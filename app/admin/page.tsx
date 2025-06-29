import { createClient } from '@/lib/supabase-server'
import AdminDashboardContent from './AdminDashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  return <AdminDashboardContent clients={clients} />
}
