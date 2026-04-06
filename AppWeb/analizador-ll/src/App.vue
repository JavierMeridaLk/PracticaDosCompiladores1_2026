<template>
  <div class="flex min-h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-y-auto">
    
    <!-- Sidebar con slide -->
    <transition name="slide">
      <aside v-if="sidebarOpen" class="w-72 bg-[#161b2b] border-r border-slate-800 flex flex-col shadow-2xl">
        <div class="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1c2333]">
          <h2 class="font-bold text-xs uppercase tracking-widest text-slate-500">Historial de Gramáticas</h2>
          <button @click="sidebarOpen = false" class="text-slate-500 hover:text-white">
            <span class="material-icons text-sm">first_page</span>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-for="item in historial" :key="item.id" 
               class="p-3 rounded-xl bg-[#1c2333] border border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer group">
            <p class="text-sm font-medium text-slate-200 group-hover:text-emerald-400">{{ item.nombre }}</p>
            <p class="text-[10px] text-slate-500 mt-1 uppercase">{{ item.tipo }}</p>
            <p class="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ item.estado }}
            </p>
          </div>
        </div>
      </aside>
    </transition>

    <main class="flex-1 flex flex-col min-w-0 relative">
      <!-- Header centrado + botón abrir sidebar -->
      <header class="h-16 flex items-center justify-center bg-[#0b0f1a] border-b border-slate-800/60 relative">
        <button v-if="!sidebarOpen" @click="sidebarOpen = true" class="absolute left-4 p-2 hover:bg-slate-800 rounded-lg transition">
          <span class="material-icons">menu</span>
        </button>
        <h1 class="text-xl font-semibold tracking-tight text-white">Analizador sintáctico LL</h1>
      </header>

      <div class="flex-1 p-6 grid grid-cols-12 gap-6">
        
        <!-- Editor -->
        <div class="col-span-8 flex flex-col gap-6">
          <div class="flex-1 bg-[#161b2b] rounded-2xl border border-slate-800 flex flex-col relative shadow-lg overflow-hidden">
            
            <!-- Header editor -->
            <div class="p-4 flex justify-between items-center bg-slate-800/30 rounded-t-2xl border-b border-slate-700">
              <div>
                <h1 class="text-sm font-bold text-white text-[20px]">Editor de Código</h1>
              </div>
              <button class="bg-[#2563eb] hover:bg-[#3b82f6] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-md">
                <span class="material-icons text-base">cloud_upload</span> SUBIR CONFIGURACIÓN
              </button>
            </div>

            <!-- Editor con scroll interno -->
            <div class="flex flex-1 overflow-hidden">
              <div class="flex flex-1 overflow-auto" ref="scrollContainer" @scroll="syncScroll">
                
                <!-- Line numbers -->
                <div ref="linesRef" class="text-sm font-mono text-slate-500 p-4 text-right select-none leading-relaxed">
                  <div v-for="n in lineCount" :key="n">{{ n }}</div>
                </div>

                <!-- Textarea -->
                <textarea 
                  ref="textareaRef"
                  v-model="grammarInput"
                  @input="updateCursor"
                  @click="updateCursor"
                  class="flex-1 bg-transparent p-4 outline-none resize-none font-mono text-emerald-400 text-sm leading-relaxed min-h-full"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            
            <!-- Cursor -->
            <div class="p-3 text-right text-[10px] text-slate-600 font-mono border-t border-slate-800 uppercase tracking-tighter">
              Línea: {{ cursor.line }}, Columna: {{ cursor.column }}
            </div>
          </div>

          <button @click="procesarGramatica" 
                  class="w-full bg-[#10b981] hover:bg-[#059669] text-[#0b0f1a] py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/20">
            <span class="material-icons">bolt</span> Analizar gramática
          </button>
        </div>

        <!-- Panel derecho -->
        <div class="col-span-4 flex flex-col gap-6">
          
          <div class="bg-[#161b2b] p-5 rounded-2xl border border-slate-800 shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Cadenas de Entrada</h3>
            <p class="text-[15px] text-slate-500">Ingresa una cadena de entrada para analizar</p>
            <textarea v-model="inputString" rows="3" class="w-full bg-[#0b0f1a] border border-slate-700 rounded-xl p-4 text-sm outline-none focus:border-blue-500 transition"></textarea>
            <button class="w-full mt-4 py-2.5 border border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-500/10 transition text-xs font-bold uppercase">Analizar entrada</button>
          </div>

          <div class="min-h-[300px] bg-[#161b2b] p-5 rounded-2xl border border-slate-800 flex flex-col shadow-sm">
            <h3 class="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Salida del Analizador</h3>
            <div class="flex-1 bg-[#0b0f1a] rounded-xl border border-slate-800/50"></div>
          </div>

          <div class="bg-[#161b2b] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div class="p-4 flex items-center bg-red-500/5 border-b border-slate-800">
              <h3 class="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                <span class="material-icons text-base">error_outline</span> Lista de Errores
              </h3>
            </div>
            <div class="h-32 overflow-y-auto"></div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sidebarOpen = ref(true)
const grammarInput = ref("")
const inputString = ref("")

const textareaRef = ref(null)
const linesRef = ref(null)

const cursor = ref({ line: 1, column: 1 })

const lineCount = computed(() => grammarInput.value.split('\n').length)

const historial = ref([
  { id: 1, nombre: 'Gramática Aritmética v2', tipo: 'Gramática de JSON', estado: 'Aceptado' },
  { id: 2, nombre: 'Gramática Aritmética v2', tipo: 'Gramática de JSON', estado: 'Aceptado' },
  { id: 3, nombre: 'Gramática Aritmética v0', tipo: 'Aceptado', estado: 'Aceptado' }
])

function updateCursor(e) {
  const text = e.target.value.substring(0, e.target.selectionStart)
  const lines = text.split('\n')
  cursor.value.line = lines.length
  cursor.value.column = lines[lines.length - 1].length + 1
}

function syncScroll() {
  if (linesRef.value && textareaRef.value) {
    linesRef.value.scrollTop = textareaRef.value.scrollTop
  }
}

const procesarGramatica = () => {
  console.log("Enviando al backend:", grammarInput.value)
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}
</style>