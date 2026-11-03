let registrationFailed = false

export function pwaRegistrationFailed() { return registrationFailed }

export function registerPwa() {
  if (!import.meta.env.PROD) return
  if (!('serviceWorker' in navigator)) {
    registrationFailed = true
    return
  }
  const fail = () => {
    registrationFailed = true
    window.dispatchEvent(new Event('pwa-registration-error'))
  }
  void navigator.serviceWorker.register(new URL('sw.js', document.baseURI)).then(registration => {
    const worker = registration.installing
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'redundant' && !registration.active) fail()
    })
  }).catch(fail)
}