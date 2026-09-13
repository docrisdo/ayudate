import { useMemo, useState } from 'react'
import './App.css'
import ayudateLogo from './assets/ayudate-logo.png'
import HomeScreen from './screens/Home.jsx'
import ListsScreen from './screens/Lists.jsx'
import NewList from './screens/NewList.jsx'
import SearchScreen from './screens/Search.jsx'
import RouteScreen from './screens/Route.jsx'
import BudgetScreen from './screens/Budget.jsx'
import CartScreen from './screens/Cart.jsx'
import { milkProducts, additionalProducts } from './screens/searchProducts.js'

const products = [
  ...milkProducts,
  ...additionalProducts,
  { id: 1, name: 'Leche deslactosada', brand: 'Selecta', price: 32, unit: '1 L', category: 'Lácteos', aisle: 3, shelf: 'Refrigerador derecho', available: true, visual: 'LE' },
  { id: 2, name: 'Yogur natural', brand: 'Campo Claro', price: 26, unit: '1 L', category: 'Lácteos', aisle: 3, shelf: 'Refrigerador central', available: true, visual: 'YO' },
  { id: 3, name: 'Cereal integral', brand: 'Granvita', price: 58, unit: '500 g', category: 'Cereales', aisle: 4, shelf: 'Estante medio', available: true, visual: 'CE' },
  { id: 4, name: 'Avena', brand: 'Natural', price: 29, unit: '400 g', category: 'Cereales', aisle: 4, shelf: 'Estante inferior', available: true, visual: 'AV' },
  { id: 5, name: 'Manzanas', brand: 'Huerta local', price: 44, unit: '1 kg', category: 'Frutas', aisle: 1, shelf: 'Mesa frontal', available: true, visual: 'MA' },
  { id: 6, name: 'Plátanos', brand: 'Huerta local', price: 24, unit: '1 kg', category: 'Frutas', aisle: 1, shelf: 'Mesa lateral', available: true, visual: 'PL' },
  { id: 7, name: 'Arroz', brand: 'Valle', price: 36, unit: '1 kg', category: 'Abarrotes', aisle: 5, shelf: 'Estante superior', available: true, visual: 'AR' },
  { id: 8, name: 'Frijol', brand: 'La Mesa', price: 39, unit: '900 g', category: 'Abarrotes', aisle: 5, shelf: 'Estante medio', available: true, visual: 'FR' },
  { id: 9, name: 'Jabón para ropa', brand: 'Brillo', price: 72, unit: '1 L', category: 'Limpieza', aisle: 7, shelf: 'Estante inferior', available: true, visual: 'JA' },
  { id: 10, name: 'Papel higiénico', brand: 'Suave', price: 89, unit: '4 rollos', category: 'Limpieza', aisle: 7, shelf: 'Cabecera de pasillo', available: false, visual: 'PA' },
  { id: 11, name: 'Pan de caja', brand: 'Panadería', price: 46, unit: '1 pieza', category: 'Panadería', aisle: 2, shelf: 'Mesa central', available: true, visual: 'PN' },
  { id: 12, name: 'Huevos', brand: 'Granja', price: 64, unit: '12 piezas', category: 'Lácteos', aisle: 3, shelf: 'Refrigerador izquierdo', available: true, visual: 'HU' },
]

const starterLists = [
  { id: 'weekly', name: 'Compra semanal', items: [1, 12, 11, 5, 7, 9, 10] },
  { id: 'cleaning', name: 'Productos de limpieza', items: [9, 10, 8, 7, 4] },
  { id: 'breakfast', name: 'Desayunos', items: [1, 3, 4, 11, 12] },
]

const defaultPreferences = {
  largeText: false,
  highContrast: false,
  voice: false,
  pictograms: true,
  bigButtons: false,
  accessibleRoute: false,
}

const sections = [
  { id: 'home', label: 'Inicio' },
  { id: 'lists', label: 'Mis listas' },
  { id: 'search', label: 'Buscar producto' },
  { id: 'route', label: 'Mi ruta' },
  { id: 'budget', label: 'Presupuesto' },
  { id: 'cart', label: 'Mi carrito' },
]

