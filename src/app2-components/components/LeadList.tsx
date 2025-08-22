import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { ViewToggle } from './ViewToggle'
import { LeadCard } from './LeadCard'
import { CrmTable } from './CrmTable'
import { LeadModal } from './LeadModal'
import { EnhancedFilters } from './EnhancedFilters'
import { KanbanBoard } from './KanbanBoard'
import { Lead } from '@/types/database'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface LeadListProps {
  leads: Lead[]
  selectedDate?: string
}

export function LeadList({ leads, selectedDate }: LeadListProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [view, setView] = useState<'cards' | 'crm' | 'kanban'>('cards')
  const [sortBy, setSortBy] = useState('severity')
  const [filters, setFilters] = useState({
    foreclosure: false,
    liens: false,
    tax_delinquent: false,
    bankruptcy: false,
    divorce: false,
    deceased: false,
    is_tax_delinquent: false,
    is_in_bankruptcy: false,
    is_foreclosure: false,
    filed_for_divorce_30_days: false,
    has_open_liens: false,
    is_the_owner_deceased: false,
    zipCode: '',
    city: '',
    selectedLocations: []
  })
  const { toast } = useToast()

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }

  const handleLeadStageChange = async (leadId: string, newStage: 'lead' | 'contacted' | 'closed') => {
    try {
      const leadToUpdate = leads.find(l => l.id === leadId)
      if (!leadToUpdate) return

      const updatedRaw = {
        ...leadToUpdate.raw,
        stage: newStage
      }

      const { error } = await supabase
        .from('leads')
        .update({ raw: updatedRaw })
        .eq('id', leadId)

      if (error) throw error

      toast({
        title: "Lead updated",
        description: `Lead moved to ${newStage} stage.`
      })

      // Trigger a refetch of leads
      window.location.reload()
    } catch (error) {
      console.error('Error updating lead stage:', error)
      toast({
        title: "Error",
        description: "Failed to update lead stage.",
        variant: "destructive"
      })
    }
  }

  const exportLeads = async () => {
    try {
      // Fetch all leads from Supabase for export
      const { data: allLeads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const csvHeaders = Object.keys(allLeads[0] || {}).filter(key => key !== 'raw')

      const csvData = allLeads.map(lead => {
        return csvHeaders.map(header => {
          const value = lead[header as keyof Lead]
          if (Array.isArray(value)) {
            return value.join('; ')
          }
          return value || ''
        })
      })

      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'leads_export.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      toast({
        title: "Export successful",
        description: "Leads have been exported to CSV."
      })
    } catch (error) {
      console.error('Error exporting leads:', error)
      toast({
        title: "Export failed",
        description: "Failed to export leads.",
        variant: "destructive"
      })
    }
  }

  // Filter and search leads
  const filteredLeads = leads.filter(lead => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = 
        lead.primary_owner?.toLowerCase().includes(searchLower) ||
        lead.other_owner?.toLowerCase().includes(searchLower) ||
        lead.property_address?.toLowerCase().includes(searchLower) ||
        lead.phones_primary_owner?.some(phone => phone.toLowerCase().includes(searchLower)) ||
        lead.emails_primary_owner?.some(email => email.toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false
    }

    // Distress filters
    if (filters.is_foreclosure && !lead.is_foreclosure) return false
    if (filters.has_open_liens && !lead.has_open_liens) return false
    if (filters.is_tax_delinquent && !lead.is_tax_delinquent) return false
    if (filters.is_in_bankruptcy && !lead.is_in_bankruptcy) return false
    if (filters.filed_for_divorce_30_days && !lead.filed_for_divorce_30_days) return false
    if (filters.is_the_owner_deceased && !lead.is_the_owner_deceased) return false

    // Location filters
    if (filters.zipCode && !lead.property_address?.includes(filters.zipCode)) return false
    if (filters.city && !lead.property_address?.toLowerCase().includes(filters.city.toLowerCase())) return false
    
    if (filters.selectedLocations && filters.selectedLocations.length > 0) {
      const addressMatch = filters.selectedLocations.some((location: string) => {
        const locationParts = location.split(', ')
        if (locationParts.length >= 2) {
          const city = locationParts[0].trim()
          return lead.property_address?.toLowerCase().includes(city.toLowerCase())
        }
        return false
      })
      if (!addressMatch) return false
    }

    return true
  })

  // Sort leads
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    switch (sortBy) {
      case 'severity':
        const aFlags = [
          a.is_foreclosure,
          a.has_open_liens,
          a.is_tax_delinquent,
          a.is_in_bankruptcy,
          a.filed_for_divorce_30_days,
          a.is_the_owner_deceased
        ].filter(Boolean).length

        const bFlags = [
          b.is_foreclosure,
          b.has_open_liens,
          b.is_tax_delinquent,
          b.is_in_bankruptcy,
          b.filed_for_divorce_30_days,
          b.is_the_owner_deceased
        ].filter(Boolean).length

        if (aFlags !== bFlags) return bFlags - aFlags
        
        const aAmount = a.delinquent_amount || 0
        const bAmount = b.delinquent_amount || 0
        return bAmount - aAmount

      case 'value':
        return (b.estimated_value || 0) - (a.estimated_value || 0)

      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedDate 
                ? `Leads for ${new Date(selectedDate).toLocaleDateString()}`
                : 'All Leads'
              }
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {sortedLeads.length} lead{sortedLeads.length !== 1 ? 's' : ''}
              {sortedLeads.length !== leads.length && ` (filtered from ${leads.length})`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle view={view} onViewChange={setView} />
            <Button variant="outline" size="sm" onClick={exportLeads}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <EnhancedFilters
          leads={leads}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filters}
          onFilterChange={setFilters}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Content Area */}
      {sortedLeads.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-gray-500">
            {leads.length === 0 ? (
              selectedDate ? 'No leads for this date' : 'No leads available'
            ) : (
              'No leads match your search criteria'
            )}
          </div>
        </div>
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => handleLeadClick(lead)}
            />
          ))}
        </div>
      ) : view === 'crm' ? (
        <CrmTable
          leads={sortedLeads}
          onLeadClick={handleLeadClick}
        />
      ) : (
        <KanbanBoard
          leads={sortedLeads}
          onLeadClick={handleLeadClick}
          onLeadStageChange={handleLeadStageChange}
        />
      )}

      {/* Lead Modal */}
      <LeadModal
        lead={selectedLead}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
