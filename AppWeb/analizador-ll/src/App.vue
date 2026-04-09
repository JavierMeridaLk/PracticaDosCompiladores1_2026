<template>
  <div class="flex min-h-screen bg-[#0d1117] text-slate-300 font-sans overflow-hidden selection:bg-blue-500/30">
    
    <transition name="slide">
      <aside v-if="sidebarOpen" class="w-72 bg-[#161b22] border-r border-slate-800/60 flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)] z-20">
        <div class="p-6 border-b border-slate-800/60 flex justify-between items-center bg-[#161b22]">
          <h2 class="font-black text-[10px] uppercase tracking-[0.2em] text-blue-500">Historial de Gramáticas</h2>
          <button @click="sidebarOpen = false" class="text-slate-500 hover:text-white transition-colors">
            <span class="material-icons text-lg">menu_open</span>
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div v-for="item in historial" :key="item.id" 
               class="p-4 rounded-xl bg-gradient-to-br from-[#1c2128] to-[#161b22] border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg">
            <p class="text-sm font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors">{{ item.nombre }}</p>
            <div class="flex items-center justify-between mt-3">
              <span class="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider border border-emerald-500/20">{{ item.tipo }}</span>
              <p class="text-[10px] text-emerald-500 flex items-center gap-1.5 font-medium">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {{ item.estado }}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </transition>

    <main class="flex-1 flex flex-col min-w-0 relative bg-[#0d1117]">
      
      <header class="h-16 flex items-center justify-center bg-[#0d1117] border-b border-slate-800/60 sticky top-0 z-10 px-6">
        <button v-if="!sidebarOpen" @click="sidebarOpen = true" class="absolute left-6 p-2.5 hover:bg-slate-800/50 rounded-xl transition-all">
          <span class="material-icons text-slate-400">menu</span>
        </button>
        <h1 class="text-lg font-bold tracking-tight text-white uppercase tracking-[0.3em]">Analizador Sintáctico LL</h1>
        
        <div class="absolute right-6 flex items-center gap-3">
          <transition-group name="fade">
            <div v-if="mensajeProcesando" key="proc" class="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold">⏳ {{ mensajeProcesando }}</div>
            <div v-if="mensajeExito" key="success" class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold">✓ {{ mensajeExito }}</div>
            <div v-if="mensajeError" key="err" class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold">⚠ {{ mensajeError }}</div>
          </transition-group>
        </div>
      </header>

      <div class="flex-1 p-6 grid grid-cols-12 gap-8 h-[calc(100vh-64px)] overflow-hidden">
  
        <div class="col-span-7 flex flex-col gap-6 overflow-hidden">
          <div class="flex-1 bg-[#161b22] rounded-3xl border border-slate-800 flex flex-col relative shadow-2xl overflow-hidden">
            <div class="p-4 flex justify-between items-center bg-[#1c2128] border-b border-slate-800">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-2">Editor de Gramática</span>
              <button @click="clickSubirArchivo" class="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all">SUBIR ARCHIVO</button>
              <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".txt" style="display: none;">
            </div>

            <div class="flex flex-1 overflow-hidden bg-[#0d1117]">
              <div class="flex flex-1 overflow-auto custom-scrollbar" ref="scrollContainer" @scroll="syncScroll">
                <div ref="linesRef" class="editor-font text-slate-600 p-5 text-right select-none leading-relaxed bg-[#0d1117] border-r border-slate-800/50 min-w-[3.5rem] overflow-hidden">
                  <div v-for="n in lineCount" :key="n" :class="{'text-blue-500 font-bold': cursor.line === n}">{{ n }}</div>
                </div>
                <textarea 
                  ref="textareaRef"
                  v-model="grammarInput"
                  @input="handleInput"
                  @click="updateCursor"
                  @keyup="updateCursor"
                  class="flex-1 bg-transparent p-5 outline-none resize-none editor-font text-emerald-400 leading-relaxed min-h-full"
                  spellcheck="false"
                ></textarea>
              </div>
            </div>
            
            <div class="px-5 py-2 bg-[#1c2128] text-right text-[9px] text-slate-500 font-bold border-t border-slate-800 uppercase tracking-widest">
              Línea: {{ cursor.line }} | Columna: {{ cursor.column }}
            </div>
          </div>

          <button @click="procesarGramatica" class="w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98]">
            Analizar Gramática
          </button>
        </div>

        <div class="col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          
          <div class="bg-[#161b22] p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 class="text-[10px] font-black text-slate-500 uppercase mb-5 tracking-[0.15em] flex justify-between items-center">
              Prueba de Cadena
              <span v-if="gramaticaEsValida" class="text-emerald-500 flex items-center gap-1 normal-case font-bold">
                <span class="material-icons text-[14px]">check_circle</span> Lista
              </span>
              <span v-else class="text-amber-500 flex items-center gap-1 normal-case font-bold">
                <span class="material-icons text-[14px]">info</span> Pendiente
              </span>
            </h3>
            <textarea v-model="inputString" rows="2" class="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-sm outline-none focus:border-blue-500 transition-all text-emerald-400 font-mono" placeholder="Ingrese la cadena a evaluar..."></textarea>
            <button @click="analizarEntrada" class="w-full mt-4 py-3 bg-[#1c2128] hover:bg-blue-600 text-slate-400 hover:text-white border border-slate-700 hover:border-blue-500 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest">Analizar cadena</button>
          </div>

          <div class="flex-1 bg-[#161b22] p-6 rounded-3xl border border-slate-800 flex flex-col shadow-xl min-h-0 relative">
            <h3 class="text-[10px] font-black text-slate-500 uppercase mb-5 tracking-[0.15em]">Resultado del Análisis</h3>
            <div ref="treeContainer" class="flex-1 bg-[#0d1117] rounded-2xl border border-slate-800/50 relative overflow-hidden">
               <svg ref="svgRef" class="w-full h-full"></svg>
               <div v-if="!arbolResultado" class="absolute inset-0 flex items-center justify-center text-slate-700 text-[10px] uppercase font-bold tracking-widest">Árbol no generado</div>
            </div>
          </div>

          <div class="h-64 bg-[#0d1117] rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              <div class="px-5 py-3 bg-[#161b2b]/50 border-b border-slate-800">
                <h3 class="text-[10px] font-black text-red-500 uppercase tracking-widest">Registro de Errores</h3>
              </div>
              <div class="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar font-mono">
                <div v-if="erroresAnalisis.length === 0" class="h-full flex items-center justify-center text-slate-600 italic text-xs">Sin errores detectados</div>
                <div v-for="(error, index) in erroresAnalisis" :key="index" class="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-[9px] font-black text-red-400 uppercase tracking-widest">Error {{ error.tipo || 'SINTÁCTICO' }}</span>
                    <span class="text-[9px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">L: {{ error.linea || error.line || 0 }} | C: {{ error.columna || error.column || 0 }}</span>
                  </div>
                  <p class="text-xs text-slate-200 mb-2">{{ error.descripcion || error.mensaje || 'Error desconocido' }}</p>
                  <div v-if="error.lexema" class="p-2 bg-black/40 rounded border border-red-900/30">
                    <code class="text-red-400 text-[11px]">Lexema: "{{ error.lexema }}"</code>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import * as d3 from 'd3'

const sidebarOpen = ref(true)
const textareaRef = ref(null)
const linesRef = ref(null)
const scrollContainer = ref(null)
const treeContainer = ref(null)
const svgRef = ref(null)
const fileInputRef = ref(null)

const grammarInput = ref("")
const inputString = ref("")
const mensajeError = ref("")
const mensajeExito = ref("")
const mensajeProcesando = ref("")
const erroresAnalisis = ref([])
const gramaticaValidaData = ref(null)
const arbolResultado = ref(null)
const cursor = ref({ line: 1, column: 1 })
const historial = ref([])

const lineCount = computed(() => grammarInput.value.split('\n').length || 1)
const gramaticaEsValida = computed(() => grammarInput.value.trim() !== "" && erroresAnalisis.value.length === 0 && gramaticaValidaData.value !== null);


function syncScroll() {
  if (linesRef.value && textareaRef.value) {
    // Sincronizamos el scroll vertical del índice con el del textarea
    linesRef.value.scrollTop = textareaRef.value.scrollTop;
  }
}

function updateCursor() {
  if (!textareaRef.value) return;
  const pos = textareaRef.value.selectionStart;
  const textBefore = grammarInput.value.substring(0, pos);
  const lines = textBefore.split('\n');
  cursor.value.line = lines.length;
  cursor.value.column = lines[lines.length - 1].length + 1;
}

function handleInput() {
  updateCursor();
  nextTick(() => syncScroll());
}

function limpiarSalidas() {
  arbolResultado.value = null;
  erroresAnalisis.value = [];
}

// --- D3 TREE ---
const drawTree = () => {
  if (!arbolResultado.value || !svgRef.value || !treeContainer.value) return;
  const width = treeContainer.value.clientWidth;
  const height = treeContainer.value.clientHeight;
  const svg = d3.select(svgRef.value);
  svg.selectAll("*").remove();
  const g = svg.append("g").attr("transform", "translate(60,40)");
  svg.call(d3.zoom().on("zoom", (e) => g.attr("transform", e.transform)));
  const treeLayout = d3.tree().size([height - 100, width - 200]);
  const root = d3.hierarchy(arbolResultado.value, d => d.hijos);
  treeLayout(root);
  g.selectAll(".link").data(root.links()).enter().append("path").attr("fill", "none").attr("stroke", "#334155").attr("stroke-width", 1.5).attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));
  const node = g.selectAll(".node").data(root.descendants()).enter().append("g").attr("transform", d => `translate(${d.y},${d.x})`);
  node.append("circle").attr("r", 5).attr("fill", d => d.data.lexema ? "#10b981" : "#3b82f6");
  node.append("text").attr("dy", ".35em").attr("x", d => d.children ? -10 : 10).attr("text-anchor", d => d.children ? "end" : "start").attr("fill", "#f8fafc").style("font-size", "11px").style("font-family", "monospace").text(d => d.data.lexema ? `${d.data.id}: ${d.data.lexema}` : d.data.id);
};

