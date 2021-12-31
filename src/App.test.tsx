import React from "react"
import { MonoTypeOperatorFunction, SchedulerLike } from "rxjs"
import { Observable } from "rxjs/internal/Observable"
import { Subscriber } from "rxjs/internal/Subscriber"
import { TestScheduler } from "rxjs/testing"

function rateLimitOperator<T>() {
  return function rateLimitOperation(
    this: Subscriber<T>,
    source: Observable<T>
  ) {}
}

function rateLimit<T>(scheduler?: SchedulerLike): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => source.lift(rateLimitOperator())
}

// test("renders learn react link", () => {
//   render(<App />)
//   const linkElement = screen.getByText(/learn react/i)
//   expect(linkElement).toBeInTheDocument()
// })

const testScheduler = new TestScheduler((actual, expected) => {
  expect(actual).toBe(expected)
})

test("rx ratelimiter works", () => {
  const source = new Observable<number>((subscriber) => {
    console.log("Subscribed!")
  })
})
