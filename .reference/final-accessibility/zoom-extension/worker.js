/* global chrome */
chrome.tabs.onUpdated.addListener((id, change, tab) => {
  if (change.status === 'complete' && tab.url?.startsWith('http://localhost:5173/')) chrome.tabs.setZoom(id, 2)
})

