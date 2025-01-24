import { TypeAssignment } from "./enums";
import { AssignmentProgress } from "./progress";

export interface Assignment {
  assignment_id: string;
  description: string;
  timeLimit: number;
  base_id: string;
  type: TypeAssignment;
  createdAt: Date;
  multipleChoices: MultipleChoice[];
  progressAssignment: AssignmentProgress[];
  essay?: Essay;
  sentenceMatching?: SentenceMatching;
  studentAnswers: StudentAnswerAssignment[];
}

export interface MultipleChoice {
  mcq_id: string;
  question: string;
  options: string[]; // JSON type
  correctAnswer: string;
  assignment_id: string;
  studentAnswers: StudentAnswerAssignment[];
}

export interface Essay {
  essay_id: string;
  question: string;
  assignment_id: string;
  studentAnswers: StudentAnswerAssignment[];
}

export interface SentenceMatching {
  matching_id: string;
  questions: Pair[];
  assignment_id: string;
}

export interface Pair {
  pair_id: string;
  matching_id: string;
  question: string;
  correctAnswer: string;
  studentAnswers: StudentAnswerAssignment[];
}

export interface StudentAnswerAssignment {
  answer_id: string;
  student_id: string;
  assignment_id: string;
  mcq_id?: string;
  essay_id?: string;
  pair_id?: string;
  studentAnswer: string;
  isCorrect?: boolean;
  score: number;
  submittedAt: Date;
}
