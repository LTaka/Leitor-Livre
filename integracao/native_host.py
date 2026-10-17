#!/usr/bin/env python3
import json,struct,sys,subprocess,tempfile,shutil
from pathlib import Path

def answer(value):
    raw=json.dumps(value,ensure_ascii=False).encode('utf-8')
    sys.stdout.buffer.write(struct.pack('<I',len(raw))+raw)
    sys.stdout.buffer.flush()

def main():
    header=sys.stdin.buffer.read(4)
    if len(header)!=4:return
    size=struct.unpack('<I',header)[0]
    if not 0<size<=1500000:raise ValueError('Solicitação muito grande')
    msg=json.loads(sys.stdin.buffer.read(size))
    if msg.get('action')=='check':
        answer({'ok':True,'wav':True,'mp3':shutil.which('ffmpeg') is not None})
        return
    if msg.get('action') not in ('export_audio','export_mp3'):raise ValueError('Comando inválido')
    text=msg.get('text','')
    if not isinstance(text,str) or not text.strip() or len(text.encode('utf-8'))>900000:raise ValueError('Texto inválido ou maior que 900 KB')
    title=msg.get('name','leitura')
    if not isinstance(title,str):title='leitura'
    name=''.join(c if (c.isascii() and (c.isalnum() or c in '-_')) else '_' for c in title)[:70].strip('_') or 'leitura'
    dl=Path.home()/'Downloads'
    try:
        p=subprocess.run(['xdg-user-dir','DOWNLOAD'],capture_output=True,text=True,timeout=2)
        if p.returncode==0 and p.stdout.strip():dl=Path(p.stdout.strip())
    except (OSError,subprocess.TimeoutExpired):pass
    audio_format=msg.get('format','mp3' if msg.get('action')=='export_mp3' else 'wav')
    if audio_format not in ('wav','mp3'):raise ValueError('Formato de áudio inválido')
    if audio_format=='mp3' and not shutil.which('ffmpeg'):
        raise ValueError('Para MP3, instale o FFmpeg. Ou escolha WAV, que não precisa dele.')
    dl.mkdir(parents=True,exist_ok=True)
    path=dl/(name+'.'+audio_format);j=2
    while path.exists():path=dl/(f'{name}-{j}.{audio_format}');j+=1
    with tempfile.TemporaryDirectory() as tmp:
        src=Path(tmp)/'input.txt';wav=Path(tmp)/'audio.wav'
        src.write_text(text,encoding='utf-8')
        subprocess.run(['espeak','-v','pt-br','-s','165','-f',str(src),'-w',str(wav)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=300)
        if audio_format=='wav':
            wav.replace(path)
        else:
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(wav),'-codec:a','libmp3lame','-qscale:a','4',str(path)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE,timeout=300)
    answer({'ok':True,'filename':path.name,'location':'Downloads','format':audio_format})

if __name__=='__main__':
    try:main()
    except Exception as e:answer({'ok':False,'error':str(e)[:250]})
