# Servidor local do Dead Bunker: entrega os arquivos desta pasta em http://localhost e abre o navegador.
$root = (Split-Path -Parent $MyInvocation.MyCommand.Path).TrimEnd('\') + '\'
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript'; '.json'='application/json'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.png'='image/png'; '.mp3'='audio/mpeg'; '.css'='text/css' }
$l = $null
foreach ($port in 8777..8790) {
  $try = New-Object System.Net.HttpListener
  $try.Prefixes.Add("http://localhost:$port/")
  try { $try.Start(); $l = $try; break } catch { }
}
if (-not $l) { Write-Host 'Nao consegui abrir uma porta local (8777-8790).'; Read-Host 'Enter para sair'; exit }
$url = "http://localhost:$port/index.html"
Write-Host ''
Write-Host '  BUNKER DOS MORTOS'
Write-Host "  Rodando em $url"
Write-Host '  Deixe esta janela aberta enquanto joga. Feche-a para encerrar.'
Write-Host ''
Start-Process $url
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq '') { $p = 'index.html' }
    $f = [IO.Path]::GetFullPath((Join-Path $root $p))
    if ($f.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $f -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($f); $e = [IO.Path]::GetExtension($f).ToLower()
      $t = $types[$e]; if (-not $t) { $t = 'application/octet-stream' }
      $c.Response.ContentType = $t; $c.Response.ContentLength64 = $b.Length
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { } finally { try { $c.Response.Close() } catch { } }
}
