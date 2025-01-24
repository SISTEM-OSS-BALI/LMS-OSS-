export interface CourseProgress {
  progress_course_id: string;
  completed: boolean;
  progress: number;
  totalMaterialAssignment: number;
  user_id: string;
  currentMaterialAssignmentBaseId?: string;
  course_id: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface MaterialProgress {
  progress_id: string;
  completed: boolean;
  user_id: string;
  material_id: string;
  base_id: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface AssignmentProgress {
  progress_id: string;
  completed: boolean;
  score: number;
  user_id: string;
  base_id: string;
  updatedAt: string;
  createdAt: string;
  assignment_id: string;
}
