# 🔧 CORREÇÃO CRÍTICA - Conflito Drag vs Scroll Horizontal Mobile

## 🚨 Problema Identificado

**Sintoma:** No mobile, ao tentar deslizar horizontalmente para ver mais colunas, a tarefa ficava "fosca" (efeito de drag) mas NÃO scrollava horizontalmente.

**Causa Raiz:** O container do GRUPO estava capturando todos os eventos de toque:

```vue
<!-- ANTES - ERRADO -->
<div
  v-for="group in visibleGroups"
  :draggable="canEdit"
  @dragstart="onDragStart(group.id)"
  @touchstart.passive="onTouchStart($event, group.id)"
  @touchmove.prevent="onTouchMove"  <!-- ❌ PREVENT bloqueava scroll! -->
  @touchend="onTouchEnd"
>
```

**Problemas:**
1. `:draggable="canEdit"` - Todo o grupo era draggable
2. `@touchstart` - Capturava toque no grupo inteiro
3. `@touchmove.prevent` - **BLOQUEAVA** o scroll horizontal!
4. Qualquer toque na área da tarefa iniciava drag do grupo

---

## ✅ Solução Implementada

### Arquivo Modificado
- `app/pages/boards/[id].vue`

---

## 🔄 ANTES vs DEPOIS

### ANTES (Código Problemático)

```vue
<!-- Container do grupo - draggable inteiro -->
<div
  v-for="group in visibleGroups"
  :key="group.id"
  :data-group-id="group.id"
  :draggable="canEdit"
  @dragstart="onDragStart(group.id)"
  @dragover="onDragOver($event, group.id)"
  @drop="onDrop(group.id)"
  @dragend="onDragEnd"
  @touchstart.passive="onTouchStart($event, group.id)"
  @touchmove.prevent="onTouchMove"
  @touchend="onTouchEnd"
>
  <!-- Handle de drag -->
  <div class="cursor-grab">
    <svg>...</svg>
  </div>
  
  <!-- Tarefas -->
  <TaskRow ... />
</div>
```

```typescript
// Touch handlers que bloqueavam scroll
function onTouchStart(e: TouchEvent, groupId: string) {
  touchDraggingId = groupId
  touchStartY = e.touches[0]!.clientY
  draggingId.value = groupId
}

function onTouchMove(e: TouchEvent) {
  e.preventDefault() // ❌ Bloqueava scroll!
  // ...
}
```

**Problemas:**
- ❌ Grupo inteiro draggable
- ❌ Touch events no container
- ❌ `preventDefault()` bloqueava scroll
- ❌ Impossível scrollar horizontalmente

---

### DEPOIS (Código Corrigido)

```vue
<!-- Container do grupo - NÃO draggable -->
<div
  v-for="group in visibleGroups"
  :key="group.id"
  :data-group-id="group.id"
  class="bg-white border border-neutral-200 rounded-xl transition-all"
>
  <!-- Handle de drag - APENAS o handle é draggable -->
  <div
    v-if="canEdit"
    :draggable="true"
    class="cursor-grab active:cursor-grabbing"
    @dragstart="onDragStart(group.id)"
    @dragover.prevent="onDragOver($event, group.id)"
    @drop="onDrop(group.id)"
    @dragend="onDragEnd"
  >
    <svg>...</svg>
  </div>
  
  <!-- Tarefas - scroll livre -->
  <TaskRow ... />
</div>
```

```typescript
// Touch handlers removidos - não são mais necessários
// Drag funciona apenas pelo handle com mouse/touch nativo

function onDragStart(groupId: string) {
  draggingId.value = groupId
}

function onDragOver(e: DragEvent, groupId: string) {
  e.preventDefault()
  dragOverId.value = groupId
}

function onDrop(targetId: string) {
  // ... lógica de reordenação
}

function onDragEnd() {
  draggingId.value = null
  dragOverId.value = null
}
```

**Melhorias:**
- ✅ Apenas o handle é draggable
- ✅ Sem touch handlers no container
- ✅ Scroll horizontal livre
- ✅ Desktop: drag funciona pelo handle
- ✅ Mobile: scroll funciona, drag opcional pelo handle

---

## 🎯 Comportamento Corrigido

### Mobile
1. **Swipe horizontal** → Scroll funciona! ✅
2. **Toque na tarefa** → Não inicia drag ✅
3. **Toque no handle** → Inicia drag (opcional) ✅
4. **Colunas ocultas** → Acessíveis via scroll ✅

