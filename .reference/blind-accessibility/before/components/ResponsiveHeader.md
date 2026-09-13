# Header de AYÚDATE

Todas las pantallas deben envolver su encabezado de escritorio con `ResponsiveHeader`.
Pasar `active`, `onNavigate`, `onRead` y `voiceSupported`. La lectura conserva el contenido específico de cada pantalla.

El componente conserva el encabezado recibido sin cambios en escritorio y muestra la navegación móvil compartida hasta 768 px. No crear un menú móvil propio en nuevas pantallas. Las rutas del menú se mantienen únicamente en `ResponsiveHeader.jsx`.

`active="newlist"` marca Mis listas como sección activa. `help` corresponde a Solicitar asistencia y `accessibility` marca el acceso de Accesibilidad.
