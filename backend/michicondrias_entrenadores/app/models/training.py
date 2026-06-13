import uuid
from sqlalchemy import Column, String, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base

class TrainingProgram(Base):
    __tablename__ = "training_programs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    trainer_id = Column(String(36), nullable=False)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_weeks = Column(Integer, default=4, nullable=False)

    goals = relationship("PetTrainingGoal", back_populates="program")


class PetTrainingGoal(Base):
    __tablename__ = "pet_training_goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pet_id = Column(String(36), nullable=False)
    program_id = Column(String(36), ForeignKey("training_programs.id"), nullable=True)
    goal_name = Column(String(150), nullable=False)
    status = Column(String(20), default="not_started", nullable=False)
    progress_notes = Column(Text, nullable=True)
    video_proof_url = Column(String(500), nullable=True)

    program = relationship("TrainingProgram", back_populates="goals")
