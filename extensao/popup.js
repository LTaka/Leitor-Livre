const $=id=>document.getElementById(id),PAUSE='<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>',PLAY='<path d="M7 4.5v15l13-7.5z"/>';
let reading={active:false,paused:false,tabId:null};
async function refresh(){reading=await chrome.runtime.sendMessage({type:'get-reading-state'});const {active,paused}=reading;document.body.classList.toggle('active',active&&!paused);document.body.classList.toggle('paused',active&&paused);$('toggle').disabled=!active;$('goto').disabled=!active||reading.tabId===null;$('toggle-label').textContent=paused?'Retomar':'Pausar';$('toggle-icon').innerHTML=paused?PLAY:PAUSE;$('title').textContent=active?(paused?'Leitura pausada':'Lendo agora'):'Nada tocando';$('status').textContent=active?(paused?'Toque em Retomar para continuar.':'Leitura em andamento numa aba.'):'Selecione um texto para ouvir.'}
$('toggle').onclick=async()=>{const result=await chrome.runtime.sendMessage({type:'toggle-current-reading'});if(!result.ok)$('status').textContent=result.error;setTimeout(()=>refresh().catch(()=>{}),80)};
$('goto').onclick=async()=>{try{const tab=await chrome.tabs.update(reading.tabId,{active:true});await chrome.windows.update(tab.windowId,{focused:true});window.close()}catch(e){$('status').textContent=e.message}};
$('open').onclick=async()=>{try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});await chrome.sidePanel.open({windowId:tab.windowId});window.close()}catch(e){$('status').textContent=e.message}};
const autoHint=on=>$('auto-hint').textContent=on?'Selecionar texto inicia a leitura.':'Desligada: use Alt + Shift + R.';
$('automatic').onchange=()=>{const on=$('automatic').checked;chrome.storage.local.set({enabled:on});autoHint(on)};
chrome.storage.local.get({enabled:false}).then(({enabled})=>{$('automatic').checked=enabled;autoHint(enabled)});
refresh().catch(e=>$('status').textContent=e.message);
