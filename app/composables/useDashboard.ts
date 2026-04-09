import { ref } from '#imports'
import type { Database } from '~/shared/types/database'

// ===== TIPOS =====
export interface Widget {
  id: string
  type: 'status' | 'assignee' | 'overdue' | 'deadline' | 'priority'
  title: string
  position: { x: number; y: number; w: number; h: number }
}

export interface DashboardState {
  connectedBoards: string[]
  widgets: Widget[]
  filterByPeople: string[]
  isLoading: boolean
}

export interface StatusData {
  statusName: string
  count: number
  color: string
  isDone: boolean
}

export interface AssigneeData {
  userId: string
  userName: string
  userAvatar: string | null
  taskCount: number
}

export interface OverdueTask {
  id: string
  title: string
  dueDate: string
  boardName: string
  assignees: string[]
}

export interface DeadlineData {
  date: string
  count: number
}

// ===== COMPOSABLE =====
export function useDashboard() {
  // Estado reativo
  const connectedBoards = ref<string[]>([])
  const widgets = ref<Widget[]>([])
  const filterByPeople = ref<string[]>([])
  const isLoading = ref(false)

  // Dados dos widgets
  const statusData = ref<StatusData[]>([])
  const assigneeData = ref<AssigneeData[]>([])
  const overdueData = ref<OverdueTask[]>([])
  const deadlineData = ref<DeadlineData[]>([])

  /**
   * Busca tarefas agrupadas por status
   */
  async function fetchTasksByStatus(boardIds: string[]) {
    if (import.meta.server) return
    
    try {
      const { useNuxtApp } = await import('#app')
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase as any
      
      if (!boardIds.length) {
        statusData.value = []
        return
      }

      // Buscar todos os status dos boards conectados
      const { data: statuses, error: statusError } = await supabase
        .from('task_statuses')
        .select('id, name, color, is_done, board_id')
        .in('board_id', boardIds)

      if (statusError) throw statusError

      // Buscar contagem de tarefas por status
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status_id, board_id')
        .in('board_id', boardIds)
        .is('archived_at', null)

      if (tasksError) throw tasksError

      // Agrupar contagem por status
      const statusCounts = new Map<string, number>()
      tasks?.forEach(task => {
        if (task.status_id) {
          statusCounts.set(task.status_id, (statusCounts.get(task.status_id) || 0) + 1)
        }
      })

      // Montar dados finais
      statusData.value = (statuses || []).map(status => ({
        statusName: status.name,
        count: statusCounts.get(status.id) || 0,
        color: status.color,
        isDone: status.is_done
      }))

      console.log('[useDashboard] Status data:', statusData.value)
    } catch (error) {
      console.error('[useDashboard] Error fetching tasks by status:', error)
      statusData.value = []
    }
  }

  /**
   * Busca tarefas agrupadas por responsável (incluindo subtarefas)
   */
  async function fetchTasksByAssignee(boardIds: string[]) {
    if (import.meta.server) return
    
    try {
      const { useNuxtApp } = await import('#app')
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase as any
      
      if (!boardIds.length) {
        console.log('[useDashboard] No board IDs provided')
        assigneeData.value = []
        return
      }

      console.log('[useDashboard] Fetching assignees for boards:', boardIds)

      // Buscar tarefas com assignees (query simplificada)
      const { data: taskAssignees, error: taskError } = await supabase
        .from('task_assignees')
        .select(`
          user_id,
          profiles(id, full_name, avatar_url),
          tasks(board_id, archived_at)
        `)

      console.log('[useDashboard] Raw task_assignees data:', taskAssignees)
      console.log('[useDashboard] Task assignees error:', taskError)

      if (taskError) throw taskError

      // Filtrar apenas os boards conectados e tarefas não arquivadas
      const filteredAssignees = taskAssignees?.filter((item: any) => {
        const boardId = item.tasks?.board_id
        const isArchived = item.tasks?.archived_at
        return boardId && boardIds.includes(boardId) && !isArchived
      })

      console.log('[useDashboard] Filtered assignees:', filteredAssignees)

      // Agrupar por usuário
      const userCounts = new Map<string, { name: string; avatar: string | null; count: number }>()
      
      filteredAssignees?.forEach((item: any) => {
        const userId = item.user_id
        const userName = item.profiles?.full_name || 'Sem nome'
        const userAvatar = item.profiles?.avatar_url || null

        if (userCounts.has(userId)) {
          userCounts.get(userId)!.count++
        } else {
          userCounts.set(userId, { name: userName, avatar: userAvatar, count: 1 })
        }
      })

      // Montar dados finais
      assigneeData.value = Array.from(userCounts.entries())
        .map(([userId, data]) => ({
          userId,
          userName: data.name,
          userAvatar: data.avatar,
          taskCount: data.count
        }))
        .sort((a, b) => b.taskCount - a.taskCount)

      console.log('[useDashboard] Final assignee data:', assigneeData.value)
    } catch (error) {
      console.error('[useDashboard] Error fetching tasks by assignee:', error)
      assigneeData.value = []
    }
  }

  /**
   * Busca tarefas atrasadas
   */
  async function fetchOverdueTasks(boardIds: string[]) {
    if (import.meta.server) return
    
    try {
      const { useNuxtApp } = await import('#app')
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase as any
      
      if (!boardIds.length) {
        overdueData.value = []
        return
      }

      const today = new Date().toISOString().split('T')[0]

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          id,
          title,
          due_date,
          board_id,
          boards!inner(name),
          task_assignees(profiles(full_name))
        `)
        .in('board_id', boardIds)
        .lt('due_date', today)
        .is('archived_at', null)
        .order('due_date', { ascending: true })

      if (error) throw error

      overdueData.value = (tasks || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        dueDate: task.due_date,
        boardName: task.boards?.name || 'Board',
        assignees: task.task_assignees?.map((a: any) => a.profiles?.full_name).filter(Boolean) || []
      }))

      console.log('[useDashboard] Overdue data:', overdueData.value)
    } catch (error) {
      console.error('[useDashboard] Error fetching overdue tasks:', error)
      overdueData.value = []
    }
  }

  /**
   * Busca tarefas agrupadas por data de vencimento
   */
  async function fetchTasksByDueDate(boardIds: string[]) {
    if (import.meta.server) return
    
    try {
      const { useNuxtApp } = await import('#app')
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase as any
      
      if (!boardIds.length) {
        deadlineData.value = []
        return
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('due_date')
        .in('board_id', boardIds)
        .not('due_date', 'is', null)
        .is('archived_at', null)

      if (error) throw error

      // Agrupar por data
      const dateCounts = new Map<string, number>()
      tasks?.forEach(task => {
        if (task.due_date) {
          dateCounts.set(task.due_date, (dateCounts.get(task.due_date) || 0) + 1)
        }
      })

      // Montar dados finais e ordenar por data
      deadlineData.value = Array.from(dateCounts.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      console.log('[useDashboard] Deadline data:', deadlineData.value)
    } catch (error) {
      console.error('[useDashboard] Error fetching tasks by due date:', error)
      deadlineData.value = []
    }
  }

  /**
   * Busca todos os dados do dashboard em paralelo
   */
  async function fetchAllDashboardData() {
    if (import.meta.server) return
    
    isLoading.value = true
    
    try {
      const { useNuxtApp } = await import('#app')
      const nuxtApp = useNuxtApp()
      const supabase = nuxtApp.$supabase as any
      
      // Se não houver boards conectados, buscar todos os boards do usuário
      if (!connectedBoards.value.length) {
        const { data: userBoards } = await supabase
          .from('boards')
          .select('id')
          .limit(10) // Limitar para performance inicial

        if (userBoards) {
          connectedBoards.value = userBoards.map(b => b.id)
        }
      }

      // Buscar todos os dados em paralelo
      await Promise.all([
        fetchTasksByStatus(connectedBoards.value),
        fetchTasksByAssignee(connectedBoards.value),
        fetchOverdueTasks(connectedBoards.value),
        fetchTasksByDueDate(connectedBoards.value)
      ])

      console.log('[useDashboard] All data fetched successfully')
    } catch (error) {
      console.error('[useDashboard] Error fetching dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    // Estado
    connectedBoards,
    widgets,
    filterByPeople,
    isLoading,
    
    // Dados
    statusData,
    assigneeData,
    overdueData,
    deadlineData,
    
    // Métodos
    fetchTasksByStatus,
    fetchTasksByAssignee,
    fetchOverdueTasks,
    fetchTasksByDueDate,
    fetchAllDashboardData
  }
}
