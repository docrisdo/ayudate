# Auditoría de accesibilidad de AYÚDATE

Fecha: 12 de septiembre de 2026. Alcance: las diez pantallas aprobadas, navegación compartida, escáner, diálogos y controles de lectura y voz. Sin deploy ni funciones nuevas de producto.

## Hallazgos y correcciones

| Hallazgo | Impacto | Corrección |
|---|---|---|
| El foco quedaba en BODY tras cambiar de pantalla. | Crítico: se perdía el punto de lectura y navegación. | Foco al H1 tras montar la vista, sin desplazamiento forzado; título del documento actualizado. Enlace global para saltar al contenido. |
| Header y navegación estaban incluidos dentro del main general. | Dificultaba distinguir contenido y navegación. | Un main de contenido por pantalla, con header fuera; se conservaron los nav nativos y sus nombres. |
| Botones repetidos de búsqueda se llamaban solamente Leer, Agregar al carrito o Ver ubicación. | Crítico: no permitían distinguir productos en una lista de botones. | Nombres accesibles con producto y marca; resultados con encabezados H3 y artículos identificados; ubicación expone expandido/contraído. |
| Resultados de búsqueda y cambios de cantidades/listas/presupuesto no siempre se anunciaban. | Crítico: una acción podía parecer no haber ocurrido. | Anuncios breves mediante una región status compartida, sin SpeechSynthesis; resultados anunciados tras una pausa al escribir. Se conservaron anuncios locales útiles. |
| Eliminar filas, cerrar detalles o confirmar algunas acciones quitaba el elemento enfocado. | Crítico: pérdida de foco. | Foco al control superviviente siguiente/anterior o a un destino lógico. Confirmaciones llevan a su mensaje. |
| La apertura de listas enfocaba el panel antes de actualizar su nombre. | Podía anunciar la lista anterior. | Foco después de actualizar React. |
| TAB podía abandonar el documento al llegar al extremo de diálogos nativos. | Incumplía el recorrido solicitado dentro del modal. | Cierre del ciclo de TAB/SHIFT+TAB dentro del diálogo abierto; se conserva showModal y su fondo inerte. |
| Cerrar Ayuda de voz no restauraba el foco porque sus controles cambian de contenedor. | Crítico para retomar la navegación por teclado. | Restauración explícita al botón Ayuda de voz, después de recolocar los controles. |
| Pasar del formulario de código a un resultado retiraba el control enfocado. | Crítico en el escáner. | Foco al resultado, al campo manual o al título de cámara según el estado. ESC conserva el retorno a Buscar por código. |
| Las descripciones de opciones no estaban asociadas programáticamente a sus campos. | Se perdía la explicación del apoyo. | aria-describedby en Bienvenida y Accesibilidad; los checkbox nativos conservan su estado. |
| La visión general de productos pendientes de Mi ruta dependía del recorrido visual. | Crítico para comprender la compra sin mapa. | Región textual con zona actual, indicación, siguiente zona y lista de pendientes con pasillo/ubicación/disponibilidad, generada del estado existente. Se conservan los botones accesibles del mapa. |
| Bienvenida intentaba hablar incluso sin activar la función. | Podía competir con un lector de pantalla. | Orientación automática solo con Comandos de voz activados; guía explícita disponible. Un clic de teclado/tecnología de asistencia en texto no activa el micrófono. |
| Varios verdes sobre fondos claros y algunos estados de alto contraste no alcanzaban el contraste de texto. | Barrera adicional para baja visión. | Oscurecimiento selectivo de textos y botones; corrección del estado Agotado y del indicador de paso en alto contraste. Sin cambios de tamaños, distribución o imágenes. |

## Semántica y comunicación

Las pantallas conservan un H1 y una estructura de secciones. Buscar producto incorpora encabezados de resultados individuales. Formularios siguen usando campos nativos con etiquetas; se asociaron también instrucciones de entrada masiva y el mensaje de validación del nombre de lista. Los productos del carrito conservan tabla, encabezados, precio unitario, subtotal y cantidades; Nueva lista expone los prefijos de precio y subtotal también en escritorio.

La región compartida `role="status"` anuncia resultados, cantidades, listas guardadas/restauradas y presupuesto actualizado. Los mensajes existentes de búsqueda, asistencia, cámara y total se conservaron. No se convirtió toda la pantalla en una región viva. Los pictogramas decorativos mantienen alt vacío; las fotografías informativas conservan alternativas. Los controles no necesitan que SpeechRecognition esté disponible.

La revisión del carrito poblado detectó que dos leches de marcas distintas compartían el nombre de sus controles. Se añadió la marca a aumentar, disminuir, eliminar y cantidad; esta última expone también el número actual. Se probaron aumentar y disminuir por teclado y se volvió a auditar el carrito poblado.

