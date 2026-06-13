from sqlalchemy.orm import Session
from typing import Optional, List

from app.models.training import TrainingProgram, PetTrainingGoal, TrainingEnrollment
from app.schemas.training import (
    TrainingProgramCreate,
    PetTrainingGoalCreate,
    PetTrainingGoalUpdate,
    TrainingEnrollmentCreate,
)

# ==========================================
# TRAINING PROGRAM CRUD
# ==========================================

def create_program(
    db: Session, program_in: TrainingProgramCreate, trainer_id: str
) -> TrainingProgram:
    db_program = TrainingProgram(
        trainer_id=trainer_id,
        **program_in.model_dump()
    )
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program


def get_program_by_id(db: Session, program_id: str) -> Optional[TrainingProgram]:
    return db.query(TrainingProgram).filter(TrainingProgram.id == program_id).first()


def get_programs_by_trainer(db: Session, trainer_id: str) -> List[TrainingProgram]:
    return db.query(TrainingProgram).filter(TrainingProgram.trainer_id == trainer_id).all()


def get_all_active_programs(db: Session) -> List[TrainingProgram]:
    return db.query(TrainingProgram).all()


# ==========================================
# PET TRAINING GOAL CRUD
# ==========================================

def create_goal(db: Session, goal_in: PetTrainingGoalCreate) -> PetTrainingGoal:
    db_goal = PetTrainingGoal(
        **goal_in.model_dump()
    )
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal


def get_goal_by_id(db: Session, goal_id: str) -> Optional[PetTrainingGoal]:
    return db.query(PetTrainingGoal).filter(PetTrainingGoal.id == goal_id).first()


def update_goal(
    db: Session, db_goal: PetTrainingGoal, goal_in: PetTrainingGoalUpdate
) -> PetTrainingGoal:
    update_data = goal_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal


# ==========================================
# TRAINING ENROLLMENT CRUD
# ==========================================

def create_enrollment(
    db: Session, *, enroll_in: TrainingEnrollmentCreate, client_id: str, price: float
) -> TrainingEnrollment:
    db_enroll = TrainingEnrollment(
        client_id=client_id,
        total_paid=price,
        status="active",
        **enroll_in.model_dump()
    )
    db.add(db_enroll)
    db.commit()
    db.refresh(db_enroll)
    return db_enroll


def get_enrollments_for_client(db: Session, client_id: str) -> List[TrainingEnrollment]:
    return db.query(TrainingEnrollment).filter(TrainingEnrollment.client_id == client_id).all()


def get_enrollments_for_trainer(db: Session, trainer_id: str) -> List[TrainingEnrollment]:
    return db.query(TrainingEnrollment).join(
        TrainingProgram, TrainingEnrollment.program_id == TrainingProgram.id
    ).filter(TrainingProgram.trainer_id == trainer_id).all()
