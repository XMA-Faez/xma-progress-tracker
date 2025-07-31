import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { MinimalTaskManagement, MinimalTaskManagementPremium } from '@/components/MinimalTaskManagement'

export default async function TaskManagementPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!teamMember?.is_admin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-slate-300">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  // Fetch all team members
  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('name')

  // Fetch all clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name')
    .order('name')

  return (
    <div className="min-h-screen">
      <MinimalTaskManagementPremium
        teamMembers={teamMembers || []}
        clients={clients || []}
        currentUser={teamMember}
      />
    </div>
  )
}
