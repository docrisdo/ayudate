// One pending contextual utterance. Explicit reading and navigation cancel it.
export function createPendingSpeech(setTimer = setTimeout, clearTimer = clearTimeout) {
  let pending = null
  function cancel() {
    if (!pending) return
    clearTimer(pending.timer)
    pending.resolve('cancelled')
    pending = null
  }
  function schedule(play, delay = 1800) {
    cancel()
    return new Promise(resolve => {
      const entry = { resolve, timer: null }
      pending = entry
      entry.timer = setTimer(() => {
        if (pending !== entry) return
        pending = null
        Promise.resolve().then(play).then(resolve, () => resolve(false))
      }, delay)
    })
  }
  return { cancel, schedule }
}
