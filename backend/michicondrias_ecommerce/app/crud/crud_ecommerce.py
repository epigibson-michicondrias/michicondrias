from sqlalchemy.orm import Session
from app.models.ecommerce import Product, Donation
from app.schemas.ecommerce import ProductCreate, ProductUpdate, DonationCreate, DonationUpdate

# CRUD PRODUCTS
def get_product(db: Session, product_id: str):
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100, category: str = None, seller_id: str = None):
    # Public view only shows active AND approved products
    query = db.query(Product).filter(Product.is_active == True, Product.is_approved == True)
    if category:
        query = query.filter(Product.category == category)
    if seller_id:
        query = query.filter(Product.seller_id == seller_id)
    return query.offset(skip).limit(limit).all()

def get_pending_products(db: Session):
    return db.query(Product).filter(Product.is_approved == False).all()

def approve_product(db: Session, product_id: str):
    db_product = get_product(db, product_id)
    if db_product:
        db_product.is_approved = True
        db.commit()
        db.refresh(db_product)
    return db_product

def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.model_dump())
    db_product.is_approved = False # All new products start as pending
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, db_product: Product, product_update: ProductUpdate):
    update_data = product_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        db.delete(db_product)
        db.commit()
    return db_product

# CRUD DONATIONS
def get_donation(db: Session, donation_id: str):
    return db.query(Donation).filter(Donation.id == donation_id).first()

def get_donations(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Donation).order_by(Donation.date.desc()).offset(skip).limit(limit).all()

def create_donation(db: Session, donation: DonationCreate, user_id: str = None):
    db_donation = Donation(**donation.model_dump())
    db_donation.user_id = user_id
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation

def update_donation_status(db: Session, db_donation: Donation, status: str):
    db_donation.status = status
    db.add(db_donation)
    db.commit()
    db.refresh(db_donation)
    return db_donation
