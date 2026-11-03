import { useApp } from '../store/AppContextValue'

export function counterFeedback(vibration: boolean, sound: boolean) {
  if (vibration && 'vibrate' in navigator) navigator.vibrate(30)
  if (sound) {
    try {
      const audio = new AudioContext()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.frequency.value = 520
      gain.gain.setValueAtTime(0.012, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08)
      oscillator.connect(gain); gain.connect(audio.destination)
      oscillator.start(); oscillator.stop(audio.currentTime + 0.08)
      oscillator.onended = () => { void audio.close() }
    } catch { return }
  }
}

export function milestoneFeedback(vibration: boolean, sound: boolean, goal: boolean) {
  if (vibration && 'vibrate' in navigator) navigator.vibrate(goal ? [200, 100, 200, 100, 400] : [60, 40, 60])
  if (goal && sound) {
    try {
      const audio = new AudioContext()
      const oscillator = audio.createOscillator()
      const gain = audio.createGain()
      oscillator.type = 'sine'; oscillator.frequency.value = 660
      gain.gain.setValueAtTime(0.04, audio.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 1.2)
      oscillator.connect(gain); gain.connect(audio.destination)
      oscillator.start(); oscillator.stop(audio.currentTime + 1.2)
      oscillator.onended = () => { void audio.close() }
    } catch { return }
  }
}

export function useCounter(id: string) {
  const store = useApp()
  const session = store.session[id] ?? { count: 0, target: store.settings.beadsPerRound, goalRounds: store.settings.goalRounds, roundsDone: 0, goalReached: false, undo: [] }
  const count = store.counts[id] ?? { total: 0, rounds: 0 }
  function tap() {
    counterFeedback(store.settings.vibration, store.settings.sound)
    return store.increment(id)
  }
  return { session, count, tap, undo: () => store.undo(id), reset: (target?: number, goalRounds?: number) => store.resetSession(id, target, goalRounds), dismissGoal: () => store.dismissSingleGoal(id) }
}