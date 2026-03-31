<template>
  <canvas ref="canvasRef" class="absolute inset-0 w-full h-full" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'

const canvasRef = ref<HTMLCanvasElement | null>(null)

let renderer: THREE.WebGLRenderer
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let animationId: number
let mouseX = 0
let mouseY = 0

const cardColors = [0x6366f1, 0x8b5cf6, 0x06b6d4, 0x10b981, 0xf59e0b, 0xef4444, 0xec4899]
const tagColors  = [0xddd6fe, 0xbae6fd, 0xa7f3d0, 0xfde68a, 0xfecaca, 0xfbcfe8]

function makeRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function createCardTexture(accentHex: number): THREE.CanvasTexture {
  const W = 320, H = 200
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Fundo branco com sombra interna
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, W, H)

  // Barra de acento no topo
  const r = ((accentHex >> 16) & 0xff)
  const g = ((accentHex >> 8) & 0xff)
  const b = (accentHex & 0xff)
  const accent = `rgb(${r},${g},${b})`
  const accentLight = `rgba(${r},${g},${b},0.12)`

  ctx.fillStyle = accent
  ctx.fillRect(0, 0, W, 6)

  // Título (linha grossa)
  ctx.fillStyle = '#1e293b'
  ctx.font = 'bold 18px system-ui, sans-serif'
  const titles = ['Revisar proposta', 'Deploy produção', 'Design sistema', 'Reunião cliente', 'Testes QA', 'Documentação', 'Code review']
  ctx.fillText(titles[Math.floor(Math.random() * titles.length)], 18, 36)

  // Linhas de texto simuladas
  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px system-ui, sans-serif'
  const descs = ['Verificar todos os itens antes de enviar', 'Atualizar dependências e fazer merge', 'Criar componentes base do projeto']
  ctx.fillText(descs[Math.floor(Math.random() * descs.length)], 18, 56)

  // Divisor
  ctx.strokeStyle = '#f1f5f9'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(18, 68); ctx.lineTo(W - 18, 68); ctx.stroke()

  // Tags coloridas
  const tagLabels = ['Alta', 'Em andamento', 'Revisão', 'Urgente', 'Design', 'Dev']
  const tagBgs    = ['#fef3c7', '#dbeafe', '#f3e8ff', '#fee2e2', '#d1fae5', '#e0e7ff']
  const tagFgs    = ['#92400e', '#1e40af', '#6b21a8', '#991b1b', '#065f46', '#3730a3']
  const numTags = 1 + Math.floor(Math.random() * 2)
  let tx = 18
  for (let i = 0; i < numTags; i++) {
    const idx = Math.floor(Math.random() * tagLabels.length)
    const label = tagLabels[idx]
    const tw = ctx.measureText(label).width + 16
    makeRoundedRect(ctx, tx, 78, tw, 20, 10)
    ctx.fillStyle = tagBgs[idx]; ctx.fill()
    ctx.fillStyle = tagFgs[idx]
    ctx.font = 'bold 10px system-ui, sans-serif'
    ctx.fillText(label, tx + 8, 92)
    tx += tw + 8
  }

  // Checkboxes / subtarefas
  ctx.font = '11px system-ui, sans-serif'
  ctx.fillStyle = '#64748b'
  const checks = [true, false, true]
  for (let i = 0; i < 3; i++) {
    const cy = 114 + i * 20
    makeRoundedRect(ctx, 18, cy, 12, 12, 3)
    if (checks[i]) {
      ctx.fillStyle = accent; ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 9px system-ui'
      ctx.fillText('✓', 20, cy + 10)
    } else {
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5; ctx.stroke()
    }
    ctx.fillStyle = checks[i] ? '#94a3b8' : '#334155'
    ctx.font = `${checks[i] ? 'normal' : 'normal'} 11px system-ui, sans-serif`
    const subtasks = ['Criar wireframe', 'Revisar código', 'Atualizar docs', 'Testar fluxo', 'Aprovar PR']
    ctx.fillText(subtasks[(i + Math.floor(Math.random() * 3)) % subtasks.length], 36, cy + 10)
  }

  // Rodapé: avatar + data + prioridade
  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, H - 36, W, 36)
  ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(0, H - 36); ctx.lineTo(W, H - 36); ctx.stroke()

  // Avatar círculo
  const avatarColors = [accent, '#8b5cf6', '#06b6d4', '#10b981']
  ctx.beginPath()
  ctx.arc(30, H - 18, 10, 0, Math.PI * 2)
  ctx.fillStyle = avatarColors[Math.floor(Math.random() * avatarColors.length)]
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.font = 'bold 9px system-ui'
  const initials = ['ST', 'JD', 'MK', 'AL', 'RB']
  ctx.fillText(initials[Math.floor(Math.random() * initials.length)], 23, H - 14)

  // Data
  ctx.fillStyle = '#94a3b8'
  ctx.font = '10px system-ui, sans-serif'
  const dates = ['Hoje', 'Amanhã', '3 abr', '5 abr', '10 abr']
  ctx.fillText('📅 ' + dates[Math.floor(Math.random() * dates.length)], 48, H - 13)

  // Indicador de prioridade
  const prioColors = ['#ef4444', '#f59e0b', '#10b981']
  const prioLabels = ['Alta', 'Média', 'Baixa']
  const prio = Math.floor(Math.random() * 3)
  ctx.fillStyle = prioColors[prio]
  ctx.beginPath(); ctx.arc(W - 30, H - 18, 5, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#64748b'
  ctx.font = '10px system-ui'
  ctx.fillText(prioLabels[prio], W - 22, H - 14)

  return new THREE.CanvasTexture(canvas)
}