watch(arbolResultado, () => setTimeout(drawTree, 100));

const clickSubirArchivo = () => fileInputRef.value.click();

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  limpiarSalidas();
  inputString.value = "";
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    if (data.exito) {
      const res = await fetch(`http://localhost:5000/api/files/${data.archivo.nombreUnico}`);
      grammarInput.value = await res.text();
      nextTick(() => syncScroll());
    }
  } catch (e) { mensajeError.value = "Error al cargar"; }
};

const procesarGramatica = async () => {
  limpiarSalidas();
  inputString.value = "";
  mensajeProcesando.value = 'Procesando gramática...';
  try {
    const response = await fetch('http://localhost:5000/api/analizar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entrada: grammarInput.value })
    });
    const data = await response.json();
    if (!data.ok) {
      // Mapeo flexible para asegurar que se muestren errores sintácticos
      erroresAnalisis.value = data.errores || [{ tipo: 'SINTÁCTICO', descripcion: data.mensaje }];
    } else {
      mensajeExito.value = "Gramática aceptada";
      gramaticaValidaData.value = data;
      historial.value.unshift({ id: Date.now(), nombre: `Gramática ${historial.value.length + 1}`, tipo: 'LL(1)', estado: 'Aceptado' });
    }
  } catch (e) { mensajeError.value = 'Error de conexión'; }
  finally { mensajeProcesando.value = ''; setTimeout(() => mensajeExito.value = '', 3000); }
}

const analizarEntrada = async () => {
  if (!gramaticaValidaData.value) {
    mensajeError.value = 'Analice la gramática primero';
    return;
  }
  erroresAnalisis.value = [];
  arbolResultado.value = null;
  mensajeProcesando.value = 'Analizando cadena...';
  try {
    const response = await fetch('http://localhost:5000/api/analizar-cadena', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cadena: inputString.value, datosGramatica: gramaticaValidaData.value })
    });
    const data = await response.json();
    if (data.ok) { arbolResultado.value = data.arbol; mensajeExito.value = 'Cadena aceptada'; }
    else { erroresAnalisis.value = data.errores; mensajeError.value = 'Cadena rechazada'; }
  } catch (e) { mensajeError.value = 'Error de red'; }
  finally { mensajeProcesando.value = ''; setTimeout(() => { mensajeExito.value = ''; mensajeError.value = '' }, 3000); }
};
</script>

<style scoped>
/* Clase para unificar fuente en editor e índice */
.editor-font {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

.slide-enter-active, .slide-leave-active { transition: all 0.4s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(-100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

textarea {
  scrollbar-width: none;
  overflow-y: hidden;
}
textarea::-webkit-scrollbar { display: none; }
</style>