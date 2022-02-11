import React, { useEffect } from "react"
import useSound from "use-sound"

// @ts-ignore
import treatSound from "./treat_sound_trimmed.mp3"
import { rewardTriggered$ } from "../../model/treat-timer"

export const RewardNotifier = () => {
  const [play] = useSound(treatSound)

  useEffect(() => {
    rewardTriggered$.subscribe((_) => {
      play()
    })
  }, [play])

  return (
    <div>
      <button
        onClick={() => {
          play()
        }}
      >
        Play me
      </button>
      <div>3</div>
    </div>
  )
}
