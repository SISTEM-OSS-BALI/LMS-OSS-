import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import {
  BasePlacementTest,
  MultipleChoicePlacementTest,
  PlacementTest,
} from "@prisma/client";
import { Form, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface PlacementTestResponse {
  data: PlacementTest;
}

interface UserResponse {
  data: User[];
}

interface BasePlacementTestResponse {
  data: BasePlacementTest[];
}

export const useDetailPlacementTestViewModel = () => {
  const query = useParams();
  const placement_test_id = query.placement_test_id;

  const { data: dataDetailPlacementTest, mutate: mutateDetail } =
    useSWR<PlacementTestResponse>(
      `/api/teacher/placementTest/${placement_test_id}/detail`,
      fetcher
    );

  const {
    data: basePlacementTestData,
    mutate: mutateBasePlacementTest,
    isLoading: isLoadingBasePlacementTest,
  } = useSWR<BasePlacementTestResponse>(
    `/api/teacher/placementTest/${placement_test_id}/showBase`,
    fetcher
  );

  const { data: dataStudentResponse, error: studentError } =
    useSWR<UserResponse>("/api/admin/student/show", fetcher);

  const [isModalAccessVisible, setIsModalAccessVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBase, setSelectedBase] = useState<BasePlacementTest | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [form] = Form.useForm();

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingTimeLimit, setIsEditingTimeLimit] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);


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

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedBase(null);
  };

  const handleEdit = (base_id: string) => {
    const selectBase = basePlacementTestData?.data.find(
      (base) => base.base_id === base_id
    );
    if (selectBase) {
      form.setFieldsValue({
        ...selectBase,
      });
      setSelectedBase(selectBase);
      handleOpenModal();
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
    };
    try {
      if (selectedBase) {
        await crudService.put(
          `/api/teacher/placementTest/${placement_test_id}/${selectedBase.base_id}/updateBase`,
          payload
        );
      } else {
        await crudService.post(
          `/api/teacher/placementTest/${placement_test_id}/createBase`,
          payload
        );
      }

      notification.success({ message: "Berhasil membuat data" });
      mutateBasePlacementTest();
      handleCancelModal();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal membuat placement test" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAccess = async () => {
    try {
      setLoading(true);
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

  const handleDelete = (base_id: string) => {
    try {
      crudService.delete(
        `/api/teacher/placementTest/${placement_test_id}/${base_id}/deleteBase`,
        base_id
      );
      notification.success({ message: "Berhasil menghapus data" });
      mutateBasePlacementTest();
      mutateDetail();
    } catch (error) {
      console.error(error);
      notification.error({ message: "Gagal menghapus data" });
    }
  };

  const handleEditDescription = () => {
    setIsEditingDescription(true);
    form.setFieldsValue({
      description: dataDetailPlacementTest?.data.description,
    });
  };

  const handleEditTimeLimit = () => {
    setIsEditingTimeLimit(true);
    form.setFieldsValue({ timeLimit: dataDetailPlacementTest?.data.timeLimit });
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    const payload = {
      description : values.description,
      time_limit : values.timeLimit
    };
    try {
      await crudService.patch(
        `/api/teacher/placementTest/${placement_test_id}/handleEditDetail`,
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
    dataDetailPlacementTest,
    handleOpenModalAccess,
    isModalVisible,
    isModalAccessVisible,
    handleCancelModalAccess,
    filteredStudent,
    handleSearch,
    setSelectedStudent,
    selectedStudent,
    form,
    handleSubmitAccess,
    loading,
    basePlacementTestData,
    isLoadingBasePlacementTest,
    handleOpenModal,
    handleCancelModal,
    handleSubmit,
    handleEdit,
    selectedBase,
    handleDelete,
    handleEditDescription,
    handleEditTimeLimit,
    isEditingDescription,
    isEditingTimeLimit,
    handleSave,
    handleCancelDrawer,
    setIsDrawerVisible,
    isDrawerVisible,
  };
};
