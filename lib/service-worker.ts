'use client'

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New service worker is available
                showUpdateNotification()
              }
            })
          }
        })

        console.log('Service Worker registered successfully:', registration.scope)
      } catch (error) {
        console.log('Service Worker registration failed:', error)
      }
    })
  }
}

function showUpdateNotification() {
  // You can implement a toast notification here
  if (confirm('Pembaruan aplikasi tersedia. Muat ulang untuk mendapatkan versi terbaru?')) {
    window.location.reload()
  }
}

export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister()
      })
      .catch((error) => {
        console.error(error.message)
      })
  }
}
