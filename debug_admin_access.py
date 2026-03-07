#!/usr/bin/env python3
"""
🔍 Debug de acceso de admin - Verificar usuarios y roles
"""

import psycopg2

def debug_admin_access():
    """🔍 Debug completo del sistema de usuarios y roles"""
    try:
        DATABASE_URL = 'postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres'
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        print("🔍 DEBUG COMPLETO DE ACCESO ADMIN")
        print("=" * 80)

        # 1. Verificar estructura de tabla roles
        print("\n📋 ESTRUCTURA TABLA ROLES:")
        print("-" * 40)
        cursor.execute('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = %s ORDER BY ordinal_position', ('roles',))
        roles_columns = cursor.fetchall()
        
        for col in roles_columns:
            print(f"📄 {col[0]} ({col[1]})")

        # 2. Verificar datos en tabla roles
        print("\n📋 DATOS TABLA ROLES:")
        print("-" * 40)
        cursor.execute('SELECT * FROM roles')
        roles_data = cursor.fetchall()
        
        for role in roles_data:
            print(f"🏷️ {role}")

        # 3. Verificar estructura de tabla users
        print("\n📋 ESTRUCTURA TABLA USERS:")
        print("-" * 40)
        cursor.execute('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = %s ORDER BY ordinal_position', ('users',))
        users_columns = cursor.fetchall()
        
        for col in users_columns:
            print(f"📄 {col[0]} ({col[1]})")

        # 4. Verificar todos los usuarios con sus roles
        print("\n📋 USUARIOS CON ROLES:")
        print("-" * 40)
        cursor.execute('SELECT id, email, full_name, role_id, verification_status, is_active FROM users ORDER BY role_id')
        users_data = cursor.fetchall()
        
        for user in users_data:
            user_id, email, full_name, role_id, verification_status, is_active = user
            
            print(f"👤 {full_name}")
            print(f"   📧 Email: {email}")
            print(f"   🆔 ID: {user_id}")
            print(f"   🔑 Role ID: {role_id}")
            print(f"   ✅ Status: {verification_status}")
            print(f"   🟢 Activo: {is_active}")
            print("-" * 40)

        # 5. Buscar específicamente usuarios admin
        print("\n👑 USUARIOS ADMIN:")
        print("-" * 40)
        
        # Intentar diferentes formas de buscar admin
        admin_queries = [
            ("role_id = 'admin'", "role_id = 'admin'"),
            ("role_id = %s", "b7e20dc7-732e-4fa8-90d9-8553f21688a6"),
            ("email LIKE %s", "%admin%"),
            ("full_name LIKE %s", "%admin%")
        ]
        
        for query_desc, query_param in admin_queries:
            try:
                if query_desc == "role_id = 'admin'":
                    cursor.execute(f"SELECT id, email, full_name, role_id FROM users WHERE {query_desc}")
                else:
                    cursor.execute(f"SELECT id, email, full_name, role_id FROM users WHERE {query_desc}", [query_param])
                
                admin_users = cursor.fetchall()
                
                if admin_users:
                    print(f"✅ Encontrados con {query_desc}:")
                    for user in admin_users:
                        print(f"   📧 {user[1]} - 🔑 {user[3]}")
                else:
                    print(f"❌ No encontrados con {query_desc}")
                    
            except Exception as e:
                print(f"❌ Error en query {query_desc}: {e}")

        # 6. Verificar relación foreign key
        print("\n🔗 VERIFICAR FOREIGN KEY:")
        print("-" * 40)
        try:
            cursor.execute('''
                SELECT u.id, u.email, u.role_id, r.name as role_name, r.description
                FROM users u 
                LEFT JOIN roles r ON u.role_id = r.id 
                WHERE u.role_id IS NOT NULL
                ORDER BY r.name
            ''')
            
            user_roles = cursor.fetchall()
            
            for ur in user_roles:
                user_id, email, role_id, role_name, description = ur
                print(f"👤 {email}")
                print(f"   🔑 Role ID: {role_id}")
                print(f"   🏷️ Role Name: {role_name}")
                print(f"   📝 Description: {description}")
                print("-" * 40)
                
        except Exception as e:
            print(f"❌ Error en verificación de FK: {e}")

        conn.close()
        
        return users_data, roles_data

    except Exception as e:
        print(f'❌ Error general: {e}')
        return [], []

if __name__ == "__main__":
    users, roles = debug_admin_access()
    
    print("\n🎯 RECOMENDACIONES:")
    print("=" * 80)
    print("1. ✅ Verificar que el usuario admin tenga el role_id correcto")
    print("2. ✅ Confirmar que el role_id exista en la tabla roles")
    print("3. ✅ Asegurar que el usuario esté activo (is_active = true)")
    print("4. ✅ Verificar que verification_status sea VERIFIED")
    print("5. ✅ Revisar que el frontend esté usando los IDs correctos")
    
    print("\n📱 ACCESO ADMIN ESPERADO:")
    print("=" * 80)
    print("🔑 Role ID Admin: b7e20dc7-732e-4fa8-90d9-8553f21688a6")
    print("📧 Email: admin@example.com")
    print("🏥 Condición frontend: user?.role_id === 'b7e20dc7-732e-4fa8-90d9-8553f21688a6'")