function createCard(accentColor: number, position: [number, number, number], rotX: number, rotY: number, rotZ: number) {
  const group = new THREE.Group()
  group.position.set(...position)
  group.rotation.set(rotX, rotY, rotZ)

  // Sombra (plano levemente deslocado atrás)
  const shadowGeo = new THREE.PlaneGeometry(3.3, 2.2)
  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x6366f1,
    transparent: true,
    opacity: 0.12
  })
  const shadow = new THREE.Mesh(shadowGeo, shadowMat)
  shadow.position.set(0.06, -0.06, -0.02)
  group.add(shadow)

  // Card principal com textura canvas
  const texture = createCardTexture(accentColor)
  texture.colorSpace = THREE.SRGBColorSpace

  const cardGeo = new THREE.PlaneGeometry(3.2, 2.1)
  const cardMat = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.3,
    metalness: 0.0,
  })
  const card = new THREE.Mesh(cardGeo, cardMat)
  group.add(card)

  // Borda sutil
  const borderGeo = new THREE.PlaneGeometry(3.22, 2.12)
  const borderMat = new THREE.MeshBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.6,
    side: THREE.BackSide
  })
  const border = new THREE.Mesh(borderGeo, borderMat)
  border.position.z = -0.001
  group.add(border)

  ;(group as any).floatSpeed  = 0.25 + Math.random() * 0.35
  ;(group as any).floatOffset = Math.random() * Math.PI * 2
  ;(group as any).rotSpeed    = (Math.random() - 0.5) * 0.002
  ;(group as any).baseY       = position[1]

  return group
}

function buildScene() {
  const positions: Array<[number, number, number]> = [
    // Topo — 3 cards espaçados
    [-7,  7.5, -1],
    [ 0,  8.5, -1.5],
    [ 7,  7.5, -1],
    // Lateral esquerda — 2 cards
    [-10,  2.5, -0.5],
    [-10, -2.5, -0.5],
    // Lateral direita — 2 cards
    [ 10,  2.5, -0.5],
    [ 10, -2.5, -0.5],
    // Base — 3 cards espaçados
    [-7, -7.5, -1],
    [ 0, -8.5, -1.5],
    [ 7, -7.5, -1],
  ]

  positions.forEach((pos, i) => {
    const color = cardColors[i % cardColors.length]
    const rx = (Math.random() - 0.5) * 0.25
    const ry = (Math.random() - 0.5) * 0.2
    const rz = (Math.random() - 0.5) * 0.15
    const card = createCard(color, pos, rx, ry, rz)
    scene.add(card)
  })

  // Partículas sutis
  const count = 60
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 28
    pos[i * 3 + 1] = (Math.random() - 0.5) * 20
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 4
  }
  const pGeo = new THREE.BufferGeometry()
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  const pMat = new THREE.PointsMaterial({ color: 0x6366f1, size: 0.05, transparent: true, opacity: 0.3 })
  scene.add(new THREE.Points(pGeo, pMat))
}

function init(canvas: HTMLCanvasElement) {
  const w = canvas.clientWidth
  const h = canvas.clientHeight

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setSize(w, h)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0xf8fafc, 1)
  renderer.shadowMap.enabled = true

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100)
  camera.position.set(0, 0, 18)

  const ambient = new THREE.AmbientLight(0xffffff, 1.2)
  scene.add(ambient)

  const dir = new THREE.DirectionalLight(0xffffff, 1.5)
  dir.position.set(5, 8, 10)
  scene.add(dir)

  const fill = new THREE.DirectionalLight(0x818cf8, 0.3)
  fill.position.set(-5, -3, 5)
  scene.add(fill)

  buildScene()
}

function animate() {
  animationId = requestAnimationFrame(animate)
  const t = Date.now() * 0.001

  camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.02
  camera.position.y += (-mouseY * 0.3 - camera.position.y) * 0.02
  camera.lookAt(0, 0, 0)

  scene.children.forEach(obj => {
    if ((obj as any).floatSpeed !== undefined) {
      obj.position.y = (obj as any).baseY + Math.sin(t * (obj as any).floatSpeed + (obj as any).floatOffset) * 0.2
      obj.rotation.z += (obj as any).rotSpeed
    }
  })

  renderer.render(scene, camera)
}

function onMouseMove(e: MouseEvent) {
  const el = canvasRef.value
  if (!el) return
  const rect = el.getBoundingClientRect()
  mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
  mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
}

function onResize() {
  const el = canvasRef.value
  if (!el || !renderer) return
  const w = el.clientWidth
  const h = el.clientHeight
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  if (!canvasRef.value) return
  init(canvasRef.value)
  animate()
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  renderer?.dispose()
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
})
</script>
