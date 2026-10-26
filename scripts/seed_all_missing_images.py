"""Script to seed high-resolution Unsplash images for all entities across the database.
Covers:
- clinics (Hospitales y clínicas)
- veterinarians (Veterinarios)
- adoption_listings (Mascotas en adopción)
- petfriendly_places (Lugares pet-friendly)
- sitters & walkers (Cuidadores y paseadores)
- categories (Categorías de la tienda)
- pets (Mascotas de usuarios sin foto)
- users (Avatares de usuarios)
"""
from sqlalchemy import create_engine, text

url = 'postgresql://postgres.zaegmfufrzjmjiemrvvp:tdSNa3rTPbaHLNMDtsj9dN@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
engine = create_engine(url)

# 1. CLÍNICAS Y HOSPITALES
clinics_images = {
    'Hospital Michi Central': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80',
    'Clínica Veterinaria Michi Central': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    'Hospital Animal Santa Fe': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
    'Veterinaria Los Cachorros': 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80',
    'Clínica Patitas Felices': 'https://images.unsplash.com/photo-1587560699334-cc4ff634909a?auto=format&fit=crop&w=800&q=80',
    'Centro Veterinario 24h': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
}

# 2. VETERINARIOS
vets_images = {
    'Sofía': 'https://images.unsplash.com/photo-1594824813633-890209774659?auto=format&fit=crop&w=800&q=80',
    'Ana': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
    'Carlos': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80',
    'Laura': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
    'Roberto': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=800&q=80',
    'María': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
}

# 3. MASCOTAS EN ADOPCIÓN
adoption_images = {
    'Nube': 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    'Smoke Adoptable': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    'Canela': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    'Tommy': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    'Michi': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    'Rocky': 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    'Luna': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
    'Toby': 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
    'Pelusa': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    'Max': 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
    'Nina': 'https://images.unsplash.com/photo-1513360309081-38f076278f1e?auto=format&fit=crop&w=800&q=80',
    'Bruno': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
}

# 4. LUGARES PET-FRIENDLY
places_images = {
    'Café Huellitas': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    'Parque La Mexicana': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80',
    'Hotel Patitas': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'Parque Lincoln': 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    'Café Patitas': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
    'Terraza Michi': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    'Pet Park Santa Fe': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
    'Hotel Pet Friendly Roma': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    'Playa Canina Cancún': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
}

# 5. CUIDADORES Y PASEADORES
sitters_images = {
    'María Cuidadora': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
}
walkers_images = {
    'Juan Paseador': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
}

# 6. CATEGORÍAS DE TIENDA
categories_images = {
    'Alimentos': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    'Accesorios': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    'Juguetes': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    'Salud': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'Higiene': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    'Ropa y Moda': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
}

# 7. USUARIOS (Avatares)
user_avatars = {
    'test.consumidor@example.com': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    'test.consumidor2@example.com': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'test.vendedor@example.com': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'test.veterinario@example.com': 'https://images.unsplash.com/photo-1594824813633-890209774659?auto=format&fit=crop&w=400&q=80',
    'test.admin@example.com': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    'test.cuidador@example.com': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    'test.paseador@example.com': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    'test.hospital@example.com': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=400&q=80',
    'test.refugio@example.com': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
}

# 8. MASCOTAS DE PRUEBA (sin foto)
pets_images = {
    'Rocky': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
    'Luna': 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
    'Max': 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
}

with engine.begin() as conn:
    print("Updating clinics...")
    for name, img in clinics_images.items():
        conn.execute(text("UPDATE clinics SET logo_url = :img WHERE name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE clinics SET logo_url = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=800&q=80' WHERE logo_url IS NULL OR logo_url = '';"))

    print("Updating veterinarians...")
    for first_name, img in vets_images.items():
        conn.execute(text("UPDATE veterinarians SET photo_url = :img WHERE first_name = :first_name;"), {'img': img, 'first_name': first_name})
    conn.execute(text("UPDATE veterinarians SET photo_url = 'https://images.unsplash.com/photo-1594824813633-890209774659?auto=format&fit=crop&w=800&q=80' WHERE photo_url IS NULL OR photo_url = '';"))

    print("Updating adoption_listings...")
    for name, img in adoption_images.items():
        conn.execute(text("UPDATE adoption_listings SET photo_url = :img WHERE name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE adoption_listings SET photo_url = 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80' WHERE photo_url IS NULL OR photo_url = '';"))

    print("Updating petfriendly_places...")
    for name, img in places_images.items():
        conn.execute(text("UPDATE petfriendly_places SET image_url = :img WHERE name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE petfriendly_places SET image_url = 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80' WHERE image_url IS NULL OR image_url = '';"))

    print("Updating sitters...")
    for name, img in sitters_images.items():
        conn.execute(text("UPDATE sitters SET photo_url = :img WHERE display_name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE sitters SET photo_url = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80' WHERE photo_url IS NULL OR photo_url = '';"))

    print("Updating walkers...")
    for name, img in walkers_images.items():
        conn.execute(text("UPDATE walkers SET photo_url = :img WHERE display_name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE walkers SET photo_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80' WHERE photo_url IS NULL OR photo_url = '';"))

    print("Updating categories...")
    for name, img in categories_images.items():
        conn.execute(text("UPDATE categories SET image_url = :img WHERE name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE categories SET image_url = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80' WHERE image_url IS NULL OR image_url = '';"))

    print("Updating user avatars...")
    for email, img in user_avatars.items():
        conn.execute(text("UPDATE users SET avatar_url = :img WHERE email = :email;"), {'img': img, 'email': email})

    print("Updating pets without photos...")
    for name, img in pets_images.items():
        conn.execute(text("UPDATE pets SET photo_url = :img WHERE name = :name AND (photo_url IS NULL OR photo_url = '');"), {'img': img, 'name': name})

print("All database images successfully populated!")
