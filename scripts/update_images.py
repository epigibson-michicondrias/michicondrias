from sqlalchemy import create_engine, text

url = 'postgresql://postgres.zaegmfufrzjmjiemrvvp:tdSNa3rTPbaHLNMDtsj9dN@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
engine = create_engine(url)

lost_pet_images = {
    'Luna': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    'Coco': 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    'Nube': 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
    'Rocko': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    'Michín': 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
    'Firulais': 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?auto=format&fit=crop&w=800&q=80',
    'Toby': 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?auto=format&fit=crop&w=800&q=80',
}

product_images = {
    'Antipulgas Collar 6 Meses': 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80',
    'Arena Aglomerante 10kg': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    'Cama Dona para Gato': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80',
    'Cama Ortopédica Memory Foam': 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&w=800&q=80',
    'Cepillo Deslanador': 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80',
    'Collar Reflectante GPS': 'https://images.unsplash.com/photo-1535294435445-d7249524ef2e?auto=format&fit=crop&w=800&q=80',
    'Comida Húmeda Gourmet 12u': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    'Correa Retráctil 5 m': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    'Croquetas Gatito 3kg': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    'Croquetas Gato Indoor 7.5kg': 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
    'Croquetas Premium Adulto 15kg': 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
    'Fuente de Agua Automática': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    'Juguete Interactivo Ratón': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    'Pelota Ultra Resistente': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
    'Rascador Torre 1.2m': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    'Ratón de Plumas para Gato': 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=800&q=80',
    'Shampoo Hipoalergénico': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
    'Snack Dental 500g': 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?auto=format&fit=crop&w=800&q=80',
    'Transportadora IATA Mediana': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
    'Vitaminas Dermatológicas': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
}

with engine.begin() as conn:
    for name, img in lost_pet_images.items():
        conn.execute(text("UPDATE lost_pet_reports SET image_url = :img WHERE pet_name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE lost_pet_reports SET image_url = 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80' WHERE image_url IS NULL OR image_url = '';"))

    for name, img in product_images.items():
        conn.execute(text("UPDATE products SET image_url = :img WHERE name = :name;"), {'img': img, 'name': name})
    conn.execute(text("UPDATE products SET image_url = 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80' WHERE image_url IS NULL OR image_url = '';"))

print("Images updated successfully!")
