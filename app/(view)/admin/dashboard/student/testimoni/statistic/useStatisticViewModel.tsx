import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";

export interface Student {
  username: string;
}

export interface Testimoni {
  testimonial_id: string;
  student_id: string;
  lesson_satisfaction: number;
  teaching_method_effectiveness: number;
  exercise_and_assignment_relevance: number;
  material_relevance: number;
  teacher_identity: string;
  teaching_delivery: number;
  teacher_attention: number;
  teacher_ethics: number;
  teacher_motivation: number;
  class_experience: string;
  favorite_part: string;
  improvement_suggestions: string;
  student: Student;
}

interface TestimoniResponse {
  data: Testimoni[];
}

export const useStatisticViewModel = () => {
  const {
    data: dataTestimoni,
    isLoading: isLoadingDataTestimoni,
    mutate,
  } = useSWR<TestimoniResponse>("/api/admin/testimoni/show", fetcher);

  return {
    dataTestimoni,
    isLoadingDataTestimoni,
  }
};
