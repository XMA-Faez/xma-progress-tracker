import { Task } from '@/types'

export const defaultTasks: Omit<Task, 'id'>[] = [
  // ONBOARDING (Touchpoints 1-4)
  {
    name: 'Onboarding call',
    type: 'call',
    stage: 'onboarding',
    touchpoint: 1,
    completed: false,
    description: 'Initial call to welcome the client and discuss project overview',
    order_index: 1
  },
  {
    name: 'Creative Strategy & Writing',
    type: 'project',
    stage: 'onboarding',
    touchpoint: 2,
    completed: false,
    description: 'Develop creative strategy and write initial content for the campaign',
    order_index: 2
  },
  {
    name: 'Account setup call',
    type: 'call',
    stage: 'onboarding',
    touchpoint: 3,
    completed: false,
    description: 'Set up client accounts and review access requirements',
    order_index: 3
  },
  {
    name: 'Customized CRM setup',
    type: 'project',
    stage: 'onboarding',
    touchpoint: 4,
    completed: false,
    description: 'Configure and customize CRM for client-specific needs',
    order_index: 4
  },
  
  // PRE-PRODUCTION (Touchpoints 5-7)
  {
    name: 'Pre-production Call',
    type: 'call',
    stage: 'pre-production',
    touchpoint: 5,
    completed: false,
    description: 'Discuss pre-production requirements and timeline',
    order_index: 5
  },
  {
    name: 'Pre-production Revision Round',
    type: 'revision',
    stage: 'pre-production',
    touchpoint: 6,
    completed: false,
    description: 'Review and revise pre-production materials based on client feedback',
    order_index: 6
  },
  {
    name: 'Video Script and Graphic Brief Approval',
    type: 'project',
    stage: 'pre-production',
    touchpoint: 7,
    completed: false,
    description: 'Finalize and get approval for video scripts and graphic briefs',
    order_index: 7
  },
  
  // PRODUCTION (Touchpoints 8-15)
  {
    name: 'Production Start',
    type: 'project',
    stage: 'production',
    touchpoint: 8,
    completed: false,
    description: 'Begin the production phase of the project',
    order_index: 8
  },
  {
    name: 'Model & Location Selection',
    type: 'project',
    stage: 'production',
    touchpoint: 9,
    completed: false,
    description: 'Select appropriate models and shooting locations',
    order_index: 9
  },
  {
    name: 'Video Shoot',
    type: 'project',
    stage: 'production',
    touchpoint: 10,
    completed: false,
    description: 'Execute the video shoot according to approved scripts',
    order_index: 10
  },
  {
    name: 'Graphics Creation',
    type: 'project',
    stage: 'production',
    touchpoint: 11,
    completed: false,
    description: 'Create graphics and visual assets for the campaign',
    order_index: 11
  },
  {
    name: 'Video Editing',
    type: 'project',
    stage: 'production',
    touchpoint: 12,
    completed: false,
    description: 'Edit video footage and create final video content',
    order_index: 12
  },
  {
    name: 'Post Production Call',
    type: 'call',
    stage: 'production',
    touchpoint: 13,
    completed: false,
    description: 'Review production outputs and discuss post-production needs',
    order_index: 13
  },
  {
    name: 'Post-production Revision Round',
    type: 'revision',
    stage: 'production',
    touchpoint: 14,
    completed: false,
    description: 'Implement revisions based on post-production feedback',
    order_index: 14
  },
  {
    name: 'Post-production Creatives Approval',
    type: 'project',
    stage: 'production',
    touchpoint: 15,
    completed: false,
    description: 'Get final approval on all creative assets',
    order_index: 15
  },
  
  // LAUNCH (Touchpoints 16-17)
  {
    name: 'Pre-launch Call',
    type: 'call',
    stage: 'launch',
    touchpoint: 16,
    completed: false,
    description: 'Final review before campaign launch',
    order_index: 16
  },
  {
    name: 'Ads Launch',
    type: 'project',
    stage: 'launch',
    touchpoint: 17,
    completed: false,
    description: 'Launch advertising campaign across all channels',
    order_index: 17
  }
]