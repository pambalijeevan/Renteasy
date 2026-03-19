param([string]$RootPath = "c:\Users\lcfma\Downloads\Renteasy\public", [int]$Port = 8000)
Add-Type -AssemblyName System.Web
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $RootPath on http://localhost:$Port/"
while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
    $reqPath = [System.Web.HttpUtility]::UrlDecode($ctx.Request.Url.AbsolutePath)
    if ([string]::IsNullOrWhiteSpace($reqPath) -or $reqPath -eq '/') { $reqPath = '/index.html' }
    $safePath = $reqPath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
    $fullPath = Join-Path $RootPath $safePath
    $rootFull = [IO.Path]::GetFullPath($RootPath)
    $fileFull = [IO.Path]::GetFullPath($fullPath)
    if (-not $fileFull.StartsWith($rootFull)) {
      $ctx.Response.StatusCode = 403
      $ctx.Response.Close()
      continue
    }
    if (-not (Test-Path $fileFull -PathType Leaf)) {
      $ctx.Response.StatusCode = 404
      $ctx.Response.Close()
      continue
    }
    switch ([IO.Path]::GetExtension($fileFull).ToLowerInvariant()) {
      '.html' { $ct = 'text/html; charset=utf-8' }
      '.css'  { $ct = 'text/css; charset=utf-8' }
      '.js'   { $ct = 'application/javascript; charset=utf-8' }
      '.json' { $ct = 'application/json; charset=utf-8' }
      '.png'  { $ct = 'image/png' }
      '.jpg'  { $ct = 'image/jpeg' }
      '.jpeg' { $ct = 'image/jpeg' }
      '.svg'  { $ct = 'image/svg+xml' }
      '.ico'  { $ct = 'image/x-icon' }
      default { $ct = 'application/octet-stream' }
    }
    $bytes = [IO.File]::ReadAllBytes($fileFull)
    $ctx.Response.ContentType = $ct
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.OutputStream.Close()
  } catch {
    try { $ctx.Response.StatusCode = 500; $ctx.Response.Close() } catch {}
  }
}
