from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
import uuid

def get_notification(db: Session, notification_id: str):
    return db.query(Notification).filter(Notification.id == notification_id).first()

def get_notifications_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100):
    return (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_notification(db: Session, notification: NotificationCreate):
    db_obj = Notification(
        id=str(uuid.uuid4()),
        user_id=notification.user_id,
        title=notification.title,
        message=notification.message,
        type=notification.type,
        is_read=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def mark_notification_as_read(db: Session, notification_id: str):
    db_obj = get_notification(db, notification_id)
    if db_obj:
        db_obj.is_read = True
        db.commit()
        db.refresh(db_obj)
    return db_obj
