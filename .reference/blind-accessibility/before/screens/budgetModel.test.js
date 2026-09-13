import { test } from 'node:test'
import assert from 'node:assert/strict'
import { budgetSummary } from './budgetModel.js'

test('calculates quantities, decimal prices, ordering and contribution from the cart', () => {
  const summary = budgetSummary(100, [{ id: 1, price: .1, quantity: 3 }, { id: 2, price: 33.5, quantity: 2 }])
  assert.equal(summary.total, 67.3)
  assert.equal(summary.remaining, 32.7)
  assert.equal(summary.percent, 67)
  assert.deepEqual(summary.rows.map(row => [row.id, row.subtotal, row.share]), [[2, 67, 100], [1, .3, 0]])
  assert.equal(budgetSummary(100, []).total, 0)
})

test('distinguishes approaching, reached and exceeded budgets', () => {
  for (const [price, status] of [[79, 'ok'], [80, 'near'], [100, 'limit'], [120, 'over']]) {
    const summary = budgetSummary(100, [{ price, quantity: 1 }])
    assert.equal(summary.status, status)
    assert.equal(summary.progress, Math.min(price, 100))
    assert.equal(summary.remaining, 100 - price)
  }
})

test('zero budget and empty cart never produce an infinite percentage', () => {
  assert.equal(budgetSummary(0, []).percent, null)
  assert.equal(budgetSummary(0, []).status, 'ok')
  const summary = budgetSummary(0, [{ price: 32, quantity: 1 }])
  assert.equal(summary.status, 'over')
  assert.equal(summary.remaining, -32)
  assert.equal(summary.progress, 100)
  assert.equal(summary.percent, null)
})
