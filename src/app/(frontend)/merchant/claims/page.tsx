'use client'

import { useState, useEffect } from 'react'
import { SearchBar } from '@/components/SearchBar'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { FiDownload, FiSearch, FiFilter } from 'react-icons/fi'
import { BarChart } from '@/components/charts/BarChart'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'

export default function ClaimsManagementPage() {
  const [claims, setClaims] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set())

  const [filters, setFilters] = useState({
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    offerId: '',
  })

  async function fetchClaims() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.offerId) params.set('offerId', filters.offerId)

      const response = await fetch(`/api/merchant/claims?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClaims()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [filters])

  async function handleStatusChange(claimId: string, newStatus: string) {
    try {
      const response = await fetch('/api/merchant/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ claimId, status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update claim status')
      }

      toast.success('Claim status updated')
      fetchClaims()
    } catch (error) {
      console.error('Error updating claim:', error)
      toast.error('Failed to update claim status')
    }
  }

  function exportClaims() {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })

    window.open(`/api/merchant/claims/export?${params.toString()}`, '_blank')
  }

  function toggleClaimSelection(claimId: string) {
    const newSelection = new Set(selectedClaims)
    if (newSelection.has(claimId)) {
      newSelection.delete(claimId)
    } else {
      newSelection.add(claimId)
    }
    setSelectedClaims(newSelection)
  }

  async function handleBulkAction(action: string) {
    if (selectedClaims.size === 0) {
      toast.error('No claims selected')
      return
    }

    try {
      const response = await fetch('/api/merchant/claims/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          claimIds: Array.from(selectedClaims),
          action,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to perform bulk action')
      }

      const data = await response.json()
      toast.success(`Successfully updated ${data.updated} claims`)
      setSelectedClaims(new Set())
      fetchClaims()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  if (loading && claims.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading claims...</p>
      </div>
    )
  }

  // Chart data
  const chartData = summary
    ? [
        {
          name: 'Status',
          Reserved: summary.reserved,
          Redeemed: summary.redeemed,
          Expired: summary.expired,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Claim Management
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              View and manage all customer claims
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportClaims}
              className="inline-flex items-center gap-2 bg-white text-text-primary border border-border px-6 py-3 hover:border-primary transition-colors font-semibold"
            >
              <FiDownload />
              Export
            </button>
            <Link
              href="/merchant/dashboard"
              className="inline-flex items-center gap-2 bg-white text-text-primary border border-border px-6 py-3 hover:border-primary transition-colors font-semibold"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Total Claims</h3>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {summary?.total || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Reserved</h3>
            <p className="font-heading text-3xl font-bold text-yellow-600">
              {summary?.reserved || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Redeemed</h3>
            <p className="font-heading text-3xl font-bold text-green-600">
              {summary?.redeemed || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase">Expired</h3>
            <p className="font-heading text-3xl font-bold text-red-600">{summary?.expired || 0}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white border border-border p-6 mb-8">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Claims Overview
            </h2>
            <BarChart
              data={chartData}
              bars={[
                { key: 'Reserved', name: 'Reserved', color: '#F59E0B' },
                { key: 'Redeemed', name: 'Redeemed', color: '#10B981' },
                { key: 'Expired', name: 'Expired', color: '#EF4444' },
              ]}
              xAxisKey="name"
              height={300}
            />
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <FiFilter />
            <h2 className="font-heading text-lg font-semibold text-text-primary">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Offer, customer..."
                  className="w-full pl-10 pr-4 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary"
              >
                <option value="">All Statuses</option>
                <option value="RESERVED">Reserved</option>
                <option value="REDEEMED">Redeemed</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 bg-white text-text-primary border border-border focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedClaims.size > 0 && (
          <div className="bg-white border border-primary p-4 mb-8 flex items-center justify-between">
            <span className="text-sm text-text-primary">
              {selectedClaims.size} claim(s) selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('REDEEMED')}
                className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Mark Redeemed
              </button>
              <button
                onClick={() => handleBulkAction('EXPIRED')}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Mark Expired
              </button>
              <button
                onClick={() => setSelectedClaims(new Set())}
                className="px-4 py-2 bg-white text-text-primary border border-border hover:border-primary transition-colors text-sm font-medium"
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}

        {/* Claims Table */}
        <div className="bg-white border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              All Claims ({claims.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClaims(new Set(claims.map((c) => c.id)))
                        } else {
                          setSelectedClaims(new Set())
                        }
                      }}
                      checked={selectedClaims.size === claims.length && claims.length > 0}
                      className="border-border focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Offer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-text-tertiary">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim: any) => {
                    const offer = claim.offer
                    const user = claim.user
                    const venue = offer?.venue

                    return (
                      <tr key={claim.id} className="hover:bg-[#F7F7F7]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedClaims.has(claim.id)}
                            onChange={() => toggleClaimSelection(claim.id)}
                            className="border-border focus:ring-primary"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                          #{claim.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-text-primary">
                              {offer?.title || 'Unknown'}
                            </div>
                            <div className="text-xs text-text-tertiary">{venue?.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {user?.phone || user?.email || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {claim.reservedAt
                            ? new Date(claim.reservedAt).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              claim.status === 'REDEEMED'
                                ? 'bg-green-100 text-green-800'
                                : claim.status === 'EXPIRED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2 items-center">
                            {claim.status === 'RESERVED' && (
                              <>
                                <button
                                  onClick={() => handleStatusChange(claim.id, 'REDEEMED')}
                                  className="text-green-600 hover:text-green-700 font-medium"
                                >
                                  Redeem
                                </button>
                                <button
                                  onClick={() => handleStatusChange(claim.id, 'EXPIRED')}
                                  className="text-red-600 hover:text-red-700 font-medium"
                                >
                                  Expire
                                </button>
                              </>
                            )}
                            <button
                              onClick={() =>
                                setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)
                              }
                              className="text-primary hover:text-primary-hover font-medium"
                            >
                              QR
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR Code Modal */}
        {selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading text-lg font-semibold text-text-primary">
                  QR Code for Claim #{selectedClaim.id}
                </h3>
                <button
                  onClick={() => setSelectedClaim(null)}
                  className="text-text-tertiary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col items-center">
                <QRCodeGenerator value={selectedClaim.id.toString()} size={256} />
                <p className="mt-4 text-sm text-text-secondary text-center">
                  Scan this QR code to verify and redeem this claim
                </p>
                <button
                  onClick={() => {
                    window.open(`/merchant/claims/verify/${selectedClaim.id}`, '_blank')
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white hover:bg-primary-hover transition-colors font-semibold"
                  style={{ color: 'white' }}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
