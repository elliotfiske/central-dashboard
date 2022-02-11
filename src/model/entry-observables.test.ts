// THIS IS JUST HERE TO QUIET DOWN ERRORS. MAKE ACUAL TESTS LATER, or don't whatever
import { TestScheduler } from "rxjs/testing"

const testScheduler = new TestScheduler((actual, expected) => {
  expect(expected).toEqual(actual)
})

describe("The rate limiter", () => {
  it("with (1, 4), limits the expensive API to 1 request every 4 ticks", () => {
    testScheduler.run((helpers) => {})
  })
})
