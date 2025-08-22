
import React, { useState } from 'react'
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react'
import { Lead } from '@/types/database'

interface AnalyticsDashboardProps {
  leads: Lead[]
}

export function AnalyticsDashboard({ leads }: AnalyticsDashboardProps) {
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today')

  const getFilteredLeads = () => {
    const now = new Date()
    let startDate: Date

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    return leads.filter(lead => new Date(lead.created_at) >= startDate)
  }

  const filteredLeads = getFilteredLeads()
  const totalLeads = filteredLeads.length
  const pipelineValue = filteredLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0)
  const closedLeads = filteredLeads.filter(lead => lead.raw?.stage === 'closed').length
  const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                timeframe === period
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pipeline Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(pipelineValue / 1000000).toFixed(1)}M
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Target className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-gray-900">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Property Value</p>
            <p className="text-2xl font-bold text-gray-900">
              ${totalLeads > 0 ? Math.round(pipelineValue / totalLeads / 1000) : 0}K
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
