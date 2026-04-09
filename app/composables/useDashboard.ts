import { ref, computed } from 'vue'
import type { Tables } from '#shared/types/database'

interface DashboardStats {
  openTasks: number
  inProgressTasks: number
  completedToday: number
  overdueTasks: number
}

interface RecentBoard {
  id: string
  name: string
  workspace_name: string | null
  last_accessed: string
  task_count: number
}

export function useDashboard() {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const stats = ref<DashboardStats>({
    openTasks: 0,
    inProgressTasks: 0,
    completedToday: 0,
    overdueTasks: 0
  })
  
  const recentBoards = ref<RecentBoard[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchStats() {
    if (!user.value) return

    try {
      isLoading.value = true
      error.value = null

      // Buscar todas as tarefas do usuário (como assignee ou membro do board)
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          id,
          status_id,
          due_date,
          created_at,
          task_statuses (
            id,
            name,
            color,
            is_done
          ),
          boards!inner (
            id,
            board_members!inner (
              user_id
            )
          ),
          task_assignees!left (
            user_id
          )
        `)
        .or(`task_assignees.user_id.eq.${user.value.id},boards.board_members.user_id.eq.${user.value.id}`)

      if (tasksError) throw tasksError

      // Buscar subtarefas
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select(`
          id,
          status_id,
          due_date,
          created_at,
          is_done,
          task_statuses (
            id,
            name,
            color,
            is_done
          ),
          tasks!inner (
            id,
            boards!inner (
              id,
              board_members!inner (
                user_id
              )
            )
          ),
          subtask_assignees!left (
            user_id
          )
        `)
        .or(`subtask_assignees.user_id.eq.${user.value.id},tasks.boards.board_members.user_id.eq.${user.value.id}`)

      if (subtasksError) throw subtasksError

      // Calcular estatísticas
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Tarefas abertas (não concluídas)
      const openTasksCount = (tasks || []).filter(t => !t.task_statuses?.is_done).length
      const openSubtasksCount = (subtasks || []).filter(s => !s.is_done && !s.task_statuses?.is_done).length
      stats.value.openTasks = openTasksCount + openSubtasksCount

      // Em andamento (status específico ou com assignee mas não concluído)
      const inProgressTasksCount = (tasks || []).filter(t => 
        !t.task_statuses?.is_done && 
        t.task_assignees && 
        t.task_assignees.length > 0
      ).length
      const inProgressSubtasksCount = (subtasks || []).filter(s => 
        !s.is_done && 
        !s.task_statuses?.is_done && 
        s.subtask_assignees && 
        s.subtask_assignees.length > 0
      ).length
      stats.value.inProgressTasks = inProgressTasksCount + inProgressSubtasksCount

      // Concluídas hoje
      const completedTodayTasksCount = (tasks || []).filter(t => {
        if (!t.task_statuses?.is_done) return false
        // Verificar se foi atualizada hoje (aproximação)
        return true // TODO: adicionar campo updated_at para precisão
      }).length
      const completedTodaySubtasksCount = (subtasks || []).filter(s => {
        if (!s.is_done && !s.task_statuses?.is_done) return false
        return true // TODO: adicionar campo updated_at para precisão
      }).length
      stats.value.completedToday = completedTodayTasksCount + completedTodaySubtasksCount

      // Atrasadas (due_date no passado e não concluídas)
      const overdueTasksCount = (tasks || []).filter(t => {
        if (t.task_statuses?.is_done) return false
        if (!t.due_date) return false
        const dueDate = new Date(t.due_date)
        return dueDate < today
      }).length
      const overdueSubtasksCount = (subtasks || []).filter(s => {
        if (s.is_done || s.task_statuses?.is_done) return false
        if (!s.due_date) return false
        const dueDate = new Date(s.due_date)
        return dueDate < today
      }).length
      stats.value.overdueTasks = overdueTasksCount + overdueSubtasksCount

    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      error.value = err instanceof Error ? err.message : 'Erro ao carregar estatísticas'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchRecentBoards() {
    if (!user.value) return

    try {
      // Buscar boards recentes do usuário
      const { data, error: boardsError } = await supabase
        .from('boards')
        .select(`
          id,
          name,
          workspaces (
            name
          ),
          board_members!inner (
            user_id,
            last_accessed
          ),
          tasks (
            id
          )
        `)
        .eq('board_members.user_id', user.value.id)
        .order('board_members.last_accessed', { ascending: false })
        .limit(5)

      if (boardsError) throw boardsError

      recentBoards.value = (data || []).map(board => ({
        id: board.id,
        name: board.name,
        workspace_name: board.workspaces?.name || null,
        last_accessed: board.board_members[0]?.last_accessed || new Date().toISOString(),
        task_count: board.tasks?.length || 0
      }))

    } catch (err) {
      console.error('Error fetching recent boards:', err)
    }
  }

  // Subscrição em tempo real para atualizações
  function subscribeToUpdates() {
    if (!user.value) return

    // Subscrever mudanças em tasks
    const tasksChannel = supabase
      .channel('dashboard-tasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    // Subscrever mudanças em subtasks
    const subtasksChannel = supabase
      .channel('dashboard-subtasks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subtasks'
        },
        () => {
          fetchStats()
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(tasksChannel)
      supabase.removeChannel(subtasksChannel)
    }
  }

  return {
    stats: computed(() => stats.value),
    recentBoards: computed(() => recentBoards.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchStats,
    fetchRecentBoards,
    subscribeToUpdates
  }
}
