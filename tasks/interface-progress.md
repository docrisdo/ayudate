# AYÚDATE — avance de interfaz

## 2026-09-09: Inicio

Se continuó sobre Home.jsx y Home.css existentes, sin reiniciar el proyecto.

- Biblioteca oficial integrada sin cambiar su estructura en public/assets (149 archivos).
- Capturas conservadas exclusivamente como referencia en references/screens.
- asset-manifest.json copiado en la raíz y utilizado por Inicio.
- Inicio comparado con references/screens/ayudate p3.png.
- Banner, libreta, logo e iconos de Inicio utilizan archivos individuales oficiales. Ya no se cargan los recortes antiguos de capturas en esta pantalla.
- El logo suministrado es vertical e incluye su lema; se muestra completo con contain, por eso difiere del logo horizontal de la captura.
- Conservados la composición de tarjetas, colores, navegación y estados. Ajustados proporciones, tipografía, márgenes y respuesta móvil.
- Resumen conectado a listas, carrito y parada actuales. Las cantidades pueden diferir de las cifras ilustrativas de la referencia.
- Pictograma de ruta acompaña el texto cuando la preferencia pictograms está activa; al desactivarla se conserva el icono normal.

Validación: npm run build, npm run lint, detector visual sin hallazgos mecánicos; comparación visual en escritorio y móvil; sin desbordamiento horizontal a 320, 390, 768, 1024 y tamaño de escritorio. Imágenes cargadas. Navegación a listas, búsqueda, ruta, presupuesto, carrito, accesibilidad y asistencia. Voz conservada al recargar y restaurada a desactivada después de probar. Pictogramas probados en ambos estados. Carga final sin errores ni advertencias de consola.

## Siguientes pantallas, por orden del usuario

1. Mis listas
2. Nueva lista
3. Buscar producto
4. Mi ruta
5. Presupuesto
6. Mi carrito
7. Accesibilidad
8. Solicitar asistencia
9. Bienvenida y pantallas adicionales de references/screens

Los recursos para estas pantallas ya están integrados, pero aún falta aplicarlos y comparar cada pantalla. Mantener funcionalidad y LocalStorage. Usar products para fotografías y pictograms/svg para apoyo opcional acompañado de texto. jabon-liquido.png es un producto. El manifiesto recibido omite jabón líquido y los pictogramas cereales/abarrotes/producto genérico aunque los archivos sí existen.

Vista local de esta sesión: http://127.0.0.1:5173/ . La pestaña anterior en localhost mostró una versión antigua; usar la dirección anterior para revisar este trabajo.

## Mis listas: comprobación final terminada

Comparada en navegador con references/screens/ayudate p4.png. Verificadas columnas, tarjetas, detalle de Compra semanal, siete fotografías oficiales con contain, botones e iconos SVG. Revisados tamaños de 320, 390, 768, 1024 y 1440 px, sin desbordamiento horizontal.

Comprobados Abrir, selección, creación con Nueva lista, renombrado, agregar/quitar productos, eliminación con cancelar y deshacer, e Iniciar compra hacia Mi ruta. Se eliminó la lista temporal y se conservaron las tres listas originales. Inicio y AyudateIcons conservan sus hashes anteriores.

Correcciones finales: banner sin recorte de texto en móvil/tableta, desplazamiento al detalle al abrir una lista en una columna y mensaje contextual para lista vacía durante edición. Lint, build y detector visual pasan. Mis listas queda abierta con Compra semanal seleccionada. Esperar revisión del usuario; no iniciar Nueva lista.

## Pantalla 5 — Nueva lista: terminada, pendiente de aprobación

Inicio y Mis listas aprobadas por el usuario. Nueva vista NewList.jsx/NewList.css comparada con references/screens/ayudate p5.png: nombre, banner de libreta oficial, búsqueda, entrada por líneas, tabla con fotografías y categorías, cantidades/subtotales y dos acciones de guardado. Reutiliza los estilos de cabecera sin modificar Lists.css. Único ajuste de Lists.jsx: conectar el botón existente Nueva lista a la nueva pantalla.

Guarda IDs compatibles con las listas existentes y cantidades por producto. El catálogo conserva sus nombres/precios y fotos disponibles. Reconocimiento local por nombre sin acentos, cantidades como 2 x Leche, límite de 50 líneas, duplicados acumulados y aviso de nombres desconocidos. No inventa variantes de productos para imitar los ejemplos de p5.

Verificación: 4 pruebas de reconocimiento/cantidades, lint y build correctos. Navegador a 320, 768, 1024 y 1440 px sin desbordamiento; imágenes cargadas y consola sin errores. Probados nombre requerido, lista vacía, búsqueda, agregado múltiple, aumentar/reducir, eliminar, vaciar/cancelar, Guardar lista y persistencia tras recargar en Mis listas. Guardar e iniciar compra lleva a Mi ruta. Listas temporales eliminadas y lista activa original restaurada. No continuar con Buscar producto hasta aprobación.

