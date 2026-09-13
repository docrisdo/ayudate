const fs=require('fs');
function edit(path,fn){const full='src/'+path;fs.writeFileSync(full,fn(fs.readFileSync(full,'utf8')))}
function replace(s,a,b){if(!s.includes(a))throw Error('Missing: '+a);return s.replace(a,b)}
edit('main.jsx',s=>s.replace("import App from './App.jsx'","import App from './App.jsx'\nimport AccessibilityProvider from './components/AccessibilityProvider.jsx'").replace('<SpeechProvider>','<AccessibilityProvider><SpeechProvider>').replace('</SpeechProvider>','</SpeechProvider></AccessibilityProvider>'));
edit('App.jsx',s=>{
 s="import { useAnnounce, useScreenFocus } from './components/accessibilityContext.js'\n"+s;
 s=s.replace("const [screen, setScreen] = useState('welcome')","const [screen, setScreen] = useState('welcome')\n  useScreenFocus(screen)\n  const announce = useAnnounce()");
 s=s.replaceAll('<main className={appClass}', '<div className={appClass}').replaceAll('</main>','</div>');
 s=s.replace('updateLists([...lists, list])','updateLists([...lists, list])\n        announce(`Lista ${list.name} guardada.`)');
 return s;
});
for(const [file,cls] of [['Accessibility','ac'],['Assistance','as'],['Budget','bd'],['Cart','ct'],['Lists','lists'],['NewList','nl'],['Route','rt'],['Search','sp'],['Home','home']]){
 edit('screens/'+file+'.jsx',s=>{
  const expression=new RegExp('<div className="'+cls+'-content"([^>]*)>');
  s=s.replace(expression,(_,attrs)=>'<main className="'+cls+'-content" id="main-content" tabIndex={-1}'+attrs.replace(' id="home-content"','').replace(' tabIndex={-1}','')+'>');
  const end=s.lastIndexOf('    </div>');if(end<0)throw Error(file);s=s.slice(0,end)+s.slice(end).replace('    </div>','    </main>');
  if(file==='Home')s=s.replace('      <a className="home-skip" href="#home-content">Saltar al contenido</a>\n','');
  return s;
 });
}
edit('screens/Welcome.jsx',s=>s.replace('<main className="wl-screen">','<div className="wl-screen">').replace('<div className="wl-layout">','<main className="wl-layout" id="main-content" tabIndex={-1}>').replace('    </div>\n  </main>','    </main>\n  </div>').replace('<small>{option.text}</small>','<small id={`wl-description-${option.id}`}>{option.text}</small>').replace('aria-label={option.title}','aria-label={option.title} aria-describedby={`wl-description-${option.id}`}'));
edit('screens/Accessibility.jsx',s=>s.replace('<small>{description}</small>','<small id={`ac-description-${key}`}>{description}</small>').replace('aria-label={title} checked','aria-label={title} aria-describedby={`ac-description-${key}`} checked'));
edit('components/VoiceCommandsProvider.jsx',s=>s.replace("const timer = setTimeout(() => { say(welcome) }, 0)","const timer = meta.enabled ? setTimeout(() => { say(welcome) }, 0) : null").replace("if (welcomeUsed.current || !event.target.closest", "if (event.detail === 0 || welcomeUsed.current || !event.target.closest").replace('[meta.screen, say]','[meta.screen, meta.enabled, say]'));
edit('screens/Search.jsx',s=>{
 s=s.replace("import { useRef, useState }", "import { useEffect, useRef, useState }");s="import { useAnnounce } from '../components/accessibilityContext.js'\n"+s;
 s=s.replace("const [sort, setSort]", "const announce = useAnnounce()\n  const [sort, setSort]");
 s=s.replace('  function filter(value)',"  useEffect(() => { const timer = setTimeout(() => announce(`${results.length} resultados${query.trim() ? ` para ${query.trim()}` : ''}.`), 400); return () => clearTimeout(timer) }, [query, category, results.length, announce])\n  function filter(value)");
 s=s.replace('className="sp-result ${','className="sp-result ${');
 s=s.replace('key={product.id}>\n        <div className="sp-product">','key={product.id} aria-labelledby={`sp-product-${product.id}`}>\n        <div className="sp-product">');
 s=s.replace('<button className="sp-select-product"','<h3 className="sp-product-heading"><button className="sp-select-product"');
 s=s.replace('<span><strong>{product.name} {product.unit}</strong>','<span><strong id={`sp-product-${product.id}`}>{product.name} {product.unit}</strong>');
 s=s.replace('</span></button><button className="sp-read"','</span></button></h3><button className="sp-read" aria-label={`Leer información de ${product.name} ${product.brand}`}');
 s=s.replace('className="sp-add-list" disabled','className="sp-add-list" aria-label={`${selectedList?.items.includes(product.id) ? \'En tu lista\' : \'Agregar a lista\'}: ${product.name} ${product.brand}`} disabled');
 s=s.replace('className="lists-button" disabled={!product.available} onClick={() => addCart','className="lists-button" aria-label={`Agregar al carrito: ${product.name} ${product.brand}`} disabled={!product.available} onClick={() => addCart');
 s=s.replace('className="sp-location" onClick','className="sp-location" aria-label={`Ver ubicación de ${product.name} ${product.brand}`} aria-expanded={selected === product.id} aria-controls={`sp-detail-${product.id}`} onClick');
 s=s.replace('className="sp-detail" aria-label','className="sp-detail" id={`sp-detail-${product.id}`} aria-label');
 s=s.replace('onClick={() => setSelected(null)}>Cerrar detalle', 'onClick={() => { setSelected(null); document.querySelector(`[aria-controls="sp-detail-${product.id}"]`)?.focus() }}>Cerrar detalle');
 return s;
});
edit('screens/Cart.jsx',s=>{
 s="import { useAnnounce, focusAfterRemoval } from '../components/accessibilityContext.js'\n"+s;
 s=s.replace('  const [removed,','  const announce = useAnnounce()\n  const [removed,');
 s=s.replace('function remove(item) { setRemoved(item); onRemove(item.id) }','function remove(item) { focusAfterRemoval(document.activeElement, \'tr\', \'button\', \'.ct-continue\'); setRemoved(item); onRemove(item.id) }');
 s=s.replace('else onDecrease(item.id)', 'else { onDecrease(item.id); announce(`${item.name}. Cantidad ${item.quantity - 1}.`) }');
 s=s.replace('onClick={() => onIncrease(item.id)}', 'onClick={() => { onIncrease(item.id); announce(`${item.name}. Cantidad ${item.quantity + 1}.`) }}');
 s=s.replace('onRestore(removed.id, removed.quantity); setRemoved(null)', 'onRestore(removed.id, removed.quantity); announce(`${removed.name} restaurado al carrito.`); setRemoved(null); requestAnimationFrame(() => document.querySelector(\'.ct-quantity button\')?.focus())');
 s=s.replace('onClick={() => setConfirmed(true)}','onClick={() => { setConfirmed(true); requestAnimationFrame(() => document.getElementById(\'ct-dialog-title\')?.focus()) }}').replace('id="ct-dialog-title"','id="ct-dialog-title" tabIndex={-1}');
 return s;
});
edit('screens/NewList.jsx',s=>{
 s="import { focusAfterRemoval } from '../components/accessibilityContext.js'\n"+s;
 s=s.replace('  function remove(id) {','  function remove(id) {\n    setMessage(`${products.find(product => product.id === id)?.name} eliminado de la lista.`)\n    focusAfterRemoval(document.activeElement, \'li\', \'input\', \'#nl-search\')');
 s=s.replace('  function changeQuantity(id, value) {','  function changeQuantity(id, value) {\n    setMessage(`${products.find(product => product.id === id)?.name}. Cantidad ${Math.max(1, Math.min(99, Number(value) || 1))}.`)');
 s=s.replace('className="nl-status" role="status"','className="nl-status" id="nl-status" role="status"');
 s=s.replace('id="nl-name" ref','id="nl-name" aria-describedby="nl-status" ref');
 s=s.replace('id="nl-bulk" ref','id="nl-bulk" aria-describedby="nl-bulk-help" ref').replace('className="nl-bulk-help"','className="nl-bulk-help" id="nl-bulk-help"');
 s=s.replace('className="nl-clear"','className="nl-clear" role="group" aria-label="Confirmar vaciado de la lista" onKeyDown={event => { if (event.key === \'Escape\') { setClearing(false); document.querySelector(\'.nl-products-heading button\')?.focus() } }}');
 s=s.replace("onClick={() => setClearing(true)}", "onClick={() => { setClearing(true); requestAnimationFrame(() => document.querySelector('.nl-clear button')?.focus()) }}");
 s=s.replace("setClearing(false); setMessage('Se vació la lista.')", "setClearing(false); setMessage('Se vació la lista.'); searchRef.current?.focus()");
 s=s.replace('onClick={() => setClearing(false)}','onClick={() => { setClearing(false); document.querySelector(\'.nl-products-heading button\')?.focus() }}');
 return s;
});
edit('screens/Budget.jsx',s=>{
 s="import { useAnnounce } from '../components/accessibilityContext.js'\n"+s;
 s=s.replace('  const [editing,','  const announce = useAnnounce()\n  const [editing,');
 s=s.replace('onBudget(Math.round(next * 100) / 100)','onBudget(Math.round(next * 100) / 100)\n    announce(`Presupuesto actualizado: ${money(next)}. Gasto actual: ${money(total)}. Restante: ${money(next - total)}.`)');return s;
});
edit('screens/Route.jsx',s=>{
 s=s.replace('<div className="rt-columns">','<div className="rt-columns"><section className="a11y-sr-only" aria-label="Recorrido en texto"><h2>Recorrido de compra</h2><p role="status" aria-atomic="true">Zona actual: {currentZone}. {instruction} Siguiente zona: {upcoming[0] || \'Caja\'}.</p><h3>Productos pendientes</h3><ul>{pending.map(item => <li key={item.id}>{item.name}, {item.unit}. Pasillo {item.aisle}, {item.shelf}. {!item.available && \'Agotado.\'}</li>)}</ul></section>');return s;
});
edit('screens/Lists.jsx',s=>{
 s="import { useAnnounce, focusAfterRemoval } from '../components/accessibilityContext.js'\n"+s;
 s=s.replace('  const [creating,','  const announce = useAnnounce()\n  const [creating,');
 s=s.replace('  function removeList(list) {','  function removeList(list) {\n    focusAfterRemoval(document.activeElement, \'article\', \'.lists-card-select\', \'.lists-new-action button\')');
 s=s.replace('onClick={() => setDeleteId(deleteId === list.id ? null : list.id)}','aria-expanded={deleteId === list.id} onClick={() => { setDeleteId(deleteId === list.id ? null : list.id); requestAnimationFrame(() => document.querySelector(\'.lists-delete-confirm button\')?.focus()) }}');
 s=s.replace('className="lists-delete-confirm"','className="lists-delete-confirm" role="group" aria-label={`¿Eliminar ${list.name}?`} onKeyDown={event => { if (event.key === \'Escape\') { setDeleteId(null); event.currentTarget.closest(\'article\').querySelector(\'.lists-card-actions button:last-child\').focus() } }}');
 s=s.replace('onClick={() => setDeleteId(null)}','onClick={event => { setDeleteId(null); event.currentTarget.closest(\'article\').querySelector(\'.lists-card-actions button:last-child\').focus() }}');
 s=s.replace('if (draftName.trim()) onUpdateList({ ...selectedList, name: draftName.trim(), updatedAt: new Date().toISOString() })','if (draftName.trim()) { onUpdateList({ ...selectedList, name: draftName.trim(), updatedAt: new Date().toISOString() }); announce(`Lista ${draftName.trim()} guardada.`) }');
 s=s.replace('onClick={() => setEditing(false)}>Listo','onClick={() => { setEditing(false); detailRef.current?.focus() }}>Listo');
 s=s.replace('onClick={() => onRemoveProduct(product.id)}','onClick={event => { focusAfterRemoval(event.currentTarget, \'li\', \'button\', \'.lists-detail-edit\'); onRemoveProduct(product.id); announce(`${product.name} eliminado de la lista.`) }}');
 s=s.replace('onClick={() => onAddProduct(product.id)}','onClick={() => { onAddProduct(product.id); announce(`${product.name} agregado a la lista.`) }}');return s;
});
edit('screens/Assistance.jsx',s=>s.replace('function notifyStaff() { setConfirmed(true) }',"function notifyStaff() { const inside = document.activeElement?.closest('dialog'); setConfirmed(true); requestAnimationFrame(() => (inside ? document.querySelector('.as-confirmation') : document.querySelector('.as-notify-result'))?.focus()) }").replace('className="as-notify-result" role','className="as-notify-result" tabIndex={-1} role').replace('className="as-confirmation" role','className="as-confirmation" tabIndex={-1} role').replace('onClick={notifyStaff}><Icon','aria-label={`Notificar al personal: ${selected.title}`} onClick={notifyStaff}><Icon'));
