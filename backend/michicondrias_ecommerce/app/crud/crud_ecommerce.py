from sqlalchemy import func
from app.models.ecommerce import Product, Donation, Review
from app.schemas.ecommerce import ProductCreate, ProductUpdate, DonationCreate, DonationUpdate, ReviewCreate

def _attach_rating_info(db: Session, product: Product):
    if not product:
        return product
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.product_id == product.id).first()
    
    product.average_rating = float(stats.avg_rating) if stats.avg_rating else 0.0
    product.review_count = stats.count or 0
    return product

# CRUD PRODUCTS
def get_product(db: Session, product_id: str):
    product = db.query(Product).filter(Product.id == product_id).first()
    return _attach_rating_info(db, product)

def get_products(db: Session, skip: int = 0, limit: int = 100, category: str = None, seller_id: str = None):
    # Public view only shows active AND approved products
    query = db.query(Product).filter(Product.is_active == True, Product.is_approved == True)
    if category:
        query = query.filter(Product.category_id == category) # Fixed category_id
    if seller_id:
        query = query.filter(Product.seller_id == seller_id)
    
    products = query.offset(skip).limit(limit).all()
    for p in products:
        _attach_rating_info(db, p)
    return products

def get_pending_products(db: Session):
    products = db.query(Product).filter(Product.is_approved == False).all()
    for p in products:
        _attach_rating_info(db, p)
    return products

# ... (approve_product and others remain same, skipping to new Review CRUD)

def create_review(db: Session, review: ReviewCreate, product_id: str, user_id: str):
    db_review = Review(**review.model_dump(), product_id=product_id, user_id=user_id)
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review

def get_product_reviews(db: Session, product_id: str, skip: int = 0, limit: int = 50):
    return db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).offset(skip).limit(limit).all()

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
