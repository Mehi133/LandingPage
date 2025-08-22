import React from 'react'
import { X, Phone, Mail, ExternalLink, Copy } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Lead } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

interface LeadDrawerProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export function LeadDrawer({ lead, isOpen, onClose }: LeadDrawerProps) {
  const { toast } = useToast()

  if (!isOpen || !lead) return null

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    
    return phone
  }

  const distressFlags = [
    { key: 'is_foreclosure', label: 'Foreclosure', value: lead.is_foreclosure },
    { key: 'has_open_liens', label: 'Open Liens', value: lead.has_open_liens },
    { key: 'is_tax_delinquent', label: 'Tax Delinquent', value: lead.is_tax_delinquent },
    { key: 'is_in_bankruptcy', label: 'Bankruptcy', value: lead.is_in_bankruptcy },
    { key: 'filed_for_divorce_30_days', label: 'Recent Divorce', value: lead.filed_for_divorce_30_days },
    { key: 'is_the_owner_deceased', label: 'Deceased Owner', value: lead.is_the_owner_deceased }
  ].filter(flag => flag.value)

  const copyContact = async () => {
    const contactInfo = []
    
    if (lead.primary_owner) contactInfo.push(`Owner: ${lead.primary_owner}`)
    if (lead.other_owner) contactInfo.push(`Co-Owner: ${lead.other_owner}`)
    
    if (lead.phones_primary_owner && lead.phones_primary_owner.length > 0) {
      contactInfo.push(`Phones: ${lead.phones_primary_owner.map(formatPhoneNumber).join(', ')}`)
    }
    
    if (lead.emails_primary_owner && lead.emails_primary_owner.length > 0) {
      contactInfo.push(`Emails: ${lead.emails_primary_owner.join(', ')}`)
    }
    
    if (lead.property_address) contactInfo.push(`Address: ${lead.property_address}`)
    
    await navigator.clipboard.writeText(contactInfo.join('\n'))
    toast({
      title: "Copied to clipboard",
      description: "Contact information has been copied to your clipboard."
    })
  }

  const openCmaReport = () => {
    if (lead.cma_url) {
      window.open(lead.cma_url, '_blank', 'noopener,noreferrer')
    }
  }

  const renderParsedData = (data: any, level = 0) => {
    if (typeof data !== 'object' || data === null) {
      return <span className="text-gray-900">{String(data)}</span>
    }

    if (Array.isArray(data)) {
      return (
        <div className="space-y-1">
          {data.map((item, index) => (
            <div key={index} className="flex">
              <span className="text-gray-600 mr-2">[{index}]:</span>
              {renderParsedData(item, level + 1)}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className={`space-y-2 ${level > 0 ? 'ml-4 border-l border-gray-200 pl-4' : ''}`}>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row">
            <span className="text-sm font-medium text-gray-600 min-w-[120px]">
              {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
            </span>
            <div className="flex-1">
              {renderParsedData(value, level + 1)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {lead.primary_owner || 'Unknown Owner'}
            </h2>
            {lead.other_owner && (
              <p className="text-sm text-gray-500">& {lead.other_owner}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          {/* Distress Badges */}
          {distressFlags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {distressFlags.map((flag, index) => (
                <span
                  key={index}
                  className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full border border-red-200"
                >
                  {flag.label}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            {lead.cma_url && (
              <Button
                onClick={openCmaReport}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View CMA Report
              </Button>
            )}
            <Button variant="outline" onClick={copyContact}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Contact
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact</h3>
              
              {lead.phones_primary_owner && lead.phones_primary_owner.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Primary Owner Phones</span>
                  </div>
                  <div className="space-y-1">
                    {lead.phones_primary_owner.map((phone, index) => (
                      <p key={index} className="text-sm text-gray-900 ml-6">
                        {formatPhoneNumber(phone)}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {lead.emails_primary_owner && lead.emails_primary_owner.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">Primary Owner Emails</span>
                  </div>
                  <div className="space-y-1">
                    {lead.emails_primary_owner.map((email, index) => (
                      <p key={index} className="text-sm text-gray-900 ml-6">{email}</p>
                    ))}
                  </div>
                </div>
              )}

              {lead.primary_owner_age && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Age: </span>
                  <span className="text-sm text-gray-900">{lead.primary_owner_age}</span>
                </div>
              )}
            </div>

            {/* Property Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Property</h3>
              
              {lead.property_address && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Address: </span>
                  <p className="text-sm text-gray-900">{lead.property_address}</p>
                </div>
              )}

              {lead.property_type && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Type: </span>
                  <span className="text-sm text-gray-900">{lead.property_type}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {lead.beds && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Beds: </span>
                    <span className="text-sm text-gray-900">{lead.beds}</span>
                  </div>
                )}
                {lead.baths && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Baths: </span>
                    <span className="text-sm text-gray-900">{lead.baths}</span>
                  </div>
                )}
                {lead.sqft && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Sq Ft: </span>
                    <span className="text-sm text-gray-900">{lead.sqft.toLocaleString()}</span>
                  </div>
                )}
                {lead.year_built && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Built: </span>
                    <span className="text-sm text-gray-900">{lead.year_built}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Financials</h3>
              
              {lead.estimated_value && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Estimated Value: </span>
                  <span className="text-sm text-gray-900">${lead.estimated_value.toLocaleString()}</span>
                </div>
              )}

              {lead.equity_percent && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Equity: </span>
                  <span className="text-sm text-gray-900">{lead.equity_percent}%</span>
                </div>
              )}

              {lead.last_transfer_value && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Last Transfer: </span>
                  <span className="text-sm text-gray-900">${lead.last_transfer_value.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Legal & Distress */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Legal & Distress</h3>
              
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">On Market:</span>
                    <span className="text-sm text-gray-900">{lead.is_on_the_market ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Delinquent:</span>
                    <span className="text-sm text-gray-900">{lead.is_tax_delinquent ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Foreclosure:</span>
                    <span className="text-sm text-gray-900">{lead.is_foreclosure ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bankruptcy:</span>
                    <span className="text-sm text-gray-900">{lead.is_in_bankruptcy ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Raw Data (Collapsible) */}
          <details className="mt-8">
            <summary className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-gray-700">
              Additional Fields
            </summary>
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              {lead.raw && typeof lead.raw === 'object' ? (
                <div className="text-sm">
                  {renderParsedData(lead.raw)}
                </div>
              ) : (
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(lead.raw, null, 2)}
                </pre>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  )
}
