import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { notification } from "antd";
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

export const useTestimoniViewModel = () => {
  const {
    data: dataTestimoni,
    isLoading: isLoadingDataTestimoni,
    mutate,
  } = useSWR<TestimoniResponse>("/api/admin/testimoni/show", fetcher);

  const handleDelete = async (testimonial_id: string) => {
    try {
      await crudService.delete(
        `/api/admin/testimoni/${testimonial_id}/delete`,
        testimonial_id
      );
      mutate();
      notification.success({ message: "Data berhasil dihapus" });
    } catch (error) {
      notification.error({
        message: "Data gagal dihapus",
      });
    }
  };
  return {
    dataTestimoni,
    isLoadingDataTestimoni,
    handleDelete,
  };
};
