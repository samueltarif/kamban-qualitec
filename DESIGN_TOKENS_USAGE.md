# Design Tokens - Guia de Uso

## Exemplos de Classes Tailwind

### Cores

```vue
<!-- Primary -->
<button class="bg-primary text-white hover:bg-primary-600">Botão Principal</button>
<div class="bg-primary-50 text-primary-900">Card com fundo claro</div>

<!-- Secondary -->
<button class="bg-secondary text-white hover:bg-secondary-600">Botão Secundário</button>

<!-- Feedback -->
<div class="bg-success-50 text-success-700 border border-success-500">Sucesso</div>
<div class="bg-error-50 text-error-700 border border-error-500">Erro</div>
<div class="bg-warning-50 text-warning-700 border border-warning-500">Aviso</div>
<div class="bg-info-50 text-info-700 border border-info-500">Info</div>

<!-- Neutral -->
<p class="text-neutral-900">Texto principal</p>
<p class="text-neutral-600">Texto secundário</p>
<div class="bg-neutral-50">Fundo claro</div>
```

### Tipografia

```vue
<!-- Tamanhos -->
<h1 class="text-4xl font-bold">Título Principal</h1>
<h2 class="text-3xl font-semibold">Subtítulo</h2>
<p class="text-base font-regular">Texto normal</p>
<span class="text-sm text-neutral-600">Texto pequeno</span>

<!-- Pesos -->
<p class="font-regular">Regular (400)</p>
<p class="font-medium">Medium (500)</p>
<p class="font-semibold">Semibold (600)</p>
<p class="font-bold">Bold (700)</p>
```

### Espaçamento

```vue
<!-- Padding -->
<div class="p-4">Padding padrão</div>
<div class="px-6 py-4">Padding horizontal e vertical</div>
<div class="p-8">Padding maior</div>

<!-- Margin -->
<div class="mb-4">Margem inferior</div>
<div class="mt-6 mb-8">Margens top e bottom</div>

<!-- Gap (Flexbox/Grid) -->
<div class="flex gap-4">Items com espaçamento</div>
<div class="grid grid-cols-3 gap-6">Grid com gap</div>
```

### Border Radius (iOS Style)

```vue
<!-- Cards -->
<div class="rounded-lg">Card padrão</div>
<div class="rounded-xl">Card maior</div>
<div class="rounded-2xl">Card extra grande</div>

<!-- Botões -->
<button class="rounded-lg px-6 py-3">Botão iOS</button>
<button class="rounded-full px-8 py-3">Botão pill</button>

<!-- Inputs -->
<input class="rounded-md px-4 py-2" />
```

### Sombras (iOS Style)

```vue
<!-- Cards -->
<div class="shadow-sm rounded-lg">Card sutil</div>
<div class="shadow-md rounded-xl">Card padrão</div>
<div class="shadow-lg rounded-xl">Card elevado</div>
<div class="shadow-xl rounded-2xl">Card modal</div>

<!-- Hover -->
<button class="shadow-md hover:shadow-lg transition-all">Botão com hover</button>
```

### Transições

```vue
<!-- Rápida (150ms) -->
<button class="transition-fast hover:bg-primary-600">Hover rápido</button>

<!-- Base (200ms) -->
<div class="transition-all duration-base hover:scale-105">Escala suave</div>

<!-- Lenta (300ms) -->
<div class="transition-slow hover:opacity-75">Fade suave</div>
```

### Z-Index

```vue
<div class="z-0">Base</div>
<div class="z-10">Dropdown</div>
<div class="z-20">Modal backdrop</div>
<div class="z-30">Modal</div>
<div class="z-40">Tooltip</div>
<div class="z-50">Toast/Notification</div>
```

## Componentes Completos

### Card Kanban

```vue
<div class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-base">
  <h3 class="text-lg font-semibold text-neutral-900 mb-2">Título da Task</h3>
  <p class="text-sm text-neutral-600 mb-4">Descrição da tarefa</p>
  <div class="flex gap-2">
    <span class="bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">Tag</span>
  </div>
</div>
```

### Botão Primary

```vue
<button class="bg-primary text-white font-medium px-6 py-3 rounded-lg shadow-md hover:bg-primary-600 hover:shadow-lg transition-all duration-fast">
  Criar Tarefa
</button>
```

### Input iOS Style

```vue
<input 
  type="text" 
  class="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-fast"
  placeholder="Digite aqui..."
/>
```

### Badge de Status

```vue
<!-- Sucesso -->
<span class="bg-success-50 text-success-700 text-xs font-medium px-3 py-1 rounded-full">Concluído</span>

<!-- Aviso -->
<span class="bg-warning-50 text-warning-700 text-xs font-medium px-3 py-1 rounded-full">Em Progresso</span>

<!-- Erro -->
<span class="bg-error-50 text-error-700 text-xs font-medium px-3 py-1 rounded-full">Atrasado</span>
```

### Modal iOS Style

```vue
<div class="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm">
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transition-all duration-base">
      <h2 class="text-2xl font-bold text-neutral-900 mb-4">Título do Modal</h2>
      <p class="text-neutral-600 mb-6">Conteúdo do modal</p>
      <div class="flex gap-3">
        <button class="flex-1 bg-neutral-100 text-neutral-700 font-medium py-3 rounded-lg hover:bg-neutral-200 transition-fast">
          Cancelar
        </button>
        <button class="flex-1 bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-600 transition-fast">
          Confirmar
        </button>
      </div>
    </div>
  </div>
</div>
```

## CSS Variables (uso direto)

```vue
<style scoped>
.custom-element {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
</style>
```
