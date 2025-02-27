import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { BaseMockTest, User } from "@prisma/client";
import { Form, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface MockTestDetailResponse {
  data: BaseMockTest[];
}

interface UserResponse {
  data: User[];
}

export const useDetailMockTestViewModel = () => {
  const query = useParams();
  const mockTestId = query.mock_test_id;
  const { data: mockTestDetailData, isLoading: mockTestDetailDataLoading } =
    useSWR<MockTestDetailResponse>(
      `/api/teacher/mockTest/${mockTestId}/show`,
      fetcher
    );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalAccessVisible, setIsModalAccessVisible] = useState(false);

  const { data: dataStudentResponse, error: studentError } =
    useSWR<UserResponse>("/api/admin/student/show", fetcher);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredStudent = Array.isArray(dataStudentResponse?.data)
    ? dataStudentResponse.data.filter((student) =>
        student.username.toLowerCase().includes(searchTerm)
      )
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
  };
};
