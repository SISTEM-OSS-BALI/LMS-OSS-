import { fetcher } from "@/app/lib/utils/fetcher";
import { PlacementTest } from "@prisma/client";
import { Form, message } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface PlacementTestResponse {
  data: PlacementTest;
}

export const useFreePlacemenetViewModel = () => {
  const query = useParams();
  const placement_test_id = query.placement_test_id;
  const { data: placementTestData, isLoading: isLoadingPlacement } =
    useSWR<PlacementTestResponse>(
      `/api/freePlacementTest/${placement_test_id}/detail`,
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
    const payload = {
      ...values,
    };
    try {
      setLoading(true);
      const res = await fetch(
        `/api/freePlacementTest/${placement_test_id}/registerParticipant`,
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
      } else {
        message.error(data.message || "Terjadi kesalahan");
      }
      setEmail(values.email);
      setIsModalVisible(false);
    } catch (error) {
      console.log(error);
      message.error("Terjadi kesalahan saat mengirim data");
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = () => {
    router.push(`/free-placement-test/${placement_test_id}/question?email=${email}`);
  };

  return {
    placementTestData,
    isLoadingPlacement,
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
