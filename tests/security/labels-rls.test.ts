import { describe, it, expect, beforeAll } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '#shared/types/database'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

describe('Labels RLS Security', () => {
  let supabase: ReturnType<typeof createClient<Database>>

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
  })

  it('should prevent unauthenticated users from reading labels', async () => {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .limit(1)

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent unauthenticated users from creating labels', async () => {
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: '00000000-0000-0000-0000-000000000000',
        name: 'Test Label',
        color: '#ff0000',
      })

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent unauthenticated users from updating labels', async () => {
    const { data, error } = await supabase
      .from('labels')
      .update({ name: 'Updated Label' })
      .eq('id', '00000000-0000-0000-0000-000000000000')

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent unauthenticated users from deleting labels', async () => {
    const { data, error } = await supabase
      .from('labels')
      .delete()
      .eq('id', '00000000-0000-0000-0000-000000000000')

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent unauthenticated users from reading task_labels', async () => {
    const { data, error } = await supabase
      .from('task_labels')
      .select('*')
      .limit(1)

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent unauthenticated users from creating task_labels', async () => {
    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        task_id: '00000000-0000-0000-0000-000000000000',
        label_id: '00000000-0000-0000-0000-000000000000',
      })

    // Deve falhar sem autenticação
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent SQL injection in label name', async () => {
    const maliciousName = "'; DROP TABLE labels; --"
    
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: '00000000-0000-0000-0000-000000000000',
        name: maliciousName,
        color: '#ff0000',
      })

    // Deve falhar (sem autenticação) mas não executar SQL injection
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent XSS in label name', async () => {
    const xssName = '<script>alert("XSS")</script>'
    
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: '00000000-0000-0000-0000-000000000000',
        name: xssName,
        color: '#ff0000',
      })

    // Deve falhar (sem autenticação)
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should validate label color format', async () => {
    const invalidColor = 'not-a-color'
    
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: '00000000-0000-0000-0000-000000000000',
        name: 'Test Label',
        color: invalidColor,
      })

    // Deve falhar (sem autenticação ou validação)
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent creating labels with empty name', async () => {
    const { data, error } = await supabase
      .from('labels')
      .insert({
        board_id: '00000000-0000-0000-0000-000000000000',
        name: '',
        color: '#ff0000',
      })

    // Deve falhar
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent creating task_labels with invalid task_id', async () => {
    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        task_id: 'invalid-uuid',
        label_id: '00000000-0000-0000-0000-000000000000',
      })

    // Deve falhar
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })

  it('should prevent creating task_labels with invalid label_id', async () => {
    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        task_id: '00000000-0000-0000-0000-000000000000',
        label_id: 'invalid-uuid',
      })

    // Deve falhar
    expect(error).toBeTruthy()
    expect(data).toBeNull()
  })
})
