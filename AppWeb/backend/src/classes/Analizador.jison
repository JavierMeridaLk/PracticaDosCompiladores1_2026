%lex
%options flex

%%

/* Reglas para omitir (ahora más estrictas) */
\s+                     /* omitir espacios y saltos de línea */
\/\*\*[\s\S]*?\*\/      /* omitir comentarios multilínea */
\#[^\n]* /* omitir comentarios de una línea */


"Wison"                 return 'R_WISON';
"¿"                     return 'SIGNO_INICIO';
"?Wison"                return 'FIN_WISON';
/* Palabras Reservadas y Símbolos */

"¿"                     return 'SIGNO_INICIO';


"Lex"                   return 'R_LEX';
"{:"                    return 'LLAVE_DP_A';
":}"                    return 'LLAVE_DP_C';

"Syntax"                return 'R_SYNTAX';
"{{:"                   return 'DOBLE_LLAVE_DP_A';
":}}"                   return 'DOBLE_LLAVE_DP_C';

"Terminal"              return 'R_TERMINAL';
"No_Terminal"           return 'R_NOTERMINAL';
"Initial_Sim"           return 'R_INITIAL_SIM';

"<-"                    return 'ASIGNACION_LEX';
"<="                    return 'ASIGNACION_SYN';
";"                     return 'PUNTO_COMA';
"|"                     return 'OR';
"("                     return 'PAR_A';
")"                     return 'PAR_C';
"*"                     return 'ASTERISCO';
"+"                     return 'MAS';
"?"                     return 'INTERROGACION';

"[aA-zZ]"               return 'RANGO_LETRAS';
"[0-9]"                 return 'RANGO_NUMEROS';

\$_[a-zA-Z0-9_]+        return 'ID_TERMINAL';
\%_[a-zA-Z0-9_]+        return 'ID_NOTERMINAL';
\'[^\']*\'              return 'CADENA';

.                       {
                            parser.parseError("Error Léxico: Caracter inesperado '" + yytext + "'", {
                                text: yytext,
                                loc: yylloc,
                                token: null
                            });
                        }


<<EOF>>                 return 'EOF';

/lex


%start inicio

%%

inicio
    : R_WISON SIGNO_INICIO bloque_lex bloque_syntax FIN_WISON EOF 
        { 
            return { 
                lexico: $3, 
                sintaxis: $4 
            }; 
        }
    ;

bloque_lex
    : R_LEX LLAVE_DP_A lista_terminales LLAVE_DP_C
        { $$ = $3; }
    ;

lista_terminales
    : lista_terminales declaracion_terminal
        { $$ = $1; $$.push($2); }
    | declaracion_terminal
        { $$ = [$1]; }
    ;

declaracion_terminal
    : R_TERMINAL ID_TERMINAL ASIGNACION_LEX expr_lexica PUNTO_COMA
        { 
            $$ = { tipo: 'Def_Terminal', identificador: $2, expresion: $4 }; 
        }
    ;

expr_lexica
    : expr_lexica item_lexico
        { $$ = $1; $$.push($2); }
    | item_lexico
        { $$ = [$1]; }
    ;

item_lexico
    : base_lexica
        { $$ = $1; }
    | base_lexica ASTERISCO
        { $$ = { tipo: 'Kleene', expresion: $1 }; }
    | base_lexica MAS
        { $$ = { tipo: 'Cerradura_Positiva', expresion: $1 }; }
    | base_lexica INTERROGACION
        { $$ = { tipo: 'Opcional', expresion: $1 }; }
    ;

base_lexica
    : CADENA
        { $$ = { tipo: 'Cadena', valor: $1 }; }
    | RANGO_LETRAS
        { $$ = { tipo: 'Rango_Letras', valor: $1 }; }
    | RANGO_NUMEROS
        { $$ = { tipo: 'Rango_Numeros', valor: $1 }; }
    | ID_TERMINAL
        { $$ = { tipo: 'Referencia_Terminal', id: $1 }; }
    | PAR_A expr_lexica PAR_C
        { $$ = { tipo: 'Agrupacion', expresion: $2 }; }
    ;


bloque_syntax
    : R_SYNTAX DOBLE_LLAVE_DP_A lista_instrucciones_syn DOBLE_LLAVE_DP_C
        { $$ = $3; }
    ;

lista_instrucciones_syn
    : lista_instrucciones_syn instruccion_syn
        { $$ = $1; $$.push($2); }
    | instruccion_syn
        { $$ = [$1]; }
    ;

instruccion_syn
    : R_NOTERMINAL ID_NOTERMINAL PUNTO_COMA
        { $$ = { tipo: 'Def_No_Terminal', id: $2 }; }
    | R_INITIAL_SIM ID_NOTERMINAL PUNTO_COMA
        { $$ = { tipo: 'Def_Simbolo_Inicial', id: $2 }; }
    | ID_NOTERMINAL ASIGNACION_SYN lista_lados_derechos PUNTO_COMA
        { $$ = { tipo: 'Produccion', lado_izquierdo: $1, lado_derecho: $3 }; }
    ;

lista_lados_derechos
    : lista_lados_derechos OR lado_derecho
        { $$ = $1; $$.push($3); }
    | lado_derecho
        { $$ = [$1]; }
    ;

lado_derecho
    : lista_simbolos
        { $$ = $1; }
    ;

lista_simbolos
    : lista_simbolos simbolo
        { $$ = $1; $$.push($2); }
    | simbolo
        { $$ = [$1]; }
    ;

simbolo
    : ID_NOTERMINAL
        { $$ = { tipo: 'Ref_No_Terminal', id: $1 }; }
    | ID_TERMINAL
        { $$ = { tipo: 'Ref_Terminal', id: $1 }; }
    ;

    

%%

/* Código Adicional */
{{
    var listaErrores = [];

    // Sobrescribimos el manejador de errores de Jison
    parser.parseError = function (str, hash) {
        const error = {
            tipo: hash.token ? "Sintáctico" : "Léxico",
            lexema: hash.text || hash.token || "Desconocido",
            linea: hash.loc ? hash.loc.first_line : "N/A",
            columna: hash.loc ? hash.loc.first_column : "N/A",
            descripcion: str
        };
        listaErrores.push(error);
    };

    parser.getErrores = function () {
        return listaErrores;
    };

    parser.limpiarErrores = function () {
        listaErrores = [];
    };
}}