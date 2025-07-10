import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { MyTasksDashboard } from '@/components/MyTasksDashboard'

export default async function MyTasksPage() {
  const supabase = createServerComponentClient({ cookies })

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Find team member by email
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('*')
    .eq('email', user?.email)
    .single()

  if (!teamMember) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Team member profile not found</h1>
          <p className="text-slate-300">Please contact your administrator to set up your team profile.</p>
        </div>
      </div>
    )
  }

  // Fetch tasks assigned to this team member
  const { data: tasks } = await supabase
    .from('client_tasks')
    .select(`
      *,
      clients (name),
      task_assignments!inner (
        team_member_id
      )
    `)
    .eq('task_assignments.team_member_id', teamMember.id)
    .order('due_date', { ascending: true, nullsLast: true })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">My Tasks</h1>
        <p className="text-slate-300">Tasks assigned to {teamMember.name}</p>
      </div>
      
      <MyTasksDashboard tasks={tasks || []} teamMember={teamMember} />
    </div>
  )
}
