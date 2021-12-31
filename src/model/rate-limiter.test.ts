import RateLimiter from "rxjs-ratelimiter"
import { mergeMap } from "rxjs/operators"
import { TestScheduler } from "rxjs/testing"

const testScheduler = new TestScheduler((actual, expected) => {
  expect(expected).toEqual(actual)
})

describe("The rate limiter", () => {
  it("with (1, 4), limits the expensive API to 1 request every 4 ticks", () => {
    testScheduler.run((helpers) => {
      const { cold, hot, expectObservable } = helpers

      const ratelimiter = new RateLimiter(1, 4)

      const expensiveApi = cold("-a|")
      const rateLimitedApi = ratelimiter.limit(expensiveApi)
      const apiResults = hot("1-1111|").pipe(
        mergeMap((_) => {
          return rateLimitedApi
        })
      )

      const expected = "-a---a---a---a---a|"

      expectObservable(apiResults).toBe(expected)
    })
  })
})
