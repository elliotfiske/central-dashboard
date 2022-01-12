import { asyncScheduler, EMPTY, expand, Observable } from "rxjs"
import axios from "axios"
import RateLimiter from "rxjs-ratelimiter"

const ax = axios.create({
  baseURL: "http://localhost:8010/proxy/",
  auth: {
    username: process.env.REACT_APP_TOGGL_API_TOKEN ?? "",
    password: "api_token",
  },
})

const rateLimiter = new RateLimiter(1, 2_000, asyncScheduler)

/**
 * Takes in a URL and spits out a cold Observable.
 *
 * That Observable will emit 1 value or error then complete.
 */
export function axiosRxGet<Result>(url: string): Observable<Result> {
  const requestObservable = new Observable<Result>((subscriber) => {
    const source = axios.CancelToken.source()

    ax.get<Result>(url, { cancelToken: source.token })
      .then((result) => {
        subscriber.next(result.data)
        subscriber.complete()
      })
      .catch((error) => {
        if (axios.isCancel(error)) {
          return
        }
        subscriber.error(error)
      })

    return () => {
      source.cancel("Cancelled in an rx-y fashion")
    }
  })

  return rateLimiter.limit(requestObservable)
}

export function axiosRxGetPaged<Result>(
  url: string,
  getNextPage: (currentResult: Result) => string | null
): Observable<Result> {
  return axiosRxGet<Result>(url).pipe(
    expand((apiResult) => {
      const nextPageUrl = getNextPage(apiResult)
      if (nextPageUrl !== null) {
        return axiosRxGet<Result>(nextPageUrl)
      } else {
        return EMPTY
      }
    })
  )
}
