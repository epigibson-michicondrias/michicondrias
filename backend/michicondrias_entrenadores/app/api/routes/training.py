from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from datetime import date, timedelta
from sqlalchemy import bindparam, func, text
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.api import deps
from app.crud import crud_training
from app.models.training import PetTrainingGoal, TrainingEnrollment, TrainingProgram
from app.schemas.training import (
    TrainingProgramCreate,
    TrainingProgramUpdate,
    TrainingProgramResponse,
    PetTrainingGoalCreate,
    PetTrainingGoalResponse,
    PetTrainingGoalUpdate,
    TrainingEnrollmentCreate,
    TrainingEnrollmentResponse,
)

router = APIRouter()

GOAL_STATUSES = {"pending", "not_started", "in_progress", "video_submitted", "completed", "rejected"}
# El cliente solo puede cancelar su inscripción; el entrenador la completa o la cancela.
PROVIDER_ENROLLMENT_TRANSITIONS = {"active": {"completed", "cancelled"}}
CLIENT_ENROLLMENT_TRANSITIONS = {"active": {"cancelled"}}


def _names(db: Session, table: str, column: str, ids: set) -> dict:
    """Mapa id -> nombre leyendo tablas hermanas (misma BD). Si falla, devuelve vacío sin romper la respuesta."""
    if not ids:
        return {}
    try:
        stmt = text(f"SELECT id, {column} FROM {table} WHERE id IN :ids").bindparams(bindparam("ids", expanding=True))
        return {str(r[0]): r[1] for r in db.execute(stmt, {"ids": list(ids)}).fetchall()}
    except Exception:
        db.rollback()
        return {}


def _programs_out(db: Session, programs: list) -> list:
    users = _names(db, "users", "full_name", {p.trainer_id for p in programs})
    counts = {}
    if programs:
        rows = (
            db.query(TrainingEnrollment.program_id, func.count(TrainingEnrollment.id))
            .filter(TrainingEnrollment.program_id.in_([p.id for p in programs]), TrainingEnrollment.status != "cancelled")
            .group_by(TrainingEnrollment.program_id)
            .all()
        )
        counts = {r[0]: r[1] for r in rows}
    out = []
    for p in programs:
        item = TrainingProgramResponse.model_validate(p)
        item.trainer_name = users.get(p.trainer_id)
        item.enrollments_count = counts.get(p.id, 0)
        out.append(item)
    return out


def _enrollments_out(db: Session, enrollments: list) -> list:
    if not enrollments:
        return []
    programs = {p.id: p for p in db.query(TrainingProgram).filter(TrainingProgram.id.in_({e.program_id for e in enrollments})).all()}
    pets = _names(db, "pets", "name", {e.pet_id for e in enrollments})
    users = _names(db, "users", "full_name", {e.client_id for e in enrollments} | {p.trainer_id for p in programs.values()})
    goals = db.query(PetTrainingGoal).filter(
        PetTrainingGoal.pet_id.in_({e.pet_id for e in enrollments}),
        PetTrainingGoal.program_id.in_(list(programs.keys())),
    ).all()
    out = []
    for e in enrollments:
        item = TrainingEnrollmentResponse.model_validate(e)
        prog = programs.get(e.program_id)
        mine = [g for g in goals if g.pet_id == e.pet_id and g.program_id == e.program_id]
        item.program_title = prog.title if prog else None
        item.pet_name = pets.get(e.pet_id)
        item.client_name = users.get(e.client_id)
        item.trainer_name = users.get(prog.trainer_id) if prog else None
        item.goals_total = len(mine)
        item.goals_done = len([g for g in mine if g.status == "completed"])
        out.append(item)
    return out

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
    created = crud_training.create_program(db=db, program_in=program_in, trainer_id=trainer_id)
    return _programs_out(db, [created])[0]


@router.get("/programs", response_model=List[TrainingProgramResponse])
def read_all_programs(
    db: Session = Depends(get_db)
) -> Any:
    """
    Get all active training programs. Public endpoint.
    """
    return _programs_out(db, crud_training.get_all_active_programs(db=db))


