from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.models.ecommerce import Product, Donation, Review, Order, OrderItem
from app.schemas.ecommerce import ProductCreate, ProductUpdate, DonationCreate, DonationUpdate, ReviewCreate, OrderCreate

def _attach_rating_info(db: Session, product: Product):
    """Attach rating info for a single product (used for single-product endpoints)."""
    if not product:
        return product
    stats = db.query(
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.product_id == product.id).first()
    
    product.average_rating = float(stats.avg_rating) if stats.avg_rating else 0.0
    product.review_count = stats.count or 0
    return product

def _batch_attach_ratings(db: Session, products: list):
    """Attach rating info for a LIST of products in a SINGLE SQL query (avoids N+1)."""
    if not products:
        return products
    
    product_ids = [p.id for p in products]
    
    # Single aggregated query for ALL products at once
    stats = db.query(
        Review.product_id,
        func.avg(Review.rating).label("avg_rating"),
        func.count(Review.id).label("count")
    ).filter(Review.product_id.in_(product_ids)).group_by(Review.product_id).all()
    
    # Build a lookup dict: product_id -> (avg_rating, count)
    ratings_map = {s.product_id: (float(s.avg_rating) if s.avg_rating else 0.0, s.count or 0) for s in stats}
    
    for p in products:
        avg_r, cnt = ratings_map.get(p.id, (0.0, 0))
        p.average_rating = avg_r
        p.review_count = cnt
    
    return products

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
    return _batch_attach_ratings(db, products)

def get_pending_products(db: Session):
    products = db.query(Product).filter(Product.is_approved == False).all()
    return _batch_attach_ratings(db, products)

# ... (approve_product and others remain same, skipping to new Review CRUD)

PURCHASED_STATUSES = ("paid", "confirmed", "shipped", "delivered")


def user_has_purchased(db: Session, user_id: str, product_id: str) -> bool:
    """True si el usuario tiene un pedido pagado (no pendiente ni cancelado) con ese producto."""
    return db.query(OrderItem.id).join(Order, Order.id == OrderItem.order_id).filter(
        Order.user_id == user_id,
        OrderItem.product_id == product_id,
        Order.status.in_(PURCHASED_STATUSES),
    ).first() is not None


def user_has_reviewed(db: Session, user_id: str, product_id: str) -> bool:
    return db.query(Review.id).filter(Review.user_id == user_id, Review.product_id == product_id).first() is not None


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
    """Elimina el producto; si ya tiene ventas (FK de order_items) lo desactiva para conservar el historial."""
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if db_product:
        has_orders = db.query(OrderItem.id).filter(OrderItem.product_id == product_id).first() is not None
        if has_orders:
            db_product.is_active = False
            db.commit()
        else:
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
# Un pedido pendiente aparta stock; si no se paga en este tiempo se cancela y el stock regresa.
PENDING_ORDER_TTL_MINUTES = 40
STOCK_HOLDING_STATUSES = ("pending", "paid", "confirmed")


def release_stale_pending_orders(db: Session) -> int:
    """Cancela pedidos pendientes de pago abandonados y devuelve el stock apartado."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=PENDING_ORDER_TTL_MINUTES)
    stale = db.query(Order).options(joinedload(Order.items)).filter(
        Order.status == "pending", Order.created_at < cutoff
    ).all()
    for order in stale:
        _restock_order(db, order)
        order.status = "cancelled"
    if stale:
        db.commit()
    return len(stale)


def _restock_order(db: Session, order: Order):
    for item in order.items:
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        if product:
            product.stock = (product.stock or 0) + item.quantity


def create_order(db: Session, order_in: OrderCreate, user_id: str):
    """Crea un pedido pendiente validando producto, disponibilidad y stock. Lanza ValueError con mensaje para el usuario."""
    if not order_in.items:
        raise ValueError("El carrito está vacío")

    release_stale_pending_orders(db)

    # Une líneas repetidas del mismo producto y bloquea en orden estable (evita interbloqueos entre compras simultáneas)
    quantities: dict = {}
    for item in order_in.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    total_amount = 0.0
    items_to_create = []

    for product_id in sorted(quantities):
        quantity = quantities[product_id]
        if quantity > 100:
            raise ValueError("Cantidad máxima por producto: 100")
        product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
        if not product:
            raise ValueError("Uno de los productos ya no existe. Quítalo de tu bolsa.")
        if not product.is_active or not product.is_approved:
            raise ValueError(f"\"{product.name}\" ya no está disponible. Quítalo de tu bolsa.")
        if product.seller_id and product.seller_id == user_id:
            raise ValueError(f"No puedes comprar tu propio producto (\"{product.name}\").")
        if (product.stock or 0) < quantity:
            raise ValueError(f"Stock insuficiente para {product.name}. Solo quedan {product.stock or 0}.")

        total_amount += product.price * quantity
        items_to_create.append(OrderItem(
            product_id=product.id,
            quantity=quantity,
            price_at_purchase=product.price,
        ))
        product.stock -= quantity

    db_order = Order(
        user_id=user_id,
        total_amount=round(total_amount, 2),
        shipping_address=(order_in.shipping_address or "").strip() or None,
        status="pending",  # Wait for Stripe Webhook to mark as paid
    )
    db.add(db_order)
    db.flush()  # Get order ID

    for oi in items_to_create:
        oi.order_id = db_order.id
        db.add(oi)

    try:
        db.commit()
        db.refresh(db_order)
        return db_order
    except Exception:
        db.rollback()
        raise

def get_user_orders(db: Session, user_id: str, skip: int = 0, limit: int = 20):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_seller_orders(db: Session, seller_id: str, skip: int = 0, limit: int = 50):
    """Get orders containing products from a specific seller."""
    # Find order IDs that contain products from this seller
    order_ids = db.query(OrderItem.order_id).join(Product).filter(Product.seller_id == seller_id).distinct().all()
    order_ids = [oid[0] for oid in order_ids]
    
    if not order_ids:
        return []
    
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id.in_(order_ids)).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def get_order(db: Session, order_id: str):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()

def get_all_orders(db: Session, skip: int = 0, limit: int = 50):
    return db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()

def update_order_status(db: Session, order_id: str, status: str):
    db_order = get_order(db, order_id)
    if db_order:
        # Cancelar un pedido que aún tenía stock apartado lo devuelve al inventario (una sola vez)
        if status == "cancelled" and db_order.status in STOCK_HOLDING_STATUSES:
            _restock_order(db, db_order)
        db_order.status = status
        db.commit()
        db.refresh(db_order)
    return db_order
