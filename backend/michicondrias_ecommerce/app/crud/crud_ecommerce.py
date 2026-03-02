from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.ecommerce import Product, Donation, Review, Order, OrderItem
from app.schemas.ecommerce import ProductCreate, ProductUpdate, DonationCreate, DonationUpdate, ReviewCreate, OrderCreate

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

# CRUD ORDERS
def create_order(db: Session, order_in: OrderCreate, user_id: str):
    # 1. Calculate total and check stock
    total_amount = 0.0
    items_to_create = []
    
    # Use a nested transaction or just the main one. Since we are in a function called by a route, 
    # we use the 'db' session. We'll use 'with_for_update()' to lock the rows.
    
    for item in order_in.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if not product:
            raise Exception(f"Producto {item.product_id} no encontrado")
        
        if product.stock < item.quantity:
            raise Exception(f"Stock insuficiente para {product.name}. Solo quedan {product.stock}.")
        
        # Calculate price
        item_total = product.price * item.quantity
        total_amount += item_total
        
        # Prepare OrderItem
        items_to_create.append(OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price
        ))
        
        # Deduct stock
        product.stock -= item.quantity

    # 2. Create Order
    db_order = Order(
        user_id=user_id,
        total_amount=total_amount,
        shipping_address=order_in.shipping_address,
        status="paid" # Simulating paid for now
    )
    db.add(db_order)
    db.flush() # Get order ID

    # 3. Save Items
    for oi in items_to_create:
        oi.order_id = db_order.id
        db.add(oi)
    
    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception as e:
        db.rollback()
        raise e

def get_user_orders(db: Session, user_id: str, skip: int = 0, limit: int = 20):
    return db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: str):
    return db.query(Order).filter(Order.id == order_id).first()
