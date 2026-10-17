param([Parameter(Mandatory=$true)][string]$ExtensionId)
$ErrorActionPreference='Stop'
if ($ExtensionId -notmatch '^[a-p]{32}$') { throw 'ID de extensao invalido' }
$dir=Join-Path $env:LOCALAPPDATA 'LeitorLivre'
New-Item -ItemType Directory -Force $dir | Out-Null
$src=@'
using System;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;
using System.Collections.Generic;
using System.Diagnostics;
using System.Speech.Synthesis;
public class Program {
 static void Reply(object o) { var x=Encoding.UTF8.GetBytes(new JavaScriptSerializer().Serialize(o));var stdout=Console.OpenStandardOutput();var len=BitConverter.GetBytes(x.Length);stdout.Write(len,0,4);stdout.Write(x,0,x.Length);stdout.Flush(); }
 static void Main(){try{
 var input=Console.OpenStandardInput();byte[] h=new byte[4];if(input.Read(h,0,4)!=4)return;int n=BitConverter.ToInt32(h,0);if(n<1||n>1500000)throw new Exception("Mensagem muito grande");byte[] buf=new byte[n];int pos=0;while(pos<n){int got=input.Read(buf,pos,n-pos);if(got<=0)throw new Exception("Mensagem incompleta");pos+=got;}
 var req=new JavaScriptSerializer().Deserialize<Dictionary<string,object>>(Encoding.UTF8.GetString(buf));string act=req.ContainsKey("action") ? Convert.ToString(req["action"]) : "";if(act=="check"){Reply(new {ok=true,platform="Windows",wav=true,mp3=File.Exists(Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),"ffmpeg.exe"))});return;}
 if(act!="export_audio" && act!="export_mp3")throw new Exception("Comando desconhecido");string txt=req.ContainsKey("text") ? Convert.ToString(req["text"]) : "";if(String.IsNullOrWhiteSpace(txt)||Encoding.UTF8.GetByteCount(txt)>900000)throw new Exception("Texto vazio ou acima de 900 KB");
 string name=req.ContainsKey("name")?Convert.ToString(req["name"]):"leitura";foreach(char c in Path.GetInvalidFileNameChars())name=name.Replace(c,'_');if(name.Length>55)name=name.Substring(0,55);if(String.IsNullOrWhiteSpace(name))name="leitura";
 string format=req.ContainsKey("format") ? Convert.ToString(req["format"]) : "mp3";if(format!="wav" && format!="mp3")throw new Exception("Formato inválido");string downloads=Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),"Downloads");Directory.CreateDirectory(downloads);string output=Path.Combine(downloads,name+"."+format);int index=2;while(File.Exists(output))output=Path.Combine(downloads,name+"-"+(index++)+"."+format);
 string wav=Path.Combine(Path.GetTempPath(),Guid.NewGuid().ToString("N")+".wav");
 try {using(var v=new SpeechSynthesizer()){v.SetOutputToWaveFile(wav);v.Speak(txt);v.SetOutputToNull();}if(format=="wav"){File.Move(wav,output);}else{var pr=new Process();pr.StartInfo.FileName="ffmpeg.exe";pr.StartInfo.Arguments="-nostdin -hide_banner -loglevel error -y -i \""+wav+"\" -codec:a libmp3lame -qscale:a 4 \""+output+"\"";pr.StartInfo.CreateNoWindow=true;pr.StartInfo.UseShellExecute=false;pr.StartInfo.RedirectStandardError=true;pr.Start();string err=pr.StandardError.ReadToEnd();pr.WaitForExit(300000);if(pr.ExitCode!=0)throw new Exception("FFmpeg: "+err.Substring(0,Math.Min(err.Length,150)));}}
 finally {if(File.Exists(wav))File.Delete(wav);}
 Reply(new {ok=true,filename=Path.GetFileName(output),location="Downloads",format=format});
 }catch(Exception e){Reply(new {ok=false,error=e.Message});}}
}
'@
$exe=Join-Path $dir 'LeitorLivreHost.exe'
Add-Type -TypeDefinition $src -ReferencedAssemblies @('System.dll','System.Core.dll','System.Web.Extensions.dll','System.Speech.dll') -OutputAssembly $exe -OutputType ConsoleApplication
$manifest=Join-Path $dir 'br.leitorlivre.exporter.json'
@{name='br.leitorlivre.exporter';description='Leitor Livre conversor MP3';path=$exe;type='stdio';allowed_origins=@("chrome-extension://$ExtensionId/")} | ConvertTo-Json -Depth 5 | Set-Content -Encoding UTF8 $manifest
foreach($browser in @('Google\Chrome','Chromium','Microsoft\Edge')){
 $key="HKCU:\Software\$browser\NativeMessagingHosts\br.leitorlivre.exporter"
 New-Item -Path $key -Force | Out-Null
 Set-Item -Path $key -Value $manifest
}
Write-Output 'Integracao Leitor Livre instalada. Reinicie o navegador.'
