/*  Archivo de configuración de Analizador lexico y sintactico con Jison */

/*  Seccion lexica  */

%lex
%%

/*
Palabras reservadas, expresiones regulares y tokens del anañlizador léxico.
*/

/*  Espacios en blanco  */
[ \t\r\n]+                 /* ignorar espacios, tabs y saltos */

/*  Comentarios  */
\/#.*                      /* comentario de una linea */
\/\*\*[^]*?\*\/            /* comentario multilinea */

/*  Palabras reservadas  */
"Wison"                    return 'PALABRA_RESERVADA_WISON';
"Lex"                      return 'PALABRA_RESERVADA_LEX';
"Syntax"                   return 'PALABRA_RESERVADA_SYNTAX';
"Terminal"                 return 'PALABRA_RESERVADA_TERMINAL';
"No_Terminal"              return 'PALABRA_RESERVADA_NO_TERMINAL';
"Initial_Sim"              return 'PALABRA_RESERVADA_INITIAL_SIM';

/*  Bloques */
"{{:"                      return 'DOBLE_BLOQUE_ABRE';
":}}"                      return 'DOBLE_BLOQUE_CIERRA';
":{"                       return 'BLOQUE_ABRE';
":}"                       return 'BLOQUE_CIERRA';

/*  Símbolos  */

"$"                        return 'PALABRA_RESERVADA_DT';
"%"                        return 'PALABRA_RESERVADA_DNT';    

"¿"                        return 'SIMBOLO_APERTURA';
"?"                        return 'SIMBOLO_CIERRE';

"{"                        return 'LLAVE_ABRE';
"}"                        return 'LLAVE_CIERRA';

"("                        return 'PARENTESIS_ABRE';
")"                        return 'PARENTESIS_CIERRA';

"["                        return 'CORCHETE_ABRE';
"]"                        return 'CORCHETE_CIERRA';

":"                        return 'DOS_PUNTOS';
";"                        return 'PUNTO_Y_COMA';
","                        return 'COMA';

"<-"                       return 'FLECHA_ASIGNACION';
"<="                       return 'FLECHA_PRODUCCION';
"="                        return 'IGUAL';
"|"                        return 'OR';

/*  Reglas regex   */
"*"                        return 'KLEENE';
"+"                        return 'MAS';

/*  Expresiones regulares  */
"[aA-zZ]"                  return 'RANGO_LETRAS';
"[0-9]"                    return 'RANGO_NUMEROS';

/*  Declaraciones   */
\'[^\']*\'                 return 'TEXTO';

/*  Identificadores  */
_[a-zA-Z0-9_]*             return 'IDENTIFICADOR';

/*  Token desconocido */
.                          return 'ERROR';

<<EOF>>                    return 'EOF';

/lex

/*  Final de la sección léxica  */

/*  Sección sintáctica  */

%start archivo

%%

/*  Reglas de producción  */

/*  Produccion inicial y flujo del archivo de configuración  */

archivo
    : PALABRA_RESERVADA_WISON SIMBOLO_APERTURA
      PALABRA_RESERVADA_LEX BLOQUE_ABRE bloque_lex BLOQUE_CIERRA
      PALABRA_RESERVADA_SYNTAX DOBLE_BLOQUE_ABRE bloque_syntax DOBLE_BLOQUE_CIERRA
      SIMBOLO_CIERRE PALABRA_RESERVADA_WISON EOF
    ;

/*  Bloque léxico */
bloque_lex
    : lista_terminales
    ;

lista_terminales
    : lista_terminales declaracion_terminal
    | declaracion_terminal
    ;

declaracion_terminal
    : PALABRA_RESERVADA_TERMINAL PALABRA_RESERVADA_DT IDENTIFICADOR FLECHA_ASIGNACION expresion_terminal PUNTO_Y_COMA
    ;

/*  Expresión terminal  */

expresion_terminal
    : concatenacion
    ;

concatenacion
    : concatenacion repeticion
    | repeticion
    ;

repeticion
    : base
    | base KLEENE
    | base MAS
    | base SIMBOLO_CIERRE
    ;

base
    : TEXTO
    | RANGO_LETRAS
    | RANGO_NUMEROS
    | PARENTESIS_ABRE expresion_terminal PARENTESIS_CIERRA
    ;

/*  Bloque sintáctico */

bloque_syntax
    : lista_no_terminales simbolo_inicial lista_producciones
    ;

/*  Lista de no terminales */

lista_no_terminales
    : lista_no_terminales declaracion_no_terminal
    | declaracion_no_terminal
    ;

declaracion_no_terminal
    : PALABRA_RESERVADA_NO_TERMINAL PALABRA_RESERVADA_DNT IDENTIFICADOR PUNTO_Y_COMA
    ;

/*  Símbolo inicial  */

simbolo_inicial
    : PALABRA_RESERVADA_INITIAL_SIM PALABRA_RESERVADA_DNT IDENTIFICADOR PUNTO_Y_COMA
    ;

/*  Lista de producciones  */

lista_producciones
    : lista_producciones produccion
    | produccion
    ;

produccion
    : lado_izq FLECHA_PRODUCCION lado_der PUNTO_Y_COMA
    ;

/*  Lados de la producción  */

lado_izq
    : PALABRA_RESERVADA_DNT IDENTIFICADOR
    ;

lado_der
    : lado_der OR secuencia
    | secuencia
    ;

secuencia
    : secuencia simbolo
    | simbolo
    ;

simbolo
    : PALABRA_RESERVADA_DNT IDENTIFICADOR   /* no terminal */
    | PALABRA_RESERVADA_DT IDENTIFICADOR    /* terminal */
    ;