$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$neonUrl = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Iniciando migración a Neon Serverless Postgres..."
Write-Host "Usando URL: $neonUrl"

$env:DATABASE_URL = $neonUrl

foreach ($service in $services) {
    $serviceDir = "c:\desarrollos\michicondrias\backend\michicondrias_$service"
    if (Test-Path $serviceDir) {
        Set-Location $serviceDir
        Write-Host "`nMIGRANDO: $service"
        # Usamos el venv de core que garantizamos tiene alembic y todos los drivers
        & "c:\desarrollos\michicondrias\backend\michicondrias_core\venv\Scripts\python.exe" -m alembic upgrade head
    }
}

Set-Location c:\desarrollos\michicondrias
Write-Host "`nMigraciones terminadas."
