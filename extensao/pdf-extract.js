/* Leitor PDF local simples: streams Flate/ASCII85 e comandos Tj/TJ.
 * Não substitui PDF.js: fontes CID/ToUnicode complexas e imagens requerem outro extrator. */
async function extractPDF(data){
  const latin=new TextDecoder('latin1');
  const raw=latin.decode(data);
  if(!raw.startsWith('%PDF-'))throw Error('O arquivo selecionado não é um PDF.');
  function ascii85(buf){
    const str=latin.decode(buf).replace(/^\s*<~/,'').split('~>')[0];let group=[],out=[];
    for(const c of str){if(/\s/.test(c))continue;if(c==='z'&&!group.length){out.push(0,0,0,0);continue}const v=c.charCodeAt(0)-33;if(v<0||v>84)continue;group.push(v);if(group.length===5){let n=group.reduce((a,v)=>a*85+v,0);out.push(n>>>24&255,n>>>16&255,n>>>8&255,n&255);group=[]}}
    if(group.length>1){const k=group.length;while(group.length<5)group.push(84);let n=group.reduce((a,v)=>a*85+v,0);for(let i=0;i<k-1;i++)out.push(n>>>(24-8*i)&255)}return new Uint8Array(out)
  }
  function pdfString(token){
    if(token[0]==='<'){const digits=token.slice(1,-1).replace(/\s/g,'');const chars=new Uint8Array((digits.match(/.{1,2}/g)||[]).map(s=>parseInt(s.padEnd(2,'0'),16)));if(chars[0]===0xfe&&chars[1]===0xff){try{return new TextDecoder('utf-16be').decode(chars.slice(2))}catch{}}return latin.decode(chars)}
    let s=token.slice(1,-1),out='';for(let i=0;i<s.length;i++){if(s[i]!=='\\'){out+=s[i];continue}const c=s[++i];if(c===undefined)break;if(c==='\r'||c==='\n'){if(c==='\r'&&s[i+1]==='\n')i++;continue}if(/[0-7]/.test(c)){let digits=c;for(let j=0;j<2&&/[0-7]/.test(s[i+1]||'');j++)digits+=s[++i];out+=String.fromCharCode(parseInt(digits,8));continue}out+=({n:'\n',r:'\r',t:'\t',b:'\b',f:'\f'}[c]||c)}return out
  }
  const results=[];const streamPattern=/\bstream(?:\r\n|\n|\r)/g;let m,seen=0;
  while((m=streamPattern.exec(raw))!==null){
    if(++seen>20000)break;
    const begin=m.index+m[0].length,end=raw.indexOf('endstream',begin);if(end<0)continue;
    const dict=raw.slice(Math.max(0,m.index-3500),m.index);const lastDict=dict.lastIndexOf('<<');const header=lastDict>=0?dict.slice(lastDict):dict;
    let bin=data.slice(begin,end);while(bin.length&&(bin.at(-1)===10||bin.at(-1)===13))bin=bin.slice(0,-1);
    const filters=(header.match(/\/(ASCII85Decode|FlateDecode|ASCIIHexDecode|LZWDecode|DCTDecode|JPXDecode)/g)||[]).map(x=>x.slice(1));
    try{
      for(const filter of filters){if(filter==='ASCII85Decode'){bin=ascii85(bin)}else if(filter==='FlateDecode'){
          const ds=new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate'));bin=new Uint8Array(await new Response(ds).arrayBuffer());
        }else throw Error('Filtro não implementado')}
    }catch{streamPattern.lastIndex=end+9;continue}
    const decoded=latin.decode(bin);const bt=/\bBT\b([\s\S]*?)\bET\b/g;let textBlock;
    while((textBlock=bt.exec(decoded))!==null){const block=textBlock[1];let matches=[];const draw=/(\((?:\\[\s\S]|[^\\)])*\)|<[A-Fa-f\d\s]+>)\s*Tj|\[([\s\S]*?)\]\s*TJ|(?:T\*|T[dD]|\bTm\b)/g;let command;
      while((command=draw.exec(block))!==null){if(command[1])matches.push(pdfString(command[1]));else if(command[2]){const tokens=command[2].match(/\((?:\\[\s\S]|[^\\)])*\)|<[A-Fa-f\d\s]+>/g)||[];matches.push(tokens.map(pdfString).join(''))}else if(matches.length)matches.push(' ')}
      let text=matches.join('').replace(/\s+/g,' ').trim();if(text)results.push(text)
    }
    streamPattern.lastIndex=end+9;
  }
  return results.join('\n').trim();
}
