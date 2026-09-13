import heroProduce from '../assets/home-hero-produce.png'
import notebookImage from '../assets/home-list-notebook.png'
import { AyudateIcon } from '../components/AyudateIcons.jsx'

const navItems = [
  { id: 'home', label: 'Inicio' },
  { id: 'lists', label: 'Mis listas' },
  { id: 'search', label: 'Buscar producto' },
  { id: 'route', label: 'Mi ruta' },
  { id: 'budget', label: 'Presupuesto' },
  { id: 'cart', label: 'Mi carrito' },
]

const quickCards = [
  {
    id: 'search',
    title: 'Buscar producto',
    text: 'Encuentra lo que necesitas de forma rápida',
    icon: 'search',
    className: 'col-span-3',
  },
  {
    id: 'route',
    title: 'Mi ruta',
    text: 'Te guiamos por los pasillos del supermercado',
    icon: 'pin',
    className: 'col-span-3',
  },
  {
    id: 'budget',
    title: 'Presupuesto',
    text: 'Controla tus gastos en tiempo real',
    icon: 'wallet',
    className: 'col-span-2',
  },
  {
    id: 'cart',
    title: 'Mi carrito',
    text: 'Revisa y confirma tu compra',
    icon: 'cart',
    className: 'col-span-2',
  },
  {
    id: 'help',
    title: 'Solicitar asistencia',
    text: 'Estamos para ayudarte cuando lo necesites',
    icon: 'help',
    className: 'col-span-2 bg-[#fff7ea] border-[#f0d9ad]',
    bubble: 'bg-[#fff0cf] text-[#e58c00]',
  },
]

function Header({ logo, onNavigate, onRead, onAssist }) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#dfe8ed] bg-white/95 backdrop-blur">
      <div className="mx-auto grid h-[82px] max-w-[1360px] grid-cols-[230px_minmax(0,1fr)_400px] items-center gap-4 px-5">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex min-h-12 shrink-0 items-center gap-3 rounded-xl px-1 text-left focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
          aria-label="Ir al inicio de AYÚDATE"
        >
          <img className="h-[56px] w-[56px] object-contain" src={logo} alt="" />
          <span className="whitespace-nowrap text-[23px] font-black tracking-[-0.01em]">
            <span className="text-[#07569c]">AYÚ</span>
            <span className="text-[#079c83]">DATE</span>
          </span>
        </button>

        <nav className="flex min-w-0 items-center justify-start gap-[10px] overflow-hidden" aria-label="Navegación principal">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={[
                'relative min-h-12 whitespace-nowrap rounded-xl px-1 text-[13px] font-semibold text-[#072f63]',
                'focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]',
                item.id === 'home' ? 'text-[#009b88] after:absolute after:bottom-1 after:left-0 after:h-[3px] after:w-full after:rounded-full after:bg-[#009b88]' : '',
              ].join(' ')}
              aria-current={item.id === 'home' ? 'page' : undefined}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-3">
          <button
            type="button"
            onClick={onRead}
            className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-bold text-[#07356f] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
          >
            <AyudateIcon name="voice" className="h-7 w-7" />
            Leer
          </button>
          <button
            type="button"
            onClick={() => onNavigate('accessibility')}
            className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-xl text-[13px] font-bold text-[#07356f] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
          >
            <AyudateIcon name="access" className="h-7 w-7" />
            Accesibilidad
          </button>
          <button
            type="button"
            onClick={onAssist}
            className="flex min-h-[52px] items-center gap-3 whitespace-nowrap rounded-[13px] bg-[#009b88] px-4 text-[14px] font-black text-white shadow-[0_10px_22px_rgba(0,155,136,0.24)] transition hover:bg-[#07826f] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
          >
            <AyudateIcon name="help" className="h-7 w-7" />
            Solicitar asistencia
          </button>
        </div>
      </div>
    </header>
  )
}

function IconBubble({ name, tone = 'teal', className = '' }) {
  const tones = {
    teal: 'bg-[#dff8f2] text-[#009486]',
    blue: 'bg-[#e2f4ff] text-[#075aa3]',
    orange: 'bg-[#fff0cf] text-[#e58c00]',
  }

  return (
    <span className={`grid h-[86px] w-[86px] shrink-0 place-items-center rounded-full ${tones[tone]} ${className}`}>
      <AyudateIcon name={name} className="h-12 w-12" />
    </span>
  )
}

function FreshBanner() {
  return (
    <div className="relative h-[176px] overflow-hidden rounded-tl-[150px] bg-[#ddf6f2]">
      <img
        src={heroProduce}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  )
}

