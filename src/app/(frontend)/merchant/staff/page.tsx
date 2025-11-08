'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiUsers, FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import dynamic from 'next/dynamic'

const StaffModal = dynamic(() => import('@/components/merchant/StaffModal'), { ssr: false })

type StaffMember = {
  id: string
  name: string
  email: string
  phone?: string
  venues?: Array<{ venue: { id: string; name: string } }>
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch staff and venues in parallel
      const [staffRes, venuesRes] = await Promise.all([
        fetch('/api/merchant/staff', { credentials: 'include' }),
        fetch('/api/merchant/venues', { credentials: 'include' }),
      ])

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaff(staffData.staff || [])
      }

      if (venuesRes.ok) {
        const venuesData = await venuesRes.json()
        setVenues(venuesData.venues || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Učitavanje podataka nije uspjelo')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(staffId: string) {
    if (!confirm('Jeste li sigurni da želite ukloniti ovog člana osoblja?')) {
      return
    }

    try {
      const response = await fetch(`/api/merchant/staff/${staffId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Član osoblja je uklonjen')
        fetchData()
      } else {
        toast.error('Uklanjanje člana osoblja nije uspjelo')
      }
    } catch (error) {
      console.error('Error removing staff:', error)
      toast.error('Uklanjanje člana osoblja nije uspjelo')
    }
  }

  function handleEdit(staffMember: StaffMember) {
    setEditingStaff(staffMember)
    setShowModal(true)
  }

  function handleCloseModal() {
    setShowModal(false)
    setEditingStaff(null)
  }

  function handleSuccess() {
    fetchData()
    handleCloseModal()
  }

  function getVenueNames(staffMember: StaffMember): string {
    if (!staffMember.venues || staffMember.venues.length === 0) {
      return 'Nema dodijeljenih lokacija'
    }
    const names = staffMember.venues.map((v) =>
      typeof v.venue === 'object' ? v.venue.name : 'Nepoznato',
    )
    return names.join(', ')
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4"
            >
              <FiArrowLeft />
              Natrag na nadzornu ploču
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Upravljanje Osobljem
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Upravljajte članovima osoblja i njihovim dodijeljenim lokacijama
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
            style={{ color: 'white' }}
          >
            <FiPlus className="w-5 h-5" />
            Dodaj člana osoblja
          </button>
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm">Učitavanje osoblja...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FiUsers className="text-primary text-3xl" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              Još nema članova osoblja
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto text-center">
              Dodajte članove osoblja kako bi pomogli upravljati lokacijama i obrađivati realizacije.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
              style={{ color: 'white' }}
            >
              <FiPlus className="w-5 h-5" />
              Dodajte svog prvog člana osoblja
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                Svi članovi osoblja ({staff.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Član osoblja
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Kontakt
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Dodijeljene lokacije
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Radnje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-[#F7F7F7] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FiUsers className="text-primary text-lg" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-text-primary">
                              {member.name}
                            </div>
                            <div className="text-xs text-text-secondary">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.phone ? (
                          <div className="text-sm text-text-secondary">{member.phone}</div>
                        ) : (
                          <span className="text-text-tertiary text-xs">Nema telefona</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-text-secondary max-w-md">
                          {getVenueNames(member)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(member)}
                            className="p-2 text-text-secondary hover:text-primary hover:bg-white rounded transition-colors"
                            title="Uredi člana osoblja"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-text-secondary hover:text-error hover:bg-white rounded transition-colors"
                            title="Ukloni člana osoblja"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Section */}
        {staff.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="text-blue-600 text-xl" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-2">Savjeti za upravljanje osobljem</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Članovi osoblja mogu pristupiti sučelju za iskorištavanje kako bi obrađivali zahtjeve</li>
                  <li>• Dodijelite osoblje određenim lokacijama radi boljeg upravljanja</li>
                  <li>• Osoblje može pristupiti samo značajkama za svoje dodijeljene lokacije</li>
                  <li>• Redovito pregledavajte i ažurirajte dodjele članova osoblja prema potrebi</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {showModal && (
        <StaffModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          venues={venues}
          staffMember={editingStaff}
        />
      )}
    </div>
  )
}

