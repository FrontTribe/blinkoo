'use client'

import { useState, useEffect } from 'react'
import { FiUser } from 'react-icons/fi'
import toast from 'react-hot-toast'

type WaitlistButtonProps = {
  offerId: string
  offerSlug?: string
  isSoldOut: boolean
}

export function WaitlistButton({ offerId, offerSlug, isSoldOut }: WaitlistButtonProps) {
  const [onWaitlist, setOnWaitlist] = useState(false)
  const [position, setPosition] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function checkWaitlist() {
      if (!offerSlug) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/web/offers/${offerSlug}/waitlist`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setOnWaitlist(data.onWaitlist)
          setPosition(data.position || null)
        }
      } catch (error) {
        console.error('Error checking waitlist:', error)
      } finally {
        setLoading(false)
      }
    }

    if (offerSlug && isSoldOut) {
      checkWaitlist()
    } else {
      setLoading(false)
    }
  }, [offerSlug, isSoldOut])

  async function handleJoinWaitlist() {
    if (!offerSlug) {
      toast.error('Unable to join waitlist')
      return
    }

    setJoining(true)
    try {
      const response = await fetch(`/api/web/offers/${offerSlug}/waitlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoClaim: true }),
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setOnWaitlist(true)
        setPosition(data.position)
        toast.success(`Joined waitlist! Position: #${data.position}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to join waitlist')
      }
    } catch (error) {
      console.error('Error joining waitlist:', error)
      toast.error('Failed to join waitlist')
    } finally {
      setJoining(false)
    }
  }

  async function handleLeaveWaitlist() {
    if (!offerSlug) {
      toast.error('Unable to leave waitlist')
      return
    }

    try {
      const response = await fetch(`/api/web/offers/${offerSlug}/waitlist`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setOnWaitlist(false)
        setPosition(null)
        toast.success('Left waitlist')
      } else {
        toast.error('Failed to leave waitlist')
      }
    } catch (error) {
      console.error('Error leaving waitlist:', error)
      toast.error('Failed to leave waitlist')
    }
  }

  if (!isSoldOut || loading) {
    return null
  }

  if (onWaitlist && position) {
    return (
      <div className="bg-primary/10 border border-primary p-4 rounded">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiUser className="text-primary text-xl" />
            <div>
              <p className="text-sm font-semibold text-text-primary">On Waitlist</p>
              <p className="text-xs text-text-secondary">Position #{position} in queue</p>
            </div>
          </div>
          <button
            onClick={handleLeaveWaitlist}
            className="px-4 py-2 text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-white transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleJoinWaitlist}
      disabled={joining}
      className="w-full bg-primary text-white py-4 px-6 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-base flex items-center justify-center gap-2"
      style={{ color: 'white' }}
    >
      <FiUser />
      {joining ? 'Joining...' : 'Join Waitlist'}
    </button>
  )
}