function BigListCard({ onNavigate }) {
  return (
    <article className="relative h-[280px] overflow-hidden rounded-[12px] border border-[#dbe6ea] bg-white shadow-[0_8px_22px_rgba(8,41,70,0.08)]">
      <img
        src={notebookImage}
        alt=""
        className="absolute right-0 top-0 h-full w-[210px] object-cover opacity-95"
      />
      <div className="relative z-10 flex h-full w-[66%] items-center gap-5 p-8">
        <IconBubble name="list" />
        <div>
          <h2 className="text-[38px] font-black leading-none tracking-[-0.01em] text-[#07356f]">Mis listas</h2>
          <p className="mt-4 text-[23px] font-medium leading-tight text-[#294878]">Prepara y reutiliza tus compras</p>
          <p className="mt-6 flex items-center gap-2 text-[16px] font-semibold text-[#46628b]">
            <AyudateIcon name="list" className="h-6 w-6" />
            3 listas guardadas
          </p>
          <button
            type="button"
            onClick={() => onNavigate('lists')}
            className="mt-8 inline-flex min-h-[56px] min-w-[270px] items-center justify-center gap-3 rounded-[12px] bg-[#009b88] px-7 text-[20px] font-black text-white shadow-[0_10px_22px_rgba(0,155,136,0.18)] hover:bg-[#07826f] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
          >
            Abrir mis listas
            <AyudateIcon name="arrowRight" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </article>
  )
}

function QuickCard({ card, onNavigate }) {
  const isHelp = card.id === 'help'

  const compact = card.className?.includes('col-span-2')

  return (
    <button
      type="button"
      onClick={() => onNavigate(card.id)}
      className={`group flex min-h-[132px] items-center rounded-[12px] border border-[#dbe6ea] bg-white text-left shadow-[0_8px_22px_rgba(8,41,70,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(8,41,70,0.12)] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd] ${compact ? 'gap-3 p-4' : 'gap-5 p-6'} ${card.className || ''}`}
    >
      <IconBubble name={card.icon} tone={isHelp ? 'orange' : card.id === 'cart' ? 'teal' : 'blue'} className={compact ? 'h-[58px] w-[58px]' : 'h-[78px] w-[78px]'} />
      <span className="min-w-0 flex-1">
        <span className={`block font-black leading-tight text-[#07356f] ${compact ? 'text-[17px]' : 'text-[21px]'}`}>{card.title}</span>
        <span className={`mt-2 block font-medium leading-snug text-[#4b6591] ${compact ? 'text-[13px]' : 'text-[16px]'}`}>{card.text}</span>
      </span>
      <AyudateIcon name="chevron" className="h-6 w-6 shrink-0 text-[#075aa3]" />
    </button>
  )
}

function ContinuePurchase({ onNavigate }) {
  return (
    <section className="mt-8 border-t border-[#d8e5ea] pt-7" aria-labelledby="continue-title">
      <div className="mb-4 flex items-center justify-between">
        <h2 id="continue-title" className="text-[28px] font-black text-[#07356f]">Continúa tu compra</h2>
        <button
          type="button"
          onClick={() => onNavigate('lists')}
          className="flex min-h-11 items-center gap-2 rounded-xl text-[17px] font-black text-[#075aa3] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
        >
          Ver todas mis listas
          <AyudateIcon name="arrowRight" className="h-5 w-5" />
        </button>
      </div>
      <article className="grid min-h-[116px] grid-cols-[300px_370px_1fr_260px] items-center rounded-[12px] border border-[#dbe6ea] bg-white px-7 shadow-[0_8px_22px_rgba(8,41,70,0.07)]">
        <div className="flex items-center gap-5">
          <IconBubble name="bag" className="h-[74px] w-[74px]" />
          <div>
            <h3 className="text-[23px] font-black text-[#07356f]">Compra semanal</h3>
            <p className="mt-2 flex items-center gap-2 text-[16px] font-semibold text-[#516c98]">
              <AyudateIcon name="list" className="h-5 w-5" />
              7 productos
            </p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-[16px] font-black text-[#07356f]">3 productos encontrados</p>
          <div className="flex items-center gap-4">
            <span className="h-[12px] w-[290px] overflow-hidden rounded-full bg-[#d9e3e8]">
              <span className="block h-full w-[47%] rounded-full bg-[#009b88]" />
            </span>
            <strong className="text-[16px] text-[#365681]">3 de 7</strong>
          </div>
        </div>
        <div className="flex items-center gap-5 border-l border-[#d9e3e8] pl-8">
          <AyudateIcon name="pin" className="h-10 w-10 text-[#009b88]" />
          <div>
            <p className="text-[16px] font-medium text-[#516c98]">Próxima parada:</p>
            <p className="text-[22px] font-black text-[#07356f]">Lácteos · Pasillo 3</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('route')}
          className="justify-self-end inline-flex min-h-[58px] w-[250px] items-center justify-center gap-4 rounded-[12px] bg-[#075aa3] text-[18px] font-black text-white shadow-[0_10px_22px_rgba(7,90,163,0.18)] hover:bg-[#064b88] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
        >
          Continuar compra
          <AyudateIcon name="arrowRight" className="h-6 w-6" />
        </button>
      </article>
    </section>
  )
}

