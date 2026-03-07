#!/usr/bin/env python3
"""
🔍 Test de APIs con URLs corregidas
"""

import requests
import json

# Configuración con URLs corregidas
BASE_URL = "https://kowly51wia.execute-api.us-east-1.amazonaws.com"

def test_corrected_urls():
    """🔍 Probar URLs corregidas"""
    print("🔍 PROBANDO URLs CORREGIDAS")
    print("=" * 60)
    
    # Tests con URLs corregidas
    tests = [
        # Adopciones - URLs corregidas
        ("adopciones", "/api/v1/pets/admin/pending", "Adopciones Pendientes"),
        ("adopciones", "/api/v1/pets/admin/requests/pending", "Solicitudes de Adopción"),
        
        # Directorio - URLs corregidas (necesitaríamos verificar los endpoints exactos)
        ("directorio", "/api/v1/clinics/admin/pending", "Clínicas Pendientes"),
        ("directorio", "/api/v1/veterinarians/admin/pending", "Veterinarios Pendientes"),
        
        # Ecommerce
        ("ecommerce", "/api/v1/products/admin/pending", "Productos Pendientes"),
        
        # Perdidas
        ("perdidas", "/api/v1/reports/admin/pending", "Mascotas Perdidas Pendientes"),
        
        # Core/KYC
        ("core", "/api/v1/users/pending-verifications", "Verificaciones KYC"),
    ]
    
    results = []
    
    for service, endpoint, description in tests:
        print(f"\n🔍 Probando: {description}")
        print(f"   URL: {BASE_URL}/{service}{endpoint}")
        
        try:
            url = f"{BASE_URL}/{service}{endpoint}"
            headers = {
                "Content-Type": "application/json",
                # Sin token para probar si el endpoint existe
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            
            print(f"   ✅ Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   📊 Data: {len(data) if isinstance(data, list) else 'object'} items")
                except:
                    print(f"   📊 Data: Response received")
                results.append((description, True))
            elif response.status_code == 401:
                print(f"   🔒 Status: Requiere autenticación (esto es correcto)")
                results.append((description, True))
            else:
                print(f"   ❌ Error: {response.text[:100]}...")
                results.append((description, False))
                
        except Exception as e:
            print(f"   ❌ Error: {e}")
            results.append((description, False))
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE URLs CORREGIDAS")
    print("=" * 60)
    
    passed = 0
    for description, success in results:
        status = "✅ FUNCIONA" if success else "❌ FALLA"
        print(f"{status} {description}")
        if success:
            passed += 1
    
    print(f"\n🎯 Resultado: {passed}/{len(results)} endpoints encontrados")
    
    if passed >= 5:  # Si al menos la mayoría funcionan
        print("\n🎉 ¡LAS URLs CORREGIDAS FUNCIONAN!")
        print("\n💡 El problema de la pantalla gris podría ser:")
        print("   1. Token de autenticación inválido o expirado")
        print("   2. Error en el manejo del token en SecureStore")
        print("   3. Problema de red en el dispositivo móvil")
        print("   4. Caching de React Query con datos incorrectos")
        
        print("\n🔧 Soluciones recomendadas:")
        print("   1. Hacer logout y login nuevamente")
        print("   2. Limpiar cache de la app")
        print("   3. Reinstalar la app")
        print("   4. Verificar conexión a internet")
    else:
        print("\n⚠️  Aún hay problemas con las URLs")
    
    return passed >= len(results) * 0.8  # 80% de éxito es aceptable

if __name__ == "__main__":
    success = test_corrected_urls()
    print(f"\n🎯 Diagnóstico final: {'ÉXITO' if success else 'NECESITA MÁS REVISIÓN'}")
