const READ_SELECTION_MENU = 'leitor-livre-read-selection';
const APPEND_SELECTION_MENU = 'leitor-livre-append-selection';
let reading = { tabId: null, active: false, paused: false };

async function queuePanelRead(request, windowId) {
  await chrome.storage.local.set({ panelReadRequest: { ...request, requestedAt: Date.now() } });
  try { await chrome.sidePanel.open({ windowId }); } catch { /* O pedido permanece pronto para quando o painel for aberto. */ }
}

async function currentReading() {
  if (reading.active) return reading;
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      const state = await chrome.tabs.sendMessage(tab.id, { type: 'get-local-reading-state' });
      if (state?.active) return reading = { tabId: tab.id, active: true, paused: !!state.paused };
    } catch {
      // Nem todas as abas aceitam scripts de extensão.
    }
  }
  return reading;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: READ_SELECTION_MENU,
    title: 'Ler com Leitor Livre',
    contexts: ['selection']
  });
  chrome.contextMenus.create({
    id: APPEND_SELECTION_MENU,
    title: 'Continuar leitura com Leitor Livre (acrescentar)',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const type = { [READ_SELECTION_MENU]: 'read-context-selection', [APPEND_SELECTION_MENU]: 'append-context-selection' }[info.menuItemId];
  if (!type || !tab?.id || !info.selectionText?.trim()) return;
  chrome.tabs.sendMessage(tab.id, { type, text: info.selectionText }).catch(() => {
    // A página pode não aceitar scripts de extensão, como chrome:// e a Chrome Web Store.
  });
});

chrome.commands.onCommand.addListener(async (command, commandTab) => {
  if (command !== 'append-or-read-copied') return;
  const tab = commandTab || (await chrome.tabs.query({ active: true, lastFocusedWindow: true }))[0];
  if (!tab?.id || !tab.windowId) return;
  try {
    const result = await chrome.tabs.sendMessage(tab.id, { type: 'shortcut-append' });
    if (result?.handled) return;
  } catch {
    // PDFs do visualizador interno não permitem content scripts.
  }
  await queuePanelRead({ fromClipboard: true }, tab.windowId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'copy-to-panel-and-read' && sender.tab?.windowId && message.text?.trim()) {
    queuePanelRead({ text: message.text.trim() }, sender.tab.windowId)
      .then(() => sendResponse({ ok: true }));
    return true;
  }
  if (message.type === 'reading-state' && sender.tab?.id) {
    reading = { tabId: sender.tab.id, active: !!message.active, paused: !!message.paused };
    if (!reading.active) reading.tabId = null;
    return;
  }
  if (message.type === 'get-reading-state') {
    currentReading().then(sendResponse);
    return true;
  }
  if (message.type === 'toggle-current-reading') {
    currentReading().then(state => {
      if (!state.active || state.tabId === null) throw Error('Nenhuma leitura está em andamento.');
      return chrome.tabs.sendMessage(state.tabId, { type: 'toggle-pause' });
    }).then(() => sendResponse({ ok: true })).catch(error => {
      reading = { tabId: null, active: false, paused: false };
      sendResponse({ ok: false, error: error.message || 'A página da leitura não está mais disponível.' });
    });
    return true;
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  if (reading.tabId === tabId) reading = { tabId: null, active: false, paused: false };
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading' && reading.tabId === tabId) reading = { tabId: null, active: false, paused: false };
});
