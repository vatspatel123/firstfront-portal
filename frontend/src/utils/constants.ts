/**
 * Shared constants — aligned with backend enums.
 */

export const SERVICE_TYPES = [
  { id: 'pre-plan', name: 'Pre-Plan Design', desc: 'Quick 3D layout & shadow analysis', icon: 'Sun' },
  { id: 'detailed', name: 'Detailed Design & Consultancy', desc: 'Complete engineering with PVsyst simulations', icon: 'FileSearch' },
  { id: 'mw-scale', name: 'MW-Scale Project', desc: 'Utility-scale ground mount & substation design', icon: 'Building2' },
  { id: 'ceig', name: 'CEIG Drawing', desc: 'Compliant electrical drawings for approvals', icon: 'FileText' },
  { id: 'shadow', name: 'Shadow Analysis & Certificate', desc: 'Detailed shadow report with structure certificate', icon: 'Search' },
]

export const PROJECT_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  new:                { label: 'New',              color: 'text-blue-700',    bgColor: 'bg-blue-50' },
  data_review:        { label: 'Data Review',      color: 'text-purple-700',  bgColor: 'bg-purple-50' },
  missing_data:       { label: 'Missing Data',     color: 'text-amber-700',   bgColor: 'bg-amber-50' },
  data_complete:      { label: 'Data Complete',    color: 'text-brand-600',   bgColor: 'bg-brand-50' },
  assigned:           { label: 'Assigned',         color: 'text-indigo-700',  bgColor: 'bg-indigo-50' },
  design_in_progress: { label: 'In Design',        color: 'text-sun-700',     bgColor: 'bg-sun-50' },
  qa_review:          { label: 'QA Review',        color: 'text-violet-700',  bgColor: 'bg-violet-50' },
  approved:           { label: 'Approved',         color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  delivered:          { label: 'Delivered',         color: 'text-green-700',   bgColor: 'bg-green-50' },
}

export const LEAD_STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  new:               { label: 'New',               color: 'text-blue-700',    bgColor: 'bg-blue-50' },
  contacted:         { label: 'Contacted',         color: 'text-sky-700',     bgColor: 'bg-sky-50' },
  interested:        { label: 'Interested',        color: 'text-indigo-700',  bgColor: 'bg-indigo-50' },
  followup:          { label: 'Follow-up',         color: 'text-amber-700',   bgColor: 'bg-amber-50' },
  meeting_scheduled: { label: 'Meeting Scheduled', color: 'text-purple-700',  bgColor: 'bg-purple-50' },
  quotation_sent:    { label: 'Quotation Sent',    color: 'text-sun-700',     bgColor: 'bg-sun-50' },
  converted:         { label: 'Converted',         color: 'text-green-700',   bgColor: 'bg-green-50' },
  lost:              { label: 'Lost',              color: 'text-red-700',     bgColor: 'bg-red-50' },
}

export const USER_ROLES: Record<string, { label: string; color: string; bgColor: string }> = {
  client:   { label: 'Client',   color: 'text-blue-700',   bgColor: 'bg-blue-50' },
  designer: { label: 'Designer', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  admin:    { label: 'Admin',    color: 'text-red-700',    bgColor: 'bg-red-50' },
  sales:    { label: 'Sales',    color: 'text-amber-700',  bgColor: 'bg-amber-50' },
}

export const PROPERTY_TYPES = [
  { id: 'residential', label: 'Residential' },
  { id: 'commercial',  label: 'Commercial' },
  { id: 'industrial',  label: 'Industrial' },
]
