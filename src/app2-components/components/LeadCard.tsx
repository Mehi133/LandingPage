
import React from 'react'
import { Phone, Mail, AlertTriangle, Home } from 'lucide-react'
import { Lead } from '@/types/database'

interface LeadCardProps {
  lead: Lead
  onClick: () => void
}

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const distressFlags = [
    lead.is_foreclosure && 'Foreclosure',
    lead.has_open_liens && 'Liens',
    lead.is_tax_delinquent && 'Tax Delinquent',
    lead.is_in_bankruptcy && 'Bankruptcy',
    lead.filed_for_divorce_30_days && 'Divorce',
    lead.is_the_owner_deceased && 'Deceased'
  ].filter(Boolean)

  const hasContact = (lead.phones_primary_owner && lead.phones_primary_owner.length > 0) ||
                    (lead.emails_primary_owner && lead.emails_primary_owner.length > 0)

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {lead.primary_owner || 'Unknown Owner'}
          </h3>
          {lead.other_owner && (
            <p className="text-xs text-gray-500">& {lead.other_owner}</p>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {hasContact && <Phone className="h-3 w-3 text-green-500" />}
          {lead.emails_primary_owner && lead.emails_primary_owner.length > 0 && (
            <Mail className="h-3 w-3 text-blue-500" />
          )}
          {distressFlags.length > 0 && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <Home className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-600 line-clamp-2">
            {lead.property_address || 'No address'}
          </p>
        </div>

        {lead.estimated_value && (
          <p className="text-xs text-gray-500">
            Est. Value: ${lead.estimated_value.toLocaleString()}
          </p>
        )}

        {distressFlags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {distressFlags.slice(0, 2).map((flag, index) => (
              <span
                key={index}
                className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
              >
                {flag}
              </span>
            ))}
            {distressFlags.length > 2 && (
              <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{distressFlags.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
