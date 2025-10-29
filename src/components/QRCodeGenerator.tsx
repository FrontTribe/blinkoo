'use client'

import { QRCodeSVG } from 'react-qr-code'

type QRCodeGeneratorProps = {
  value: string
  size?: number
}

export function QRCodeGenerator({ value, size = 200 }: QRCodeGeneratorProps) {
  return (
    <div className="inline-block p-4 bg-white border border-border">
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  )
}
