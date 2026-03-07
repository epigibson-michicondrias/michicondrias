#!/usr/bin/env python3
"""
📄 Verificar usuarios existentes y sus roles
"""

import psycopg2

def verificar_usuarios_reales():
    """📄 Verificar usuarios existentes y sus roles"""
    try:
        DATABASE_URL = 'postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres'
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Verificar todos los usuarios existentes
        cursor.execute('SELECT id, email, full_name, role_id, verification_status FROM users')
        users = cursor.fetchall()

        print('📄 USUARIOS EXISTENTES:')
        print('=' * 60)

        for user in users:
            print(f'📧 Email: {user[1]}')
            print(f'👤 Nombre: {user[2]}')
            print(f'🔑 Role ID: {user[3]}')
            print(f'✅ Status: {user[4]}')
            print('-' * 40)

        # Buscar usuarios que podrían ser admin
        cursor.execute('SELECT id, email, full_name, role_id, verification_status FROM users WHERE role_id = %s OR email LIKE %s', ('admin', '%admin%'))
        admin_users = cursor.fetchall()

        print('\n👑 USUARIOS ADMIN POTENCIALES:')
        print('=' * 60)

        if admin_users:
            for user in admin_users:
                print(f'📧 Email: {user[1]}')
                print(f'👤 Nombre: {user[2]}')
                print(f'🔑 Role ID: {user[3]}')
                print(f'✅ Status: {user[4]}')
                print('-' * 40)
        else:
            print('❌ No se encontraron usuarios con role admin')

        conn.close()
        
        return users

    except Exception as e:
        print(f'❌ Error: {e}')
        return []

if __name__ == "__main__":
    users = verificar_usuarios_reales()
