#!/usr/bin/env python3
"""
🔍 Diagnóstico de Problemas con Pantallas de Admin/KYC
Verifica si las APIs de moderación están funcionando correctamente
"""

import requests
import json
from datetime import datetime

# Configuración de la API Gateway
BASE_URL = "https://kowly51wia.execute-api.us-east-1.amazonaws.com"

def test_api_endpoint(service, endpoint, description):
    """🔍 Probar un endpoint específico"""
    print(f"\n🔍 Probando: {description}")
    print(f"   URL: {BASE_URL}/{service}/api/v1/{endpoint}")
    
    try:
        url = f"{BASE_URL}/{service}/api/v1/{endpoint}"
        headers = {
            "Content-Type": "application/json",
            # Not adding auth token for now to test public endpoints
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        
        print(f"   ✅ Status: {response.status_code}")
        print(f"   📊 Response time: {response.elapsed.total_seconds():.2f}s")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   📋 Data type: {type(data)}")
                print(f"   📊 Data length: {len(data) if isinstance(data, list) else 'N/A'}")
                
                if isinstance(data, list) and len(data) > 0:
                    print(f"   📄 Sample item keys: {list(data[0].keys()) if data else 'N/A'}")
                elif isinstance(data, dict):
                    print(f"   📄 Dict keys: {list(data.keys())}")
                
                return True
            except json.JSONDecodeError as e:
                print(f"   ❌ JSON Decode Error: {e}")
                print(f"   📄 Raw response: {response.text[:200]}...")
                return False
        else:
            print(f"   ❌ Error Response: {response.text[:200]}...")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Request Error: {e}")
        return False
    except Exception as e:
        print(f"   ❌ Unexpected Error: {e}")
        return False

def main():
    """🚀 Ejecutar diagnóstico completo"""
    print("🔍 DIAGNÓSTICO DE ADMIN/KYC APIS")
    print("=" * 60)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"📅 Timestamp: {datetime.now().isoformat()}")
    
    # Tests de endpoints de moderación
    tests = [
        # Moderación - Adopciones
        ("adopciones", "pets/admin/pending", "Adopciones Pendientes"),
        ("adopciones", "pets/admin/requests/pending", "Solicitudes de Adopción"),
        
        # Moderación - Perdidas
        ("perdidas", "reports/admin/pending", "Mascotas Perdidas Pendientes"),
        
        # Moderación - Directorio
        ("directorio", "clinics/admin/pending", "Clínicas Pendientes"),
        ("directorio", "veterinarians/admin/pending", "Veterinarios Pendientes"),
        
        # Moderación - Ecommerce
        ("ecommerce", "products/admin/pending", "Productos Pendientes"),
        
        # KYC - Verificaciones
        ("core", "users/pending-verifications", "Verificaciones KYC Pendientes"),
    ]
    
    results = []
    
    for service, endpoint, description in tests:
        success = test_api_endpoint(service, endpoint, description)
        results.append((description, success))
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE DIAGNÓSTICO")
    print("=" * 60)
    
    passed = 0
    for description, success in results:
        status = "✅ FUNCIONA" if success else "❌ FALLA"
        print(f"{status} {description}")
        if success:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{len(results)} endpoints funcionando")
    
    if passed == len(results):
        print("\n🎉 ¡TODAS LAS APIS FUNCIONAN!")
        print("\n💡 Si las pantallas siguen en gris, el problema podría ser:")
        print("   1. Problema de autenticación (token inválido)")
        print("   2. Problema de red en el dispositivo móvil")
        print("   3. Error en el código del frontend")
        print("   4. Caching de React Query")
    else:
        print(f"\n⚠️  {len(results) - passed} endpoints están fallando")
        print("\n💡 Posibles soluciones:")
        print("   1. Verificar que los servicios estén desplegados en AWS")
        print("   2. Revisar las URLs en el API Gateway")
        print("   3. Verificar configuración de CORS")
        print("   4. Revisar logs de AWS Lambda")
    
    return passed == len(results)

def test_with_auth():
    """🔑 Probar endpoints con autenticación si hay token"""
    print("\n🔑 PROBANDO CON AUTENTICACIÓN (si hay token)")
    print("-" * 40)
    
    # Aquí podríamos probar con un token real si lo tenemos
    # Por ahora, solo mostramos cómo se haría
    print("💡 Para probar con autenticación:")
    print("   1. Obtener un token válido de un usuario admin")
    print("   2. Agregar header: Authorization: Bearer <token>")
    print("   3. Volver a probar los endpoints")
    print("\n📱 En el móvil, el problema podría ser:")
    print("   - Token expirado o inválido")
    print("   - Error en el manejo del token")
    print("   - Problema con SecureStore")

if __name__ == "__main__":
    success = main()
    test_with_auth()
    
    print(f"\n🎯 Diagnóstico completado: {'ÉXITO' if success else 'HAY PROBLEMAS'}")
    print("\n📋 Próximos pasos recomendados:")
    print("   1. Revisar logs de AWS CloudWatch")
    print("   2. Probar las URLs directamente en navegador")
    print("   3. Verificar configuración de API Gateway")
    print("   4. Debuggear el frontend móvil")
