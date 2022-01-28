import { testScheduler } from "../__util__/rx"
import { of } from "rxjs"
import { mergeMap } from "rxjs/operators"

describe("mergeMap", () => {
  it("do be like that sometimes", () => {
    testScheduler.run(async (helpers) => {
      const { expectObservable, hot } = helpers

      const numbers = hot("--1-----2---3----4--5")

      const letters = hot("----a--b--c----")

      const merged = of(1, 2).pipe(
        mergeMap((val) => {
          if (val === 1) return numbers
          else return letters
        })
      )

      // --1-----2---3----4--5
      // ----a--b--c----
      // --1-a--b2-c-3----4--5
      //^----------------------!

      expectObservable(merged, "^----------------------!").toBe(
        "--1-a--b2-c-3----4--5"
      )
    })
  })
})
