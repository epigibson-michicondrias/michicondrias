/**
 * @module types/training
 * @description Types for the pet training domain — training programs, pet training goals,
 * and enrollment tracking.
 */

// ─── Training Programs ─────────────────────────────────────────────────────────

export interface TrainingProgram {
    id: string;
    trainer_id: string;
    title: string;
    description?: string;
    price: number;
    duration_weeks: number;
}

export interface TrainingProgramCreate {
    title: string;
    description?: string;
    price: number;
    duration_weeks?: number;
}

// ─── Pet Training Goals ─────────────────────────────────────────────────────────

export interface PetTrainingGoal {
    id: string;
    pet_id: string;
    program_id?: string;
    goal_name: string;
    status?: string;
    progress_notes?: string;
    video_proof_url?: string;
}

export interface PetTrainingGoalCreate {
    pet_id: string;
    program_id?: string;
    goal_name: string;
    status?: string;
    progress_notes?: string;
    video_proof_url?: string;
}

export interface PetTrainingGoalUpdate {
    status?: string;
    progress_notes?: string;
    video_proof_url?: string;
}

// ─── Enrollments ────────────────────────────────────────────────────────────────

export interface TrainingEnrollment {
    id: string;
    client_id: string;
    pet_id: string;
    program_id: string;
    start_date: string;
    status: string;
    total_paid: number;
    created_at: string;
}

export interface TrainingEnrollmentCreate {
    pet_id: string;
    program_id: string;
    start_date: string;
}

// ─── Constants & Defaults ───────────────────────────────────────────────────────

/** Goal status options */
export const TRAINING_GOAL_STATUS_OPTIONS = [
    { label: 'Pendiente', value: 'pending' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completado', value: 'completed' },
    { label: 'Verificado', value: 'verified' },
] as const;

/** Enrollment status options */
export const ENROLLMENT_STATUS_OPTIONS = [
    { label: 'Activo', value: 'active' },
    { label: 'Completado', value: 'completed' },
    { label: 'Cancelado', value: 'cancelled' },
] as const;