### Desktop
1. **Hover no grupo** → Handle aparece ✅
2. **Drag pelo handle** → Reordena grupos ✅
3. **Clique na tarefa** → Não inicia drag ✅
4. **Scroll horizontal** → Funciona se necessário ✅

---

## 📐 Estrutura da Solução

```
┌─────────────────────────────────────────┐
│ Grupo Container (NÃO draggable)         │
│ ┌─────────────────────────────────────┐ │
│ │ Header                              │ │
│ │ ┌──────┐ ┌────────────────────────┐│ │
│ │ │Handle│ │ Nome do Grupo          ││ │
│ │ │(drag)│ │                        ││ │
│ │ └──────┘ └────────────────────────┘│ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ TaskRow (scroll horizontal livre)   │ │
│ │ ┌─────┬─────┬─────┬─────┬─────────┐│ │
│ │ │Title│Stat│Pri │Date│...scroll→││ │
│ │ └─────┴─────┴─────┴─────┴─────────┘│ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## 🔧 Mudanças Técnicas

### 1. Removido do Container do Grupo
```diff
- :draggable="canEdit"
- @dragstart="onDragStart(group.id)"
- @dragover="onDragOver($event, group.id)"
- @drop="onDrop(group.id)"
- @dragend="onDragEnd"
- @touchstart.passive="onTouchStart($event, group.id)"
- @touchmove.prevent="onTouchMove"
- @touchend="onTouchEnd"
```

### 2. Adicionado ao Handle
```diff
+ :draggable="true"
+ @dragstart="onDragStart(group.id)"
+ @dragover.prevent="onDragOver($event, group.id)"
+ @drop="onDrop(group.id)"
+ @dragend="onDragEnd"
```

### 3. Funções Removidas
```diff
- function onTouchStart(e: TouchEvent, groupId: string)
- function onTouchMove(e: TouchEvent)
- function onTouchEnd()
- let touchDraggingId: string | null = null
- let touchStartY = 0
```

---

## ✅ Checklist de Validação

- [x] Mobile: swipe horizontal funciona
- [x] Mobile: não inicia drag ao tocar na tarefa
- [x] Mobile: colunas ocultas acessíveis
- [x] Desktop: drag pelo handle funciona
- [x] Desktop: sem regressões
- [x] Sem `preventDefault()` bloqueando scroll
- [x] Sem touch handlers no container
- [x] Handle visível no hover (desktop)
- [x] TypeScript válido

---

## 🎨 UX Melhorada

### Antes
- ❌ Toque na tarefa → Efeito "fosco" (drag)
- ❌ Impossível scrollar horizontalmente
- ❌ Colunas ocultas inacessíveis
- ❌ Experiência frustrante

### Depois
- ✅ Toque na tarefa → Nada (normal)
- ✅ Swipe horizontal → Scroll suave
- ✅ Colunas ocultas acessíveis
- ✅ Drag opcional pelo handle
- ✅ Experiência intuitiva

---

## 📦 Commit Sugerido

```
fix(mobile): resolve conflito entre drag de grupo e scroll horizontal

- Remove draggable do container do grupo
- Move drag apenas para o handle (ícone de arrastar)
- Remove touch handlers que bloqueavam scroll (preventDefault)
- Mobile: scroll horizontal agora funciona livremente
- Desktop: drag pelo handle preservado
- Colunas ocultas acessíveis via swipe em mobile

BREAKING: Grupos agora só podem ser arrastados pelo handle, não pelo container inteiro
```

---

## 🔍 Causa Raiz Detalhada

O problema estava em **3 camadas**:

1. **`:draggable="canEdit"` no container**
   - Tornava todo o grupo draggable
   - Qualquer toque iniciava drag

2. **`@touchmove.prevent`**
   - `preventDefault()` bloqueava eventos nativos
   - Scroll horizontal era cancelado

3. **Touch handlers customizados**
   - Tentavam implementar drag via touch
   - Conflitavam com scroll nativo

**Solução:** Remover todas as 3 camadas e usar drag nativo apenas no handle.

---

## 🎯 Resultado Final

**Mobile:**
- ✅ Swipe horizontal funciona perfeitamente
- ✅ Sem efeito "fosco" ao tocar
- ✅ Todas as colunas acessíveis
- ✅ Experiência fluida

**Desktop:**
- ✅ Drag pelo handle funciona
- ✅ Sem regressões
- ✅ Comportamento intuitivo
