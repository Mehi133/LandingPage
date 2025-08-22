
import React from 'react'
import { Phone, Mail, AlertTriangle } from 'lucide-react'
import { Lead } from '@/types/database'

interface CrmTableProps {
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

export function CrmTable({ leads, onLeadClick }: CrmTableProps) {
  const formatPhoneNumber = (phone: string) => {
    // Extract digits before any parenthesis or bracket, remove tel: prefix
    const cleaned = phone.replace(/^tel:/, '').split(/[\(\[\)]/)[0].replace(/\D/g, '')
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return cleaned
  }

  const formatEmail = (email: string) => {
    // Remove any labels in parentheses or brackets
    return email.split(/[\(\[]/)[0].trim()
  }

  const getDistressFlags = (lead: Lead) => {
    return [
      lead.is_foreclosure && 'Foreclosure',
      lead.has_open_liens && 'Liens',
      lead.is_tax_delinquent && 'Tax Delinquent',
      lead.is_in_bankruptcy && 'Bankruptcy',
      lead.filed_for_divorce_30_days && 'Divorce',
      lead.is_the_owner_deceased && 'Deceased'
    ].filter(Boolean)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property Address
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bedrooms
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bathrooms
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sq Ft
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year Built
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loans
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estimated Value
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Equity %
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distress Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => {
              const distressFlags = getDistressFlags(lead)
              const primaryPhone = lead.phones_primary_owner?.[0]
              const primaryEmail = lead.emails_primary_owner?.[0]
              
              return (
                <tr
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.primary_owner || 'Unknown Owner'}
                      </div>
                      {lead.other_owner && (
                        <div className="text-xs text-gray-500">& {lead.other_owner}</div>
                      )}
                      {primaryPhone && (
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {formatPhoneNumber(primaryPhone)}
                          </span>
                        </div>
                      )}
                      {primaryEmail && (
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{formatEmail(primaryEmail)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {lead.property_address || 'No address'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.property_type || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.beds || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.baths || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.sqft ? lead.sqft.toLocaleString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.year_built || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.number_of_loans || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.equity_percent ? `${lead.equity_percent}%` : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {distressFlags.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600">
                            {distressFlags.length} flag{distressFlags.length > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-green-600">Clear</span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
