#!/usr/bin/env python3
"""
📋 Verificar estructura de la tabla users
"""

import psycopg2

def verificar_estructura_users():
    """📋 Verificar estructura de la tabla users"""
    try:
        DATABASE_URL = 'postgresql://postgres:Michicondrias201094*@db.zaegmfufrzjmjiemrvvp.supabase.co:5432/postgres'
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()

        # Verificar estructura de la tabla users
        cursor.execute('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = %s ORDER BY ordinal_position', ('users',))
        columns = cursor.fetchall()

        print('📋 ESTRUCTURA DE LA TABLA USERS:')
        print('=' * 60)

        for col in columns:
            print(f'📄 {col[0]} ({col[1]})')

        # Verificar si hay usuarios
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        
        print(f'\n📊 TOTAL DE USUARIOS: {user_count}')
        
        if user_count > 0:
            # Verificar algunos usuarios para ver la estructura real
            cursor.execute('SELECT * FROM users LIMIT 3')
            users = cursor.fetchall()
            
            print('\n📄 EJEMPLOS DE USUARIOS:')
            print('=' * 60)
            
            for i, user in enumerate(users):
                print(f'👤 Usuario {i+1}:')
                for j, col in enumerate(columns):
                    col_name = col[0]
                    col_value = user[j] if j < len(user) else 'N/A'
                    print(f'   {col_name}: {col_value}')
                print('-' * 40)

        conn.close()
        
        return columns

    except Exception as e:
        print(f'❌ Error: {e}')
        return []

if __name__ == "__main__":
    columns = verificar_estructura_users()