## Pantalla 6 — Buscar producto: terminada, pendiente de aprobación

Referencia identificada: references/screens/ayudate p6.png. Search.jsx/Search.css implementan cabecera, banner oficial, buscador, categorías, ordenación, filas de resultados y acciones. Cuatro presentaciones reales de search-products: LALA entera 1 L, Santa Clara entera 1 L, Alpura entera 1 L, NIDO en polvo 720 g. Se respetan los envases disponibles, distintos de algunas variantes ilustradas en p6. Precios de demostración basados en p6; no se inventan cantidades de inventario.

Los nuevos IDs de leche se integran con las listas y el carrito; las listas existentes y la entrada de Nueva lista mantienen sus productos originales. Ningún archivo de las tres pantallas aprobadas fue modificado (hashes verificados). Se sustituyó únicamente la rama de Buscar producto en App.jsx. Buscar por código admite códigos internos del catálogo; no simula escáner ni códigos de barras inexistentes.

Verificado en navegador: escribir/buscar por nombre y marca, selección, detalle de pasillo/disponibilidad, agregar a lista, agregar a carrito y deshacer ambos, agotados bloqueados, filtros, categorías adicionales, ordenar precios, estado vacío, código interno y lectura de producto. Navegación a Mi ruta comprobada solo como destino del botón; pantalla no revisada ni modificada. Datos de prueba revertidos. Sin errores ni advertencias de consola. Revisados 320, 768, 1024 y 1440 px, imágenes cargadas y sin desbordamiento; corregido el encaje del botón Buscar en tableta. Pruebas de búsqueda y reconocimiento (7), lint y build correctos.

Detenerse hasta aprobación de Buscar producto. No continuar con Mi ruta.

## Corrección final de Buscar producto — ZIP y lectura

Integradas las diez fotografías de AYUDATE_productos_buscar_producto.zip en public/assets/search-products, conservando subcarpetas. Frijol, yogur, cereal y avena conservan su información y ahora tienen foto. Agregados seis productos demostrativos (IDs 17–22) para Carnes, Bebidas e Higiene personal, conectados al catálogo común para listas/carrito. La selección de productos de Nueva lista conserva su catálogo aprobado.

Todas las tarjetas muestran Leer; el detalle mantiene Leer producto. Ambos usan productSpeech con nombre, marca, precio, presentación, categoría, pasillo, ubicación y disponibilidad. No se modificó Search.css ni los archivos de Inicio, Mis listas o Nueva lista (hashes comprobados).

Verificadas las seis categorías solicitadas, búsqueda por nombre, imágenes completas con contain, agregado/deshacer en listas y carrito, selección y ambos botones de lectura. Vista final Todos: 21 productos, 21 botones Leer, 21 fotos cargadas. Cinco pruebas automatizadas, lint y build correctos. El servidor local estaba detenido al retomar; se restableció en 127.0.0.1:5173. Sin errores nuevos tras recargar (solo permanecen los registros anteriores de desconexión de Vite). Pantalla abierta para revisión. No continuar con Mi ruta.

## Pantalla 7 — Mi ruta: terminada, pendiente de aprobación

Referencia: references/screens/ayudate p7.png. Creados Route.jsx, RouteMap.jsx, Route.css y routeModel.js. App.jsx conecta la nueva pantalla al recorrido, lista activa y carrito existentes; retirado únicamente el antiguo bloque de ruta y su mapa/cálculos exclusivos. Cabecera, banner, mapa interactivo, leyenda, progreso, próxima parada, producto, indicaciones y Después siguen la composición de p7 usando SVG y fotos oficiales. No se usa la captura en la interfaz.

Progreso basado en cantidades del carrito, no en el índice de parada. Producto encontrado añade la cantidad solicitada sin duplicarla, marca zona completada y permite deshacer. Siguiente avanza sin marcar encontrado. Las zonas llevan al primer producto pendiente; los detalles muestran ubicación y disponibilidad. Caja permite revisar pendientes o ir al carrito. Se conservan lectura e indicaciones. El mapa contempla las categorías incorporadas desde Buscar producto. Las cifras reflejan la lista activa real, no las ilustrativas de p7.

Verificación: pruebas de progreso/cantidades, selección y mapa; lint, build y detector sin errores. Navegador en escritorio 1440 y móvil 390 px; sin desbordamiento horizontal, fotos cargadas, zonas táctiles mayores de 44 px, selección desplaza al detalle. Probados marcar/deshacer, Siguiente, detalle, voz, Caja/pendientes, agotados y navegación al carrito. Operación de prueba deshecha; no se alteraron listas ni cantidades originales. Consola final sin errores/advertencias. Hashes de Inicio, Mis listas, Nueva lista y Buscar producto intactos. No continuar con Presupuesto hasta aprobación.
