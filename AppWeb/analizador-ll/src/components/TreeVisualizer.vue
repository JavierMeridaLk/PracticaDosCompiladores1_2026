<template>
  <div ref="treeContainer" class="w-full h-full bg-[#0b0f1a] overflow-hidden cursor-move">
    <svg ref="svgRef"></svg>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';

const props = defineProps({
  data: Object
});

const treeContainer = ref(null);
const svgRef = ref(null);

const drawTree = () => {
  if (!props.data || !svgRef.value) return;

  // Limpiar SVG previo
  const svg = d3.select(svgRef.value);
  svg.selectAll("*").remove();

  const width = treeContainer.value.clientWidth;
  const height = treeContainer.value.clientHeight;

  const g = svg
    .attr("width", width)
    .attr("height", height)
    .call(d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    }))
    .append("g");

  const treeLayout = d3.tree().size([width - 100, height - 100]);
  const root = d3.hierarchy(props.data, d => d.hijos);
  treeLayout(root);

  // Enlaces (Líneas)
  g.selectAll(".link")
    .data(root.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", "#1e293b")
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y));

  // Nodos (Círculos/Rectángulos)
  const node = g.selectAll(".node")
    .data(root.descendants())
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.append("circle")
    .attr("r", 20)
    .attr("fill", d => d.data.lexema ? "#10b981" : "#2563eb") // Verde si es hoja, Azul si es No Terminal
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);

  node.append("text")
    .attr("dy", ".35em")
    .attr("y", d => d.children ? -30 : 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#cbd5e1")
    .style("font-size", "12px")
    .style("font-family", "monospace")
    .text(d => d.data.lexema || d.data.id);
};

onMounted(drawTree);
watch(() => props.data, drawTree, { deep: true });
</script>