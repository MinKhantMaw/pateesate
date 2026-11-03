import { useApp } from '../store/AppContextValue'

export function useCounter(id: string) {
  const store = useApp()
  const session = store.session[id] ?? { count: 0, target: store.settings.defaultTarget, undo: [] }
  const count = store.counts[id] ?? { total: 0, rounds: 0 }
  function tap() {
    if (store.settings.vibration && 'vibrate' in navigator) navigator.vibrate(30)
    if (store.settings.sound) {
      try {
        const audio = new AudioContext()
        const oscillator = audio.createOscillator()
        const gain = audio.createGain()
        oscillator.frequency.value = 520
        gain.gain.setValueAtTime(0.035, audio.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.08)
        oscillator.connect(gain); gain.connect(audio.destination)
        oscillator.start(); oscillator.stop(audio.currentTime + 0.08)
        oscillator.onended = () => { void audio.close() }
      } catch { return store.increment(id) }
    }
    return store.increment(id)
  }
  return { session, count, tap, undo: () => store.undo(id), reset: (target?: number) => store.resetSession(id, target) }
}