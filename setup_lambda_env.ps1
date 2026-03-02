$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")

foreach ($service in $services) {
    $functionName = "michicondrias-$service"
    $prefix = "/$service"
    
    Write-Host "Configurando PROXY_PREFIX=$prefix para $functionName..."
    
    # Obtener variables actuales para combinarlas si existen
    $currentConfig = aws lambda get-function-configuration --function-name $functionName --no-cli-pager | ConvertFrom-Json
    $vars = @{}
    if ($currentConfig.Environment -and $currentConfig.Environment.Variables) {
        $vars = $currentConfig.Environment.Variables
    }
    
    # Agregar/Actualizar PROXY_PREFIX
    $vars.PROXY_PREFIX = $prefix
    
    # Convertir a formato key1=val1,key2=val2
    $varStrings = @()
    foreach ($key in $vars.Keys) {
        $varStrings += "$key=$($vars[$key])"
    }
    $varString = $varStrings -join ","
    
    aws lambda update-function-configuration `
        --function-name $functionName `
        --environment "Variables={$varString}" `
        --no-cli-pager | Out-Null
}

Write-Host "Configuración completada exitosamente."
