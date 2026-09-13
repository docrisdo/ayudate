import { test } from 'node:test'
import assert from 'node:assert/strict'
import { supportPreferences } from './welcomeFlow.js'

test('combines support choices without mutating saved preferences', () => {
  const current = { voice: true, largeText: false, highContrast: false, bigButtons: false, accessibleRoute: false, pictograms: false }
  const next = supportPreferences(current, ['visual', 'motor', 'auditory', 'communication'])
  assert.deepEqual(next, { voice: false, largeText: true, highContrast: true, bigButtons: true, accessibleRoute: true, pictograms: true })
  assert.equal(current.largeText, false)
  assert.deepEqual(supportPreferences(current, []), current)
})
