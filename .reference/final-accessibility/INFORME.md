# Revisión final de accesibilidad — 13 de septiembre de 2026

## Resultado

Se completó la revisión técnica de las diez pantallas, sin rediseño ni cambios en SpeechRecognition. No es una certificación WCAG ni una prueba con un lector de pantalla humano.

## Hallazgos y correcciones de esta revisión

- **Orientación:** Inicio, Accesibilidad, Mi ruta y Asistencia tenían títulos visibles comprensibles, pero no nombraban explícitamente la pantalla. Se añadieron prefijos solo para tecnologías de asistencia, conservando el texto visual y un H1 por pantalla.
- **Formularios:** Buscar producto y Más categorías usaban nombres ARIA sin label HTML. Se asociaron labels reales; también se etiquetaron las cantidades de Nueva lista. Se mantuvieron las etiquetas existentes y se vinculó el error del nombre con aria-invalid y su mensaje.
- **Productos:** se incluyó la presentación en el nombre del selector de producto, conservando el texto visible dentro del nombre accesible. Se eliminaron alternativas redundantes de fotos junto al nombre del producto y en la vista previa.
- **Mi ruta, prioridad crítica:** la alternativa textual anterior enumeraba pendientes, pero no todo el recorrido. Ahora incluye un OL con productos y caja, zona, pasillo, ubicación y estado Encontrado/Pendiente/Agotado. El paso actual expone aria-current="step". El mapa sigue intacto.
- **Estados:** marcar un producto como encontrado anuncia su nombre y el siguiente producto del recorrido/pasillo, utilizando la región status compartida. Se evitó un segundo anuncio genérico duplicado. No se cambia automáticamente de parada.
- **Skip link:** el enlace global apunta a #contenido-principal, presente en todas las pantallas.
- **Tacto:** controles principales del header, lectura de producto, agregado, cantidades y eliminación tienen mínimos de aproximadamente 48 × 48 CSS px en móvil cuando corresponde. Se ajustó mínimamente el espacio reservado al botón Leer y las columnas de cantidades. Las acciones secundarias ya suficientemente separadas no se ampliaron indiscriminadamente.
- **Foco:** apareció un fallo intermitente cuando terminaba una lectura mientras su control tenía foco. SpeechProvider devuelve el foco antes de retirar esos controles, conservándolo dentro del diálogo si hay uno abierto. No se modificó el reconocimiento de voz.

## Pruebas

| Comprobación | Resultado |
|---|---|
| Flujo completo únicamente con teclado | Aprobado en 320, 390 y 430 px; TAB, SHIFT+TAB, ENTER, SPACE y ESC. Flechas comprobadas en ordenación. |
| Zoom real del navegador al 200% | Aprobado. Perfil aislado de Brave/Chromium y API chrome.tabs.getZoom = 2; DPR = 2 y ancho de contenido de 631 CSS px en la ventana de prueba. No se usó CSS zoom ni una captura ampliada. |
| Recorrido al 200% | Bienvenida, preferencias, Inicio, listas, nueva lista, búsqueda, ruta, presupuesto, carrito y asistencia, incluyendo edición, cantidades y diálogos mediante teclado. |
| Reflow | Sin desplazamiento horizontal general en las diez pantallas a 320/390/430 px y al 200%. También se verificaron listas/carrito con productos y precios a 320 px. |
| Tacto emulado | Búsqueda, selección, agregado, recorrido, cantidades y asistencia mediante tap en viewport móvil de 320 px. |
| Flujo sin información visual | Comprobación por nombres accesibles y ariaSnapshot: pantalla, selección, producto/marca, precio, pasillo, próxima parada, presupuesto, carrito y solicitud enviada. Sin interpretar imágenes ni mapa. |
| Micrófono | Recognition ausente y micrófono no disponible en el escenario de prueba; cero solicitudes de micrófono durante el flujo normal. |
| Diálogos | Escáner, confirmación de carrito y asistencia: entrada de foco, TAB dentro, ESC y retorno. Ayuda de voz: también verificada, sin desarrollar comandos. |
| Auditoría automática | Axe-core existente, con reglas etiquetadas WCAG 2/2.1/2.2 AA y buenas prácticas: cero infracciones en 30 estados móviles y 10 estados al 200%. Otros cinco estados poblados/diálogos sin infracciones. No se ejecutó Lighthouse; no se informa una puntuación Lighthouse. |
| Accessibility Tree | Se revisaron nombres, roles, valores/cantidades, estados de checkbox, expandido/contraído, selección, encabezados, regiones y texto del recorrido; se guardaron árboles CDP y snapshots accesibles. |
| Verificación de código | Lint, compilación y 19 pruebas de lógica aprobados. Sin errores de consola en los recorridos verificados. |

Las correcciones anteriores de foco entre pantallas, labels de productos, estados de asistencia, presupuesto y carrito se conservaron. No fue necesario rehacer los diálogos. Lectura automática sigue desactivada por defecto y la accesibilidad estructural no depende de ninguna preferencia.

## Archivos modificados

- `src/components/AccessibilityProvider.jsx`: destino del skip link.
- `src/components/AccessibilitySupport.css`: tamaños táctiles y ajustes mínimos de espacio móvil.
- `src/components/SpeechProvider.jsx`: foco al finalizar lectura.
- `src/screens/Welcome.jsx`, `Lists.jsx`, `Budget.jsx`, `Cart.jsx`: identificador del contenido principal.
- `src/screens/Home.jsx`, `Assistance.jsx`: identificador y nombre accesible del H1.
- `src/screens/Accessibility.jsx`: identificador, H1 y foto sin alternativa redundante.
- `src/screens/Search.jsx`: labels reales, nombre de selector completo, foto y destino principal.
- `src/screens/NewList.jsx`: label de cantidades, asociación de errores y destino principal.
- `src/screens/Route.jsx`: lista ordenada, paso actual, estados, anuncio y destino principal.

Evidencia y scripts reproducibles en esta carpeta: `after.json`, `zoom.json`, `keyboard-report.json`, `zoom-keyboard-report.json`, `states.json`, `nonvisual.json`, archivos `*-tree.json` y capturas. La herramienta auxiliar para configurar zoom solo existe en el perfil de prueba, no en AYÚDATE ni en el perfil personal del usuario.

## Límites

**Preparado para VoiceOver/TalkBack, pero requiere prueba manual en dispositivo real.** No se ejecutaron VoiceOver, TalkBack, NVDA o JAWS reales. Tacto y tamaños móviles fueron emulados en el navegador; las pruebas por nombres/árbol accesible no reproducen la experiencia auditiva humana ni todos los gestos de exploración. La verificación definitiva con una persona usuaria de lector de pantalla queda pendiente. No se realizó deploy.
