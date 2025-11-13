'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'
import { MdArrowBack, MdEdit, MdDelete, MdAdd } from 'react-icons/md'
import { ConfirmModal } from '@/components/ConfirmModal'
import SlotForm from './SlotForm'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function OfferDetailPage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations('merchant.offers')
  const offerId = params.id as string
  const [offer, setOffer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSlotForm, setShowSlotForm] = useState(false)

  const [slots, setSlots] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch offer
        const response = await fetch(`/api/merchant/offers/${offerId}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setOffer(data.offer)
        }

        // Fetch slots for this offer
        const slotsResponse = await fetch(`/api/merchant/offers/${offerId}/slots`, {
          credentials: 'include',
        })

        if (slotsResponse.ok) {
          const slotsData = await slotsResponse.json()
          setSlots(slotsData.slots || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (offerId) {
      fetchData()
    }
  }, [offerId])

  function handleDeleteClick() {
    setShowDeleteModal(true)
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/merchant/offers/${offerId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete offer')
      }

      toast.success('Ponuda je uspješno obrisana!')

      setTimeout(() => {
        router.push('/merchant/offers')
      }, 500)
    } catch (error) {
      console.error('Error deleting offer:', error)
      toast.error('Brisanje ponude nije uspjelo. Molimo pokušajte ponovno.')
    }
  }

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white border border-border p-10 max-w-md">
          <h2 className="font-heading text-2xl font-bold text-text-primary mb-4">
            Ponuda Nije Pronađena
          </h2>
          <Link
            href="/merchant/offers"
            className="block text-center bg-primary text-white py-4 px-6 hover:bg-primary-hover transition-colors font-semibold"
            style={{ color: 'white' }}
          >
            Natrag na Ponude
          </Link>
        </div>
      </div>
    )
  }

  const offerData = offer as any
  const venue = offerData.venue

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/merchant/offers"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <MdArrowBack />
          Natrag na ponude
        </Link>

        <div className="bg-white border border-border p-8 md:p-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-text-primary mb-2">
                {offerData.title}
              </h1>
              <p className="text-sm text-text-secondary">{venue?.name || 'Nepoznata Lokacija'}</p>
            </div>
            <span
              className={`inline-flex items-center px-3 py-1.5 text-sm font-medium ${
                offerData.status === 'active'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-[#F7F7F7] text-text-tertiary border border-border'
              }`}
            >
              {offerData.status || 'draft'}
            </span>
          </div>

          {offerData.description && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-text-secondary mb-2">Opis</h2>
              <p className="text-text-primary">{offerData.description}</p>
            </div>
          )}

          {offerData.terms && (
            <div className="mb-6">
              <h2 className="text-sm font-medium text-text-secondary mb-2">Uvjeti i Odredbe</h2>
              <p className="text-text-primary">{offerData.terms}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-[#EBEBEB]">
            <div>
              <h2 className="text-sm font-medium text-text-secondary mb-2">Vrsta Ponude</h2>
              <p className="text-text-primary capitalize">{offerData.type}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-text-secondary mb-2">Vrijednost Popusta</h2>
              <p className="text-text-primary">{offerData.discountValue}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-text-secondary mb-2">Limit po Korisniku</h2>
              <p className="text-text-primary">{offerData.perUserLimit || 'Neograničeno'}</p>
            </div>
            <div>
              <h2 className="text-sm font-medium text-text-secondary mb-2">Cooldown</h2>
              <p className="text-text-primary">{offerData.cooldownMinutes || 0} minuta</p>
            </div>
          </div>

          {/* Slots Section */}
          <div className="border-t border-[#EBEBEB] pt-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="font-heading text-lg font-semibold text-text-primary">Slotovi Ponude</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSlotForm(!showSlotForm)}
                  className="px-4 py-2 bg-white text-text-primary border border-border hover:border-primary transition-colors inline-flex items-center gap-2 font-semibold"
                >
                  <MdAdd />
                  Pojedinačni Slot
                </button>
                <Link
                  href={`/merchant/offers/${offerId}/bulk-slots`}
                  className="px-4 py-2 bg-white text-text-primary border border-border hover:border-primary transition-colors inline-flex items-center gap-2 font-semibold"
                >
                  <MdAdd />
                  Masovni Slotovi
                </Link>
                <Link
                  href={`/merchant/offers/${offerId}/calendar`}
                  className="px-4 py-2 bg-primary text-white hover:bg-primary-hover transition-colors inline-flex items-center gap-2 font-semibold"
                  style={{ color: 'white' }}
                >
                  <MdAdd style={{ color: 'white' }} />
                  Kalendarski Pregled
                </Link>
              </div>
            </div>

            {showSlotForm && (
              <div className="mb-6 bg-white border border-border p-6">
                <h3 className="font-semibold text-text-primary mb-4">Kreiraj Novi Slot</h3>
                <SlotForm
                  offerId={offerId}
                  onSlotCreated={() => {
                    setShowSlotForm(false)
                    // Refresh slots list
                    fetch(`/api/merchant/offers/${offerId}/slots`, {
                      credentials: 'include',
                    })
                      .then((res) => res.json())
                      .then((data) => setSlots(data.slots || []))
                  }}
                  onCancel={() => setShowSlotForm(false)}
                />
              </div>
            )}
            {slots.length === 0 ? (
              <p className="text-text-tertiary">Nema slotova za ovu ponudu</p>
            ) : (
              <div className="space-y-3">
                {slots.map((slot: any) => (
                  <div
                    key={slot.id}
                    className="bg-[#F7F7F7] border border-border p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-text-primary font-semibold text-sm">
                          {new Date(slot.startsAt).toLocaleString()} -{' '}
                          {new Date(slot.endsAt).toLocaleString()}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          Način: {slot.mode} | Status: {slot.state}
                        </p>
                      </div>
                      <span className="bg-primary/10 text-primary px-3 py-1.5 text-xs font-medium border border-primary/20 flex-shrink-0">
                        {slot.qtyRemaining}/{slot.qtyTotal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-[#EBEBEB]">
            <button
              onClick={handleDeleteClick}
              className="px-6 py-3 bg-white text-red-600 border border-red-600 hover:bg-red-50 transition-colors inline-flex items-center gap-2 font-semibold"
            >
              <MdDelete />
              Obriši Ponudu
            </button>
            <Link
              href={`/merchant/offers/${offerId}/edit`}
              className="px-6 py-3 bg-primary text-white hover:bg-primary-hover transition-colors inline-flex items-center gap-2 font-semibold text-center justify-center"
              style={{ color: 'white' }}
            >
              <MdEdit style={{ color: 'white' }} />
              Uredi Ponudu
            </Link>
            <Link
              href="/merchant/offers"
              className="px-6 py-3 bg-white text-text-primary border border-border hover:border-primary transition-colors font-semibold text-center"
            >
              Zatvori
            </Link>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Obriši Ponudu"
        message="Jeste li sigurni da želite obrisati ovu ponudu? Ovo će također obrisati sve povezane slotove i ne može se poništiti."
        confirmText="Obriši Ponudu"
        cancelText="Odustani"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}
