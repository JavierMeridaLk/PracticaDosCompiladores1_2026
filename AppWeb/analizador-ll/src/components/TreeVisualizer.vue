<template>
  <div class="flex min-h-screen bg-[#0b0f1a] text-slate-300 font-sans overflow-y-auto">
    <transition name="slide">
      <aside v-if="sidebarOpen" class="w-72 bg-[#161b2b] border-r border-slate-800 flex flex-col shadow-2xl">
        <div class="p-5 border-b border-slate-800 flex justify-between items-center bg-[#1c2333]">
          <h2 class="font-bold text-xs uppercase tracking-widest text-slate-500">Historial</h2>
          <button @click="sidebarOpen = false" class="text-slate-500 hover:text-white">
            <span class="material-icons text-sm">first_page</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-for="item in historial" :key="item.id" class="p-3 rounded-xl bg-[#1c2333] border border-slate-700/50">
            <p class="text-sm font-medium text-slate-200">{{ item.nombre }}</p>
            <p class="text-[11px] text-emerald-500 mt-1 flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {{ item.estado }}
            </p>
          </div>
        </div>
      </aside>
    </transition>

    <main class="flex-1 flex flex-col min-w-0 relative">
      <header class="h-16 flex items-center justify-center bg-[#0b0f1a] border-b border-slate-800/60 relative">
        <button v-if="!sidebarOpen" @click="sidebarOpen = true" class="absolute left-4 p-2 hover:bg-slate-800 rounded-lg">
          <span class="material-icons">menu</span>
        </button>
        <h1 class="text-xl font-semibold tracking-tight text-white">Analizador Sintáctico LL(1)</h1>
        <div class="absolute right-4 flex flex-col gap-2">
          <transition name="fade">
            <div v-if="mensajeProcesando" class="bg-amber-500/20 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-lg text-sm">⏳ {{ mensajeProcesando }}</div>
          </transition>
          <transition name="fade">
            <div v-if="mensajeExito" class="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg text-sm">✓ {{ mensajeExito }}</div>
          </transition>
        </div>
      </header>

      <div class="flex-1 p-6 grid grid-cols-12 gap-6 h-[calc(100vh-64px)]">
        <div class="col-span-7 flex flex-col gap-6">
          <div class="flex-1 bg-[#161b2b] rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
            <div class="p-4 flex justify-between items-center bg-slate-800/30 border-b border-slate-700">
              <h1 class="text-sm font-bold text-white text-[20px]">Editor de Gramática</h1>
              <button @click="clickSubirArchivo" class="bg-[#2563eb] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition">
                <span class="material-icons text-base">cloud_upload</span> SUBIR
              </button>
              <input type="file" ref="fileInputRef" @change="handleFileUpload" accept=".txt" style="display: none;">
            </div>
            <div class="flex flex-1 overflow-hidden">
              <div class="flex flex-1 overflow-auto" ref="scrollContainer" @scroll="syncScroll">
                <div ref="linesRef" class="text-sm font-mono text-slate-500 p-4 text-right select-none">{{ lineCount }}</div>
                <textarea ref="textareaRef" v-model="grammarInput" @input="updateCursor" @click="updateCursor" class="flex-1 bg-transparent p-4 outline-none resize-none font-mono text-emerald-400 text-sm leading-relaxed" spellcheck="false"></textarea>
              </div>
            </div>
          </div>
          <button @click="procesarGramatica" class="w-full bg-[#10b981] text-[#0b0f1a] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all">
            <span class="material-icons">bolt</span> Analizar gramática
          </button>
        </div>

        <div class="col-span-5 flex flex-col gap-6 h-full overflow-hidden">
          <div class="bg-[#161b2b] p-5 rounded-2xl border border-slate-800 shadow-sm" :class="{ 'opacity-50 grayscale-[0.4]': !gramaticaEsValida }">
            <h3 class="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Entrada de Cadena</h3>
            <textarea v-model="inputString" :disabled="!gramaticaEsValida" rows="2" class="w-full bg-[#0b0f1a] border border-slate-700 rounded-xl p-4 text-sm text-emerald-400 outline-none focus:border-blue-500" placeholder="Ej: ( x )"></textarea>
            <button @click="analizarEntrada" :disabled="!gramaticaEsValida" class="w-full mt-4 py-2.5 border rounded-xl transition text-xs font-bold uppercase" :class="gramaticaEsValida ? 'border-blue-500/30 text-blue-400 hover:bg-blue-500/10' : 'border-slate-800 text-slate-600'">
              Analizar entrada
            </button>
          </div>

          <div class="flex-1 bg-[#161b2b] p-5 rounded-2xl border border-slate-800 flex flex-col shadow-sm min-h-0">
            <h3 class="text-xs font-bold text-slate-500 uppercase mb-4 tracking-widest">Árbol de Derivación</h3>
            <div ref="treeContainer" class="flex-1 bg-[#0b0f1a] rounded-xl border border-slate-800/50 relative overflow-hidden cursor-move">
              <svg ref="svgRef" class="w-full h-full"></svg>
              <div v-if="!arbolResultado" class="absolute inset-0 text-slate-600 text-xs italic flex items-center justify-center">Esperando resultado...</div>
            </div>
          </div>

          <div class="h-48 bg-[#161b2b] rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
            <div class="p-3 border-b border-slate-800 bg-red-500/5 font-bold text-xs text-red-500 uppercase">Errores</div>
            <div class="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b0f1a]/30">
              <div v-if="erroresAnalisis.length === 0" class="text-slate-600 italic text-xs">Sin errores detectados</div>
              <div v-for="(error, index) in erroresAnalisis" :key="index" class="text-xs p-2 border-l-2 border-red-500 bg-[#1c2333]">
                {{ error.descripcion }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import * as d3 from 'd3'

const sidebarOpen = ref(true)
const grammarInput = ref("")
const inputString = ref("")
const fileInputRef = ref(null)
const mensajeError = ref("")
const mensajeExito = ref("")
const mensajeProcesando = ref("")
const erroresAnalisis = ref([])
const gramaticaValidaData = ref(null)
const arbolResultado = ref(null)

const textareaRef = ref(null)
const linesRef = ref(null)
const treeContainer = ref(null)
const svgRef = ref(null)
const cursor = ref({ line: 1, column: 1 })

const gramaticaEsValida = computed(() => grammarInput.value.trim() !== "" && erroresAnalisis.value.length === 0 && gramaticaValidaData.value !== null)
const lineCount = computed(() => grammarInput.value.split('\n').length || 1)
const historial = ref([{ id: 1, nombre: 'Gramática Actual', estado: 'Pendiente' }])

// --- LÓGICA D3 HORIZONTAL ---
const drawTree = () => {
  if (!arbolResultado.value || !svgRef.value) return;
  const width = treeContainer.value.clientWidth;
  const height = treeContainer.value.clientHeight;
  const svg = d3.select(svgRef.value);
  svg.selectAll("*").remove();

  const g = svg.append("g").attr("transform", "translate(80,40)");
  svg.call(d3.zoom().on("zoom", (e) => g.attr("transform", e.transform)));

  const treeLayout = d3.tree().size([height - 100, width - 250]);
  const root = d3.hierarchy(arbolResultado.value, d => d.hijos);
  treeLayout(root);

  g.selectAll(".link").data(root.links()).enter().append("path")
    .attr("fill", "none").attr("stroke", "#334155").attr("stroke-width", 1.5)
    .attr("d", d3.linkHorizontal().x(d => d.y).y(d => d.x));

  const node = g.selectAll(".node").data(root.descendants()).enter().append("g")
    .attr("transform", d => `translate(${d.y},${d.x})`);

  node.append("circle").attr("r", 5).attr("fill", d => d.data.lexema ? "#10b981" : "#3b82f6");
  node.append("text").attr("dy", ".35em").attr("x", d => d.children ? -10 : 10)
    .attr("text-anchor", d => d.children ? "end" : "start")
    .attr("fill", "#f8fafc").style("font-size", "12px").style("font-family", "monospace")
    .text(d => d.data.lexema ? `${d.data.id}: ${d.data.lexema}` : d.data.id);
};

watch(arbolResultado, () => setTimeout(drawTree, 100));

// --- MÉTODOS ---
function updateCursor(e) {
  const text = e.target.value.substring(0, e.target.selectionStart)
  const lines = text.split('\n')
  cursor.value.line = lines.length
  cursor.value.column = lines[lines.length - 1].length + 1
}
function syncScroll() { if (linesRef.value && textareaRef.value) linesRef.value.scrollTop = textareaRef.value.scrollTop }
function clickSubirArchivo() { fileInputRef.value.click() }

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch('http://localhost:5000/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    if (data.exito) {
      const resContenido = await fetch(`http://localhost:5000/api/files/${data.archivo.nombreUnico}`);
      grammarInput.value = await resContenido.text();
    }
  } catch (e) { mensajeError.value = "Error al subir"; }
}

