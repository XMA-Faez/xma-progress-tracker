import { createClient } from '@/lib/supabase-server'
import { TeamDashboard } from '@/components/TeamDashboard'
import { TeamMember } from '@/types'

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: teamMembers } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)
    .order('name')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Team Dashboard</h1>
        <p className="text-slate-300">Track what everyone is working on across all projects</p>
      </div>
      
      <TeamDashboard teamMembers={teamMembers as TeamMember[] || []} />
    </div>
  )
}
