export type ViewKey = 'dashboard' | 'pipeline' | 'contacts' | 'companies' | 'tasks' | 'settings'

export type Organization = { id: string; name: string }
export type Contact = {
  id: string
  organization_id: string
  name: string
  email?: string | null
  phone?: string | null
  whatsapp?: string | null
  instagram?: string | null
  source?: string | null
  status: string
  tags?: string[] | null
  owner_id?: string | null
  created_at?: string
}
export type Company = {
  id: string
  organization_id: string
  name: string
  website?: string | null
  phone?: string | null
  email?: string | null
}
export type Pipeline = { id: string; organization_id: string; name: string; is_default: boolean }
export type Stage = { id: string; organization_id: string; pipeline_id: string; name: string; position: number; probability: number }
export type Deal = {
  id: string
  organization_id: string
  pipeline_id: string
  stage_id: string
  contact_id?: string | null
  company_id?: string | null
  title: string
  value: number
  currency: string
  status: 'open' | 'won' | 'lost'
  expected_close_date?: string | null
}
export type Task = {
  id: string
  organization_id: string
  title: string
  description?: string | null
  due_at?: string | null
  status: 'pending' | 'done' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  contact_id?: string | null
  deal_id?: string | null
}
