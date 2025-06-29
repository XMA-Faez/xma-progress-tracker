'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { defaultTasks } from '@/utils/defaultTasks'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewClientPage() {
  const [name, setName] = useState('')
  const [frameLink, setFrameLink] = useState('')
  const [googleDriveLink, setGoogleDriveLink] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Generate unique link
      const uniqueLink = nanoid(10)

      // Create client
      const supabase = createClient()
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .insert({
          name,
          unique_link: uniqueLink,
          frame_link: frameLink || null,
          google_drive_link: googleDriveLink || null,
        })
        .select()
        .single()

      if (clientError) throw clientError

      // Create default tasks for the client
      const clientTasks = defaultTasks.map(task => ({
        ...task,
        client_id: client.id,
      }))

      const { error: tasksError } = await supabase
        .from('client_tasks')
        .insert(clientTasks)

      if (tasksError) throw tasksError

      router.push('/admin')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/admin" className="inline-flex items-center text-sm text-gray-400 hover:text-white">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Client</CardTitle>
          <CardDescription>
            Add a new client and their project tracking page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Client Name / Business Name
              </label>
              <Input
                id="name"
                placeholder="Enter client or business name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="frameLink" className="text-sm font-medium">
                Frame Link (Optional)
              </label>
              <Input
                id="frameLink"
                type="url"
                placeholder="https://frame.io/..."
                value={frameLink}
                onChange={(e) => setFrameLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="googleDriveLink" className="text-sm font-medium">
                Google Drive Link (Optional)
              </label>
              <Input
                id="googleDriveLink"
                type="url"
                placeholder="https://drive.google.com/..."
                value={googleDriveLink}
                onChange={(e) => setGoogleDriveLink(e.target.value)}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-900/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={loading || !name}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
              <Link href="/admin" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}