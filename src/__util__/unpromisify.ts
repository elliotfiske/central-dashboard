/**
 * This function returns a mock implementation you can use for a method that
 *  normally returns a Promise.
 *
 * Instead of inserting anything into the Promise queue, this will just
 *  synchronously call `then` or `catch` immediately. This avoids weird
 *  stuff where the Promise queue doesn't flush properly.
 *
 *  If you call this with `errorResult !== undefined`, it will call `catch` and
 *    NOT call `then`. That is, resolvedResult is ignored if errorResult is
 *    supplied.
 */
export function createInstaPromise(
  resolvedResult: any,
  errorResult: any | undefined = undefined
) {
  const catchBlock = {
    catch: (errorCallback: (err: any) => void) => {
      if (errorResult !== undefined) {
        errorCallback(errorResult)
      }
    },
  }

  return () => {
    return {
      then: (callback: (res: any) => void) => {
        if (errorResult === undefined) {
          callback(resolvedResult)
        }
        return catchBlock
      },
    }
  }
}
