import { z } from 'zod'

const reorderSchema = z.object({
  group_id: z.string().uuid(),
  task_ids: z.array(z.string().uuid()).min(1)
})

export default defineEventHandler(async (event) => {
  const supabase = getSupabaseClient(event)
  const user = await getSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  // Validate input
  const body = await readBody(event)
  const validation = reorderSchema.safeParse(body)
  
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: validation.error.errors
    })
  }

  const { group_id, task_ids } = validation.data

  // Verify all tasks belong to the same group
  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select('id, group_id, board_id')
    .in('id', task_ids)

  if (fetchError) {
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch tasks'
    })
  }

  if (!tasks || tasks.length !== task_ids.length) {
    throw createError({
      statusCode: 400,
      message: 'Some tasks not found'
    })
  }

  // Verify all tasks belong to the specified group
  const invalidTasks = tasks.filter(t => t.group_id !== group_id)
  if (invalidTasks.length > 0) {
    throw createError({
      statusCode: 400,
      message: 'All tasks must belong to the same group'
    })
  }

  const boardId = tasks[0].board_id

  // Check user permission on the board
  const { data: profile } = await supabase
    .from('profiles')
    .select('role_global')
    .eq('id', user.id)
    .single()

  const isMaster = profile?.role_global === 'master'

  if (!isMaster) {
    // Check if user is board member with edit permissions
    const { data: members, error: memberError } = await supabase
      .from('board_members')
      .select('access_role')
      .eq('board_id', boardId)
      .eq('user_id', user.id)

    // If query fails or no member found, check if user is board creator
    if (memberError || !members || members.length === 0) {
      const { data: board } = await supabase
        .from('boards')
        .select('created_by')
        .eq('id', boardId)
        .single()

      if (board?.created_by !== user.id) {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions'
        })
      }
    } else {
      const canEdit = members[0].access_role === 'owner' || members[0].access_role === 'editor'
      
      if (!canEdit) {
        throw createError({
          statusCode: 403,
          message: 'Insufficient permissions'
        })
      }
    }
  }

  // Update positions in order
  const updates = task_ids.map((taskId, index) => ({
    id: taskId,
    position: index
  }))

  // Execute updates in a transaction-like manner
  for (const update of updates) {
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ position: update.position })
      .eq('id', update.id)

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: 'Failed to update task position'
      })
    }
  }

  return { success: true }
})
