'use client'

import { useState, useRef, useEffect } from 'react'
import { FiMic, FiMicOff, FiX } from 'react-icons/fi'

type VoiceInputButtonProps = {
  onResult: (text: string) => void
  onCancel: () => void
}

export function VoiceInputButton({ onResult, onCancel }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      setTranscript(finalTranscript || interimTranscript)

      if (finalTranscript) {
        // Clean up the transcript (remove spaces, convert to uppercase)
        const cleaned = finalTranscript.trim().replace(/\s+/g, '').toUpperCase()
        if (cleaned) {
          onResult(cleaned)
          stopListening()
        }
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech') {
        // User didn't speak, just close
        stopListening()
      } else {
        alert('Voice input error. Please try again or enter code manually.')
        stopListening()
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onResult])

  function startListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Error starting recognition:', error)
      }
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
    setIsListening(false)
  }

  if (!recognitionRef.current) {
    return null // Speech recognition not supported
  }

  if (isListening) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-text-primary">Listening...</h3>
            <button
              onClick={() => {
                stopListening()
                onCancel()
              }}
              className="text-text-tertiary hover:text-text-primary"
              aria-label="Cancel voice input"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
              <FiMic className="w-12 h-12 text-primary" />
            </div>
          </div>
          {transcript && (
            <p className="text-center text-sm text-text-secondary mb-4">
              Heard: <span className="font-mono font-semibold">{transcript}</span>
            </p>
          )}
          <p className="text-xs text-center text-text-tertiary">
            Speak the code clearly (letters and numbers)
          </p>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={startListening}
      className="w-full bg-primary/10 border-2 border-primary text-primary py-4 px-6 hover:bg-primary/20 transition-colors font-semibold flex items-center justify-center gap-3"
      aria-label="Use voice input"
    >
      <FiMic className="w-5 h-5" />
      Use Voice Input
    </button>
  )
}
