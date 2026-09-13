const iconPaths = {
  calculator: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="2" />
      <path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15v3M9 18h.01M12 18h.01" />
    </>
  ),
  basket: (
    <>
      <path d="M3 9h18l-2.5 11h-13L3 9ZM8 9l3-6M16 9l-3-6M9 13v3M15 13v3" />
    </>
  ),
  list: (
    <>
      <rect x="6" y="5" width="12" height="14" rx="2.5" />
      <path d="M9 9h.01M12 9h3M9 13h.01M12 13h3" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="5.8" />
      <path d="m15 15 4.2 4.2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.2-5.4 6.2-11.2a6.2 6.2 0 0 0-12.4 0C5.8 15.6 12 21 12 21Z" />
      <circle cx="12" cy="9.8" r="2" />
    </>
  ),
  wallet: (
    <>
      <rect x="4.5" y="6.5" width="15" height="13" rx="2.5" />
      <path d="M15.5 11h4v4h-4a2 2 0 0 1 0-4ZM8 6.5V4.8h8v1.7" />
    </>
  ),
  cart: (
    <>
      <path d="M5 5.8h2.2l2 9.2h8.2l2-6.2H8.4" />
      <circle cx="10.5" cy="19" r="1.6" />
      <circle cx="17" cy="19" r="1.6" />
    </>
  ),
  help: (
    <>
      <path d="M5 18v-2.2a7 7 0 0 1 14 0V18" />
      <path d="M5 18h4.2v-6H5v6ZM14.8 18H19v-6h-4.2v6Z" />
    </>
  ),
  voice: (
    <>
      <path d="M4.5 10v4h4l4.8 4V6l-4.8 4h-4Z" />
      <path d="M16 9a4.2 4.2 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
    </>
  ),
  access: (
    <>
      <circle cx="12" cy="5" r="2" />
      <path d="M5 10h14M12 7v6M8 21l4-8 4 8" />
    </>
  ),
  bag: (
    <>
      <path d="M7 9h10l1 11H6L7 9Z" />
      <path d="M9 9a3 3 0 0 1 6 0" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8v2M12 19.2v2M4.8 4.8l1.4 1.4M17.8 17.8l1.4 1.4M2.8 12h2M19.2 12h2M4.8 19.2l1.4-1.4M17.8 6.2l1.4-1.4" />
    </>
  ),
}

const officialIcons = {
  list: 'icon-listas', search: 'icon-buscar', pin: 'icon-ruta',
  calculator: 'icon-presupuesto-calculadora', wallet: 'icon-wallet',
  cart: 'icon-carrito', basket: 'icon-bolsa', bag: 'icon-bolsa',
  help: 'icon-asistencia', audio: 'icon-audio', voice: 'nav-leer', access: 'nav-accesibilidad',
  arrowRight: 'icon-flecha-derecha', gear: 'icon-accesibilidad',
}

export function AyudateIcon({ name, className = 'h-6 w-6', strokeWidth = 2.2 }) {
  if (officialIcons[name]) {
    return <img className={`ayudate-icon ${className}`} src={`/assets/icons/svg/${officialIcons[name]}.svg`} alt="" aria-hidden="true" width="24" height="24" />
  }
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
    >
      {iconPaths[name] || iconPaths.help}
    </svg>
  )
}
