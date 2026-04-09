-- Add is_done column to task_statuses table
alter table public.task_statuses 
  add column is_done boolean not null default false;

-- Add comment explaining the column
comment on column public.task_statuses.is_done is 'Indicates if tasks with this status are considered completed';
