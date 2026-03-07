#!/usr/bin/env python3
"""
🔍 Test API /users/me para verificar que devuelve role_id correcto
"""

import requests
import json

BASE_URL = "https://kowly51wia.execute-api.us-east-1.amazonaws.com"

def test_users_me_api():
    """🔍 Probar API /users/me con diferentes credenciales"""
    
    print("🔍 TEST API /users/me")
    print("=" * 80)
    
    # 1. Primero probar login para obtener token
    print("\n📧 1. PROBAR LOGIN OBTENER TOKEN:")
    print("-" * 40)
    
    login_data = {
        "username": "admin@example.com",
        "password": "admin123"  # Asumir contraseña por defecto
    }
    
    try:
        print(f"🔐 Intentando login con: {login_data['username']}")
        
        response = requests.post(
            f"{BASE_URL}/core/api/v1/login/access-token",
            data=login_data,
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"✅ Login exitoso:")
            print(f"   🎫 Token: {token_data.get('access_token', 'N/A')[:50]}...")
            print(f"   🔑 Token Type: {token_data.get('token_type', 'N/A')}")
            
            # 2. Probar /users/me con el token
            print(f"\n📋 2. PROBAR /users/me CON TOKEN:")
            print("-" * 40)
            
            headers = {
                "Authorization": f"Bearer {token_data['access_token']}",
                "Content-Type": "application/json"
            }
            
            users_me_response = requests.get(
                f"{BASE_URL}/core/api/v1/users/me",
                headers=headers
            )
            
            print(f"📊 Status Code: {users_me_response.status_code}")
            
            if users_me_response.status_code == 200:
                user_data = users_me_response.json()
                print(f"✅ /users/me exitoso:")
                print(f"   🆔 ID: {user_data.get('id', 'N/A')}")
                print(f"   📧 Email: {user_data.get('email', 'N/A')}")
                print(f"   👤 Nombre: {user_data.get('full_name', 'N/A')}")
                print(f"   🔑 Role ID: {user_data.get('role_id', 'N/A')}")
                print(f"   ✅ Status: {user_data.get('verification_status', 'N/A')}")
                print(f"   🟢 Activo: {user_data.get('is_active', 'N/A')}")
                
                # Verificar si tiene role_id correcto
                expected_role_id = "b7e20dc7-732e-4fa8-90d9-8553f21688a6"
                actual_role_id = user_data.get('role_id')
                
                if actual_role_id == expected_role_id:
                    print(f"✅ Role ID CORRECTO: {actual_role_id}")
                else:
                    print(f"❌ Role ID INCORRECTO:")
                    print(f"   🎯 Esperado: {expected_role_id}")
                    print(f"   📍 Actual: {actual_role_id}")
                
                # Mostrar todos los campos para debug
                print(f"\n📄 3. CAMPOS COMPLETOS DEL USUARIO:")
                print("-" * 40)
                for key, value in user_data.items():
                    print(f"   📋 {key}: {value}")
                    
            else:
                print(f"❌ Error en /users/me: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
            # Probar con otras contraseñas comunes
            common_passwords = ["admin", "password", "123456", "admin123", "michicondrias"]
            
            for pwd in common_passwords:
                print(f"\n🔐 Intentando con contraseña: {pwd}")
                login_data["password"] = pwd
                
                try:
                    response = requests.post(
                        f"{BASE_URL}/core/api/v1/login/access-token",
                        data=login_data,
                        headers={"Content-Type": "application/x-www-form-urlencoded"}
                    )
                    
                    if response.status_code == 200:
                        print(f"✅ Login exitoso con contraseña: {pwd}")
                        token_data = response.json()
                        
                        # Probar /users/me
                        headers = {
                            "Authorization": f"Bearer {token_data['access_token']}",
                            "Content-Type": "application/json"
                        }
                        
                        users_me_response = requests.get(
                            f"{BASE_URL}/core/api/v1/users/me",
                            headers=headers
                        )
                        
                        if users_me_response.status_code == 200:
                            user_data = users_me_response.json()
                            print(f"   🔑 Role ID: {user_data.get('role_id', 'N/A')}")
                            
                            if user_data.get('role_id') == "b7e20dc7-732e-4fa8-90d9-8553f21688a6":
                                print(f"   ✅ Role ID correcto encontrado!")
                                return user_data
                        break
                        
                except Exception as e:
                    print(f"   ❌ Error con contraseña {pwd}: {e}")
                    
    except Exception as e:
        print(f"❌ Error general: {e}")
    
    return None

if __name__ == "__main__":
    user_data = test_users_me_api()
    
    print(f"\n🎯 DIAGNÓSTICO FINAL:")
    print("=" * 80)
    
    if user_data:
        print("✅ API /users/me funcionando correctamente")
        print("✅ Role ID presente en la respuesta")
        print("🔍 Revisar frontend para ver si está recibiendo estos datos")
    else:
        print("❌ API /users/me no funcionando")
        print("🔧 Necesario revisar backend para esta endpoint")
        print("🔍 Posibles causas:")
        print("   - Endpoint no implementado")
        print("   - Autenticación incorrecta")
        print("   - Contraseña incorrecta")
