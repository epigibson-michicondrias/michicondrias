$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$apiName = "Michicondrias-API"
$region = "us-east-1"
$accountId = (aws sts get-caller-identity --query Account --output text --no-cli-pager)

Write-Host "--- Verificando API Gateway: $apiName ---"
$api = aws apigatewayv2 get-apis --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty Items | Where-Object { $_.Name -eq $apiName }

if ($null -eq $api) {
    Write-Host "La API no existe. Creando..."
    $api = aws apigatewayv2 create-api --name $apiName --protocol-type HTTP --no-cli-pager | ConvertFrom-Json
    Write-Host "API creada con ID: $($api.ApiId)"
    
    Write-Host "Creando Stage `$default` con auto-deploy..."
    aws apigatewayv2 create-stage --api-id $($api.ApiId) --stage-name "`$default" --auto-deploy --no-cli-pager | Out-Null
} else {
    Write-Host "La API ya existe con ID: $($api.ApiId)"
    # Verificar si el stage existe, si no, crearlo
    $stage = aws apigatewayv2 get-stages --api-id $($api.ApiId) --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty Items | Where-Object { $_.StageName -eq "`$default" }
    if ($null -eq $stage) {
        Write-Host "Creando Stage `$default` faltante..."
        aws apigatewayv2 create-stage --api-id $($api.ApiId) --stage-name "`$default" --auto-deploy --no-cli-pager | Out-Null
    }
}

$apiId = $api.ApiId
$apiEndpoint = $api.ApiEndpoint

foreach ($service in $services) {
    $functionName = "michicondrias-$service"
    $lambdaArn = "arn:aws:lambda:${region}:${accountId}:function:$functionName"
    
    Write-Host "--- Configurando Integración para: $service ---"
    
    # 1. Integración
    $integration = aws apigatewayv2 get-integrations --api-id $apiId --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty Items | Where-Object { $_.IntegrationUri -eq $lambdaArn }
    if ($null -eq $integration) {
        $integration = aws apigatewayv2 create-integration --api-id $apiId --integration-type AWS_PROXY --integration-uri $lambdaArn --payload-format-version "2.0" --no-cli-pager | ConvertFrom-Json
    }
    $integrationId = $integration.IntegrationId

    # 2. Rutas (Proxy, Root, y Root con Slash)
    $routeKeys = @("ANY /$service/{proxy+}", "ANY /$service", "ANY /$service/")
    
    foreach ($routeKey in $routeKeys) {
        $route = aws apigatewayv2 get-routes --api-id $apiId --no-cli-pager | ConvertFrom-Json | Select-Object -ExpandProperty Items | Where-Object { $_.RouteKey -eq $routeKey }
        
        if ($null -eq $route) {
            aws apigatewayv2 create-route --api-id $apiId --route-key $routeKey --target "integrations/$integrationId" --no-cli-pager | Out-Null
            Write-Host "Ruta $routeKey creada."
        } else {
            Write-Host "Ruta $routeKey ya existe."
        }
    }

    # 3. Permisos
    aws lambda get-policy --function-name $functionName --no-cli-pager 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        & cmd /c "aws lambda add-permission --function-name $functionName --statement-id apigateway-access-$service --action lambda:InvokeFunction --principal apigateway.amazonaws.com --source-arn arn:aws:execute-api:${region}:${accountId}:${apiId}/*/* --no-cli-pager 2>nul"
    }
}

Write-Host "`n--- Configuración Completada ---"
Write-Host "Base URL: $apiEndpoint"
foreach ($service in $services) {
    Write-Host "- ${service}: ${apiEndpoint}/${service}/"
}
