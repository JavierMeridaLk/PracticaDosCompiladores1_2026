<template>
  <div class="layout">
    <!-- Sidebar fijo -->
    <aside class="sidebar">
      <div class="sidebar-title">Historial de Gramáticas</div>
      <ul class="sidebar-list">
        <li v-for="(item, index) in history" :key="index" class="sidebar-item">
          <div class="title">{{ item.title }}</div>
          <div class="subtitle">{{ item.subtitle }}</div>
        </li>
      </ul>
    </aside>

    <!-- Contenido principal -->
    <div class="content">
      <!-- Header -->
      <div class="header">
        <h1>Analizador sintáctico LL</h1>
        <button class="btn-upload">📤 Subir archivo de configuración</button>
      </div>

      <!-- Zona central -->
      <div class="main-grid">
        <!-- Editor -->
        <div class="editor-card">
          <div class="editor-wrapper">
            <div class="line-numbers">
              <div v-for="n in lineCount" :key="n">{{ n }}</div>
            </div>

            <textarea
              v-model="code"
              @input="updateCursor"
              @click="updateCursor"
              class="editor"
            />
          </div>

          <div class="editor-footer">
            Línea: {{ cursor.line }}, Columna: {{ cursor.column }}
          </div>

          <button class="btn-analyze">⚡ Analizar gramática</button>
        </div>

        <!-- Panel derecho -->
        <div class="right-panel">
          <!-- Entrada -->
          <div class="card">
            <h3>Cadenas de Entrada</h3>
            <input class="input" placeholder="Ingresar cadena para probar" />
            <button class="btn-secondary">Analizar entrada</button>
          </div>

          <!-- Salida -->
          <div class="card">
            <h3>Salida del Analizador</h3>
            <div class="empty"></div>
          </div>

          <!-- Errores -->
          <div class="card">
            <h3 class="warning">Lista de Errores</h3>
            <div class="empty"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const history = ref([
  { title: 'Gramática Aritmética v2', subtitle: 'Aceptado' },
  { title: 'Gramática JSON', subtitle: 'Aceptado' },
  { title: 'Gramática Aritmética v1', subtitle: 'Aceptado' }
])

const code = ref('')
const cursor = ref({ line: 1, column: 1 })

const lineCount = computed(() => code.value.split('\n').length)

function updateCursor(e) {
  const text = e.target.value.substring(0, e.target.selectionStart)
  const lines = text.split('\n')
  cursor.value.line = lines.length
  cursor.value.column = lines[lines.length - 1].length + 1
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #0b1220;
  color: #e2e8f0;
  font-family: Inter, sans-serif;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: #020617;
  border-right: 1px solid #1e293b;
  padding: 1rem;
}

.sidebar-title {
  font-weight: bold;
  margin-bottom: 1rem;
}

.sidebar-list {
  list-style: none;
  padding: 0;
}

.sidebar-item {
  padding: 0.7rem;
  border-radius: 8px;
  cursor: pointer;
}

.sidebar-item:hover {
  background: #1e293b;
}

.title {
  font-size: 14px;
}

.subtitle {
  font-size: 12px;
  color: #22c55e;
}

/* Content */
.content {
  flex: 1;
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.btn-upload {
  background: #2563eb;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}

/* Grid */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  height: calc(100% - 60px);
}

/* Editor */
.editor-card {
  display: flex;
  flex-direction: column;
  background: #020617;
  border-radius: 12px;
  padding: 1rem;
}

.editor-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.line-numbers {
  padding: 10px;
  background: #020617;
  text-align: right;
  user-select: none;
}

.editor {
  flex: 1;
  background: transparent;
  border: none;
  color: white;
  font-family: monospace;
  padding: 10px;
  outline: none;
  resize: none;
}

.editor-footer {
  font-size: 12px;
  margin-top: 5px;
}

.btn-analyze {
  margin-top: 10px;
  background: #22c55e;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

/* Right panel */
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card {
  background: #020617;
  padding: 1rem;
  border-radius: 12px;
}

.input {
  width: 100%;
  padding: 8px;
  margin: 10px 0;
  border-radius: 8px;
  border: none;
}

.btn-secondary {
  width: 100%;
  background: #1e293b;
  padding: 8px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.warning {
  color: #f59e0b;
}

.empty {
  height: 80px;
  background: #0f172a;
  border-radius: 8px;
}
</style>
