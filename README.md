# Leitor Livre 1.0 — Extensão edge/chrome

Baseado na versão 1.0 (configuração MP3 Chrome/Edge, PDF e texto).

- **Sites normais**: selecione com leitura automática ativa, ou pressione Alt+Shift+R no modo manual. Surge um **popup flutuante na própria página**, independente do painel lateral, com frase atual, botões anterior, pausar e próximo; destaque e rolagem do documento quando o navegador suporta a Highlight API.
- **Painel lateral**: controles anterior/próximo, progresso visual, frase corrente, leitura/pausa/parada e configurações de voz. Anterior/próximo percorrem trechos, não segundos exatos.
- **PDFs**: preserva a rotina de importação de texto da versão 1.0. Não faz OCR.
- **Ouvir depois**: exporta **WAV** gratuitamente com o sintetizador instalado no computador; é o padrão e não exige FFmpeg. MP3 também é gratuito, mas requer FFmpeg instalado. Em ambos os casos, o texto fica local.

## Limite importante das vozes do navegador

As vozes disponíveis em “Personalizar leitura” usam `speechSynthesis`. Chrome e Edge permitem reproduzi-las, mas não expõem o áudio gerado para uma extensão salvar em WAV ou MP3. Por isso, o arquivo exportado usa uma voz local do sistema (eSpeak no Linux ou `System.Speech` no Windows). Não é uma falha da extensão nem algo que permissões extras possam resolver.

## Preparar a exportação local

No Linux, instale `python3` e `espeak` e, na pasta extraída deste projeto, execute `bash integracao/instalar.sh ID_DA_EXTENSAO`. O ID aparece no próprio painel, em “Configurar exportação”. Instale também `ffmpeg` somente se quiser MP3. Depois, feche completamente e reabra o navegador.

No Windows, execute `integracao/windows-instalar.ps1` no PowerShell com o ID da extensão. WAV funciona sem FFmpeg; para MP3, instale FFmpeg.

## Atualizar
Extraia o ZIP. Em chrome://extensions ou edge://extensions, remova ou desative a versão anterior. Ative modo do desenvolvedor > Carregar sem compactação > escolha `./extensao`. Recarregue as páginas já abertas.

A funcionalidade no navegador ainda precisa ser testada em Chrome/Edge reais; as verificações incluídas são de sintaxe e integridade de arquivos.
