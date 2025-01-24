import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Course } from "@/app/model/course";
import { notification } from "antd";
import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";


interface CourseResponse {
  data: Course[];
}

export const useCourseViewModel = () => {
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [courseCode, setCourseCode] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const router = useRouter();
    const { data } = useSWR<CourseResponse>("/api/student/course/show", fetcher);
;

    const filteredCourses =
      data && data.data
        ? data.data.filter((course: any) =>
            course.name.toLowerCase().includes(searchTerm)
          )
        : [];

    const handleOk = async (values: any) => {
      setLoading(true);
      try {
        const payload = {
          code_course: values.course_code,
          course_id: selectedCourse!.course_id,
        };
        const response = await crudService.post(
          "/api/student/course/joinCourse",
          {
            payload,
          }
        );

        if (response.status === 200) {
          notification.success({
            message: "Berhasil Join Modul",
          });
        }
      } catch (error) {
        console.error("Error joining course:", error);
        notification.error({
          message: "Gagal join Modul",
        });
      } finally {
        setLoading(false);
        setIsModalVisible(false);
        setCourseCode("");
        router.push(`/student/dashboard/course-followed`);
      }
    };

    return {
      loading,
      selectedCourse,
      isModalVisible,
      courseCode,
      searchTerm,
      filteredCourses,
      handleOk,
      handleCancel: () => {
        setIsModalVisible(false);
      },
      handleCardClick: (course: Course) => {
        setSelectedCourse(course);
        setIsModalVisible(true);
      },
      handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value.toLowerCase());
      },
    };
};