import { entryObservables } from "./entry-observables"
import axios from "axios"

jest.mock("axios")

const mockAxios = axios as unknown as jest.Mocked<typeof axios>
mockAxios.create = jest.fn(() => mockAxios)

describe("Old entries", () => {
  it("works with 1 page", () => {
    mockAxios.get.mockImplementationOnce({
      per_page: 1,
      total_count: 1,
      data: ["a"],
    } as any)

    // entryObservables.oldEntries$
  })
})
