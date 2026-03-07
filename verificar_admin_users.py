#!/usr/bin/env python3
"""
🔍 Verificar y crear usuarios admin en la base de datos
"""

import psycopg2
import json

def verificar_admin_users():
    """🔍 Verificar usuarios admin en la base de datos"""
    try:
        # Conexión a Supabase
        DATABASE_URL = "postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres"
        conn = psycopg2.connect(DATABASE_URL)

        cursor = conn.cursor()

        # Verificar usuarios admin
        cursor.execute('SELECT id, email, full_name, role, is_active FROM users WHERE role = %s', ('admin',))
        admin_users = cursor.fetchall()

        print('🔍 USUARIOS ADMIN ENCONTRADOS:')
        print('=' * 60)

        if admin_users:
            for user in admin_users:
                print(f'📧 Email: {user[1]}')
                print(f'👤 Nombre: {user[2]}')
                print(f'🔑 Rol: {user[3]}')
                print(f'✅ Activo: {user[4]}')
                print(f'🆔 ID: {user[0]}')
                print('-' * 40)
        else:
            print('❌ No se encontraron usuarios admin')
            print('\n🔧 Creando usuario admin por defecto...')
            
            # Crear usuario admin por defecto
            cursor.execute('''
                INSERT INTO users (id, email, full_name, is_active, role, verification_status, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    role = EXCLUDED.role,
                    is_active = EXCLUDED.is_active
            ''', (
                'admin-default',
                'admin@michicondrias.com',
                'Administrador del Sistema',
                True,
                'admin',
                'VERIFIED',
                '2024-01-01T00:00:00Z'
            ))
            
            conn.commit()
            print('✅ Usuario admin creado:')
            print('📧 Email: admin@michicondrias.com')
            print('🔑 Contraseña: (necesita ser establecida en el backend)')
            print('👤 Nombre: Administrador del Sistema')

        # Verificar todos los usuarios con sus roles
        cursor.execute('SELECT id, email, full_name, role, is_active FROM users ORDER BY role, full_name')
        all_users = cursor.fetchall()

        print('\n📊 TODOS LOS USUARIOS DEL SISTEMA:')
        print('=' * 60)

        for user in all_users:
            role_emoji = {
                'admin': '👑',
                'veterinario': '👨‍⚕️',
                'walker': '🚶',
                'sitter': '🏠',
                'vendedor': '🛍️',
                'authenticated': '👤'
            }.get(user[3], '👤')
            
            status_emoji = '✅' if user[4] else '❌'
            
            print(f'{role_emoji} {user[2]} ({user[3]}) {status_emoji}')
            print(f'   📧 {user[1]}')
            print(f'   🆔 {user[0]}')
            print('-' * 40)

        conn.close()
        
        return admin_users

    except Exception as e:
        print(f'❌ Error: {e}')
        return []

if __name__ == "__main__":
    admin_users = verificar_admin_users()
    
    print('\n🎯 ACCESO COMO ADMINISTRADOR:')
    print('=' * 60)
    
    if admin_users:
        print('✅ Para acceder como administrador:')
        print('1. Abre la app móvil')
        print('2. Haz login con uno de estos emails:')
        for user in admin_users:
            print(f'   📧 {user[1]}')
        print('3. La contraseña debe ser establecida en el backend')
        print('4. Una vez logueado, verás la sección "Administración" en el menú')
        print('5. Selecciona "Panel de Administración" para acceder al sistema completo')
    else:
        print('❌ No hay usuarios admin configurados')
        print('🔧 Necesitas crear usuarios admin en la base de datos')
    
    print('\n📱 En el menú del admin verás:')
    print('👑 Panel de Administración (acceso principal)')
    print('🛡️ Centro de Moderación')
    print('🔍 Control KYC')
    print('📈 Analíticas Globales')
    print('⚙️ Configuración Sistema')
