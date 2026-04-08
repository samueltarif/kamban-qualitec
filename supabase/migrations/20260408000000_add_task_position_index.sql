-- Add index on tasks.position for better query performance when ordering
create index if not exists idx_tasks_group_position 
  on public.tasks(group_id, position);

-- Add comment explaining the index
comment on index idx_tasks_group_position is 
  'Composite index for efficient task ordering within groups';
