# Correção: Botão de Expandir Subtarefas Fixo no Mobile

## Problema Identificado

No mobile, o botão/seta para expandir subtarefas estava dentro da área com scroll horizontal. Isso causava:
- Usuário precisava arrastar para a direita para ver a seta
- Ao soltar o dedo, a área voltava ao início
- Impossível clicar na seta de forma prática
- UX completamente quebrada no mobile

## Causa Raiz

A estrutura original tinha TUDO dentro de um único container com `overflow-x-auto`:
```vue
<div class="flex items-center gap-2 px-4 py-3 overflow-x-auto">
  <button>Seta</button>  <!-- Dentro do scroll! -->
  <div>Título</div>
  <div>Colunas...</div>
</div>
```

Isso fazia com que a seta fosse arrastada junto com o scroll horizontal.

## Solução Implementada

Separei a estrutura em duas camadas no mobile:

### Mobile (< 1024px)
```vue
<div class="flex lg:hidden">
  <!-- Área FIXA à esquerda -->
  <div class="flex-shrink-0 flex items-center gap-1 pl-4 pr-2 py-3 bg-white z-20 border-r">
    <button>Seta - SEMPRE VISÍVEL</button>
  </div>

  <!-- Área ROLÁVEL horizontalmente -->
  <div class="flex-1 overflow-x-auto">
    <div class="flex items-center gap-2 pr-4 py-3">
      <div>Título</div>
      <div>Colunas...</div>
    </div>
  </div>
</div>
```

### Desktop (>= 1024px)
```vue
<div class="hidden lg:flex items-center gap-2 px-4 py-3">
  <button>Seta</button>
  <div>Drag handle</div>
  <div>Título</div>
  <div>Colunas...</div>
</div>
```

## Melhorias Aplicadas

1. **Área Fixa no Mobile**:
   - Seta de expandir fica SEMPRE visível à esquerda
   - `flex-shrink-0` impede que seja comprimida
   - `z-20` garante que fica acima de outros elementos
   - `bg-white` e `border-r` criam separação visual clara

2. **Botão Touch-Friendly**:
   - Tamanho mínimo de 44x44px (padrão de acessibilidade)
   - `touch-manipulation` para resposta imediata ao toque
   - `-webkit-tap-highlight-color: transparent` remove flash azul
   - `@click.stop` previne propagação de eventos
   - Padding aumentado (`p-1.5`) para área de toque maior
   - Ícone maior (`w-5 h-5`) para melhor visibilidade

3. **Scroll Horizontal Preservado**:
   - Área rolável continua funcionando normalmente
   - Todas as colunas acessíveis via scroll
   - Gradiente visual indica mais conteúdo à direita
   - `snap-x` e `snap-mandatory` para scroll suave

4. **Desktop Inalterado**:
   - Layout original mantido
   - Drag and drop funciona normalmente
   - Sem impacto na experiência desktop

## Arquivos Modificados

- `app/components/TaskRow.vue`
  - Separação de layouts mobile/desktop
  - Área fixa para seta no mobile
  - Melhorias de touch e acessibilidade

## Resultado

✅ No mobile, a seta de expandir subtarefas está SEMPRE visível à esquerda
✅ Clique funciona imediatamente sem precisar arrastar
✅ Scroll horizontal continua funcionando para ver outras colunas
✅ Desktop permanece inalterado
✅ Área de toque confortável (44x44px mínimo)
✅ Resposta imediata ao toque (touch-manipulation)
✅ Sem conflito entre toque e scroll

## Teste de Aceitação

1. Abra o board no mobile
2. Veja uma tarefa com subtarefas
3. A seta deve estar SEMPRE visível à esquerda
4. Toque na seta → subtarefas abrem/fecham imediatamente
5. Arraste horizontalmente → outras colunas aparecem
6. Seta permanece fixa durante o scroll
7. Desktop continua funcionando normalmente
