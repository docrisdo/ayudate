// Branded presentations supplied in search-products; demo prices from reference p6.
export const milkProducts = [
  { id: 13, barcode: '2000000000138', name: 'Leche entera', brand: 'LALA', price: 32, unit: '1 L', image: '/assets/search-products/leche-lala.png' },
  { id: 14, barcode: '2000000000145', name: 'Leche entera', brand: 'Santa Clara', price: 33.5, unit: '1 L', image: '/assets/search-products/leche-santa-clara.png' },
  { id: 15, barcode: '2000000000152', name: 'Leche entera', brand: 'Alpura', price: 31, unit: '1 L', image: '/assets/search-products/leche-alpura.png' },
  { id: 16, barcode: '2000000000169', name: 'Leche entera en polvo', brand: 'NIDO', price: 89, unit: '720 g', image: '/assets/search-products/leche-nido.png' },
].map(product => ({ ...product, category: 'Lácteos', aisle: 3, shelf: 'Sección de leches', available: true, visual: 'LE' }))

export const normalizeSearch = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

const assetRoot = '/assets/search-products/'
export const missingProductPhotos = {
  2: `${assetRoot}productos-faltantes/yogur-natural-1l-campo-claro.png`,
  3: `${assetRoot}productos-faltantes/cereal-integral-500g-granvita.png`,
  4: `${assetRoot}productos-faltantes/avena-400g-natural.png`,
  8: `${assetRoot}productos-faltantes/frijol-900g-la-mesa.png`,
}

// Local demonstration catalog; prices and availability are simulated.
export const additionalProducts = [
  { id: 17, name: 'Pechuga de pollo', brand: '', price: 129, unit: '1 kg', category: 'Carnes', aisle: 6, shelf: 'Vitrina refrigerada de pollo', image: `${assetRoot}carnes/pechuga-de-pollo-1kg.png` },
  { id: 18, name: 'Carne molida de res', brand: '', price: 89, unit: '500 g', category: 'Carnes', aisle: 6, shelf: 'Vitrina refrigerada de res', image: `${assetRoot}carnes/carne-molida-res-500g.png` },
  { id: 19, name: 'Agua', brand: '', price: 18, unit: '1.5 L', category: 'Bebidas', aisle: 8, shelf: 'Estante de agua embotellada', image: `${assetRoot}bebidas/agua-pura-1.5l.png` },
  { id: 20, name: 'Jugo de naranja', brand: 'La Mesa', price: 35, unit: '1 L', category: 'Bebidas', aisle: 8, shelf: 'Estante de jugos', image: `${assetRoot}bebidas/jugo-naranja-1l.png` },
  { id: 21, name: 'Shampoo anticaspa', brand: 'Head & Shoulders', price: 85, unit: '400 ml', category: 'Higiene personal', aisle: 9, shelf: 'Estante de cuidado del cabello', image: `${assetRoot}higiene-personal/shampoo-anticaspa-400ml.png` },
  { id: 22, name: 'Jabón líquido para manos', brand: 'Palmolive', price: 42, unit: '500 ml', category: 'Higiene personal', aisle: 9, shelf: 'Estante de jabones para manos', image: `${assetRoot}higiene-personal/jabon-liquido-manos-500ml.png` },
].map(product => ({ ...product, available: true, visual: product.name.slice(0, 2).toUpperCase() }))

export function productSpeech(product) {
  return `${product.name}${product.brand ? `, ${product.brand}` : ''}. Precio ${product.price.toFixed(2)} pesos. Presentación ${product.unit}. Categoría ${product.category}. Pasillo ${product.aisle}, ${product.shelf}. ${product.available ? 'Disponible' : 'Agotado'}.`
}
export function searchCatalog(products, query, category, sort = 'relevance') {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean)
  const filtered = products.filter(product => {
    const text = normalizeSearch(`${product.name} ${product.brand} ${product.category} ${product.unit} pasillo ${product.aisle}`)
    return (category === 'Todos' || product.category === category) && words.every(word => text.includes(word))
  })
  if (sort === 'price-up') return filtered.sort((a, b) => a.price - b.price)
  if (sort === 'price-down') return filtered.sort((a, b) => b.price - a.price)
  if (sort === 'name') return filtered.sort((a, b) => `${a.name} ${a.brand}`.localeCompare(`${b.name} ${b.brand}`, 'es'))
  return filtered
}

