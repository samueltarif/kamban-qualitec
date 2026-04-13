import { z } from 'zod'

const moveToGroupSchema = z.object({
  task_id: z.string().uuid(),
  source_group_id: z.string().uuid(),
  target_group_id: z.string().uuid()
})

export default defineEventHandler(async (event) => {
  console.log('[move-to-group] Request received')
  
  const supabase = getSupabaseClient(event)
  const user = await getSupabaseUser(event)

  if (!user) {
    console.log('[move-to-group] Unauthorized - no user')
    throw createError({
      statusCode: 401,
      message: 'Unauthorized'
    })
  }

  console.log('[move-to-group] User:', user.id)

  // Validate input
  const body = await readBody(event)
  console.log('[move-to-group] Request body:', body)
  
  const validation = moveToGroupSchema.safeParse(body)
  
  if (!validation.success) {
    console.log('[move-to-group] Validation failed:', validation.error.errors)
    throw createError({
      statusCode: 400,
      message: 'Invalid input',
      data: validation.error.errors
    })
  }

  const { task_id, source_group_id, target_group_id } = validation.data
  console.log('[move-to-group] Moving task:', { task_id, source_group_id, target_group_id })

  // Fetch the task to verify it exists and belongs to source group
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, group_id, board_id')
    .eq('id', task_id)
    .single()

  if (taskError || !task) {
    throw createError({
      statusCode: 400,
      message: 'Task not found'
    })
  }

  if (task.group_id !== source_group_id) {
    throw createError({
      statusCode: 400,
      message: 'Task does not belong to source group'
    })
  }

  const boardId = task.board_id

  // Verify both groups belong to the same board
  const { data: groups, error: groupsError } = await supabase
    .from('task_groups')
    .select('id, board_id')
    .in('id', [source_group_id, target_group_id])

  if (groupsError || !groups || groups.length !== 2) {
    throw createError({
      statusCode: 400,
      message: 'Invalid groups'
    })
  }

  const sourceGroup = groups.find(g => g.id === source_group_id)
  const targetGroup = groups.find(g => g.id === target_group_id)

  if (!sourceGroup || !targetGroup) {
    throw createError({
      statusCode: 400,
      message: 'Groups not found'
    })
  }

  if (sourceGroup.board_id !== boardId || targetGroup.board_id !== boardId) {
    throw createError({
      statusCode: 400,
      message: 'Groups must belong to the same board'
    })
  }

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

  // Get max position in target group
  const { data: targetTasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('group_id', target_group_id)
    .order('position', { ascending: false })
    .limit(1)

  const newPosition = targetTasks?.[0]?.position != null ? targetTasks[0].position + 1 : 0

  // Update task's group_id and position
  const { error: updateError } = await supabase
    .from('tasks')
    .update({ 
      group_id: target_group_id,
      position: newPosition,
      updated_at: new Date().toISOString()
    })
    .eq('id', task_id)

  if (updateError) {
    console.error('[move-to-group] Failed to update task:', updateError)
    throw createError({
      statusCode: 500,
      message: 'Failed to move task'
    })
  }

  console.log('[move-to-group] Task updated successfully')

  // Recalculate positions in source group (close gaps)
  const { data: sourceTasks } = await supabase
    .from('tasks')
    .select('id, position')
    .eq('group_id', source_group_id)
    .order('position', { ascending: true })

  if (sourceTasks && sourceTasks.length > 0) {
    console.log('[move-to-group] Recalculating positions for', sourceTasks.length, 'tasks in source group')
    for (let i = 0; i < sourceTasks.length; i++) {
      const sourceTask = sourceTasks[i]
      if (sourceTask.position !== i) {
        await supabase
          .from('tasks')
          .update({ position: i })
          .eq('id', sourceTask.id)
      }
    }
  }

  console.log('[move-to-group] Success!')
  return { success: true }
})