@router.get("/programs/mine", response_model=List[TrainingProgramResponse])
def read_my_programs(
    *,
    db: Session = Depends(get_db),
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Programas del entrenador autenticado. Requires 'entrenador' role.
    """
    return _programs_out(db, crud_training.get_programs_by_trainer(db=db, trainer_id=trainer_id))


@router.patch("/programs/{program_id}", response_model=TrainingProgramResponse)
def update_training_program(
    program_id: str,
    program_in: TrainingProgramUpdate,
    *,
    db: Session = Depends(get_db),
    trainer_id: str = Depends(deps.require_entrenador),
) -> Any:
    """
    Edita un programa propio. Requires 'entrenador' role.
    """
    program = crud_training.get_program_by_id(db=db, program_id=program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El programa no existe")
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes editar tus propios programas")
    for key, value in program_in.model_dump(exclude_unset=True).items():
        setattr(program, key, value)
    db.commit()
    db.refresh(program)
    return _programs_out(db, [program])[0]


@router.delete("/programs/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_training_program(
    program_id: str,
    *,
    db: Session = Depends(get_db),
    trainer_id: str = Depends(deps.require_entrenador),
) -> None:
    """
    Elimina un programa propio que no tenga inscripciones. Requires 'entrenador' role.
    """
    program = crud_training.get_program_by_id(db=db, program_id=program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El programa no existe")
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes eliminar tus propios programas")
    if db.query(TrainingEnrollment).filter(TrainingEnrollment.program_id == program_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes eliminar un programa que ya tiene inscripciones")
    db.query(PetTrainingGoal).filter(PetTrainingGoal.program_id == program_id).delete()
    db.delete(program)
    db.commit()


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
    if not goal_in.program_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La meta debe pertenecer a un programa")
    program = crud_training.get_program_by_id(db=db, program_id=goal_in.program_id)
    if not program:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El programa de entrenamiento especificado no existe"
        )
    if program.trainer_id != trainer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes crear metas en tus propios programas")
    if goal_in.status not in GOAL_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de meta inválido")
    enrolled = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.pet_id == goal_in.pet_id,
        TrainingEnrollment.program_id == goal_in.program_id,
        TrainingEnrollment.status != "cancelled",
    ).first()
    if not enrolled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Esa mascota no está inscrita en tu programa")
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
    goal_program = crud_training.get_program_by_id(db=db, program_id=db_goal.program_id) if db_goal.program_id else None
    if not goal_program or goal_program.trainer_id != trainer_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes editar metas de tus propios programas")
    if goal_in.status is not None and goal_in.status not in GOAL_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Estado de meta inválido")
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
    owner = db.execute(text("SELECT owner_id FROM pets WHERE id = :pet_id"), {"pet_id": enroll_in.pet_id}).first()
    if not owner or owner[0] != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes inscribir a tu propia mascota")
    if program.trainer_id == current_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No puedes inscribirte en tu propio programa")
    if enroll_in.start_date < date.today() - timedelta(days=1):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La fecha de inicio no puede ser en el pasado")
    already = db.query(TrainingEnrollment).filter(
        TrainingEnrollment.pet_id == enroll_in.pet_id,
        TrainingEnrollment.program_id == enroll_in.program_id,
        TrainingEnrollment.status == "active",
    ).first()
    if already:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Esa mascota ya está inscrita en este programa")
    created = crud_training.create_enrollment(db=db, enroll_in=enroll_in, client_id=current_user_id, price=program.price)
    return _enrollments_out(db, [created])[0]


@router.get("/enrollments/client", response_model=List[TrainingEnrollmentResponse])
def read_client_enrollments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Get all training enrollments for the logged-in client.
    """
    rows = crud_training.get_enrollments_for_client(db=db, client_id=current_user_id)
    rows.sort(key=lambda e: e.created_at.timestamp() if e.created_at else 0, reverse=True)
    return _enrollments_out(db, rows)


@router.get("/enrollments/provider", response_model=List[TrainingEnrollmentResponse])
def read_provider_enrollments(
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.require_entrenador)
) -> Any:
    """
    Get all training enrollments requested from the logged-in trainer. Requires 'entrenador' role.
    """
    rows = crud_training.get_enrollments_for_trainer(db=db, trainer_id=current_user_id)
    rows.sort(key=lambda e: e.created_at.timestamp() if e.created_at else 0, reverse=True)
    return _enrollments_out(db, rows)


@router.patch("/enrollments/{enrollment_id}/status", response_model=TrainingEnrollmentResponse)
def update_enrollment_status(
    enrollment_id: str,
    new_status: str = Query(..., alias="status"),
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id),
) -> Any:
    """
    Cambia el estado de una inscripción. El entrenador del programa la completa o cancela; el cliente solo la cancela.
    """
    enrollment = db.query(TrainingEnrollment).filter(TrainingEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La inscripción no existe")
    program = crud_training.get_program_by_id(db=db, program_id=enrollment.program_id)
    is_trainer = bool(program) and program.trainer_id == current_user_id
    if not is_trainer and enrollment.client_id != current_user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para modificar esta inscripción")
    transitions = PROVIDER_ENROLLMENT_TRANSITIONS if is_trainer else CLIENT_ENROLLMENT_TRANSITIONS
    if new_status not in transitions.get(enrollment.status, set()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese cambio de estado no está permitido")
    enrollment.status = new_status
    db.commit()
    db.refresh(enrollment)
    return _enrollments_out(db, [enrollment])[0]


@router.get("/enrollments/{enrollment_id}/goals", response_model=List[PetTrainingGoalResponse])
def read_enrollment_goals(
    enrollment_id: str,
    *,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(deps.get_current_user_id)
) -> Any:
    """
    Goals of an enrollment (same pet and program). Only the client who enrolled or the program's trainer can see them.
    """
    enrollment = db.query(TrainingEnrollment).filter(TrainingEnrollment.id == enrollment_id).first()
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La inscripción no existe")
    program = crud_training.get_program_by_id(db=db, program_id=enrollment.program_id)
    if current_user_id not in (enrollment.client_id, program.trainer_id if program else None):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a las metas de esta inscripción")
    return (
        db.query(PetTrainingGoal)
        .filter(PetTrainingGoal.pet_id == enrollment.pet_id, PetTrainingGoal.program_id == enrollment.program_id)
        .all()
    )


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
