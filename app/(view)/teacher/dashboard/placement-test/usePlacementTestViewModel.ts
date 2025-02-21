import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { PlacementTest } from "@prisma/client";
import { Form, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface PlacementTestResponse {
  data: PlacementTest[];
}

export const usePlacementTestViewModel = () => {
  const {
    data: dataPlacementTest,
    error,
    isLoading: isLoadingPlacementTest,
    mutate: mutatePlacementTest,
  } = useSWR<PlacementTestResponse>("/api/teacher/placementTest/show", fetcher);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedPlacement, setSelectedPlacement] = useState<
    PlacementTest | null | undefined
  >();

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedPlacement(null);
  };

  const handleEdit = (placement_id: string) => {
    const selectPlacement = dataPlacementTest?.data.find(
      (placement) => placement.placement_test_id === placement_id
    );
    if (selectPlacement) {
      form.setFieldsValue({
        ...selectPlacement,
        time_limit: selectPlacement.timeLimit,
      });
    }
    setSelectedPlacement(selectPlacement);
    handleOpenModal();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
    };

    try {
      if (selectedPlacement) {
        await crudService.put(
          `/api/teacher/placementTest/${selectedPlacement.placement_test_id}/update`,
          payload
        );
      } else {
        await crudService.post("/api/teacher/placementTest/create", payload);
      }
      notification.success({
        message: "Sukses",
        description: selectedPlacement
          ? "Data berhasil diperbarui"
          : "Data berhasil ditambahkan",
      });
      setLoading(false);
      mutatePlacementTest();
      handleCancelModal();
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (placement_id: string) => {
    try {
      await crudService.delete(
        `/api/teacher/placementTest/${placement_id}/delete`,
        placement_id
      );
      notification.success({
        message: "Sukses",
        description: "Data berhasil dihapus",
      });
      mutatePlacementTest();
    } catch (error) {
      console.error(error);
    }
  };

  return {
    dataPlacementTest,
    isLoadingPlacementTest,
    handleOpenModal,
    handleCancelModal,
    isModalVisible,
    form,
    handleSubmit,
    loading,
    handleEdit,
    selectedPlacement,
    handleDelete,
  };
};
