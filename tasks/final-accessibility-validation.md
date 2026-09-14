# Etapa 3: validación final de AYÚDATE

Fecha: 14 de septiembre de 2026.

## Correcciones mínimas

- `src/screens/Cart.jsx`: el elemento `output` de cantidad tenía un anuncio implícito `polite`, además del anuncio explícito con producto y cantidad. Se añadió `aria-live="off"` al `output`. Conserva su nombre, valor y presencia en el árbol accesible; la región compartida sigue anunciando el cambio con contexto. El total mantiene su anuncio independiente.
- `src/screens/Assistance.css`: el título «Solicitud enviada» del panel de notificación tenía contraste 3.98:1 sobre blanco (17.6 px, negrita). Se cambió únicamente su color a #007b74; axe ya no detecta el fallo. También se comprobó con alto contraste activado.

No se modificaron navegación, distribución, preferencias, comandos ni controlador de voz.

## Verificación ejecutada

Navegador: Chromium de Brave mediante Playwright, contextos aislados. Evidencia y perfiles temporales fuera del commit.

- Diez pantallas: Bienvenida, Personalizar experiencia, Inicio, Mis listas, Nueva lista, Buscar producto, Mi ruta, Presupuesto, Mi carrito y Solicitar asistencia.
- Anchos CSS 1440, 768, 430, 390 y 320: un H1 por pantalla, etiquetas, landmarks, ausencia de scroll horizontal general y cero errores de ejecución en el recorrido.
- Flujo exclusivamente con Tab, Shift+Tab, Enter, Space y Escape en los cinco anchos. Se escribieron campos con teclado; se verificaron flechas en el selector de ordenación. Apertura y edición de listas, creación y guardado, inicio de compra, búsqueda, ubicación, cantidades, presupuesto, escáner manual, diálogos de compra y asistencia. Foco de entrada en H1, contención de diálogos y retorno al cerrar comprobados.
- Zoom real de navegador 200 %, aplicado con extensión local temporal y verificado con devicePixelRatio=2. Diez pantallas sin desbordamiento. Reflow adicional a 320 CSS px.
- Axe existente: sin infracciones detectadas en los estados finales examinados (pantallas, preferencias combinadas, carrito lleno, confirmaciones, lista con productos, escáner y presupuesto excedido). No se instaló Lighthouse ni otra dependencia.
- Árbol accesible de Chromium: muestras de nombres, roles, checked, expanded, current, valores, regiones status, búsqueda y diálogos modales. La cantidad conserva su nombre y valor sin una segunda región live automática.
- Mi ruta: producto, zona, pasillo, ubicación, secuencia completa, estados encontrado/pendiente/agotado y caja disponibles como texto accesible. Mapa complementario. La preferencia agrupa por zona e indica pasillos principales; no detecta obstáculos físicos.
- Interacción táctil emulada a 430/390/320: categorías, escáner, código conocido, agregar al carrito/lista, cantidades, eliminación/deshacer, presupuesto y todas las opciones de asistencia. Imágenes cargadas y sin errores relevantes de consola en estos recorridos.
- Cámara: se revisó el diseño del estado de solicitud de permiso y la entrada manual. Código desconocido y conocido probados. La denegación/no disponibilidad lleva al modo manual. No se probó una captura con cámara física.
- Voz: una introducción por entrada, nombre de pantalla, datos reales de ruta/presupuesto/carrito, encendido/apagado, Pausar/Reanudar/Detener/Desactivar, cancelación al navegar y ausencia de reconocimiento/micrófono. Pruebas controladas de SpeechSynthesis y fallo/no disponibilidad; no equivalen a escuchar físicamente todas las voces del sistema.
- Preferencias: cinco persistentes tras recargar, acompañamiento apagado en nueva sesión; Leer permanece disponible con botones simplificados. Texto grande/alto contraste/controles ampliados verificados juntos, incluidos estados dinámicos a 320 px.

## Comandos finales

- `npm run lint`: correcto.
- Los siete archivos `*.test.js` de src: 27 pruebas, 27 aprobadas.
- `npm run build`: correcto. Vite emitió únicamente un aviso informativo de tiempos de plugins, sin fallo de compilación.
- `git diff --check`: correcto.

## Pendiente de validación humana con NVDA

Mantener apagados el acompañamiento y la lectura propia durante la prueba principal.

1. Bienvenida: Ctrl+Inicio, H y Tab; identificar el título y activar Comenzar o Personalizar con Enter.
2. Personalización: Tab y Space; escuchar nombre y activado/desactivado de cada switch. Guardar y confirmar llegada a Inicio.
3. Buscar producto: escribir leche; escuchar resultados, precio, disponibilidad y ubicación. Agregar al carrito y comprobar anuncio.
4. Mi ruta: recorrer encabezados y lista textual sin mirar el mapa. Marcar encontrado y avanzar; identificar producto, pasillo, estado y caja.
5. Carrito: aumentar/disminuir; escuchar una sola cantidad con producto, revisar total y eliminar. Comprobar que el foco sigue en un control útil.
6. Asistencia: seleccionar ayuda, abrir/cerrar el diálogo con Escape y notificar. Escuchar confirmación y comprobar retorno del foco.

No se utilizaron físicamente NVDA, TalkBack ni VoiceOver. La auditoría automática no certifica cumplimiento WCAG. La cámara y el tacto en teléfonos reales también requieren comprobación humana.
