from sqlalchemy.orm import Session
from app.models.ecommerce import Category, Subcategory
from app.schemas.ecommerce import CategoryCreate, CategoryUpdate, SubcategoryCreate, SubcategoryUpdate

# ---- CATEGORY CRUD ----
def get_category(db: Session, category_id: str):
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100, active_only: bool = False):
    query = db.query(Category)
    if active_only:
        query = query.filter(Category.is_active == True)
    return query.offset(skip).limit(limit).all()

def create_category(db: Session, category: CategoryCreate):
    db_category = Category(
        name=category.name,
        description=category.description,
        image_url=category.image_url,
        is_active=category.is_active
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, db_category: Category, category_update: CategoryUpdate):
    update_data = category_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_category, key, value)
    
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def remove_category(db: Session, category_id: str):
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
    return db_category

# ---- SUBCATEGORY CRUD ----
def get_subcategory(db: Session, subcategory_id: str):
    return db.query(Subcategory).filter(Subcategory.id == subcategory_id).first()

def get_subcategories_by_category(db: Session, category_id: str, active_only: bool = False):
    query = db.query(Subcategory).filter(Subcategory.category_id == category_id)
    if active_only:
        query = query.filter(Subcategory.is_active == True)
    return query.all()

def create_subcategory(db: Session, subcategory: SubcategoryCreate):
    db_subcategory = Subcategory(
        name=subcategory.name,
        description=subcategory.description,
        is_active=subcategory.is_active,
        category_id=subcategory.category_id
    )
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

def update_subcategory(db: Session, db_subcategory: Subcategory, subupdate: SubcategoryUpdate):
    update_data = subupdate.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_subcategory, key, value)
    
    db.add(db_subcategory)
    db.commit()
    db.refresh(db_subcategory)
    return db_subcategory

def remove_subcategory(db: Session, subcategory_id: str):
    db_sub = db.query(Subcategory).filter(Subcategory.id == subcategory_id).first()
    if db_sub:
        db.delete(db_sub)
        db.commit()
    return db_sub
