'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { FiCamera, FiX } from 'react-icons/fi'

type QRScannerProps = {
  onScan: (code: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Ignore scan errors (they're frequent while scanning)
        },
      )
      .catch((err) => {
        console.error('Error starting scanner:', err)
        setError('Failed to start camera')
        setScanning(false)
      })

    return () => {
      stopScanning()
    }
  }, [scanning, onScan])

  function stopScanning() {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null
          setScanning(false)
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err)
        })
    }
  }

  function startScanning() {
    setError(null)
    setScanning(true)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <h2 className="text-white font-semibold text-lg">Scan QR Code</h2>
        <button
          onClick={() => {
            stopScanning()
            onClose()
          }}
          className="text-white hover:text-gray-300"
        >
          <FiX className="w-6 h-6" />
        </button>
      </div>

      {/* Scanner Container */}
      <div className="flex-1 flex items-center justify-center p-4">
        {!scanning ? (
          <div className="text-center">
            <button
              onClick={startScanning}
              className="bg-primary text-white px-8 py-4 hover:bg-primary-hover transition-colors font-semibold flex items-center gap-3 mx-auto mb-4"
              style={{ color: 'white' }}
            >
              <FiCamera className="w-6 h-6" />
              Start Camera
            </button>
            {error && <p className="text-white mb-4">{error}</p>}
            <p className="text-white/70 text-sm">Position the QR code within the frame to scan</p>
          </div>
        ) : (
          <div className="relative w-full max-w-md">
            <div id="qr-reader" className="w-full" ref={containerRef} />
            <div className="absolute inset-0 pointer-events-none border-4 border-primary rounded-lg" />
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-black/50 text-center">
        <p className="text-white/70 text-sm">Point your camera at the customer&apos;s QR code</p>
      </div>
    </div>
  )
}
