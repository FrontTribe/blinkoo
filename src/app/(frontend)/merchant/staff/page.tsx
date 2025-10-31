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
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(staffId: string) {
    if (!confirm('Are you sure you want to remove this staff member?')) {
      return
    }

    try {
      const response = await fetch(`/api/merchant/staff/${staffId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toast.success('Staff member removed')
        fetchData()
      } else {
        toast.error('Failed to remove staff member')
      }
    } catch (error) {
      console.error('Error removing staff:', error)
      toast.error('Failed to remove staff member')
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
      return 'No venues assigned'
    }
    const names = staffMember.venues.map((v) =>
      typeof v.venue === 'object' ? v.venue.name : 'Unknown',
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
              Back to Dashboard
            </Link>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Staff Management
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Manage staff members and their venue assignments
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
            style={{ color: 'white' }}
          >
            <FiPlus className="w-5 h-5" />
            Add Staff Member
          </button>
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-sm">Loading staff...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white border border-border rounded-lg p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <FiUsers className="text-primary text-3xl" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-text-primary mb-3">
              No staff members yet
            </h2>
            <p className="text-text-secondary mb-8 max-w-md mx-auto">
              Add staff members to help manage your venues and process redemptions.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 hover:bg-primary-hover font-semibold transition-colors"
              style={{ color: 'white' }}
            >
              <FiPlus className="w-5 h-5" />
              Add Your First Staff Member
            </button>
          </div>
        ) : (
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
              <h2 className="font-heading text-lg font-bold text-text-primary">
                All Staff ({staff.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-secondary border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Assigned Venues
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Actions
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
                          <span className="text-text-tertiary text-xs">No phone</span>
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
                            title="Edit staff member"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
                            className="p-2 text-text-secondary hover:text-error hover:bg-white rounded transition-colors"
                            title="Remove staff member"
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
                <h3 className="font-semibold text-blue-900 mb-2">Staff Management Tips</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Staff members can access the redemption interface to process claims</li>
                  <li>• Assign staff to specific venues for organized management</li>
                  <li>• Staff can only access features for their assigned venues</li>
                  <li>• Regularly review and update staff assignments as needed</li>
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

