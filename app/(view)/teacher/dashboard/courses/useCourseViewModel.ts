import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Course } from "@/app/model/course";
import { User } from "@prisma/client";
import { Form, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface CourseResponse {
  data: Course[];
}

export const useCourseViewModel = () => {
  const {
    data: courseData,
    error: courseError,
    mutate: courseMutate,
  } = useSWR<CourseResponse>("/api/teacher/course/show", fetcher);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [form] = Form.useForm();

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const handleOk = async (values: any) => {
    setLoading(true);
    const payload = { name: values.name };

    let response;
    if (selectedId) {
      response = await crudService.put(
        `/api/teacher/course/${selectedId}/update`,
        payload
      );
    } else {
      response = await crudService.post("/api/teacher/course/create", payload);
    }

    if (response.status === 200) {
      notification.success({
        message: selectedId
          ? "Modul Berhasil Diperbarui"
          : "Modul Berhasil Dibuat",
      });

      if (selectedId) {
        courseMutate({
          ...courseData,
          data: courseData!.data.map((course: any) =>
            course.course_id === selectedId ? { ...course, ...payload } : course
          ),
        });
      } else {
        courseMutate({
          ...courseData,
          data: [...courseData!.data, response.data],
        });
      }
    }

    setLoading(false);
    form.resetFields();
    setIsModalVisible(false);
    setSelectedId(null);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    const response = await crudService.delete(
      `/api/teacher/course/${id}/delete`,
      id
    );

    if (response.status === 200) {
      notification.success({
        message: "Modul Berhasil Dihapus",
      });
      courseMutate({
        ...courseData,
        data: courseData!.data.filter((course: any) => course.course_id !== id),
      });
    } else {
      notification.error({
        message: "Gagal Menghapus Modul",
        description: response.data.message || "Terjadi kesalahan.",
      });
    }

    setLoading(false);
  };

  const handleUpdate = (id: string) => {
    setSelectedId(id);
    setIsModalVisible(true);
    const selectedCourse = courseData?.data?.find(
      (item: any) => item.course_id === id
    );

    if (selectedCourse) {
      form.setFieldsValue({ name: selectedCourse.name });
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredCourses = courseData?.data.filter((course: any) =>
    course.name.toLowerCase().includes(searchTerm)
  );
  return {
    loading,
    isModalVisible,
    handleCancel,
    handleOk,
    handleDelete,
    handleUpdate,
    courseData,
    courseError,
    selectedId,
    form,
    setIsModalVisible,
    handleSearch,
    filteredCourses,
  };
};
