export const normalizeProduct = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export function findProducts(products, query) {
  const term = normalizeProduct(query)
  return products.filter(product => normalizeProduct(`${product.name} ${product.category} ${product.brand}`).includes(term))
}

export function recognizeProducts(products, text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  const recognized = []
  const unresolved = []
  if (lines.length > 50) return { recognized, unresolved, error: 'Puedes agregar hasta 50 líneas a la vez.' }
  for (const line of lines) {
    const match = line.match(/^(\d+)\s*(?:x\s*|\s+)(.+)$/i)
    const quantity = match ? Number(match[1]) : 1
    const term = match ? match[2] : line
    const candidates = findProducts(products, term)
    const exact = candidates.find(product => normalizeProduct(product.name) === normalizeProduct(term))
    const product = exact || (candidates.length === 1 ? candidates[0] : null)
    if (product && quantity >= 1 && quantity <= 99) recognized.push({ id: product.id, quantity })
    else unresolved.push(line)
  }
  return { recognized, unresolved, error: '' }
}

export function addQuantities(current, entries) {
  const next = { ...current }
  entries.forEach(({ id, quantity }) => { next[id] = Math.min(99, (next[id] || 0) + quantity) })
  return next
}
