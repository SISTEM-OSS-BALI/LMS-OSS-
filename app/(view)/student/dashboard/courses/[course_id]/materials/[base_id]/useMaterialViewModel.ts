import { fetcher } from "@/app/lib/utils/fetcher";
import { Assignment } from "@/app/model/assigment";
import { Material, MaterialAssignmentBase } from "@/app/model/material";
import {
  AssignmentProgress,
  CourseProgress,
  MaterialProgress,
} from "@/app/model/progress";
import { message, notification } from "antd";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { crudService } from "@/app/lib/services/crudServices";

interface MaterialResponse {
  data: Material;
}

interface AssignmentResponse {
  data: Assignment[];
}

interface AssignmentProgressResponse {
  data: AssignmentProgress;
}

interface MaterialAssignmentBaseResponse {
  data: MaterialAssignmentBase[];
}

export const useMaterialViewModel = (base_id: string, course_id: string) => {
  const router = useRouter();
  const { data: materialData, error: materialError } = useSWR<MaterialResponse>(
    `/api/teacher/material/${base_id}/show`,
    fetcher
  );

  const { data: assignmentData, error: assignmentError } = useSWR(
    `/api/teacher/assignment/${base_id}/show`,
    fetcher
  );

  const {
    data: pointData,
    error: pointError,
    mutate: pointMutate,
  } = useSWR<AssignmentProgressResponse>(
    `/api/student/answerAssignment/${base_id}/${assignmentData?.data.assignment_id}/showPoint`,
    fetcher
  );

  const { data: materialBaseData, error: materialBaseError } =
    useSWR<MaterialAssignmentBaseResponse>(
      `/api/teacher/materialAssignmentBase/${course_id}/show`,
      fetcher
    );

  const {
    data: progressCourseData,
    error: progressError,
    mutate: progressCourseMutate,
  } = useSWR(`/api/student/material/showCourseProgress`, fetcher);

  const {
    data: progressMaterialData,
    error: progressMaterialError,
    mutate: progressMaterialMutate,
  } = useSWR(`/api/student/material/showMaterialProgress`, fetcher);

  const material = materialData?.data;
  const assignment = assignmentData?.data;
  const pointStudent = pointData?.data;
  const materialBases = materialBaseData?.data || [];
  const progressCourse = progressCourseData?.data.find(
    (item: any) => item.course_id === course_id
  );

  const currentIndex = Array.isArray(materialBases)
    ? materialBases.findIndex((base) => base.base_id === base_id)
    : -1;
  const nextIndex = currentIndex + 1;

  const handleNext = async () => {
    if (progressCourse?.progress === 100) {
      if (nextIndex < materialBases!.length) {
        const nextBaseId = materialBases![nextIndex].base_id;
        router.push(
          `/student/dashboard/courses/${course_id}/materials/${nextBaseId}`
        );
      } else {
        notification.success({ message: "Kursus berhasil diselesaikan." });
        router.push(`/student/dashboard/course-followed`);
      }
      return;
    }

    const currentMaterialBaseId = base_id;

    const payload = {
      material_id: material?.material_id,
      assignment_id: assignment?.assignment_id,
      base_id: base_id,
      course_id: course_id,
      currentMaterialBaseId: currentMaterialBaseId,
    };

    try {
      await crudService.post("/api/student/material/updateProgress", payload);

      await progressCourseMutate();
      await progressMaterialMutate();

      if (nextIndex < materialBases!.length) {
        const nextBaseId = materialBases![nextIndex].base_id;
        router.push(
          `/student/dashboard/courses/${course_id}/materials/${nextBaseId}`
        );
      } else {
        notification.success({ message: "Kursus berhasil diselesaikan." });
        router.push(`/student/dashboard/course-followed`);
      }
    } catch (error) {
      console.error("Error updating progress:", error);

      if (nextIndex < materialBases!.length) {
        message.error("Failed to update progress.");
      } else {
        message.error("Failed to complete course.");
      }
    }
  };

  return {
    materialError,
    assignmentError,
    pointMutate,
    materialBaseError,
    progressCourseMutate,
    progressMaterialData,
    progressMaterialMutate,
    handleNext,
    nextIndex,
    material,
    assignment,
    pointStudent,
    materialBases,
    progressCourse
  };
};
