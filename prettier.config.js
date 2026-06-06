/** @type {import('prettier').Config} */
export default {
	// Ancho orientativo antes de partir líneas (no equivale a max-len de ESLint).
	printWidth: 80,

	// Espacios por nivel de indentación.
	tabWidth: 1,

	// false = sangrar con espacios; true = tabuladores.
	useTabs: true,

	// Punto y coma al final de cada sentencia.
	semi: true,

	// Comillas simples en JS y TS (JSX se controla aparte).
	singleQuote: true,

	// Comillas en claves de objeto: as-needed | consistent | preserve.
	quoteProps: 'as-needed',

	// Comillas simples dentro de atributos JSX (false suele ser más habitual).
	jsxSingleQuote: false,

	// Comas finales donde el lenguaje lo permite: all | es5 | none.
	trailingComma: 'all',

	// Espacios entre llaves en objetos: { a: 1 } frente a {a: 1}.
	bracketSpacing: true,

	// Objetos multilínea: preserve respeta el primer salto; collapse compacta si cabe (v3.5+).
	objectWrap: 'preserve',

	// En tags HTML/JSX multilínea, poner el > al final de la última línea de atributos.
	bracketSameLine: true,

	// Paréntesis en funciones flecha con un solo argumento: always | avoid.
	arrowParens: 'always',

	// Saltos de línea: lf | crlf | cr | auto.
	endOfLine: 'lf',

	// Markdown / texto: preserve | always | never.
	proseWrap: 'preserve',

	// Espacios significativos en HTML, JSX, Vue: css | strict | ignore.
	htmlWhitespaceSensitivity: 'css',

	// Formatear código incrustado (templates etiquetados, bloques en MD): auto | off.
	embeddedLanguageFormatting: 'auto',

	// Forzar un atributo por línea en HTML, JSX y Vue.
	singleAttributePerLine: false,
};
