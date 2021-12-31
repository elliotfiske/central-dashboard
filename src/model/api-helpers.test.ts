import { axiosRxGet } from "./api-helpers"
import { TestScheduler } from "rxjs/testing"
import axios from "axios"
import { merge } from "rxjs"
import { createInstaPromise } from "../__util__/unpromisify"

jest.mock("axios")

const mockAxios = axios as unknown as jest.Mocked<typeof axios>
mockAxios.create = jest.fn(() => mockAxios)

beforeAll(() => {
  // real fake timers! https://www.youtube.com/watch?v=6h58uT_BGV4
  jest.useFakeTimers()
})

const testScheduler = new TestScheduler((actual, expected) => {
  expect(expected).toEqual(actual)
})

describe("The API helper", () => {
  it("rate limits incoming requests", () => {
    testScheduler.run(async (helpers) => {
      const { expectObservable } = helpers

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
