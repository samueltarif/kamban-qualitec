import { describe, it, expect } from 'vitest'

describe('Labels Input Validation', () => {
  // Função auxiliar para validar nome de label
  function validateLabelName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: 'Nome da etiqueta não pode ser vazio' }
    }

    if (name.length > 50) {
      return { valid: false, error: 'Nome da etiqueta não pode ter mais de 50 caracteres' }
    }

    // Prevenir caracteres especiais perigosos
    const dangerousChars = /<|>|&|"|'|`/
    if (dangerousChars.test(name)) {
      return { valid: false, error: 'Nome da etiqueta contém caracteres inválidos' }
    }

    return { valid: true }
  }

  // Função auxiliar para validar cor de label
  function validateLabelColor(color: string): { valid: boolean; error?: string } {
    if (!color || color.trim().length === 0) {
      return { valid: false, error: 'Cor da etiqueta não pode ser vazia' }
    }

    // Validar formato hexadecimal (#RRGGBB)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    if (!hexColorRegex.test(color)) {
      return { valid: false, error: 'Cor da etiqueta deve estar no formato #RRGGBB' }
    }

    return { valid: true }
  }

  describe('Label Name Validation', () => {
    it('should accept valid label names', () => {
      const validNames = [
        'Urgente',
        'Em Progresso',
        'Revisão Necessária',
        'Bug',
        'Feature',
        'Documentação',
      ]

      validNames.forEach(name => {
        const result = validateLabelName(name)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should reject empty label names', () => {
      const emptyNames = ['', '   ', '\t', '\n']

      emptyNames.forEach(name => {
        const result = validateLabelName(name)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Nome da etiqueta não pode ser vazio')
      })
    })

    it('should reject label names that are too long', () => {
      const longName = 'A'.repeat(51)
      const result = validateLabelName(longName)
      
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Nome da etiqueta não pode ter mais de 50 caracteres')
    })

    it('should reject label names with XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        '<img src=x onerror=alert("XSS")>',
        '<svg onload=alert("XSS")>',
        'javascript:alert("XSS")',
        '<iframe src="javascript:alert(\'XSS\')">',
      ]

      xssAttempts.forEach(name => {
        const result = validateLabelName(name)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Nome da etiqueta contém caracteres inválidos')
      })
    })

    it('should reject label names with HTML entities', () => {
      const htmlEntities = [
        '&lt;script&gt;',
        '&quot;test&quot;',
        '&#60;script&#62;',
      ]

      htmlEntities.forEach(name => {
        const result = validateLabelName(name)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Nome da etiqueta contém caracteres inválidos')
      })
    })

    it('should reject label names with SQL injection attempts', () => {
      const sqlInjections = [
        "'; DROP TABLE labels; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users--",
      ]

      sqlInjections.forEach(name => {
        const result = validateLabelName(name)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Nome da etiqueta contém caracteres inválidos')
      })
    })
  })

  describe('Label Color Validation', () => {
    it('should accept valid hex colors', () => {
      const validColors = [
        '#ff0000',
        '#00ff00',
        '#0000ff',
        '#ffffff',
        '#000000',
        '#6366f1',
        '#ef4444',
      ]

      validColors.forEach(color => {
        const result = validateLabelColor(color)
        expect(result.valid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    it('should reject empty colors', () => {
      const emptyColors = ['', '   ', '\t']

      emptyColors.forEach(color => {
        const result = validateLabelColor(color)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Cor da etiqueta não pode ser vazia')
      })
    })

    it('should reject invalid hex color formats', () => {
      const invalidColors = [
        'red',
        'rgb(255, 0, 0)',
        '#ff',
        '#ffff',
        '#fffff',
        '#fffffff',
        'ff0000',
        '#gg0000',
        '#xyz123',
      ]

      invalidColors.forEach(color => {
        const result = validateLabelColor(color)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Cor da etiqueta deve estar no formato #RRGGBB')
      })
    })

    it('should reject colors with XSS attempts', () => {
      const xssColors = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        'url(javascript:alert("XSS"))',
      ]

      xssColors.forEach(color => {
        const result = validateLabelColor(color)
        expect(result.valid).toBe(false)
        expect(result.error).toBe('Cor da etiqueta deve estar no formato #RRGGBB')
      })
    })
  })

  describe('Label Data Sanitization', () => {
    it('should trim whitespace from label names', () => {
      const name = '  Urgente  '
      const trimmed = name.trim()
      
      expect(trimmed).toBe('Urgente')
      expect(validateLabelName(trimmed).valid).toBe(true)
    })

    it('should normalize label colors to lowercase', () => {
      const color = '#FF0000'
      const normalized = color.toLowerCase()
      
      expect(normalized).toBe('#ff0000')
      expect(validateLabelColor(normalized).valid).toBe(true)
    })

    it('should escape HTML in label names before display', () => {
      const dangerousName = '<b>Bold Label</b>'
      const escaped = dangerousName
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
      
      expect(escaped).toBe('&lt;b&gt;Bold Label&lt;/b&gt;')
    })
  })

  describe('Label Relationship Validation', () => {
    it('should validate UUID format for task_id', () => {
      const validUUIDs = [
        '123e4567-e89b-12d3-a456-426614174000',
        '00000000-0000-0000-0000-000000000000',
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
      ]

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      validUUIDs.forEach(uuid => {
        expect(uuidRegex.test(uuid)).toBe(true)
      })
    })

    it('should reject invalid UUID formats', () => {
      const invalidUUIDs = [
        'not-a-uuid',
        '123',
        '123e4567-e89b-12d3-a456',
        '123e4567-e89b-12d3-a456-42661417400g',
        '',
      ]

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      invalidUUIDs.forEach(uuid => {
        expect(uuidRegex.test(uuid)).toBe(false)
      })
    })
  })
})
