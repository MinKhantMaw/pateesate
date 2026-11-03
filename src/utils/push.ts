interface OneSignalSDK {
  init: (options: Record<string, unknown>) => Promise<void>
  Notifications: { isPushSupported: () => boolean; setDefaultUrl: (url: string) => void; addEventListener: (event: string, handler: () => void) => void }
  User: { PushSubscription: { optIn: () => Promise<void>; optOut: () => Promise<void> } }
}

declare global {
  interface Window { OneSignalDeferred?: Array<(sdk: OneSignalSDK) => void> }
}

let sdkPromise: Promise<OneSignalSDK> | undefined

export const pushConfigured = () => Boolean(import.meta.env.VITE_ONESIGNAL_APP_ID)
export const pushSupported = () => 'Notification' in window && 'serviceWorker' in navigator && window.isSecureContext
export const iosNeedsInstall = () => {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const safari = /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS/.test(navigator.userAgent)
  return ios && safari && !window.matchMedia('(display-mode: standalone)').matches && !(navigator as Navigator & { standalone?: boolean }).standalone
}

export function getPushSDK(): Promise<OneSignalSDK> {
  if (!sdkPromise) {
    sdkPromise = new Promise<OneSignalSDK>((resolve, reject) => {
      const base = new URL('.', document.baseURI)
      const scope = new URL('onesignal/', base).pathname
      const workerPath = new URL('onesignal/OneSignalSDKWorker.js', base).pathname.slice(1)
      let active = true
      const fail = (error: unknown) => { if (!active) return; active = false; window.clearTimeout(timer); script.remove(); reject(error) }
      const timer = window.setTimeout(() => fail(new Error('SDK unavailable')), 15000)
      window.OneSignalDeferred = window.OneSignalDeferred || []
      window.OneSignalDeferred.push(sdk => {
        if (!active) return
        void sdk.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
          serviceWorkerPath: workerPath,
          serviceWorkerParam: { scope },
          allowLocalhostAsSecureOrigin: true,
          notificationClickHandlerMatch: 'origin',
          notificationClickHandlerAction: 'navigate',
          notifyButton: { enable: false },
          promptOptions: { slidedown: { prompts: [{ type: 'push', autoPrompt: false }] } },
          welcomeNotification: { disable: true },
        }).then(() => {
          if (!active) return
          sdk.Notifications.setDefaultUrl(new URL('#/', base).href)
          sdk.Notifications.addEventListener('click', () => { window.location.hash = '#/' })
          active = false
          window.clearTimeout(timer)
          resolve(sdk)
        }).catch(fail)
      })
      const script = document.createElement('script')
      script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js'
      script.async = true
      script.onerror = () => fail(new Error('SDK unavailable'))
      document.head.appendChild(script)
    }).catch(error => { sdkPromise = undefined; throw error })
  }
  return sdkPromise
}