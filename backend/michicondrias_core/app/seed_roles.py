"""
Script to seed initial roles into the database.
Run from the michicondrias_core directory:
    python -m app.seed_roles
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.role import Role

ROLES = [
    {"name": "consumidor", "description": "Usuario final. Puede buscar, adoptar, donar, comprar y reportar."},
    {"name": "veterinario", "description": "Profesional veterinario. Puede registrar clínicas, crear historiales y publicar adopciones."},
    {"name": "admin", "description": "Administrador. Acceso completo al sistema."},
    {"name": "paseador", "description": "Paseador o cuidador. Puede crear anuncios de sus servicio y aceptar solicitudes de oportunidades de oferta o trabajo."},
    {"name": "cuidador", "description": "Cuidador de mascotas / Hospedaje y visitas"},
    {"name": "vendedor", "description": "Vendedor de productos / Tienda E-commerce"},
    {"name": "patrocinador", "description": "Patrocinador / Donante o auspiciador de la plataforma"},
    {"name": "establecimiento", "description": "Establecimiento Pet-Friendly (Restaurantes, Cafés, Parques)"},
    {"name": "clinica", "description": "Clínica, Hospital o Centro Veterinario"},
    {"name": "refugio", "description": "Refugio de animales / Asociación protectora sin fines de lucro"},
    {"name": "hogar_temporal", "description": "Hogar temporal / Casa hogar para cuidado de mascotas rescatadas"},
    {"name": "funeraria", "description": "Servicios funerarios y cremación para mascotas."}
]

def seed_roles():
    db = SessionLocal()
    try:
        for role_data in ROLES:
            existing = db.query(Role).filter(Role.name == role_data["name"]).first()
            if not existing:
                role = Role(**role_data)
                db.add(role)
                print(f"  ✅ Rol '{role_data['name']}' creado")
            else:
                print(f"  ⏩ Rol '{role_data['name']}' ya existe")
        db.commit()
        print("\n🎉 Seed de roles completado!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_roles()
