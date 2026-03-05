$bucketName = "michicondrias-storage-1"
$configPath = "c:\desarrollos\michicondrias\scripts\aws\s3_cors_config.json"

Write-Host "--- Aplicando CORS Policy al Bucket S3: $bucketName ---"

if (Test-Path $configPath) {
    aws s3api put-bucket-cors --bucket $bucketName --cors-configuration "file://$configPath" --no-cli-pager
    if ($LASTEXITCODE -eq 0) {
        Write-Host "CORS Policy aplicada exitosamente a $bucketName."
    } else {
        Write-Host "Error al aplicar la política CORS. Verifica tus credenciales de AWS y que el bucket exista."
    }
} else {
    Write-Host "Error: No se encontró el archivo de configuración en $configPath"
}
