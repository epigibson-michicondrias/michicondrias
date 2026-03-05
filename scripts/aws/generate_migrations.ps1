$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$neonUrl = "postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

Write-Host "Generando y aplicando migraciones faltantes en Neon..."
$env:DATABASE_URL = $neonUrl

foreach ($service in $services) {
    $serviceDir = "c:\desarrollos\michicondrias\backend\michicondrias_$service"
    if (Test-Path $serviceDir) {
        Set-Location $serviceDir
        Write-Host "`nPROCESANDO: $service"
        
        # Generar nueva migración con autogenerate detectando diferencias entre SQLAlchemy models y la BD Neon
        & "c:\desarrollos\michicondrias\backend\michicondrias_core\venv\Scripts\python.exe" -m alembic revision --autogenerate -m "Sync schema updates"
        
        # Aplicar la nueva migración
        & "c:\desarrollos\michicondrias\backend\michicondrias_core\venv\Scripts\python.exe" -m alembic upgrade head
    }
}

Set-Location c:\desarrollos\michicondrias
Write-Host "`nSincronización terminada."
