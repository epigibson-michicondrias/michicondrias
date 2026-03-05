---
sidebar_position: 5
---

# Paso 4: CI/CD con GitHub Actions

El pipeline de CI/CD automatiza el proceso de empaquetar código Python, subirlo a S3, y actualizar la función Lambda. Se ejecuta en **cada push a `main`**.

## El archivo: `deploy-backend.yml`

Ubicación: `.github/workflows/deploy-backend.yml`

A continuación explicamos **cada sección** del pipeline:

## 1. Trigger

```yaml
name: Deploy Backend to AWS Lambda

on:
  push:
    branches: [ main ]
```

**¿Por qué solo `main`?** Para evitar que un push a una branch de feature/desarrollo dispare un deploy a producción. Solo código revisado y mergeado se despliega.

## 2. Matrix Strategy

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        service: [core, adopciones, mascotas, perdidas, carnet, 
                  directorio, ecommerce, paseadores, cuidadores]
```

La **matrix strategy** ejecuta el mismo job **9 veces en paralelo**, una por cada servicio. Así cada servicio se empaqueta y despliega independientemente.

### ¿Por qué no un solo ZIP con todo?

Cada Lambda es un servicio aislado con sus propias dependencias. Si las empaquetáramos juntas:
- El ZIP sería enorme y excedería el límite de S3 (250 MB)
- Un bug en un servicio tumbaría todos los demás
- No podríamos escalar servicios individualmente

## 3. Verificar credenciales

```yaml
    - name: Debug Secrets (Check if set)
      run: |
        if [ -z "${{ secrets.AWS_ACCESS_KEY_ID }}" ]; then
          echo "Error: AWS_ACCESS_KEY_ID is NOT set in GitHub Secrets"
          exit 1
        fi
```

**Step de seguridad** que verifica que los GitHub Secrets estén configurados antes de intentar el deploy. Sin esto, el pipeline fallaría silenciosamente en pasos posteriores con errores crípticos de AWS.

## 4. Autenticación AWS

```yaml
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
```

Configura las credenciales IAM para que todos los comandos `aws` del pipeline tengan permisos para subir a S3 y actualizar Lambdas.

:::tip GitHub Secrets
Las credenciales se almacenan en **Settings → Secrets and variables → Actions** del repositorio. Nunca las pongas directamente en el `.yml`.
:::

## 5. Instalar dependencias (Docker Build)

```yaml
    - name: Install dependencies and Package
      run: |
        cd backend/michicondrias_${{ matrix.service }}
        docker run --rm \
          -v ${{ github.workspace }}/backend/michicondrias_${{ matrix.service }}:/var/task \
          public.ecr.aws/sam/build-python3.11 \
          pip install -r requirements.txt -t .
        zip -r ../../${{ matrix.service }}.zip .
```

### ¿Por qué Docker aquí? — El problema de GLIBC

Este es el paso **más importante** y donde la mayoría de deploys fallan.

Las dependencias como `psycopg2-binary` tienen código compilado en **C**. Si haces `pip install` en Ubuntu (GitHub Actions), compilará para `glibc 2.35`. Pero Lambda usa **Amazon Linux 2** que tiene `glibc 2.26`.

**Resultado sin Docker:**
```
ImportError: /lib64/libc.so.6: version 'GLIBC_2.28' not found
```

**Solución:** usar la imagen `public.ecr.aws/sam/build-python3.11` que **ES Amazon Linux 2** con Python 3.11. Las dependencias se compilan para el ambiente correcto de Lambda.

### ¿Qué hace cada flag?

```bash
docker run --rm \                      # Eliminar container al terminar
  -v <workspace>:/var/task \           # Montar el código del servicio
  public.ecr.aws/sam/build-python3.11  # Imagen de Amazon Linux
  pip install -r requirements.txt -t . # Instalar deps EN el directorio del servicio

zip -r ../../$service.zip .            # Comprimir todo (código + deps)
```

## 6. Subir a S3

```yaml
    - name: Upload to S3
      run: |
        aws s3 cp ${{ matrix.service }}.zip \
          s3://michicondrias-storage-1/deployments/${{ matrix.service }}.zip
```

### ¿Por qué S3 en lugar de upload directo a Lambda?

Lambda tiene dos límites de tamaño:
- **50 MB** para upload directo via API
- **250 MB** para código cargado desde S3

Nuestros ZIPs fácilmente superan los 50 MB por las dependencias de Python (SQLAlchemy, boto3, pydantic, etc.), así que **siempre usamos S3**.

## 7. Actualizar Lambda

```yaml
    - name: Deploy to AWS Lambda (via S3)
      run: |
        aws lambda update-function-code \
          --function-name michicondrias-${{ matrix.service }} \
          --s3-bucket michicondrias-storage-1 \
          --s3-key deployments/${{ matrix.service }}.zip
```

`update-function-code` reemplaza el código de la Lambda con el ZIP nuevo de S3. La función Lambda ya debe existir previamente (la creamos en el [Paso 1](./02-crear-lambda.md)).

:::info Para agregar un nuevo servicio al pipeline
Solo necesitas agregar el nombre a la lista `matrix.service`:
```yaml
service: [core, adopciones, mascotas, ..., nuevo_servicio]
```
Y asegurarte de que la Lambda `michicondrias-nuevo_servicio` ya exista en AWS.
:::
