
export interface Lead {
  id: string
  row_number?: number
  date_key: string
  created_at: string
  primary_owner?: string
  primary_owner_age?: number
  primary_owner_occupation?: string
  other_owner?: string
  other_owner_age?: number
  other_owner_occupation?: string
  phones_primary_owner?: string[]
  phones_other_owner?: string[]
  emails_primary_owner?: string[]
  emails_other_owner?: string[]
  property_type?: string
  property_address?: string
  number_of_loans?: number
  first_loan_type?: string
  first_loan_amount?: number
  first_loan_purpose?: string
  year_built?: number
  sqft?: number
  lot?: number
  beds?: number
  baths?: number
  estimated_value?: number
  equity_percent?: number
  zoning?: string
  listings_status?: string
  is_on_the_market?: boolean
  dom?: number
  listing_date?: string
  listing_price?: number
  last_transfer_recording_date?: string
  last_transfer_value?: number
  is_tax_delinquent?: boolean
  delinquent_amount?: number
  delinquent_installments?: number
  is_the_owner_deceased?: boolean
  is_in_bankruptcy?: boolean
  mailing_same_as_property?: boolean
  mailing_address?: string
  ownership_type?: string
  is_foreclosure?: boolean
  foreclosure_stage?: string
  foreclosure_recorded_date?: string
  filed_for_divorce_30_days?: boolean
  has_open_liens?: boolean
  cma_url?: string
  raw: any
}

export interface LeadIngest {
  id: string
  received_at: string
  request_ip?: string
  total_items?: number
  payload: any
  status?: string
}
