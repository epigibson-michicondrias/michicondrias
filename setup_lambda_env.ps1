$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$neonUrl = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Iniciando configuración de variables de entorno (incluye DATABASE_URL) en AWS Lambda..."

foreach ($service in $services) {
    Write-Host "`nActualizando función: michicondrias-$service"
    
    $envObj = @{
        Variables = @{
            PROXY_PREFIX = "/$service"
            DATABASE_URL = $neonUrl
        }
    }
    
    $envPath = "c:\desarrollos\michicondrias\env_$service.json"
    $envObj | ConvertTo-Json -Depth 5 -Compress | Set-Content -Path $envPath -Encoding Ascii
    
    aws lambda update-function-configuration `
        --function-name "michicondrias-$service" `
        --environment "file://$envPath" `
        --no-cli-pager | Out-Null
        
    Remove-Item $envPath
    Write-Host "Variables inyectadas con éxito."
}

Write-Host "`nTodas las Lambdas ahora apuntan a Neon Serverless Postgres."