const quickActions = [
  { id: 'lists', title: 'Mis listas', text: 'Prepara y reutiliza tus compras', icon: 'list' },
  { id: 'search', title: 'Buscar producto', text: 'Encuentra ubicación y disponibilidad', icon: 'search' },
  { id: 'route', title: 'Mi ruta', text: 'Te guiamos por los pasillos', icon: 'pin' },
  { id: 'budget', title: 'Presupuesto', text: 'Controla tus gastos en tiempo real', icon: 'wallet' },
  { id: 'cart', title: 'Mi carrito', text: 'Revisa y confirma tu compra', icon: 'cart' },
  { id: 'help', title: 'Solicitar asistencia', text: 'Pide ayuda cuando lo necesites', icon: 'help' },
]

const helpMessages = [
  { id: 'find', title: 'No encuentro un producto', text: 'Necesito ayuda para localizar un producto en el supermercado.' },
  { id: 'move', title: 'Necesito ayuda para desplazarme', text: 'Necesito apoyo para moverme por el supermercado.' },
  { id: 'cashier', title: 'Necesito ayuda en caja', text: 'Necesito asistencia para pagar mis compras o resolver una duda en caja.' },
  { id: 'talk', title: 'Necesito comunicarme con un empleado', text: 'Quiero hablar con un empleado del supermercado para hacer una consulta.' },
  { id: 'other', title: 'Otro', text: 'Necesito otro tipo de ayuda.' },
]

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function App() {
  const [screen, setScreen] = useState('home')
  const [preferences, setPreferences] = useState(() => readStorage('ayudate-preferences', defaultPreferences))
  const [lists, setLists] = useState(() => readStorage('ayudate-lists', starterLists))
  const [activeListId, setActiveListId] = useState(() => readStorage('ayudate-active-list', 'weekly'))
  const [cart, setCart] = useState(() => readStorage('ayudate-cart', {}))
  const [budget, setBudget] = useState(() => readStorage('ayudate-budget', 800))
  const [selectedListId, setSelectedListId] = useState(activeListId || lists[0]?.id)
  const [newListName, setNewListName] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Todos')
  const [routeIndex, setRouteIndex] = useState(1)
  const [selectedHelpId, setSelectedHelpId] = useState('find')
  const voiceSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const activeList = lists.find((list) => list.id === activeListId) || lists[0]
  const selectedList = lists.find((list) => list.id === selectedListId) || lists[0]


  const listProducts = useMemo(() => {
    return (activeList?.items || [])
      .map((itemId) => products.find((product) => product.id === itemId))
      .filter(Boolean)
      .sort((a, b) => a.aisle - b.aisle)
  }, [activeList])

  const cartItems = Object.entries(cart)
    .map(([id, quantity]) => {
      const product = products.find((item) => item.id === Number(id))
      return product ? { ...product, quantity } : null
    })
    .filter(Boolean)

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const routeStops = useMemo(() => {
    return [
      { id: 'entry', label: 'Entrada', detail: 'Inicio de recorrido', zone: 'Entrada' },
      ...listProducts.map((product) => ({
        id: product.id,
        label: product.name,
        detail: `Pasillo ${product.aisle}, ${product.shelf}`,
        zone: product.category,
        product,
      })),
      { id: 'checkout', label: 'Caja', detail: 'Finalizar compra', zone: 'Caja' },
    ]
  }, [listProducts])
  const currentStop = routeStops[Math.min(routeIndex, routeStops.length - 1)] || routeStops[0]
  const selectedHelp = helpMessages.find((message) => message.id === selectedHelpId) || helpMessages[0]

  function speak(text) {
    if (!voiceSupported) return false
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-MX'
    utterance.rate = 0.92
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
    return true
  }

  function goToScreen(nextScreen) {
    setScreen(nextScreen)
    const label = sections.find((section) => section.id === nextScreen)?.label || 'Asistencia'
    if (preferences.voice) speak(`Sección ${label}`)
  }

  function updatePreferences(next) {
    setPreferences(next)
    writeStorage('ayudate-preferences', next)
    if (!preferences.voice && next.voice) {
      speak('Lectura por voz activada. Puedes escuchar productos, ruta y asistencia.')
    }
  }

  function updateLists(next) {
    setLists(next)
    writeStorage('ayudate-lists', next)
  }

  function updateCart(next) {
    setCart(next)
    writeStorage('ayudate-cart', next)
  }

  function updateBudget(next) {
    setBudget(next)
    writeStorage('ayudate-budget', next)
  }

  function setActiveList(id) {
    setActiveListId(id)
    setSelectedListId(id)
    writeStorage('ayudate-active-list', id)
    setRouteIndex(1)
    goToScreen('route')
  }

  function addProductToList(productId) {
    if (!selectedList) return
    const next = lists.map((list) => {
      if (list.id !== selectedList.id || list.items.includes(productId)) return list
      return { ...list, items: [...list.items, productId] }
    })
    updateLists(next)
  }

  function removeProductFromList(productId) {
    const next = lists.map((list) => {
      if (list.id !== selectedList?.id) return list
      return { ...list, items: list.items.filter((id) => id !== productId) }
    })
    updateLists(next)
  }

  function createList() {
    const name = newListName.trim()
    if (!name) return
    const nextList = { id: crypto.randomUUID(), name, items: [] }
    updateLists([...lists, nextList])
    setSelectedListId(nextList.id)
    setNewListName('')
  }

  function addToCart(productId) {
    const product = products.find((item) => item.id === productId)
    updateCart({ ...cart, [productId]: (cart[productId] || 0) + 1 })
    if (preferences.voice && product) speak(`${product.name} agregado al carrito. Precio ${product.price} pesos.`)
  }

  function removeFromCart(productId) {
    const next = { ...cart }
    if (next[productId] <= 1) delete next[productId]
    else next[productId] -= 1
    updateCart(next)
  }

  const appClass = [
    preferences.largeText ? 'large-text' : '',
    preferences.highContrast ? 'high-contrast' : '',
    preferences.bigButtons ? 'big-buttons' : '',
  ].join(' ')

  if (screen === 'cart') {
    return <main className={appClass}><CartScreen items={cartItems} budget={budget}
      onIncrease={addToCart} onDecrease={removeFromCart}
      onRemove={id => { const next = { ...cart }; delete next[id]; updateCart(next) }}
      onRestore={(id, quantity) => updateCart({ ...cart, [id]: (cart[id] || 0) + quantity })}
      onNavigate={goToScreen} onRead={speak} voiceSupported={voiceSupported}
    /></main>
  }

  if (screen === 'budget') {
    return <main className={appClass}><BudgetScreen budget={budget} items={cartItems}
      onBudget={updateBudget} onNavigate={goToScreen} onRead={speak} voiceSupported={voiceSupported}
    /></main>
  }

  if (screen === 'route') {
    return <main className={appClass}><RouteScreen key={activeList?.id || 'empty'}
      list={activeList} products={listProducts} index={routeIndex} onIndex={setRouteIndex}
      cart={cart} onFound={(id, quantity) => updateCart({ ...cart, [id]: Math.max(cart[id] || 0, quantity) })}
      onRestore={(id, quantity) => { const restored = { ...cart }; if (quantity) restored[id] = quantity; else delete restored[id]; updateCart(restored) }}
      onNavigate={goToScreen} onRead={speak} voiceSupported={voiceSupported}
    /></main>
  }

  if (screen === 'search') {
    return <main className={appClass}><SearchScreen
      products={products.filter(product => product.id !== 1 || query.toLowerCase().includes('deslactosada'))}
      query={query} onQuery={setQuery} category={category} onCategory={setCategory}
      selectedList={selectedList} cart={cart} onAddToList={addProductToList} onAddToCart={addToCart}
      onUndoList={(id, listId) => updateLists(lists.map(list => list.id === listId ? { ...list, items: list.items.filter(item => item !== id) } : list))}
      onUndoCart={(id, quantity) => { const restored = { ...cart }; if (quantity) restored[id] = quantity; else delete restored[id]; updateCart(restored) }}
      onNavigate={goToScreen} onRead={speak} voiceSupported={voiceSupported}
    /></main>
  }

  if (screen === 'new-list') {
    return <main className={appClass}><NewList products={products.filter(product => ![...milkProducts, ...additionalProducts].some(item => item.id === product.id))} onNavigate={goToScreen}
      voiceSupported={voiceSupported} onRead={() => speak('Nueva lista. Escribe un nombre, busca productos o escribe varios, y guarda tu lista.')}
      onSave={(draft, start) => {
        const list = { ...draft, id: crypto.randomUUID(), updatedAt: new Date().toISOString() }
        updateLists([...lists, list])
        setSelectedListId(list.id)
        if (start) setActiveList(list.id)
        else goToScreen('lists')
      }} /></main>
  }

  if (screen === 'lists') {
    return <main className={appClass}>
      <ListsScreen
        lists={lists} selectedList={selectedList} products={products}
        newListName={newListName} onNameChange={setNewListName} onCreateList={createList} onNewList={() => goToScreen('new-list')}
        onSelectList={setSelectedListId}
        onUpdateList={(updated) => updateLists(lists.map(list => list.id === updated.id ? updated : list))}
        onDeleteList={(id) => {
          const remainingLists = lists.filter(list => list.id !== id)
          updateLists(remainingLists)
          if (selectedListId === id) setSelectedListId(remainingLists[0]?.id)
          if (activeListId === id) {
            setActiveListId(remainingLists[0]?.id)
            writeStorage('ayudate-active-list', remainingLists[0]?.id || null)
            setRouteIndex(1)
          }
        }}
        onRestoreList={(list, index) => {
          const restored = [...lists]
          restored.splice(index, 0, list)
          updateLists(restored)
          setSelectedListId(list.id)
        }}
        onAddProduct={addProductToList} onRemoveProduct={removeProductFromList}
        onStart={setActiveList} onNavigate={goToScreen} voiceSupported={voiceSupported}
        onRead={() => speak(`Mis listas. ${lists.map(list => `${list.name}, ${list.items.length} productos`).join('. ')}`)}
      />
    </main>
  }
  if (screen === 'home') {
    return (
      <main className={appClass} aria-live="off">
        <HomeScreen
          listCount={lists.length}
          activeList={activeList}
          listProducts={listProducts}
          cart={cart}
          currentStop={currentStop}
          pictogramsEnabled={preferences.pictograms}
          voiceSupported={voiceSupported}
          voiceEnabled={preferences.voice}
          onToggleVoice={(checked) => updatePreferences({ ...preferences, voice: checked })}
          onNavigate={goToScreen}
          onRead={() => speak('Hola, ¿qué necesitas hoy? Organiza tu compra o continúa donde la dejaste.')}
        />
      </main>
    )
  }

  return (
    <main className={appClass} aria-live="off">
      <div className="app-frame">
        <header className="topbar">
          <button className="brand" type="button" onClick={() => goToScreen('home')} aria-label="Ir al inicio de AYÚDATE">
            <img className="brand-logo" src={ayudateLogo} alt="" />
            <span>
              <strong>AYÚDATE</strong>
              <small>Tu supermercado</small>
            </span>
          </button>
          <nav aria-label="Navegación principal">
            {sections.map((section) => (
              <button
                className={screen === section.id ? 'active' : ''}
                key={section.id}
                type="button"
                aria-current={screen === section.id ? 'page' : undefined}
                onClick={() => goToScreen(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
          <div className="top-actions">
            <button className="plain-action" type="button" onClick={() => speak('Lectura por voz disponible en AYÚDATE')} disabled={!voiceSupported}>
              Leer
            </button>
            <button className="plain-action" type="button" onClick={() => goToScreen('accessibility')}>
              Accesibilidad
            </button>
            <button type="button" onClick={() => goToScreen('help')}>Solicitar asistencia</button>
          </div>
        </header>

        {screen !== 'accessibility' && (
          <PageHero screen={screen} />
        )}

        {screen === 'home' && (
          <section className="page-body home-grid">
            <article className="primary-card">
              <IconBubble icon="list" />
              <div>
                <h2>Mis listas</h2>
                <p>Prepara y reutiliza tus compras antes de llegar al supermercado.</p>
                <small>{lists.length} listas guardadas</small>
              </div>
              <button type="button" onClick={() => goToScreen('lists')}>Abrir mis listas</button>
            </article>
            <div className="quick-grid" aria-label="Acciones principales">
              {quickActions.slice(1).map((action) => (
                <button className="quick-card" type="button" key={action.id} onClick={() => goToScreen(action.id)}>
                  <IconBubble icon={action.icon} />
                  <span>
                    <strong>{action.title}</strong>
                    <small>{action.text}</small>
                  </span>
                  <b aria-hidden="true">›</b>
                </button>
              ))}
            </div>
            <ContinuePanel activeList={activeList} listProducts={listProducts} total={total} goToScreen={goToScreen} />
            <AccessibilitySummary preferences={preferences} updatePreferences={updatePreferences} goToScreen={goToScreen} />
          </section>
        )}

        {screen === 'accessibility' && (
          <section className="page-body">
            <div className="split-layout">
              <AccessibilityPanel
                preferences={preferences}
                updatePreferences={updatePreferences}
                voiceSupported={voiceSupported}
                onTestVoice={() => speak('AYÚDATE listo. La lectura por voz está funcionando.')}
              />
              <PreviewPanel addToCart={() => addToCart(1)} speak={() => speak('Leche deslactosada. Pasillo 3. Precio 32 pesos. Disponible.')} />
            </div>
          </section>
        )}

        {screen === 'help' && (
          <section className="page-body">
            <div className="help-grid">
              {helpMessages.map((message) => (
                <button className={`help-action ${selectedHelpId === message.id ? 'selected' : ''}`} key={message.id} type="button" onClick={() => setSelectedHelpId(message.id)} aria-pressed={selectedHelpId === message.id}>
                  <IconBubble icon={message.id === 'find' ? 'search' : message.id === 'move' ? 'pin' : message.id === 'cashier' ? 'cart' : 'help'} />
                  <span>
                    <strong>{message.title}</strong>
                    <small>{message.text}</small>
                  </span>
                </button>
              ))}
            </div>
            <section className="panel message-preview">
              <PanelTitle icon="help" title="Mensaje para mostrar" />
              <h2>{selectedHelp.text}</h2>
              <div className="ticket-actions">
                <button type="button" onClick={() => speak(selectedHelp.text)} disabled={!voiceSupported}>Leer mensaje en voz alta</button>
                <button className="secondary" type="button">Mostrar mensaje en pantalla</button>
              </div>
            </section>
          </section>
        )}

        <footer>
          <span>Pequeñas compras, grandes momentos</span>
          <strong>AYÚDATE</strong>
          <small>Tu supermercado, más fácil para todos.</small>
        </footer>
      </div>
    </main>
  )
}

function PageHero({ screen }) {
  const copy = {
    home: ['Hola, ¿qué necesitas hoy?', 'Organiza tu compra o continúa donde la dejaste.', 'Una compra más fácil para tu día a día'],
    lists: ['Mis listas', 'Prepara tus compras y vuelve a utilizarlas cuando quieras.', 'Las mismas compras, menos preocupaciones'],
    search: ['Buscar producto', 'Encuentra ubicación, precio y disponibilidad.', 'Los productos que necesitas, más cerca de ti'],
    route: ['Tu ruta', 'Hemos organizado tu lista para reducir recorridos innecesarios.', 'Compras más simples, días más fáciles'],
    budget: ['Presupuesto', 'Controla cuánto llevas y cuánto te queda disponible.', 'Compras más tranquilas para un mejor mañana'],
    cart: ['Mi carrito', 'Revisa los productos seleccionados antes de finalizar tu compra.', 'Productos esenciales para tu hogar'],
    help: ['¿Cómo podemos ayudarte?', 'Selecciona una opción para pedir apoyo rápidamente.', 'Estamos para ayudarte'],
  }[screen] || ['AYÚDATE', 'Tu supermercado, más fácil para todos.', 'Tu bienestar también cuenta']

  return (
    <section className="page-hero">
      <div>
        <h1>{copy[0]}</h1>
        <p>{copy[1]}</p>
      </div>
      <FreshArt note={copy[2]} />
    </section>
  )
}

function FreshArt({ note }) {
  return (
    <div className="fresh-art" aria-hidden="true">
      <p>{note}</p>
      <div className="produce">
        <span className="lettuce"></span>
        <span className="tomato"></span>
        <span className="banana"></span>
        <span className="milk"></span>
      </div>
    </div>
  )
}

function ContinuePanel({ activeList, listProducts, total, goToScreen }) {
  return (
    <section className="panel continue-panel">
      <PanelTitle icon="cart" title="Continúa tu compra" />
      <div>
        <strong>{activeList?.name || 'Sin lista activa'}</strong>
        <small>{activeList?.items.length || 0} productos · Total actual ${total}</small>
      </div>
      <div className="budget-bar" aria-hidden="true"><span style={{ width: `${Math.min((listProducts.length / 7) * 100, 100)}%` }} /></div>
      <span>{Math.min(listProducts.length, 7)} de 7</span>
      <button type="button" onClick={() => goToScreen('route')}>Continuar compra</button>
    </section>
  )
}

function AccessibilitySummary({ preferences, updatePreferences, goToScreen }) {
  return (
    <section className="panel access-summary">
      <PanelTitle icon="voice" title="Accesibilidad activa" />
      <p>Personaliza tu experiencia para una compra más cómoda y accesible.</p>
      <label className="switch-line">
        <span>Lectura en voz alta</span>
        <input type="checkbox" checked={preferences.voice} onChange={(event) => updatePreferences({ ...preferences, voice: event.target.checked })} />
      </label>
      <button className="secondary" type="button" onClick={() => goToScreen('accessibility')}>Configurar accesibilidad</button>
    </section>
  )
}

function AccessibilityPanel({ preferences, updatePreferences, voiceSupported, onTestVoice }) {
  const options = [
    ['voice', 'Lectura en voz alta', 'AYÚDATE puede leer textos, productos e indicaciones durante tu compra.'],
    ['largeText', 'Texto más grande', 'Hace que todo el texto sea más grande y fácil de leer.'],
    ['highContrast', 'Alto contraste', 'Usa colores con mayor contraste para una mejor visibilidad.'],
    ['pictograms', 'Apoyo con imágenes', 'Muestra señales visuales claras en productos e indicaciones.'],
    ['bigButtons', 'Botones simplificados', 'Muestra botones más grandes y con menos texto.'],
    ['accessibleRoute', 'Ruta accesible', 'Te muestra una ruta con menos cruces y obstáculos.'],
  ]

  return (
    <section className="access-panel" aria-labelledby="access-title">
      <h1 id="access-title">Haz AYÚDATE más cómodo para ti</h1>
      <p>Puedes cambiar estas opciones cuando quieras.</p>
      <div className="access-list">
        {options.map(([key, label, text]) => (
          <label className="access-option" key={key}>
            <IconBubble icon={key === 'voice' ? 'voice' : key === 'largeText' ? 'text' : key === 'accessibleRoute' ? 'pin' : 'access'} />
            <span>
              <strong>{label}</strong>
              <small>{text}</small>
            </span>
            <input type="checkbox" checked={preferences[key]} onChange={(event) => updatePreferences({ ...preferences, [key]: event.target.checked })} />
          </label>
        ))}
      </div>
      <button type="button" onClick={onTestVoice} disabled={!voiceSupported}>Reproducir prueba de voz</button>
    </section>
  )
}

function PreviewPanel({ addToCart, speak }) {
  return (
    <section className="panel preview-panel">
      <PanelTitle icon="access" title="Vista previa" />
      <p>Así se verá la información con tus preferencias activas.</p>
      <ProductResult product={products[0]} addToList={() => {}} addToCart={addToCart} goToRoute={() => {}} speak={speak} />
      <p className="assist-note">Producto agregado a tu carrito. Puedes continuar con tu compra o buscar otro producto.</p>
    </section>
  )
}

function PanelTitle({ icon, title }) {
  return (
    <div className="panel-title">
      <IconBubble icon={icon} />
      <h2>{title}</h2>
    </div>
  )
}

function ProductResult({ product, addToList, addToCart, goToRoute, speak }) {
  return (
    <article className="product-result">
      <ProductThumb product={product} />
      <div>
        <h3>{product.name}</h3>
        <p>{product.brand}</p>
        <button className="micro-button" type="button" onClick={speak}>Leer</button>
      </div>
      <strong>${product.price}.00</strong>
      <span>{product.category}</span>
      <span>Pasillo {product.aisle}</span>
      <span className={product.available ? 'available' : 'unavailable'}>{product.available ? 'Disponible' : 'Agotado'}</span>
      <div className="result-actions">
        <button className="secondary" type="button" onClick={addToList} disabled={!product.available}>Agregar a lista</button>
        <button type="button" onClick={addToCart} disabled={!product.available}>Agregar al carrito</button>
        <button className="secondary" type="button" onClick={goToRoute}>Ver ubicación</button>
      </div>
    </article>
  )
}

function ProductThumb({ product }) {
  return <span className={`product-thumb tone-${product.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}>{product.visual}</span>
}

function IconBubble({ icon }) {
  const icons = {
    list: (
      <>
        <rect x="6" y="5" width="12" height="14" rx="2" />
        <path d="M9 9h.01M12 9h3M9 13h.01M12 13h3" />
      </>
    ),
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="5.5" />
        <path d="m15 15 4 4" />
      </>
    ),
    pin: (
      <>
        <path d="M12 21s6-5.2 6-11a6 6 0 0 0-12 0c0 5.8 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </>
    ),
    wallet: (
      <>
        <rect x="4" y="7" width="16" height="12" rx="2" />
        <path d="M16 11h4v4h-4a2 2 0 0 1 0-4ZM7 7V5h10v2" />
      </>
    ),
    cart: (
      <>
        <path d="M5 6h2l2 9h8l2-6H8" />
        <circle cx="10" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </>
    ),
    help: (
      <>
        <path d="M5 18v-2a7 7 0 1 1 14 0v2" />
        <path d="M5 18h4v-6H5v6ZM15 18h4v-6h-4v6Z" />
      </>
    ),
    voice: (
      <>
        <path d="M4 10v4h4l5 4V6L8 10H4Z" />
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" />
      </>
    ),
    text: (
      <>
        <path d="M5 18 10 6h2l5 12M7 14h8M18 18V9" />
      </>
    ),
    access: (
      <>
        <circle cx="12" cy="5" r="2" />
        <path d="M5 10h14M12 7v6M8 21l4-8 4 8" />
      </>
    ),
    route: (
      <>
        <path d="M6 18c5 0 3-12 8-12h4" />
        <path d="m16 4 2 2-2 2M8 20l-2-2 2-2" />
      </>
    ),
    stats: (
      <>
        <path d="M6 19V9M12 19V5M18 19v-7" />
      </>
    ),
  }

  return (
    <span className="icon-bubble" aria-hidden="true">
      <svg viewBox="0 0 24 24" focusable="false">
        {icons[icon] || icons.help}
      </svg>
    </span>
  )
}

export default App




