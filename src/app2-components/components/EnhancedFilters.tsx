
import React, { useState } from 'react'
import { Search, Filter, MapPin, AlertTriangle } from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Lead } from '@/types/database'

interface EnhancedFiltersProps {
  leads: Lead[]
  searchTerm: string
  onSearchChange: (term: string) => void
  filters: any
  onFilterChange: (filters: any) => void
  sortBy: string
  onSortChange: (sort: string) => void
}

export function EnhancedFilters({
  leads,
  searchTerm,
  onSearchChange,
  filters,
  onFilterChange,
  sortBy,
  onSortChange
}: EnhancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState<'distress' | 'location'>('distress')

  const distressFilters = [
    { key: 'is_tax_delinquent', label: 'Tax Delinquent' },
    { key: 'is_in_bankruptcy', label: 'Bankruptcy' },
    { key: 'is_foreclosure', label: 'Foreclosure' },
    { key: 'filed_for_divorce_30_days', label: 'Recent Divorce' },
    { key: 'has_open_liens', label: 'Open Liens' },
    { key: 'is_the_owner_deceased', label: 'Deceased Owner' }
  ]

  const getLocationAnalytics = () => {
    const locationMap = new Map<string, number>()
    leads.forEach(lead => {
      if (lead.property_address) {
        // Extract city and state from address
        const addressParts = lead.property_address.split(',')
        if (addressParts.length >= 2) {
          const city = addressParts[addressParts.length - 2].trim()
          const stateZip = addressParts[addressParts.length - 1].trim()
          const location = `${city}, ${stateZip}`
          locationMap.set(location, (locationMap.get(location) || 0) + 1)
        }
      }
    })
    return Array.from(locationMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  }

  const locationAnalytics = getLocationAnalytics()

  return (
    <div className="space-y-4">
      {/* Search and Main Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by owner, address, phone, or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="severity">Most Distressed</option>
            <option value="value">Highest Value</option>
            <option value="newest">Newest Leads</option>
          </select>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {Object.values(filters).some(Boolean) && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {Object.values(filters).filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setActiveTab('distress')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                activeTab === 'distress'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Distress Filters
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                activeTab === 'location'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Location Analytics
            </button>
          </div>

          {activeTab === 'distress' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Distress Indicators</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {distressFilters.map((filter) => (
                  <label key={filter.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[filter.key] || false}
                      onChange={(e) => onFilterChange({
                        ...filters,
                        [filter.key]: e.target.checked
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">{filter.label}</span>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <Input
                    placeholder="Enter zip code..."
                    value={filters.zipCode || ''}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      zipCode: e.target.value
                    })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <Input
                    placeholder="Enter city name..."
                    value={filters.city || ''}
                    onChange={(e) => onFilterChange({
                      ...filters,
                      city: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'location' && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Top Locations</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {locationAnalytics.map(([location, count]) => (
                  <label
                    key={location}
                    className="flex items-center justify-between p-2 hover:bg-white rounded-lg cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={filters.selectedLocations?.includes(location) || false}
                        onChange={(e) => {
                          const selectedLocations = filters.selectedLocations || []
                          const newLocations = e.target.checked
                            ? [...selectedLocations, location]
                            : selectedLocations.filter((l: string) => l !== location)
                          onFilterChange({
                            ...filters,
                            selectedLocations: newLocations
                          })
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{location}</span>
                    </div>
                    <Badge variant="secondary">{count} leads</Badge>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