El foco entre vistas se controla desde `useScreenFocus`. Al abrir diálogos se conserva el comportamiento nativo de `showModal`; el control compartido de TAB evita salir de ellos. ESC cierra y el foco vuelve al invocador, con tratamiento explícito para el escáner y la ayuda de voz. Estas decisiones siguen el [patrón de diálogos de WAI](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/). Los anuncios breves siguen el propósito de los [mensajes de estado](https://www.w3.org/WAI/WCAG21/Understanding/status-messages).

## Verificación realizada

- Navegador Chromium/Brave en perfiles de prueba, a 1440, 820, 390 y 430 px.
- Recorrido exclusivamente con teclado: Bienvenida → Accesibilidad → Inicio → Mis listas → Nueva lista → Buscar producto → Mi ruta → Presupuesto → Mi carrito → Solicitar asistencia. Comandos de voz desactivados. TAB, SHIFT+TAB, ENTER, SPACE y ESC; comprobación adicional de flechas en el selector de ordenación.
- Crear y guardar lista; abrir, editar, cancelar eliminación; añadir productos; cantidades; ubicación; código no encontrado; marcar producto encontrado; editar presupuesto; confirmar carrito; eliminar producto; seleccionar y confirmar asistencia.
- Foco al H1; foco en editores; retención y retorno del foco en escáner, carrito, asistencia y ayuda de voz; retorno después de eliminar filas.
- Axe-core 4.13.0, usado como herramienta local de auditoría, sin añadirlo a las dependencias de la aplicación: 40 capturas de estado con alto contraste/selección inicial y 44 con preferencias normales/transición de configuración. Cero infracciones reportadas en los estados finales auditados. Cinco estados adicionales con carrito y lista poblados y diálogos también sin infracciones.
- Cero desplazamiento horizontal en los anchos auditados. Capturas revisadas de escritorio y móvil.
- Árbol de accesibilidad mediante CDP: nombre, rol, nivel de encabezado, foco, checked, expanded, hasPopup, descripción y valores expuestos. Ejemplos: «Agregar al carrito: Leche entera LALA», botón; «Comandos de voz», checkbox desmarcado con descripción; «Ver ubicación de Leche entera LALA», botón contraído. Se guardaron árboles de carrito poblado y diálogos.
- Reconocimiento no disponible: navegación y ayuda utilizables; no se solicita micrófono; sin voz automática inicial cuando está desactivada. Ayuda de voz devuelve el foco correctamente.
- Regresión de Leer/Pausar/Reanudar/Detener y lectura automática mediante SpeechSynthesis instrumentado; cámara virtual, reconocimiento real de código con ZXing, entrada manual y liberación de cámara.
- Lint, compilación y 19 pruebas de lógica aprobados. Sin errores de consola en los recorridos funcionales probados.

Evidencia: `before.json`, `after.json`, `normal.json`, `keyboard-report.json`, `states.json`, capturas PNG y archivos `*-tree.json` de esta carpeta. Los scripts de reproducción están en esta misma carpeta. La copia anterior del código está en `before/`.

## Archivos de aplicación modificados

- `src/App.jsx`, `src/App.css`, `src/main.jsx`.
- Nuevos: `src/components/AccessibilityProvider.jsx`, `src/components/accessibilityContext.js`, `src/components/AccessibilitySupport.css`.
- `src/components/ResponsiveHeader.jsx`, `src/components/BarcodeScanner.jsx`, `src/components/SpeechProvider.jsx`, `src/components/VoiceCommandsProvider.jsx`.
- `src/screens/Welcome.jsx`, `src/screens/Welcome.css`.
- `src/screens/Accessibility.jsx`, `src/screens/Accessibility.css`.
- `src/screens/Home.jsx`, `src/screens/Lists.jsx`, `src/screens/NewList.jsx`.
- `src/screens/Search.jsx`, `src/screens/Search.css`.
- `src/screens/Route.jsx`, `src/screens/Budget.jsx`, `src/screens/Cart.jsx`, `src/screens/Assistance.jsx`.

## Pendiente y límites reales

No se ejecutaron NVDA, JAWS, VoiceOver ni TalkBack reales. El árbol del navegador comprueba la información expuesta, pero no garantiza cómo cada lector anuncia, interrumpe o agrupa los mensajes. No se probó exploración táctil en un teléfono físico. Los anchos móviles son viewports de navegador de escritorio. La voz se instrumentó y la cámara usó un dispositivo virtual en las pruebas reproducibles.

La validación con una persona ciega y su lector habitual sigue pendiente, especialmente para ritmo de anuncios, navegación virtual por encabezados y convivencia de la lectura propia opcional con el lector. No se afirma certificación WCAG ni accesibilidad universal a partir de axe. No quedan fallos detectados sin corregir en los escenarios técnicos descritos; estas pruebas no cubren todas las combinaciones posibles de dispositivo y preferencias.
