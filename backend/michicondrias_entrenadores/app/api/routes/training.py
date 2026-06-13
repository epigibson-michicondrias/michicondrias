from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api import deps
from app.crud import crud_training
from app.models.training import PetTrainingGoal
from app.schemas.training import (
    TrainingProgramCreate,
    TrainingProgramResponse,
    PetTrainingGoalCreate,
    PetTrainingGoalResponse,
    PetTrainingGoalUpdate,
    TrainingEnrollmentCreate,
    TrainingEnrollmentResponse,
)

router = APIRouter()

@router.post("/programs", response_model=TrainingProgramResponse, status_code=status.HTTP_201_CREATED)
def create_training_program(
    *,
    db: Session = Depends(get_db),
    program_in: TrainingProgramCreate,
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Create a new training program. Requires 'entrenador' role.
    """
    return crud_training.create_program(db=db, program_in=program_in, trainer_id=trainer_id)


@router.get("/programs", response_model=List[TrainingProgramResponse])
def read_all_programs(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all active training programs. Public endpoint.
    """
    return crud_training.get_all_active_programs(db=db)


@router.post("/goals", response_model=PetTrainingGoalResponse, status_code=status.HTTP_201_CREATED)
def create_pet_training_goal(
    *,
    db: Session = Depends(get_db),
    goal_in: PetTrainingGoalCreate,
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Create a specific training goal for a pet. Requires 'entrenador' role.
    """
    if goal_in.program_id:
        program = crud_training.get_program_by_id(db=db, program_id=goal_in.program_id)
        if not program:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="El programa de entrenamiento especificado no existe"
            )
    return crud_training.create_goal(db=db, goal_in=goal_in)


@router.patch("/goals/{id}", response_model=PetTrainingGoalResponse)
def update_pet_training_goal(
    *,
    id: str,
    db: Session = Depends(get_db),
    goal_in: PetTrainingGoalUpdate,
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Update goal status, progress notes, and video proof. Requires 'entrenador' role.
    """
    db_goal = crud_training.get_goal_by_id(db=db, goal_id=id)
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La meta de entrenamiento no existe"
        )
    return crud_training.update_goal(db=db, db_goal=db_goal, goal_in=goal_in)


# New TrainingEnrollment Endpoints
@router.post("/enroll", response_model=TrainingEnrollmentResponse, status_code=status.HTTP_201_CREATED)
def enroll_pet(
    *,
    db: Session = Depends(get_db),
    enroll_in: TrainingEnrollmentCreate,
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Enroll a pet in a training program. Requires user authentication.
    """
    program = crud_training.get_program_by_id(db=db, program_id=enroll_in.program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El programa de entrenamiento especificado no existe."
        )
    return crud_training.create_enrollment(db=db, enroll_in=enroll_in, client_id=current_user_id, price=program.price)


@router.get("/enrollments/client", response_model=List[TrainingEnrollmentResponse])
def read_client_enrollments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Get all training enrollments for the logged-in client.
    """
    return crud_training.get_enrollments_for_client(db=db, client_id=current_user_id)


@router.get("/enrollments/provider", response_model=List[TrainingEnrollmentResponse])
def read_provider_enrollments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_entrenador)
) -> Any:
    """
    Get all training enrollments requested from the logged-in trainer. Requires 'entrenador' role.
    """
    return crud_training.get_enrollments_for_trainer(db=db, trainer_id=current_user_id)


@router.post("/goals/{goal_id}/review-video", response_model=PetTrainingGoalResponse)
def review_pet_goal_video(
    goal_id: str,
    approved: bool,
    notes: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_entrenador)
) -> Any:
    """
    Approve or reject a pet's training progress video. Requires 'entrenador' role.
    """
    goal = db.query(PetTrainingGoal).filter(PetTrainingGoal.id == goal_id).first()
    if not goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La meta de adiestramiento no existe."
        )
    
    # Check if trainer is indeed the owner of the program
    if goal.program:
        if goal.program.trainer_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para calificar esta meta de adiestramiento."
            )
            
    goal.status = "completed" if approved else "in_progress"
    goal.progress_notes = notes
    db.commit()
    db.refresh(goal)
    return goal
