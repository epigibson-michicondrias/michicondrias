from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api import deps
from app.crud import crud_training
from app.schemas.training import (
    TrainingProgramCreate,
    TrainingProgramResponse,
    PetTrainingGoalCreate,
    PetTrainingGoalResponse,
    PetTrainingGoalUpdate,
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
    Create a new training program.
    Requires 'entrenador' role.
    """
    return crud_training.create_program(db=db, program_in=program_in, trainer_id=trainer_id)


@router.post("/goals", response_model=PetTrainingGoalResponse, status_code=status.HTTP_201_CREATED)
def create_pet_training_goal(
    *,
    db: Session = Depends(get_db),
    goal_in: PetTrainingGoalCreate,
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Create a specific training goal for a pet.
    Requires 'entrenador' role.
    """
    # If a program_id is provided, verify it exists
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
    Update goal status, progress notes, and video proof.
    Requires 'entrenador' role.
    """
    db_goal = crud_training.get_goal_by_id(db=db, goal_id=id)
    if not db_goal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La meta de entrenamiento no existe"
        )
    return crud_training.update_goal(db=db, db_goal=db_goal, goal_in=goal_in)
