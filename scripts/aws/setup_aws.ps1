$services = @("core", "adopciones", "mascotas", "perdidas", "carnet", "directorio", "ecommerce")
$roleName = "michicondrias-lambda-ex"
$region = "us-east-1"

# 1. Crear el Trust Policy
$trustPolicy = '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
$trustPolicyFile = Join-Path $env:TEMP "trust-policy.json"
$trustPolicy | Out-File -FilePath $trustPolicyFile -Encoding ASCII

# 2. Crear el Role
Write-Host "--- Verificando Role de IAM: $roleName ---"
aws iam get-role --role-name $roleName --no-cli-pager 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "El role no existe. Creando..."
    aws iam create-role --role-name $roleName --assume-role-policy-document "file://$trustPolicyFile" --no-cli-pager
    aws iam attach-role-policy --role-name $roleName --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole" --no-cli-pager
    aws iam attach-role-policy --role-name $roleName --policy-arn "arn:aws:iam::aws:policy/AmazonS3FullAccess" --no-cli-pager
    Write-Host "Role creado. Esperando propagación (15s)..."
    Start-Sleep -Seconds 15
} else {
    Write-Host "El role ya existe."
}

$roleArn = (aws iam get-role --role-name $roleName --no-cli-pager | ConvertFrom-Json).Role.Arn

# 3. Preparar código dummy
$dummyCode = "def handler(event, context): return {'statusCode': 200, 'body': 'Initial Placeholder'}"
$dummyFile = Join-Path $env:TEMP "lambda_function.py"
$dummyFileZip = Join-Path $env:TEMP "dummy.zip"
$dummyCode | Out-File -FilePath $dummyFile -Encoding ASCII
if (Test-Path $dummyFileZip) { Remove-Item $dummyFileZip }
Compress-Archive -Path $dummyFile -DestinationPath $dummyFileZip

# 4. Crear las Lambdas
foreach ($service in $services) {
    $functionName = "michicondrias-$service"
    Write-Host "--- Procesando Función: $functionName ---"
    
    aws lambda get-function --function-name $functionName --no-cli-pager 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "La función no existe. Creando..."
        aws lambda create-function `
            --function-name $functionName `
            --runtime python3.11 `
            --role $roleArn `
            --handler app.main.handler `
            --zip-file "fileb://$dummyFileZip" `
            --region $region `
            --no-cli-pager
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Función $functionName creada exitosamente."
        } else {
            Write-Host "Error al crear la función $functionName."
        }
    } else {
        Write-Host "La función $functionName ya existe."
    }
}
Write-Host "--- Proceso completado ---"
