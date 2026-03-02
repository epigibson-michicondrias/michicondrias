$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$apiId = "kowly51wia"
$region = "us-east-1"
$accountId = (aws sts get-caller-identity --query Account --output text --no-cli-pager)

foreach ($service in $services) {
    $functionName = "michicondrias-$service"
    $statementId = "apigateway-access-$service"
    
    Write-Host "Arreglando permisos para $functionName..."
    
    # 1. Eliminar el permiso defectuoso
    aws lambda remove-permission --function-name $functionName --statement-id $statementId --no-cli-pager 2>$null | Out-Null
    
    # 2. Agregar el permiso correcto
    aws lambda add-permission `
        --function-name $functionName `
        --statement-id $statementId `
        --action lambda:InvokeFunction `
        --principal apigateway.amazonaws.com `
        --source-arn "arn:aws:execute-api:${region}:${accountId}:${apiId}/*/*" `
        --no-cli-pager | Out-Null
        
    Write-Host "Permiso de $functionName actualizado exitosamente."
}
