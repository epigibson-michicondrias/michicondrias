from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

# ==========================================
# TRAINING PROGRAM SCHEMAS
# ==========================================

class TrainingProgramBase(BaseModel):
    title: str = Field(..., max_length=150)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    duration_weeks: int = Field(default=4, ge=1)

class TrainingProgramCreate(TrainingProgramBase):
    pass

class TrainingProgramUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=150)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    duration_weeks: Optional[int] = Field(None, ge=1)

class TrainingProgramResponse(TrainingProgramBase):
    id: str
    trainer_id: str

    class Config:
        from_attributes = True


# ==========================================
# PET TRAINING GOAL SCHEMAS
# ==========================================

class PetTrainingGoalBase(BaseModel):
    pet_id: str = Field(..., max_length=36)
    program_id: Optional[str] = Field(None, max_length=36)
    goal_name: str = Field(..., max_length=150)
    status: str = Field(default="not_started", max_length=20)
    progress_notes: Optional[str] = None
    video_proof_url: Optional[str] = Field(None, max_length=500)

class PetTrainingGoalCreate(PetTrainingGoalBase):
    pass

class PetTrainingGoalUpdate(BaseModel):
    status: Optional[str] = Field(None, max_length=20)
    progress_notes: Optional[str] = None
    video_proof_url: Optional[str] = Field(None, max_length=500)

class PetTrainingGoalResponse(PetTrainingGoalBase):
    id: str

    class Config:
        from_attributes = True


# ==========================================
# TRAINING ENROLLMENT SCHEMAS
# ==========================================

class TrainingEnrollmentCreate(BaseModel):
    pet_id: str = Field(..., max_length=36)
    program_id: str = Field(..., max_length=36)
    start_date: date

class TrainingEnrollmentResponse(BaseModel):
    id: str
    client_id: str
    pet_id: str
    program_id: str
    start_date: date
    status: str
    total_paid: float
    created_at: datetime

    class Config:
        from_attributes = True
