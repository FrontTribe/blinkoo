'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [segment, setSegment] = useState('')

  async function fetchCustomers() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (segment) params.set('segment', segment)

      const response = await fetch(`/api/merchant/customers?${params.toString()}`, {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
        setSummary(data.summary)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setLoading(false)
      setCustomers([])
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [segment])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-text-primary">Loading customers...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-6 md:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-text-primary">
              Customer Insights
            </h1>
            <p className="mt-2 text-sm md:text-base text-text-secondary">
              Understand your customers and drive retention
            </p>
          </div>
          <Link
            href="/merchant/dashboard"
            className="inline-flex items-center gap-2 bg-white text-text-primary border border-border px-6 py-3 hover:border-primary transition-colors font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
              <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                New Customers
              </h3>
              <p className="font-heading text-3xl font-bold text-primary">{summary.new || 0}</p>
            </div>
            <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
              <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Regular Customers
              </h3>
              <p className="font-heading text-3xl font-bold text-primary">
                {summary.regular || 0}
              </p>
            </div>
            <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
              <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                VIP Customers
              </h3>
              <p className="font-heading text-3xl font-bold text-primary">{summary.vip || 0}</p>
            </div>
            <div className="bg-white border border-border p-6 hover:border-primary transition-colors">
              <h3 className="text-xs font-medium text-text-secondary mb-2 uppercase tracking-wider">
                Dormant Customers
              </h3>
              <p className="font-heading text-3xl font-bold text-text-primary">
                {summary.dormant || 0}
              </p>
            </div>
          </div>
        )}

        {/* Segmentation Filter */}
        <div className="bg-white border border-border p-6">
          <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
            Filter by Segment
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSegment('')}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                segment === ''
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSegment('new')}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                segment === 'new'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setSegment('regular')}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                segment === 'regular'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => setSegment('vip')}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                segment === 'vip'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => setSegment('dormant')}
              className={`px-4 py-2 text-sm font-medium border transition-colors ${
                segment === 'dormant'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-text-secondary border-border hover:border-primary'
              }`}
            >
              Dormant
            </button>
          </div>
        </div>

        {/* Customer List */}
        <div className="bg-white border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              All Customers ({customers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Total Claims
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Redeemed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Lifetime Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-tertiary">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer: any) => {
                    const segmentColors: Record<string, string> = {
                      new: 'bg-blue-100 text-blue-800',
                      regular: 'bg-green-100 text-green-800',
                      vip: 'bg-yellow-100 text-yellow-800',
                      dormant: 'bg-gray-100 text-gray-800',
                    }

                    return (
                      <tr key={customer.id} className="hover:bg-[#F7F7F7] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/merchant/customers/${customer.id}`}
                            className="block hover:opacity-75 transition-opacity"
                          >
                            <div className="text-sm font-semibold text-text-primary">
                              {customer.phone || customer.email || 'Unknown'}
                            </div>
                            {customer.phone && customer.email && (
                              <div className="text-xs text-text-secondary mt-0.5">
                                {customer.email}
                              </div>
                            )}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {customer.totalClaims}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {customer.redeemedClaims}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-text-primary">
                          {typeof customer.lifetimeValue === 'number' 
                            ? `€${customer.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : '€0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                              segmentColors[customer.segment] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {customer.segment}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {customer.lastClaim
                            ? new Date(customer.lastClaim).toLocaleDateString()
                            : 'N/A'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
