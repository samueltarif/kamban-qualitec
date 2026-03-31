import { ref, useState } from '#imports'
import type { Database, Tables } from '#shared/types/database'
import { createClient } from '@supabase/supabase-js'
import type { AuthUser } from '#shared/types/auth'

type SupabaseClient = ReturnType<typeof createClient<Database>>
type Task = Tables<'tasks'>
type Board = Tables<'boards'>

export interface TaskWithBoard {
  id: string
  title: string
  description: string | null
  status_id: string | null
  priority_id: string | null
  due_date: string | null
  start_date: string | null
  board: {
    id: string
    name: string
  }
  group: {
    id: string
    name: string
  } | null
}

export function useMyTasks() {
  function getClient(): SupabaseClient {
    if (import.meta.server) {
      throw new Error('[useMyTasks] Supabase client não disponível no SSR')
    }
    return useNuxtApp().$supabase as SupabaseClient
  }

  const authUser = useState<AuthUser | null>('auth:user', () => null)
  
  const tasks = ref<TaskWithBoard[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyTasks() {
    if (!authUser.value) return

    loading.value = true
    error.value = null

    try {
      const supabase = getClient()
      
      // Buscar tarefas onde o usuário é assignee
      const { data, error: fetchError } = await supabase
        .from('task_assignees')
        .select(`
          task_id,
          tasks:task_id (
            id,
            title,
            description,
            status_id,
            priority_id,
            due_date,
            start_date,
            board_id,
            group_id,
            boards:board_id (
              id,
              name
            ),
            task_groups:group_id (
              id,
              name
            )
          )
        `)
        .eq('user_id', authUser.value.id)

      if (fetchError) throw fetchError

      tasks.value = (data || [])
        .filter(item => item.tasks)
        .map(item => {
          const task = item.tasks as any
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            status_id: task.status_id,
            priority_id: task.priority_id,
            due_date: task.due_date,
            start_date: task.start_date,
            board: {
              id: task.boards?.id || task.board_id,
              name: task.boards?.name || 'Sem board'
            },
            group: task.task_groups ? {
              id: task.task_groups.id,
              name: task.task_groups.name
            } : null
          }
        })
    } catch (e: any) {
      error.value = e.message
      console.error('Error fetching my tasks:', e)
    } finally {
      loading.value = false
    }
  }

  function getTasksByBoard() {
    const grouped = new Map<string, TaskWithBoard[]>()
    
    tasks.value.forEach(task => {
      const boardId = task.board.id
      if (!grouped.has(boardId)) {
        grouped.set(boardId, [])
      }
      grouped.get(boardId)!.push(task)
    })
    
    return Array.from(grouped.entries()).map(([boardId, boardTasks]) => ({
      boardId,
      boardName: boardTasks[0]?.board.name || 'Sem nome',
      tasks: boardTasks
    }))
  }

  function getTasksDueToday() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.value.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate >= today && dueDate < tomorrow
    })
  }

  function getOverdueTasks() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return tasks.value.filter(task => {
      if (!task.due_date) return false
      const dueDate = new Date(task.due_date)
      return dueDate < today
    })
  }

  return {
    tasks,
    loading,
    error,
    fetchMyTasks,
    getTasksByBoard,
    getTasksDueToday,
    getOverdueTasks
  }
}
