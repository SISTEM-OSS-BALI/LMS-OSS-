import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { BaseMockTest, MockTest, User } from "@prisma/client";
import { Form, notification } from "antd";
import { time } from "console";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface MockTestDetailResponse {
  data: BaseMockTest[];
}

interface MockTestResponse {
  data: MockTest;
}

interface UserResponse {
  data: User[];
}

export const useDetailMockTestViewModel = () => {
  const query = useParams();
  const mockTestId = query.mock_test_id;
  const { data: dataDetailMockTest, mutate: mutateDetail } =
    useSWR<MockTestResponse>(
      `/api/teacher/mockTest/${mockTestId}/detail`,
      fetcher
    );
  const {
    data: mockTestDetailData,
    isLoading: mockTestDetailDataLoading,
    mutate: mockTestDetailMutate,
  } = useSWR<MockTestDetailResponse>(
    `/api/teacher/mockTest/${mockTestId}/show`,
    fetcher
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalAccessVisible, setIsModalAccessVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBase, setSelectedBase] = useState<BaseMockTest | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTimeLimit, setIsEditingTimeLimit] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const { data: dataStudentResponse, error: studentError } =
    useSWR<UserResponse>("/api/admin/student/show", fetcher);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const normalizedSearch = (searchTerm ?? "").toLowerCase();

  const activeStudents = dataStudentResponse?.data.filter(
    (student) => student.is_active === true
  );

  const filteredStudent = Array.isArray(activeStudents)
    ? activeStudents.filter((student) => {
        const username = (student.username ?? "").toLowerCase();
        const nameGroup = (student.name_group ?? "").toLowerCase();

        return (
          username.includes(normalizedSearch) ||
          nameGroup.includes(normalizedSearch)
        );
      })
    : [];

  const handleOpenModalAccess = () => {
    setIsModalAccessVisible(true);
  };

  const handleCancelModalAccess = () => {
    setIsModalAccessVisible(false);
    setSelectedStudent(null);
  };

  const handleSubmitAccess = async () => {
    try {
      setLoading(true);
      const payload = {
        student_id: selectedStudent,
        mock_test_id: mockTestId,
      };

      await crudService.post(`/api/teacher/mockTest/access/create`, payload);

      notification.success({ message: "Berhasil memberikan akses" });
      handleCancelModalAccess();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal memberikan akses" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleEdit = (base_id: string) => {
    const selectBase = mockTestDetailData?.data.find(
      (base) => base.base_mock_test_id === base_id
    );
    if (selectBase) {
      form.setFieldsValue({
        ...selectBase,
      });
      setSelectedBase(selectBase);
      handleOpenModal();
    }
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
    };
    try {
      if (selectedBase) {
        await crudService.put(
          `/api/teacher/mockTest/${mockTestId}/${selectedBase.base_mock_test_id}/updateBase`,
          payload
        );
      } else {
        await crudService.post(
          `/api/teacher/mockTest/${mockTestId}/createBase`,
          payload
        );
      }

      notification.success({ message: "Berhasil membuat data" });
      mockTestDetailMutate();
      handleCancelModal();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal membuat mock test" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (base_id: string) => {
    try {
      crudService.delete(
        `/api/teacher/mockTest/${mockTestId}/${base_id}/deleteBase`,
        base_id
      );
      notification.success({ message: "Berhasil menghapus data" });
      mockTestDetailMutate();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal menghapus data" });
    }
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
    form.setFieldsValue({
      description: dataDetailMockTest?.data.description || "",
    });
  };

  const handleEditTimeLimit = () => {
    setIsEditingTimeLimit(true);
    form.setFieldsValue({
      timeLimit: dataDetailMockTest?.data.timeLimit || "",
    });
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    const payload = {
      description: values.description,
      time_limit: values.timeLimit,
    };
    try {
      await crudService.patch(
        `/api/teacher/mockTest/${mockTestId}/handleEditDetail`,
        payload
      );
      notification.success({ message: "Berhasil mengedit data" });
      mutateDetail();
      setIsEditingDescription(false);
      setIsEditingTimeLimit(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDrawer = () => {
    setIsDrawerVisible(false);
    setIsEditingDescription(false);
    setIsEditingTimeLimit(false);
  };

  return {
    mockTestDetailData,
    mockTestDetailDataLoading,
    filteredStudent,
    handleSearch,
    handleCancelModalAccess,
    handleOpenModalAccess,
    loading,
    handleSubmitAccess,
    selectedStudent,
    setSelectedStudent,
    form,
    isModalAccessVisible,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    handleSubmit,
    handleDelete,
    selectedBase,
    handleEdit,
    dataDetailMockTest,
    handleEditDescription,
    handleEditTimeLimit,
    handleSave,
    isEditingDescription,
    isEditingTimeLimit,
    handleCancelDrawer,
    setIsDrawerVisible,
    isDrawerVisible,
  };
};
