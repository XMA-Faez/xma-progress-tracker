import { createClient } from '@/lib/supabase-server'
import AdminDashboardContent from './AdminDashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all clients
  const { data: clients, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  // Fetch user's pinned clients
  let pinnedClientIds: string[] = []
  if (user) {
    const { data: pins } = await supabase
      .from('user_client_pins')
      .select('client_id')
      .eq('user_id', user.id)
    
    pinnedClientIds = pins?.map(pin => pin.client_id) || []
  }

  return <AdminDashboardContent clients={clients} pinnedClientIds={pinnedClientIds} userId={user?.id} />
}
