import { createClient } from '@/lib/supabase-server'
import AdminDashboardContent from './AdminDashboardContent'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Fetch all clients with their assigned team member
  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      assigned_member:team_members!assigned_to (
        id,
        name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching clients:', error)
  }

  // Fetch team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('name')

  // Fetch user's pinned clients
  let pinnedClientIds: string[] = []
  if (user) {
    const { data: pins } = await supabase
      .from('user_client_pins')
      .select('client_id')
      .eq('user_id', user.id)
    
    pinnedClientIds = pins?.map(pin => pin.client_id) || []
  }

  return <AdminDashboardContent 
    clients={clients} 
    pinnedClientIds={pinnedClientIds} 
    userId={user?.id} 
    teamMembers={teamMembers || []}
  />
}
