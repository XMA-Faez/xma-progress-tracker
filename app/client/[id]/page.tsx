import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import { Stage } from '@/types'
import ClientPageContent from './ClientPageContent'

const stageOrder: Stage[] = ['onboarding', 'pre-production', 'production', 'launch']

export default async function ClientProgressPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  
  // Fetch client by unique_link
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('unique_link', id)
    .single()

  if (clientError || !client) {
    notFound()
  }

  // Fetch all tasks for this client
  const { data: tasks, error: tasksError } = await supabase
    .from('client_tasks')
    .select('*')
    .eq('client_id', client.id)
    .order('order_index', { ascending: true })

  if (tasksError) {
    console.error('Error fetching tasks:', tasksError)
  }

  // Calculate progress
  const completedTasks = tasks?.filter(task => task.completed).length || 0
  const totalTasks = tasks?.length || 0
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate stage completion for progress markers
  const getStageProgress = () => {
    if (!tasks) return { onboarding: 0, preProduction: 0, production: 0, launch: 0 }
    
    const stageTaskCounts = {
      onboarding: tasks.filter(t => t.stage === 'onboarding'),
      preProduction: tasks.filter(t => t.stage === 'pre-production'),
      production: tasks.filter(t => t.stage === 'production'),
      launch: tasks.filter(t => t.stage === 'launch')
    }

    const stageCompletedCounts = {
      onboarding: stageTaskCounts.onboarding.filter(t => t.completed).length,
      preProduction: stageTaskCounts.preProduction.filter(t => t.completed).length,
      production: stageTaskCounts.production.filter(t => t.completed).length,
      launch: stageTaskCounts.launch.filter(t => t.completed).length
    }

    return {
      onboarding: stageTaskCounts.onboarding.length > 0 ? (stageCompletedCounts.onboarding / stageTaskCounts.onboarding.length) * 100 : 0,
      preProduction: stageTaskCounts.preProduction.length > 0 ? (stageCompletedCounts.preProduction / stageTaskCounts.preProduction.length) * 100 : 0,
      production: stageTaskCounts.production.length > 0 ? (stageCompletedCounts.production / stageTaskCounts.production.length) * 100 : 0,
      launch: stageTaskCounts.launch.length > 0 ? (stageCompletedCounts.launch / stageTaskCounts.launch.length) * 100 : 0
    }
  }

  const stageProgress = getStageProgress()
  
  // Calculate milestone positions based on task distribution
  const tasksByStageCount = {
    onboarding: tasks?.filter(t => t.stage === 'onboarding').length || 0,
    preProduction: tasks?.filter(t => t.stage === 'pre-production').length || 0,
    production: tasks?.filter(t => t.stage === 'production').length || 0,
    launch: tasks?.filter(t => t.stage === 'launch').length || 0
  }

  const milestone1 = totalTasks > 0 ? (tasksByStageCount.onboarding / totalTasks) * 100 : 25
  const milestone2 = totalTasks > 0 ? ((tasksByStageCount.onboarding + tasksByStageCount.preProduction) / totalTasks) * 100 : 50
  const milestone3 = totalTasks > 0 ? ((tasksByStageCount.onboarding + tasksByStageCount.preProduction + tasksByStageCount.production) / totalTasks) * 100 : 75

  // Group tasks by stage
  const tasksByStage = tasks?.reduce((acc, task) => {
    if (!acc[task.stage]) acc[task.stage] = []
    acc[task.stage].push(task)
    return acc
  }, {} as Record<Stage, typeof tasks>) || {} as Record<Stage, any[]>

  return (
    <ClientPageContent
      client={client}
      tasks={tasks || []}
      completedTasks={completedTasks}
      totalTasks={totalTasks}
      progressPercentage={progressPercentage}
      milestone1={milestone1}
      milestone2={milestone2}
      milestone3={milestone3}
      tasksByStage={tasksByStage}
    />
  )
}
