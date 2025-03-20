import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { MockTest } from "@prisma/client";
import { Form, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface MockTestResponse {
  data: MockTest[];
}

export const useMockTestViewModel = () => {
  const {
    data: mockTestData,
    isLoading: mockTestDataLoading,
    mutate: mockTestDataMutate,
  } = useSWR<MockTestResponse>("/api/teacher/mockTest/show", fetcher);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedMockTest, setSelectedMockTest] = useState<
    MockTest | null | undefined
  >();
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleEdit = (mock_test_id: string) => {
    const selectMockTest = mockTestData?.data.find(
      (mock) => mock.mock_test_id === mock_test_id
    );
    if (selectMockTest) {
      form.setFieldsValue({
        ...selectMockTest,
      });
    }
    setSelectedMockTest(selectMockTest);
    handleOpenModal();
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedMockTest(null);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      ...values,
      time_limit: values.timeLimit,
    };

    try {
      if (selectedMockTest) {
        await crudService.put(
          `/api/teacher/mockTest/${selectedMockTest.mock_test_id}/update`,
          payload
        );
      } else {
        await crudService.post("/api/teacher/mockTest/create", payload);
      }
      notification.success({
        message: "Sukses",
        description: selectedMockTest
          ? "Data berhasil diperbarui"
          : "Data berhasil ditambahkan",
      });
      setLoading(false);
      mockTestDataMutate();
      handleCancelModal();
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mock_test_id: string) => {
    try {
      await crudService.delete(
        `/api/teacher/mockTest/${mock_test_id}/delete`,
        mock_test_id
      );
      notification.success({
        message: "Sukses",
        description: "Data berhasil dihapus",
      });
      mockTestDataMutate();
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerateQRCode = (mock_test_id: string) => {
    const selectMockTest = mockTestData?.data.find(
      (mock) => mock.mock_test_id === mock_test_id
    );
    setSelectedMockTest(selectMockTest);
    setQrModalVisible(true);
  };

  const handleOpenModalQr = () => {
    setQrModalVisible(true);
  };

  const handleCancelOpenModalQr = () => {
    setQrModalVisible(false);
    setSelectedMockTest(null);
  };

  return {
    mockTestData,
    mockTestDataLoading,
    handleCancelModal,
    handleOpenModal,
    isModalVisible,
    form,
    handleSubmit,
    handleEdit,
    selectedMockTest,
    loading,
    handleDelete,
    handleGenerateQRCode,
    handleCancelOpenModalQr,
    qrModalVisible,
    handleOpenModalQr,
  };
};
