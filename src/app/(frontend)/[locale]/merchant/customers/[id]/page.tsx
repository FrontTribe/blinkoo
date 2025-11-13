'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { FiUser, FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi'
import { BarChart } from '@/components/charts/BarChart'

export default function CustomerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations('merchant.customers')
  const userId = params.id as string
  const [customer, setCustomer] = useState<any>(null)
  const [claims, setClaims] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/merchant/customers/${userId}`, {
          credentials: 'include',
        })

        if (response.ok) {
          const data = await response.json()
          setCustomer(data.customer)
          setClaims(data.claims || [])
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Error fetching customer data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  if (loading) {
    return <LoadingSpinner message={t('loading')} />
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-primary mb-4">Customer not found</p>
          <Link href="/merchant/customers" className="text-primary hover:text-primary-hover">
            Back to customers
          </Link>
        </div>
      </div>
    )
  }

  const chartData = stats
    ? [
        {
          name: 'Status',
          Redeemed: stats.redeemed,
          Expired: stats.expired,
          Reserved: stats.reserved,
        },
      ]
    : []

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link
          href="/merchant/customers"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          ← Back to customers
        </Link>

        <div className="bg-white border border-border p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <FiUser className="text-primary text-3xl" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
                Customer Profile
              </h1>
              <div className="space-y-1">
                <p className="text-text-secondary">Phone: {customer.phone || 'N/A'}</p>
                <p className="text-text-secondary">Email: {customer.email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="text-primary" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Total Claims</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-text-primary">
              {stats?.totalClaims || 0}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiTrendingUp className="text-green-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Redeemed</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-green-600">{stats?.redeemed || 0}</p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiDollarSign className="text-yellow-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Lifetime Value</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-yellow-600">
              {typeof stats?.lifetimeValue === 'number' 
                ? `€${stats.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : '€0.00'}
            </p>
          </div>
          <div className="bg-white border border-border p-6">
            <div className="flex items-center gap-2 mb-2">
              <FiCalendar className="text-red-600" />
              <h3 className="text-xs font-medium text-text-secondary uppercase">Expired</h3>
            </div>
            <p className="font-heading text-3xl font-bold text-red-600">{stats?.expired || 0}</p>
          </div>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="bg-white border border-border p-6 mb-8">
            <h2 className="font-heading text-lg font-semibold text-text-primary mb-4">
              Claim Status Distribution
            </h2>
            <BarChart
              data={chartData}
              bars={[
                { key: 'Redeemed', name: 'Redeemed', color: '#10B981' },
                { key: 'Expired', name: 'Expired', color: '#EF4444' },
                { key: 'Reserved', name: 'Reserved', color: '#F59E0B' },
              ]}
              xAxisKey="name"
              height={300}
            />
          </div>
        )}

        {/* Recent Claims */}
        <div className="bg-white border border-border">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-heading text-lg font-semibold text-text-primary">
              Claim History ({claims.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F7F7F7] border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Offer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Venue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Reserved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-tertiary">
                      No claims found
                    </td>
                  </tr>
                ) : (
                  claims.map((claim: any) => {
                    const offer = claim.offer
                    const venue = offer?.venue

                    return (
                      <tr key={claim.id} className="hover:bg-[#F7F7F7]">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-text-primary">
                            {offer?.title || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {venue?.name || 'Unknown'}
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
