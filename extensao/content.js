(()=>{'use strict';if(window.__leitorLivre)return;window.__leitorLivre=true;
let lastShortcut=0,lastAppendShortcut=0;let cfg={enabled:false,append:false,rate:1.5,pitch:1,volume:1,voiceURI:''},items=[],at=0,run=0,paused=false,active=false,panel=null,phrase=null,progress=null,button=null,last=null,block=null,timer,retryTimer,copyTimer;
const synth=speechSynthesis,hilite='leitor-livre-current';
function report(){chrome.runtime.sendMessage({type:'reading-state',active,paused}).catch(()=>{})}
function selection(){const s=getSelection();if(!s||s.isCollapsed||!s.rangeCount||!s.toString().trim())return null;const r=s.getRangeAt(0).cloneRange();if(r.startContainer.parentElement?.closest('input,textarea,[contenteditable],#leitor-livre-ui'))return null;const nodes=[];const root=r.commonAncestorContainer;function put(n){if(!n.nodeValue||!r.intersectsNode(n))return;const a=n===r.startContainer?r.startOffset:0,b=n===r.endContainer?r.endOffset:n.length;if(b>a)nodes.push({node:n,a,b,len:b-a})}if(root.nodeType===3)put(root);else{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=w.nextNode())put(n)}const text=nodes.map(n=>n.node.nodeValue.slice(n.a,n.b)).join('');return text.trim()?{nodes,text}:null}
function range(nodes,a,b){let offset=0,first,last;for(const n of nodes){const right=offset+n.len;if(a<right&&b>offset){if(!first)first={node:n.node,o:n.a+Math.max(0,a-offset)};last={node:n.node,o:n.a+Math.min(n.len,b-offset)}}offset=right}if(!first)return null;try{const r=document.createRange();r.setStart(first.node,first.o);r.setEnd(last.node,last.o);return r}catch{return null}}
function segments(data){let raw=data.text,parts=[];if(Intl.Segmenter){try{parts=[...new Intl.Segmenter('pt-BR',{granularity:'sentence'}).segment(raw)].map(x=>[x.index,x.index+x.segment.length])}catch{}}if(!parts.length){let m;const re=/[^.!?\n]+(?:[.!?]+|\n|$)/g;while(m=re.exec(raw))parts.push([m.index,re.lastIndex])}let out=[];for(let [a,b] of parts){while(a<b&&/\s/.test(raw[a]))a++;while(b>a&&/\s/.test(raw[b-1]))b--;while(b-a>230){let end=raw.lastIndexOf(' ',a+230);if(end<a+70)end=a+230;out.push({text:raw.slice(a,end),range:range(data.nodes,a,end),a,b:end});a=end;while(a<b&&/\s/.test(raw[a]))a++}if(b>a)out.push({text:raw.slice(a,b),range:range(data.nodes,a,b),a,b})}return out.filter(x=>x.text.trim())}
function clear(){if(CSS.highlights)CSS.highlights.delete(hilite)}
function marker(r){clear();if(CSS.highlights&&window.Highlight&&r){CSS.highlights.set(hilite,new Highlight(r));if(!document.getElementById('leitor-livre-style')){const st=document.createElement('style');st.id='leitor-livre-style';st.textContent='::highlight(leitor-livre-current){background:#ffe17a;color:#251a00}';document.head.append(st)}}}
function scroll(r){if(!r)return;let bounds=r.getBoundingClientRect();const y=(bounds.top+bounds.bottom)/2;let p=r.startContainer.parentElement;while(p&&p!==document.documentElement){const cs=getComputedStyle(p);if(/auto|scroll/.test(cs.overflowY)&&p.scrollHeight>p.clientHeight+6){const rect=p.getBoundingClientRect();const target=rect.top+rect.height*.48;if(Math.abs(y-target)>rect.height*.13)p.scrollBy({top:y-target,behavior:'smooth'});return}p=p.parentElement}const target=innerHeight*.48;if(Math.abs(y-target)>innerHeight*.13)window.scrollBy({top:y-target,behavior:'smooth'})}
const icon={pause:'<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>',play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>'};
function widget(){if(panel)return;const host=document.createElement('div');host.id='leitor-livre-ui';host.style.cssText='position:fixed;right:16px;bottom:16px;z-index:2147483647';document.documentElement.append(host);panel=host.attachShadow({mode:'open'});panel.innerHTML=`<style>
:host{all:initial;--bg:#fff;--soft:#eef5f1;--line:#dbe8e2;--text:#16352f;--muted:#5f7a70;--brand:#0e7866;--brand-soft:#e2f1ea;--brand-ink:#0f6a5a;--ring:#85cdb7}
@media (prefers-color-scheme:dark){:host{--bg:#16211e;--soft:#1c2a26;--line:#2b3e39;--text:#e4efeb;--muted:#93aaa2;--brand:#21a088;--brand-soft:#1d3530;--brand-ink:#8fdcc9;--ring:#3d8f7c}}
*{box-sizing:border-box}
section{width:330px;max-width:calc(100vw - 32px);border:1px solid var(--line);border-radius:16px;padding:12px 14px 12px;background:var(--bg);color:var(--text);box-shadow:0 12px 36px rgba(0,0,0,.22);font:14px/1.5 system-ui,sans-serif;animation:in .2s ease}
@keyframes in{from{opacity:0;transform:translateY(8px)}}
button{font:inherit;border:0;cursor:pointer;background:var(--brand-soft);color:var(--brand-ink);display:grid;place-items:center;padding:0;transition:filter .15s}
button:hover{filter:brightness(.95)}
button:focus-visible,input:focus-visible{outline:3px solid var(--ring);outline-offset:2px}
svg{width:16px;height:16px}
header{display:flex;align-items:center;gap:8px}
.logo{width:24px;height:24px;border-radius:7px;background:var(--brand);color:#fff;display:grid;place-items:center;flex:none}
.logo svg{width:14px;height:14px}
header strong{font-size:13px}
.dot{width:7px;height:7px;border-radius:50%;background:var(--line)}
section.playing .dot{background:var(--brand);animation:pulse 1.2s ease-in-out infinite}
section.paused .dot{background:#d79a2b}
@keyframes pulse{50%{opacity:.35}}
.tools{margin-left:auto;display:flex;gap:4px}
.tools button{width:26px;height:26px;border-radius:8px;background:transparent;color:var(--muted)}
.tools button:hover{background:var(--soft);filter:none}
p{margin:10px 0 0;background:var(--soft);border-radius:10px;padding:9px 11px;max-height:96px;overflow:auto;overflow-wrap:anywhere;font-size:14px;line-height:1.6}
.bar{height:4px;background:var(--soft);border-radius:9px;overflow:hidden;margin-top:10px}
.bar div{height:100%;width:0;background:var(--brand);transition:width .2s}
nav{display:flex;align-items:center;gap:8px;margin-top:9px}
small{flex:1;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
nav button{width:34px;height:34px;border-radius:50%}
nav #pause{width:42px;height:42px;background:var(--brand);color:#fff}
label{display:flex;align-items:center;gap:9px;margin-top:10px;padding-top:10px;border-top:1px solid var(--line);font-size:12px;color:var(--muted);cursor:pointer}
label span{flex:1}
input{appearance:none;flex:none;width:34px;height:20px;border-radius:20px;background:var(--line);position:relative;cursor:pointer;transition:background .2s;margin:0}
input::after{content:"";position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .2s}
input:checked{background:var(--brand)}
input:checked::after{transform:translateX(14px)}
section.mini{width:auto;padding:8px 10px}
section.mini p,section.mini .bar,section.mini label,section.mini small{display:none}
section.mini{display:flex;align-items:center;gap:10px}
section.mini nav{margin:0}
section.mini .tools{margin-left:4px}
section.mini header strong{display:none}
</style><section id="box" aria-label="Leitor Livre"><header><span class="logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/></svg></span><strong>Leitor Livre</strong><span class="dot"></span><div class="tools"><button id="mini" title="Minimizar" aria-label="Minimizar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg></button><button id="close" title="Parar e fechar" aria-label="Parar e fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div></header><p id="phrase"></p><div class="bar"><div id="bar"></div></div><nav><small id="progress"></small><button id="back" title="Trecho anterior" aria-label="Trecho anterior"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg></button><button id="pause"></button><button id="next" title="Próximo trecho" aria-label="Próximo trecho"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg></button></nav><label title="Novas seleções entram no fim da leitura atual"><span><b style="color:var(--text);font-weight:600">Continuar lendo</b><br>Novas seleções entram no fim da fila</span><input id="append" type="checkbox"></label></section>`;phrase=panel.getElementById('phrase');progress=panel.getElementById('progress');button=panel.getElementById('pause');panel.getElementById('close').onclick=()=>{stop();host.remove();panel=null};const box=panel.getElementById('box'),mini=panel.getElementById('mini');mini.onclick=()=>{const on=box.classList.toggle('mini');mini.title=on?'Expandir':'Minimizar';mini.setAttribute('aria-label',mini.title);mini.innerHTML=on?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 15l6-6 6 6"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12h12"/></svg>'};panel.getElementById('back').onclick=()=>jump(-1);panel.getElementById('next').onclick=()=>jump(1);button.onclick=toggle;const check=panel.getElementById('append');check.checked=cfg.append;check.onchange=()=>{cfg.append=check.checked;chrome.storage.local.set({append:cfg.append})}}
// Aviso rapido confirmando que o trecho entrou na fila de leitura.
let toastTimer;function toast(msg){let host=document.getElementById('leitor-livre-toast');if(!host){host=document.createElement('div');host.id='leitor-livre-toast';host.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;pointer-events:none';host.attachShadow({mode:'open'}).innerHTML='<style>div{background:#0e7866;color:#fff;font:600 14px/1.4 system-ui;padding:10px 16px;border-radius:999px;box-shadow:0 6px 22px #0005;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;white-space:nowrap}div.on{opacity:1;transform:none}</style><div role="status"></div>';document.documentElement.append(host)}const box=host.shadowRoot.querySelector('div');box.textContent=msg;requestAnimationFrame(()=>box.classList.add('on'));clearTimeout(toastTimer);toastTimer=setTimeout(()=>box.classList.remove('on'),2200)}
function ui(){if(!panel)return;panel.getElementById('append').checked=cfg.append;const box=panel.getElementById('box');box.classList.toggle('playing',active&&!paused);box.classList.toggle('paused',paused);phrase.textContent=items[at]?.text||'Selecione texto para iniciar.';progress.textContent=items.length?`Frase ${Math.min(at+1,items.length)} de ${items.length}`:'Aguardando texto';panel.getElementById('bar').style.width=items.length?`${Math.round(Math.min(at+1,items.length)*100/items.length)}%`:'0%';const play=paused||!active;button.innerHTML=play?icon.play:icon.pause;button.title=paused?'Continuar':play?'Ler':'Pausar';button.setAttribute('aria-label',button.title)}
function stop(){run++;clearTimeout(retryTimer);synth.cancel();items=[];at=0;block=null;active=false;paused=false;clear();ui();report()}
function speak(i,attempt=0){const id=++run;clearTimeout(retryTimer);synth.cancel();at=i;active=true;paused=false;widget();ui();report();const item=items[at];marker(item.range);scroll(item.range);const u=new SpeechSynthesisUtterance(item.text);let settled=false,startTimer;const retry=error=>{if(settled||run!==id)return;settled=true;clearTimeout(startTimer);if(attempt<2){progress.textContent=`A voz não iniciou. Tentando novamente (${attempt+1}/2)…`;retryTimer=setTimeout(()=>{if(run===id&&!paused)speak(i,attempt+1)},220);return}active=false;report();ui();progress.textContent='Erro de voz: '+error+'. Tente outra voz em Ajustes, no painel lateral.'};u.rate=cfg.rate;u.pitch=cfg.pitch;u.volume=cfg.volume;const v=synth.getVoices().find(v=>v.voiceURI===cfg.voiceURI)||synth.getVoices().find(v=>v.lang.toLowerCase()==='pt-br');if(v)u.voice=v;u.lang=v?.lang||'pt-BR';u.onstart=()=>{if(run===id)clearTimeout(startTimer)};u.onend=()=>{if(run!==id||settled)return;settled=true;clearTimeout(startTimer);if(at+1<items.length)speak(at+1);else{active=false;report();clear();ui();progress.textContent='Leitura concluída'}};u.onerror=e=>{if(run===id&&!['interrupted','canceled'].includes(e.error))retry(e.error)};startTimer=setTimeout(()=>retry('a síntese não iniciou'),1500);synth.speak(u)}
// "Continuar lendo" vale apenas para selecoes automaticas; atalhos e menus definem seu proprio modo.
function load(data,mode='auto'){let add=segments(data);if(mode==='single')add=add.slice(0,1);if(!add.length)return false;const text=data.text.trim(),append=mode==='append'||(mode==='auto'&&cfg.append);if(!append||!items.length){stop();items=add;block={text};speak(0);return true}
 // Ignora a mesma selecao repetida (ex.: automatico + Ctrl+C) e, se ela so foi estendida, acrescenta apenas o final novo.
 const flat=t=>t.replace(/\s+/g,'');if(block){if(flat(text)===flat(block.text)){ui();return true}if(text.startsWith(block.text)){const cut=data.text.length-data.text.trimStart().length+block.text.length;add=add.filter(x=>x.b>cut).map(x=>x.a>=cut?x:{text:data.text.slice(cut,x.b).trim(),range:range(data.nodes,cut,x.b),a:cut,b:x.b}).filter(x=>x.text)}}
 block={text};if(!add.length){ui();return true}const start=items.length;items.push(...add);toast(`✓ Adicionado à fila (+${add.length} ${add.length>1?'frases':'frase'})`);if(!active&&!paused)speak(start);else ui();return true}
function read(mode='auto'){const s=selection();if(!s){const field=document.activeElement;if(field&&/^(INPUT|TEXTAREA)$/.test(field.tagName)&&typeof field.selectionStart==='number'){const raw=field.value.slice(field.selectionStart,field.selectionEnd);if(raw.trim()){last={text:raw,nodes:[]};return load(last,mode)}}widget();phrase.textContent='Selecione um trecho na página antes de ler.';return false}last=s;return load(s,mode)}
// Reproduz texto entregue pela extensao, inclusive quando a selecao ja foi desfeita pelo menu.
function readExternal(text,mode='replace'){
 if(!text?.trim())return false;
 const raw=text.trim();
 // Usa os intervalos originais quando a copia coincide com a selecao.
 const selected=selection();
 const data=selected&&selected.text.trim()===raw?selected:{text:raw,nodes:[]};
 return load(data,mode);
}
// Reproduz o conteudo copiado, inclusive de input/textarea; sem limite fixo de caracteres.
function readCopied(text){return cfg.enabled&&readExternal(text,'auto')}
// O evento copy e disparado pelo gesto Ctrl+C ou menu Copiar em sites HTML comuns.
// O texto pode ser alterado por scripts da pagina, por isso se usa a selecao e,
// quando disponibilizado, o clipboardData depois da acao padrao.
document.addEventListener('copy',e=>{
 const el=document.activeElement;
 let selected='';
 if(el&&/^(INPUT|TEXTAREA)$/.test(el.tagName)&&typeof el.selectionStart==='number')selected=el.value.slice(el.selectionStart,el.selectionEnd);
 if(!selected)selected=window.getSelection()?.toString()||'';
 if(!selected.trim())return;
 // Aguarda o evento de copia terminar para evitar interferir no Ctrl+C.
 if(cfg.enabled){clearTimeout(copyTimer);copyTimer=setTimeout(()=>readCopied(selected),350)};
},false);
function toggle(){if(paused){synth.resume();paused=false;active=true}else if(active){synth.pause();paused=true}else if(items.length){speak(at);return}else{read();return}ui();report()}
function jump(n){if(items.length)speak(Math.max(0,Math.min(items.length-1,at+n)))}
function auto(){clearTimeout(timer);timer=setTimeout(()=>{if(cfg.enabled&&selection())read()},100)}
// Atalho capturado diretamente na pagina: o gesto do usuario facilita a reproducao em alguns navegadores.
// Alt+Shift+R substitui a fila; Alt+Shift+A acrescenta. O comando global usa a mesma ação em PDFs.
document.addEventListener('keydown',e=>{if(!e.altKey||!e.shiftKey||e.ctrlKey||e.metaKey||!['KeyR','KeyA'].includes(e.code)||e.repeat)return;e.preventDefault();if(e.code==='KeyR'){lastShortcut=Date.now();read('replace');return}if(Date.now()-lastAppendShortcut<300)return;lastAppendShortcut=Date.now();read('append');},true);
document.addEventListener('mouseup',e=>{if(!e.target?.closest?.('#leitor-livre-ui')){const t=selection();if(t)last=t;if(cfg.enabled)auto()}},true);document.addEventListener('keyup',e=>{if(cfg.enabled&&['Shift','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Home','End'].includes(e.key))auto()},true);
chrome.runtime.onMessage.addListener((m,_sender,reply)=>{if(m.type==='get-local-reading-state'){reply({active,paused});}else if(m.type==='shortcut-append'){clearTimeout(copyTimer);if(Date.now()-lastAppendShortcut<300)reply({handled:true});else{lastAppendShortcut=Date.now();reply({handled:read('append')})}}else if(m.type==='read-context-selection'||m.type==='append-context-selection'){const started=readExternal(m.text,m.type==='append-context-selection'?'append':'replace');reply({hasText:!!m.text?.trim(),started});}else if(m.type==='read-selection'||m.type==='read-selection-shortcut'){const hasText=!!selection();const allowed=cfg.enabled||m.type==='read-selection-shortcut';if(hasText&&allowed&&Date.now()-lastShortcut>650)read(m.type==='read-selection-shortcut'?'replace':'auto');reply({hasText,started:hasText&&allowed});}else if(m.type==='stop'){stop();reply({ok:true})}else if(m.type==='toggle-pause'){toggle();reply({ok:true})}return false});
chrome.storage.local.get(cfg).then(s=>{Object.assign(cfg,s);if(!cfg.enabled)clearTimeout(timer)});chrome.storage.onChanged.addListener((changes,area)=>{if(area!=='local')return;for(const [k,v]of Object.entries(changes))if(k in cfg)cfg[k]=v.newValue;ui();if(!cfg.enabled)clearTimeout(timer)});
})();
