
class MotorLL {
    constructor(producciones, noTerminales, simboloInicial) {
        this.producciones = producciones;
        this.noTerminales = noTerminales;
        this.simboloInicial = simboloInicial;
        this.first = {};
        this.follow = {};
        this.tablaM = {};
        this.conflictos = [];

        this.inicializarConjuntos();
    }

    inicializarConjuntos() {
        this.noTerminales.forEach(nt => {
            this.first[nt] = new Set();
            this.follow[nt] = new Set();
            this.tablaM[nt] = {};
        });
    }

    calcularFirst() {
        let cambio = true;
        while (cambio) {
            cambio = false;
            this.producciones.forEach(p => {
                p.lado_derecho.forEach(opcion => {
                    const inicial = opcion[0];
                    if (!inicial) return; 

                    const antes = this.first[p.lado_izquierdo].size;
                    
                    if (inicial.tipo === 'Ref_Terminal') {
                        this.first[p.lado_izquierdo].add(inicial.id);
                    } else if (inicial.tipo === 'Ref_No_Terminal') {
                        // Propagar First del hijo al padre
                        if (this.first[inicial.id]) {
                            this.first[inicial.id].forEach(f => this.first[p.lado_izquierdo].add(f));
                        }
                    }
                    
                    if (this.first[p.lado_izquierdo].size > antes) cambio = true;
                });
            });
        }
    }

    calcularFollow() {
        if (this.simboloInicial && this.follow[this.simboloInicial]) {
            this.follow[this.simboloInicial].add('$'); 
        }

        let cambio = true;
        while (cambio) {
            cambio = false;
            this.producciones.forEach(p => {
                p.lado_derecho.forEach(opcion => {
                    for (let i = 0; i < opcion.length; i++) {
                        const simbolo = opcion[i];
                        if (simbolo.tipo === 'Ref_No_Terminal') {
                            const antes = this.follow[simbolo.id].size;
                            const siguiente = opcion[i + 1];

                            if (siguiente) {
                                if (siguiente.tipo === 'Ref_Terminal') {
                                    this.follow[simbolo.id].add(siguiente.id);
                                } else if (this.first[siguiente.id]) {
                                    this.first[siguiente.id].forEach(f => this.follow[simbolo.id].add(f));
                                }
                            } else {

                                if (this.follow[p.lado_izquierdo]) {
                                    this.follow[p.lado_izquierdo].forEach(f => this.follow[simbolo.id].add(f));
                                }
                            }
                            if (this.follow[simbolo.id].size > antes) cambio = true;
                        }
                    }
                });
            });
        }
    }

    construirTablaM() {
        this.producciones.forEach(p => {
            p.lado_derecho.forEach(opcion => {
                const primero = opcion[0];
                if (!primero) return;

                let tokensParaEstaRegla = new Set();

                if (primero.tipo === 'Ref_Terminal') {
                    tokensParaEstaRegla.add(primero.id);
                } else if (this.first[primero.id]) {
                    this.first[primero.id].forEach(t => tokensParaEstaRegla.add(t));
                }

                tokensParaEstaRegla.forEach(t => {
                    // DETECCIÓN DE AMBIGÜEDAD:
                    // Si ya existe una regla en esta celda [NoTerminal, Terminal]
                    if (this.tablaM[p.lado_izquierdo][t]) {
                        this.conflictos.push(`Ambigüedad: M[${p.lado_izquierdo}, ${t}] tiene múltiples producciones.`);
                    }
                    this.tablaM[p.lado_izquierdo][t] = {
                        lhs: p.lado_izquierdo,
                        rhs: opcion
                    };
                });
            });
        });
    }
}

export default MotorLL;