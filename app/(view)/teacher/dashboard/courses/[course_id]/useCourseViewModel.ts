import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Program, User } from "@prisma/client";
import { Form, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface UserResponse {
  data: User[];
}

interface ProgramResponse {
  data: Program[];
}

export const useCourseViewModel = () => {
  const query = useParams();
  const course_id = query.course_id;
  const { data: courseData, error: courseError } = useSWR(
    `/api/teacher/course/${course_id}/detail`,
    fetcher
  );
  const {
    data: materialsData,
    mutate,
    error: materialsError,
  } = useSWR(`/api/teacher/materialAssignmentBase/${course_id}/show`, fetcher);
  const { data: studentEnrolled, error: studentEnrolledError } = useSWR(
    `/api/teacher/studentEnrolled/${course_id}/show`,
    fetcher
  );
  const { data: dataStudentResponse, error: studentError } =
    useSWR<UserResponse>("/api/admin/student/show", fetcher);

  const { data: programDataAll, isLoading: isLoadingProgram } =
    useSWR<ProgramResponse>("/api/teacher/student/showProgram", fetcher);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChoosingType, setIsChoosingType] = useState(true);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchTermStudent, setSearchTermStudent] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isModalAccessVisible, setIsModalAccessVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const detailCourse = courseData?.data || {};
  const materialsList = Array.isArray(materialsData?.data)
    ? materialsData.data
    : [];

  const studentEnrolledList = Array.isArray(studentEnrolled?.data)
    ? studentEnrolled.data
    : [];

  const handleSearchStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTermStudent(e.target.value.toLowerCase());
  };

  const mergedData = dataStudentResponse?.data.map((student) => {
    const program = programDataAll?.data.find(
      (program) => program.program_id === student.program_id
    );
    return {
      ...student,
      program_name: program?.name,
    };
  });

  const filteredStudent = Array.isArray(dataStudentResponse?.data)
    ? mergedData?.filter((student) =>
        student.username.toLowerCase().includes(searchTermStudent)
      )
    : [];

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsChoosingType(true);
    setIsCreatingAssignment(false);
    setSelectedId("");
  };

  const handleUpdate = (id: string) => {
    setSelectedId(id);
    setIsModalVisible(true);

    const selectedItem = materialsList.find((item: any) => item.base_id === id);

    if (selectedItem) {
      form.setFieldsValue({
        title: selectedItem.title,
      });
      setIsCreatingAssignment(selectedItem.type === "ASSIGNMENT");
      setIsChoosingType(false);
    } else {
      form.resetFields();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await crudService.delete(
        `/api/teacher/materialAssignmentBase/${course_id}/${id}/delete`,
        id
      );
      await mutate();
      notification.success({ message: "Item berhasil dihapus" });
    } catch (error) {
      console.error("Error deleting item:", error);
      notification.error({ message: "Gagal menghapus item" });
    }
  };

  const handleCreate = () => {
    setIsChoosingType(true);
    setIsModalVisible(true);
  };

  const handleOpenModalAccess = () => {
    setIsModalAccessVisible(true);
  };

  const handleCancelModalAccess = () => {
    setIsModalAccessVisible(false);
  };

  const handleTypeSelection = (type: "material" | "assignment") => {
    setIsCreatingAssignment(type === "assignment");
    setIsChoosingType(false);
  };

  const handleOk = async (values: any) => {
    setLoading(true);

    const payload = {
      title: values.title,
      course_id: course_id,
      type: isCreatingAssignment ? "ASSIGNMENT" : "MATERIAL",
    };

    try {
      if (selectedId) {
        await crudService.put(
          `/api/teacher/materialAssignmentBase/${course_id}/${selectedId}/update`,
          payload
        );
        notification.success({
          message: isCreatingAssignment
            ? "Assignment berhasil diperbarui"
            : "Materi berhasil diperbarui",
        });
      } else {
        await crudService.post(
          "/api/teacher/materialAssignmentBase/create",
          payload
        );
        notification.success({
          message: isCreatingAssignment
            ? "Assignment berhasil dibuat"
            : "Materi berhasil dibuat",
        });
      }

      form.resetFields();
      await mutate();
      setSelectedId("");
      setIsModalVisible(false);
      setIsCreatingAssignment(false);
    } catch (error) {
      console.error("Error saving item:", error);
      notification.error({ message: "Gagal menyimpan perubahan" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAccess = async () => {
    try {
      setLoading(true);
      const payload = {
        student_id: selectedStudent,
        course_id: course_id,
      };

      await crudService.post(`/api/teacher/course/access/create`, payload);

      notification.success({ message: "Berhasil memberikan akses" });
      handleCancelModalAccess();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal memberikan akses" });
    } finally {
      setLoading(false);
    }
  };
  return {
    detailCourse,
    materialsList,
    studentEnrolledList,
    isModalVisible,
    isChoosingType,
    isCreatingAssignment,
    isDrawerVisible,
    form,
    loading,
    selectedId,
    handleCancel,
    handleUpdate,
    handleDelete,
    handleCreate,
    handleTypeSelection,
    handleOk,
    courseError,
    materialsError,
    studentEnrolledError,
    courseData,
    materialsData,
    studentEnrolled,
    setIsDrawerVisible,
    course_id,
    handleSearchStudent,
    filteredStudent,
    setSelectedStudent,
    selectedStudent,
    handleCancelModalAccess,
    handleOpenModalAccess,
    isModalAccessVisible,
    handleSubmitAccess,
  };
};