const procesarGramatica = async () => {
  mensajeProcesando.value = 'Procesando...'; erroresAnalisis.value = []; arbolResultado.value = null;
  try {
    const res = await fetch('http://localhost:5000/api/analizar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entrada: grammarInput.value })
    });
    const data = await res.json();
    if (!data.ok) erroresAnalisis.value = data.errores || [{ descripcion: data.mensaje }];
    else { mensajeExito.value = "Gramática OK"; gramaticaValidaData.value = data; }
  } catch (e) { mensajeError.value = "Error servidor"; }
  finally { mensajeProcesando.value = ""; setTimeout(() => mensajeExito.value = "", 3000); }
}

const analizarEntrada = async () => {
  mensajeProcesando.value = 'Analizando cadena...';
  try {
    const res = await fetch('http://localhost:5000/api/analizar-cadena', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cadena: inputString.value, datosGramatica: gramaticaValidaData.value })
    });
    const data = await res.json();
    if (data.ok) { arbolResultado.value = data.arbol; mensajeExito.value = "Aceptada"; }
    else { erroresAnalisis.value = data.errores; mensajeError.value = "Rechazada"; }
  } catch (e) { mensajeError.value = "Error red"; }
  finally { mensajeProcesando.value = ""; setTimeout(() => mensajeExito.value = "", 3000); }
};
</script>