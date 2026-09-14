import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createPendingSpeech } from './pendingSpeech.js'

function clock() {
  let now=0, id=0
  const tasks=new Map()
  const pending=createPendingSpeech((fn,delay)=>{tasks.set(++id,{fn,at:now+delay});return id},key=>tasks.delete(key))
  return {pending,tick(ms){now+=ms;for(const [key,t] of tasks)if(t.at<=now){tasks.delete(key);t.fn()}},tasks}
}
test('guidance waits 1800 ms and keeps only the latest snapshot', async () => {
  const c=clock(),spoken=[]
  const first=c.pending.schedule(()=>spoken.push('old'))
  c.tick(1700);await Promise.resolve();assert.deepEqual(spoken,[])
  const last=c.pending.schedule(()=>spoken.push('new'))
  assert.equal(await first,'cancelled');assert.equal(c.tasks.size,1)
  c.tick(1799);await Promise.resolve();assert.deepEqual(spoken,[])
  c.tick(1);await last;assert.deepEqual(spoken,['new'])
})
test('cancel removes pending speech and does not report it as a playback failure', async () => {
  const c=clock(),spoken=[]
  const result=c.pending.schedule(()=>spoken.push('stale'))
  c.pending.cancel();c.tick(2000)
  assert.equal(await result,'cancelled');assert.deepEqual(spoken,[]);assert.equal(c.tasks.size,0)
})
test('playback failures remain distinguishable for accessible fallback', async () => {
  const c=clock();const result=c.pending.schedule(()=>{throw Error('unavailable')})
  c.tick(1800);assert.equal(await result,false)
})