function AccessibilityActive({ voiceEnabled, onToggleVoice, onNavigate }) {
  return (
    <section className="mt-5 grid min-h-[96px] grid-cols-[1fr_300px_1px_245px] items-center rounded-[12px] border border-[#dbe6ea] bg-white px-7 shadow-[0_8px_22px_rgba(8,41,70,0.07)]" aria-labelledby="access-title">
      <div className="flex items-center gap-5">
        <IconBubble name="voice" className="h-[74px] w-[74px]" />
        <div>
          <h2 id="access-title" className="text-[23px] font-black text-[#07356f]">Accesibilidad activa</h2>
          <p className="mt-2 text-[16px] font-medium text-[#5a7199]">Personaliza tu experiencia para una compra más cómoda y accesible.</p>
        </div>
      </div>
      <label className="flex min-h-[56px] items-center justify-center gap-4 rounded-[14px] bg-[#dff8f2] px-5 text-[16px] font-black text-[#07356f]">
        <AyudateIcon name="voice" className="h-7 w-7 text-[#009b88]" />
        Lectura en voz alta
        <input
          type="checkbox"
          checked={voiceEnabled}
          onChange={(event) => onToggleVoice(event.target.checked)}
          className="peer sr-only"
        />
        <span className="relative h-[34px] w-[66px] rounded-full bg-[#b9c7d1] transition peer-checked:bg-[#009b88] after:absolute after:left-[4px] after:top-[4px] after:h-[26px] after:w-[26px] after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:after:translate-x-[32px]" />
      </label>
      <span className="mx-auto h-12 w-px bg-[#d9e3e8]" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onNavigate('accessibility')}
        className="flex min-h-12 items-center justify-center gap-3 rounded-xl text-[16px] font-black text-[#075aa3] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#0b74bd]"
      >
        <AyudateIcon name="gear" className="h-6 w-6" />
        Configurar accesibilidad
        <AyudateIcon name="arrowRight" className="h-5 w-5" />
      </button>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-7 flex items-center gap-8 text-[#07356f]">
      <p className="text-[20px] italic text-[#244b83]">Pequeñas compras, grandes momentos ♡</p>
      <span className="h-px flex-1 bg-[#d0dde4]" />
      <p className="text-[14px] text-[#6b7fa0]">
        <strong className="mr-2 text-[#075aa3]">AYÚDATE</strong>
        Tu supermercado, más fácil para todos.
      </p>
    </footer>
  )
}

export default function HomeScreen({ logo, voiceEnabled, onToggleVoice, onNavigate, onRead }) {
  return (
    <div className="min-h-screen bg-[#f7fbfb] text-[#07356f]">
      <Header logo={logo} onNavigate={onNavigate} onRead={onRead} onAssist={() => onNavigate('help')} />
      <main className="mx-auto max-w-[1320px] px-5 pb-8 pt-9">
        <section className="grid grid-cols-[610px_1fr] items-end gap-7">
          <div className="pb-3">
            <h1 className="whitespace-nowrap text-[39px] font-black leading-[1.02] tracking-[-0.02em]">
              <span className="text-[#075aa3]">Hola, </span>
              <span className="text-[#009b88]">¿qué necesitas hoy?</span>
            </h1>
            <p className="mt-2 text-[25px] font-medium leading-tight text-[#294878]">Organiza tu compra o continúa donde la dejaste.</p>
          </div>
          <FreshBanner />
        </section>

        <section className="mt-5 grid grid-cols-[540px_1fr] gap-3">
          <BigListCard onNavigate={onNavigate} />
          <div className="grid grid-cols-6 gap-3">
            {quickCards.slice(0, 2).map((card) => (
              <QuickCard card={card} key={card.id} onNavigate={onNavigate} />
            ))}
            {quickCards.slice(2).map((card) => (
              <QuickCard card={card} key={card.id} onNavigate={onNavigate} />
            ))}
          </div>
        </section>

        <ContinuePurchase onNavigate={onNavigate} />
        <AccessibilityActive voiceEnabled={voiceEnabled} onToggleVoice={onToggleVoice} onNavigate={onNavigate} />
        <Footer />
      </main>
    </div>
  )
}
