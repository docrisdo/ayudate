export const money = value => new Intl.NumberFormat('es-MX', {
  style: 'currency', currency: 'MXN', minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
}).format(value)

export function budgetSummary(budget, items) {
  const limit = Math.max(0, Math.round(budget * 100))
  const rows = items.filter(item => item.quantity > 0).map(item => ({
    ...item, cents: Math.round(item.price * 100) * item.quantity,
  })).sort((a, b) => b.cents - a.cents)
  const spent = rows.reduce((sum, item) => sum + item.cents, 0)
  const percent = limit ? Math.round(spent / limit * 100) : null
  return {
    total: spent / 100, remaining: (limit - spent) / 100, percent,
    progress: limit ? Math.min(spent / limit * 100, 100) : spent ? 100 : 0,
    status: spent > limit ? 'over' : spent && spent >= limit ? 'limit' : spent && spent / limit >= .8 ? 'near' : 'ok',
    rows: rows.map(item => ({ ...item, subtotal: item.cents / 100, share: spent ? Math.round(item.cents / spent * 100) : 0 })),
  }
}
