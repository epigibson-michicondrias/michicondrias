$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")

Write-Host "Iniciando actualización de timeout en AWS Lambda..."

foreach ($service in $services) {
    Write-Host "`nActualizando función: michicondrias-$service"
    
    aws lambda update-function-configuration `
        --function-name "michicondrias-$service" `
        --timeout 15 `
        --no-cli-pager | Out-Null
        
    Write-Host "Timeout ampliado a 15 segundos con éxito."
}

Write-Host "`nTodos los Lambdas ahora tienen un timeout de 15 segundos."
