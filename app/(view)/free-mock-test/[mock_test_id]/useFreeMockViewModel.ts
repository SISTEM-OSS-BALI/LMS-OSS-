import { fetcher } from "@/app/lib/utils/fetcher";
import { MockTest, PlacementTest } from "@prisma/client";
import { Form, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface MockTestResponse {
  data: MockTest;
}

export const useFreeMockTestViewModel = () => {
  const query = useParams();
  const mock_test_id = query.mock_test_id;
  const { data: mockTestData, isLoading: isLoadingMock } =
    useSWR<MockTestResponse>(
      `/api/freeMockTest/${mock_test_id}/detail`,
      fetcher
    );

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [isModalStartVisible, setIsModalStartVisible] = useState(false);
  const [email, setEmail] = useState("");

  const showModal = () => {
    setIsModalVisible(true);
  };

  // Function untuk menutup modal
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Function untuk submit form
  const handleFormSubmit = async (values: any) => {
    const payload = { ...values };
    try {
      setLoading(true);
      const res = await fetch(
        `/api/freeMockTest/${mock_test_id}/registerParticipant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (res.ok) {
        message.success("Pendaftaran berhasil");
        setIsModalStartVisible(true);
        setEmail(values.email);
        setIsModalVisible(false);
      } else {
        if (res.status === 409) {
          message.error("Email sudah terdaftar untuk sesi hari ini.");
        } else {
          message.error(data.error || "Terjadi kesalahan");
        }
      }
    } catch (error) {
      message.error("Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    router.push(`/free-mock-test/${mock_test_id}/question?email=${email}`);
  };

  return {
    mockTestData,
    isLoadingMock,
    isModalVisible,
    showModal,
    handleCancel,
    handleFormSubmit,
    form,
    loading,
    setIsModalStartVisible,
    isModalStartVisible,
    startQuiz,
  };
};
