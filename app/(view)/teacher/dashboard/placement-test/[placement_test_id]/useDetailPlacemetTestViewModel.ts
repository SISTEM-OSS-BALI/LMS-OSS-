import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { MultipleChoicePlacementTest, PlacementTest } from "@prisma/client";
import { Form, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface PlacementTestResponse {
  data: PlacementTest;
}

interface MultipleChoiceResponse {
  data: MultipleChoicePlacementTest[];
}

interface UserResponse {
  data: User[];
}

export const useDetailPlacementTestViewModel = () => {
  const query = useParams();
  const placement_test_id = query.placement_test_id;

  const { data: dataDetailPlacementTest, error: detailPlacementError } =
    useSWR<PlacementTestResponse>(
      `/api/teacher/placementTest/${placement_test_id}/detail`,
      fetcher
    );

  const { data: dataDetailMultipleChoice, error: detailMultipleChoiceError } =
    useSWR<MultipleChoiceResponse>(
      `/api/teacher/placementTest/${placement_test_id}/showMultipleChoice`,
      fetcher
    );

  const { data: dataStudentResponse, error: studentError } =
    useSWR<UserResponse>("/api/admin/student/show", fetcher);

  const [isModalAccessVisible, setIsModalAccessVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [form] = Form.useForm();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      console.log(selectedStudent);
      const payload = {
        student_id: selectedStudent,
        placement_test_id: placement_test_id,
      };

      await crudService.post(
        `/api/teacher/placementTest/access/create`,
        payload
      );

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
    dataDetailPlacementTest,
    dataDetailMultipleChoice,
    handleOpenModalAccess,
    isModalAccessVisible,
    handleCancelModalAccess,
    filteredStudent,
    handleSearch,
    setSelectedStudent,
    selectedStudent,
    form,
    handleSubmit,
    loading,
  };
};
