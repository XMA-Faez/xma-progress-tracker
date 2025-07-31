import { createClient } from '@/lib/supabase-server'
import { ExecutiveOverview } from '@/components/ExecutiveOverview'

export default async function OverviewPage() {
  const supabase = await createClient()

  const [
    { data: clients },
    { data: teamMembers },
    { data: tasks }
  ] = await Promise.all([
    supabase
      .from('clients')
      .select(`
        *,
        client_tasks (
          *,
          team_members (name, role),
          task_assignments (
            team_member_id,
            team_members (id, name, role)
          )
        )
      `)
      .order('created_at', { ascending: false }),
    
    supabase
      .from('team_members')
      .select('*')
      .eq('active', true)
      .order('name'),
    
    supabase
      .from('client_tasks')
      .select(`
        *,
        clients (name),
        team_members (name, role),
        task_assignments (
          team_member_id,
          team_members (id, name, role)
        )
      `)
      .order('created_at', { ascending: false })
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Executive Overview</h1>
        <p className="text-slate-300">Complete overview of team performance and project progress</p>
      </div>
      
      <ExecutiveOverview 
        clients={clients || []} 
        teamMembers={teamMembers || []} 
        tasks={tasks || []} 
      />
    </div>
  )
}
