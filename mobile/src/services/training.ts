import { apiFetch } from "../lib/api";

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

export async function getAllPrograms(): Promise<TrainingProgram[]> {
    return apiFetch<TrainingProgram[]>("entrenadores", "/programs");
}

export async function createProgram(data: TrainingProgramCreate): Promise<TrainingProgram> {
    return apiFetch<TrainingProgram>("entrenadores", "/programs", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function createGoal(data: PetTrainingGoalCreate): Promise<PetTrainingGoal> {
    return apiFetch<PetTrainingGoal>("entrenadores", "/goals", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateGoal(goalId: string, data: PetTrainingGoalUpdate): Promise<PetTrainingGoal> {
    return apiFetch<PetTrainingGoal>("entrenadores", `/goals/${goalId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
}

export async function enrollPet(data: TrainingEnrollmentCreate): Promise<TrainingEnrollment> {
    return apiFetch<TrainingEnrollment>("entrenadores", "/enroll", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function getClientEnrollments(): Promise<TrainingEnrollment[]> {
    return apiFetch<TrainingEnrollment[]>("entrenadores", "/enrollments/client");
}

export async function getProviderEnrollments(): Promise<TrainingEnrollment[]> {
    return apiFetch<TrainingEnrollment[]>("entrenadores", "/enrollments/provider");
}

export async function reviewGoalVideo(goalId: string, approved: boolean, notes: string): Promise<PetTrainingGoal> {
    const params = new URLSearchParams({ approved: String(approved), notes });
    return apiFetch<PetTrainingGoal>("entrenadores", `/goals/${goalId}/review-video?${params}`, {
        method: "POST",
    });
}
