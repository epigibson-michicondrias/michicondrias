$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")

foreach ($service in $services) {
    $filePath = "c:\desarrollos\michicondrias\backend\michicondrias_$service\app\main.py"
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Replace the hardcoded localhost origins with the updated wildcard or vercel string
        $oldOrigins = 'allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"]'
        $newOrigins = 'allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "https://michicondrias.vercel.app"]'
        
        if ($content -match 'allow_origins=\["http://localhost:3000", "http://127.0.0.1:3000"\]') {
            $content = $content -replace [regex]::Escape($oldOrigins), $newOrigins
            Set-Content -Path $filePath -Value $content -Encoding UTF8
            Write-Host "CORS actualizado en $service"
        } else {
            Write-Host "No se requirió cambio o formato distinto en $service"
        }
    }
}
