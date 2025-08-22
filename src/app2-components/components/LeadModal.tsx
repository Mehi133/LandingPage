
import React, { useEffect, useRef } from 'react'
import { X, Phone, Mail, ExternalLink, Copy, MapPin, Home, User, FileText } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import { Lead } from '@/types/database'
import { useToast } from '@/hooks/use-toast'

interface LeadModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function LeadModal({ lead, isOpen, onClose }: LeadModalProps) {
  const { toast } = useToast()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (isOpen && lead?.property_address && mapRef.current && window.google) {
      initializeMap()
    }
  }, [isOpen, lead])

  useEffect(() => {
    if (isOpen) {
      // Load Google Maps API
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCm6u2vyzhJebdeZynedC_QrfvSnPmjCuA&libraries=places&callback=initMap`
        script.async = true
        window.initMap = initializeMap
        document.head.appendChild(script)
      } else {
        initializeMap()
      }
    }
  }, [isOpen])

  const initializeMap = () => {
    if (!mapRef.current || !lead?.property_address || !window.google) return

    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ address: lead.property_address }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        const map = new window.google.maps.Map(mapRef.current, {
          zoom: 15,
          center: results[0].geometry.location,
          mapTypeId: 'roadmap'
        })

        // Add property marker
        new window.google.maps.Marker({
          position: results[0].geometry.location,
          map: map,
          title: lead.property_address,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#3B82F6"/>
                <circle cx="12" cy="9" r="2.5" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24)
          }
        })

        // Search for nearby amenities
        const service = new window.google.maps.places.PlacesService(map)
        const amenityTypes = ['school', 'park', 'shopping_mall', 'restaurant']
        
        amenityTypes.forEach(type => {
          service.nearbySearch({
            location: results[0].geometry.location,
            radius: 2000,
            type: type
          }, (places: any, status: any) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && places) {
              places.slice(0, 5).forEach((place: any) => {
                new window.google.maps.Marker({
                  position: place.geometry.location,
                  map: map,
                  title: place.name,
                  icon: {
                    url: getAmenityIcon(type),
                    scaledSize: new window.google.maps.Size(20, 20)
                  }
                })
              })
            }
          })
        })

        mapInstance.current = map
      }
    })
  }

  const getAmenityIcon = (type: string) => {
    const colors = {
      school: '#10B981',
      park: '#059669',
      shopping_mall: '#8B5CF6',
      restaurant: '#F59E0B'
    }
    const color = colors[type as keyof typeof colors] || '#6B7280'
    
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="8" fill="${color}"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>
    `)
  }

  if (!isOpen || !lead) return null

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

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return 'N/A'
    return `$${value.toLocaleString()}`
  }

  const formatNumber = (value: number | null | undefined) => {
    if (!value) return 'N/A'
    return value.toLocaleString()
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const formatBoolean = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return 'N/A'
    return (
      <span className={value ? 'text-red-600' : 'text-green-600'}>
        {value ? 'Yes' : 'No'}
      </span>
    )
  }

  const copyContact = async () => {
    const contactInfo = []
    if (lead.primary_owner) contactInfo.push(`Owner: ${lead.primary_owner}`)
    if (lead.other_owner) contactInfo.push(`Co-Owner: ${lead.other_owner}`)
    if (lead.phones_primary_owner && lead.phones_primary_owner.length > 0) {
      contactInfo.push(`Phones: ${lead.phones_primary_owner.map(formatPhoneNumber).join(', ')}`)
    }
    if (lead.emails_primary_owner && lead.emails_primary_owner.length > 0) {
      contactInfo.push(`Emails: ${lead.emails_primary_owner.map(formatEmail).join(', ')}`)
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

  return (
    <TooltipProvider>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {lead.primary_owner || 'Unknown Owner'}
                </h2>
                {lead.other_owner && (
                  <p className="text-gray-600">& {lead.other_owner}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {lead.cma_url && (
                <Button onClick={openCmaReport} className="bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View CMA Report
                </Button>
              )}
              <Button variant="outline" onClick={copyContact}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Contact
              </Button>
              <Button variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                {/* Contact Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Primary Owner</span>
                      <p className="text-sm text-gray-900">{lead.primary_owner || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Other Owner</span>
                      <p className="text-sm text-gray-900">{lead.other_owner || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Primary Owner Age</span>
                      <p className="text-sm text-gray-900">{lead.primary_owner_age || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Primary Owner Occupation</span>
                      <p className="text-sm text-gray-900">{lead.primary_owner_occupation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Other Owner Age</span>
                      <p className="text-sm text-gray-900">{lead.other_owner_age || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Other Owner Occupation</span>
                      <p className="text-sm text-gray-900">{lead.other_owner_occupation || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {lead.phones_primary_owner && lead.phones_primary_owner.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-500 mb-2 block">Primary Owner Phones</span>
                      <div>
                        {lead.phones_primary_owner.map((phone, index) => (
                          <a 
                            key={index} 
                            href={`tel:${formatPhoneNumber(phone)}`}
                            className="text-sm text-gray-900 hover:text-blue-600 whitespace-nowrap block"
                          >
                            {formatPhoneNumber(phone)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.phones_other_owner && lead.phones_other_owner.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-500 mb-2 block">Other Owner Phones</span>
                      <div>
                        {lead.phones_other_owner.map((phone, index) => (
                          <a 
                            key={index} 
                            href={`tel:${formatPhoneNumber(phone)}`}
                            className="text-sm text-gray-900 hover:text-blue-600 whitespace-nowrap block"
                          >
                            {formatPhoneNumber(phone)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.emails_primary_owner && lead.emails_primary_owner.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-500 mb-2 block">Primary Owner Emails</span>
                      <div>
                        {lead.emails_primary_owner.map((email, index) => (
                          <a 
                            key={index} 
                            href={`mailto:${formatEmail(email)}`}
                            className="text-sm text-gray-900 hover:text-blue-600 block"
                          >
                            {formatEmail(email)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {lead.emails_other_owner && lead.emails_other_owner.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-gray-500 mb-2 block">Other Owner Emails</span>
                      <div>
                        {lead.emails_other_owner.map((email, index) => (
                          <a 
                            key={index} 
                            href={`mailto:${formatEmail(email)}`}
                            className="text-sm text-gray-900 hover:text-blue-600 block"
                          >
                            {formatEmail(email)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Property Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-3">
                      <span className="text-sm font-semibold text-gray-500 mb-2 block">Property Address</span>
                      <p className="text-sm text-gray-900">{lead.property_address || 'N/A'}</p>
                    </div>
                    
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Property Type</span>
                      <p className="text-sm text-gray-900">{lead.property_type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Bedrooms</span>
                      <p className="text-sm text-gray-900">{lead.beds || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Bathrooms</span>
                      <p className="text-sm text-gray-900">{lead.baths || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Square Feet</span>
                      <p className="text-sm text-gray-900">{formatNumber(lead.sqft)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Year Built</span>
                      <p className="text-sm text-gray-900">{lead.year_built || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Lot Size</span>
                      <p className="text-sm text-gray-900">{lead.lot ? `${lead.lot} acres` : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Zoning</span>
                      <p className="text-sm text-gray-900">{lead.zoning || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Listing Status</span>
                      <p className="text-sm text-gray-900">{lead.listings_status || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">On Market</span>
                      <p className="text-sm text-gray-900">{formatBoolean(lead.is_on_the_market)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Days on Market</span>
                      <p className="text-sm text-gray-900">{lead.dom || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Listing Date</span>
                      <p className="text-sm text-gray-900">{formatDate(lead.listing_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Listing Price</span>
                      <p className="text-sm text-gray-900">{formatCurrency(lead.listing_price)}</p>
                    </div>
                  </div>

                  {/* Google Maps */}
                  <div className="mt-4">
                    <div ref={mapRef} className="w-full h-64 rounded-lg bg-gray-200" />
                  </div>
                </section>

                {/* Mailing & Ownership Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mailing & Ownership</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Mailing Address</span>
                      <p className="text-sm text-gray-900">{lead.mailing_address || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Mailing Same as Property</span>
                      <p className="text-sm text-gray-900">{formatBoolean(lead.mailing_same_as_property)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Ownership Type</span>
                      <p className="text-sm text-gray-900">{lead.ownership_type || 'N/A'}</p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                {/* Financial Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Estimated Value</span>
                      <p className="text-sm text-gray-900">{formatCurrency(lead.estimated_value)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Equity Percent</span>
                      <p className="text-sm text-gray-900">{lead.equity_percent ? `${lead.equity_percent}%` : 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Last Transfer Value</span>
                      <p className="text-sm text-gray-900">{formatCurrency(lead.last_transfer_value)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Last Transfer Date</span>
                      <p className="text-sm text-gray-900">{formatDate(lead.last_transfer_recording_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Number of Loans</span>
                      <p className="text-sm text-gray-900">{lead.number_of_loans || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">First Loan Type</span>
                      <p className="text-sm text-gray-900">{lead.first_loan_type || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">First Loan Amount</span>
                      <p className="text-sm text-gray-900">{formatCurrency(lead.first_loan_amount)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">First Loan Purpose</span>
                      <p className="text-sm text-gray-900">{lead.first_loan_purpose || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Delinquent Amount</span>
                      <p className="text-sm text-gray-900">{formatCurrency(lead.delinquent_amount)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Delinquent Installments</span>
                      <p className="text-sm text-gray-900">{lead.delinquent_installments || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                {/* Legal & Distress Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal & Distress Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Tax Delinquent</span>
                      <p className="text-sm">{formatBoolean(lead.is_tax_delinquent)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Foreclosure</span>
                      <p className="text-sm">{formatBoolean(lead.is_foreclosure)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Foreclosure Stage</span>
                      <p className="text-sm text-gray-900">{lead.foreclosure_stage || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Foreclosure Recorded Date</span>
                      <p className="text-sm text-gray-900">{formatDate(lead.foreclosure_recorded_date)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Bankruptcy</span>
                      <p className="text-sm">{formatBoolean(lead.is_in_bankruptcy)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Filed for Divorce (30 Days)</span>
                      <p className="text-sm">{formatBoolean(lead.filed_for_divorce_30_days)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Open Liens</span>
                      <p className="text-sm">{formatBoolean(lead.has_open_liens)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Owner Deceased</span>
                      <p className="text-sm">{formatBoolean(lead.is_the_owner_deceased)}</p>
                    </div>
                  </div>
                </section>

                {/* Miscellaneous Section */}
                <section className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Miscellaneous Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Row Number</span>
                      <p className="text-sm text-gray-900">{lead.row_number || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Date Key</span>
                      <p className="text-sm text-gray-900">{lead.date_key || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">Created At</span>
                      <p className="text-sm text-gray-900">{formatDate(lead.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-500">CMA URL</span>
                      <p className="text-sm text-gray-900">{lead.cma_url ? 'Available' : 'N/A'}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
