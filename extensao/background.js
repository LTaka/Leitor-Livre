const READ_SELECTION_MENU = 'leitor-livre-read-selection';
const APPEND_SELECTION_MENU = 'leitor-livre-append-selection';

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
