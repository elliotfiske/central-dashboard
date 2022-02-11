import { MonoTypeOperatorFunction, Observable } from "rxjs"
import { bufferWhen, concatMap, tap } from "rxjs/operators"

export const queueUntil =
  <T>(signal$: Observable<any>) =>
  (source$: Observable<T>) => {
    let shouldBuffer = true

    return source$.pipe(
      bufferWhen(() => {
        return shouldBuffer
          ? signal$.pipe(tap(() => (shouldBuffer = false)))
          : source$
      }),
      concatMap((v) => v)
    )
  }

export const debug = <T>(tag: string): MonoTypeOperatorFunction<T> => {
  return (source: Observable<T>) =>
    source.pipe(
      tap({
        next: (value) => {
          console.log(`${tag}: ${JSON.stringify(value)}`)
        },
        error: (error) => {
          console.log()
        },
        complete: () => {},
      })
    )
}
