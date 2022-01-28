import { axiosRxGet, axiosRxGetPaged } from "./api-helpers"
import axios from "axios"
import { merge } from "rxjs"
import { createInstaPromise } from "../__util__/unpromisify"
import { map } from "rxjs/operators"
import { testScheduler } from "../__util__/rx"

jest.mock("axios")

const mockAxios = axios as unknown as jest.Mocked<typeof axios>
mockAxios.create = jest.fn(() => mockAxios)

beforeAll(() => {
  // real fake timers! https://www.youtube.com/watch?v=6h58uT_BGV4
  jest.useFakeTimers()
})

describe("The API helper", () => {
  it("rate limits incoming requests", () => {
    testScheduler.run(async (helpers) => {
      const { expectObservable } = helpers

      // TODO: un any-ify this. I would need to return an actual Promise I think, but just call
      //    Promise.resolve manually myself.
      mockAxios.get.mockImplementation(createInstaPromise({ data: "a" }) as any)

      const obs = [
        axiosRxGet("endpoint1"),
        axiosRxGet("endpoint2"),
        axiosRxGet("endpoint3"),
        axiosRxGet("endpoint4"),
      ]

      const allResults = merge(...obs)

      expectObservable(allResults).toBe("a 1999ms a 1999ms a 1999ms (a|)")
    })
  })
})

describe("if the API has a paged response...", () => {
  it("correctly handles 10 pages", () => {
    testScheduler.run(async (helpers) => {
      const { expectObservable } = helpers

      interface DummyResult {
        result: string
        per_page: number
        total_count: number
      }

      const result = { result: "a", per_page: 1, total_count: 10 }

      for (let i = 0; i < 10; i++) {
        mockAxios.get.mockImplementationOnce(
          createInstaPromise({
            data: { ...result, result: `${i}` },
          }) as any
        )
      }

      let gotSoFar = 0
      let page = 1

      const pagedObservable = axiosRxGetPaged<DummyResult>(
        "example.com",
        (currentResult) => {
          gotSoFar += currentResult.per_page

          if (gotSoFar >= currentResult.total_count) {
            return null
          }

          return `example.com/?page=${++page}`
        }
      ).pipe(map((apiResult) => apiResult.result))

      expectObservable(pagedObservable).toBe(
        "0 1999ms 1  1999ms 2 1999ms 3 1999ms 4 1999ms 5 1999ms 6 1999ms 7 1999ms 8 1999ms (9|)"
      )
    })
  })
})
