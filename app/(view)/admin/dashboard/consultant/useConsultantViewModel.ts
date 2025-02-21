import { fetcher } from "@/app/lib/utils/fetcher";
import { Consultant } from "@prisma/client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, notification } from "antd";
import { crudService } from "@/app/lib/services/crudServices";

interface ConsultantResponse {
  data: Consultant[];
}

export const useConsultantViewModel = () => {
  const router = useRouter();
  const {
    data: consultantData,
    isLoading: isLoadingConsultant,
    mutate: consultantMutate,
  } = useSWR<ConsultantResponse>("/api/admin/consultant/show", fetcher);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [form] = Form.useForm();

  const handleDetail = (consultant_id: string) => {
    router.push(`/admin/dashboard/consultant/${consultant_id}`);
  };

  const handleEdit = (consultant: any) => {
    setSelectedConsultant(consultant);
    form.setFieldsValue({
      name: consultant.name,
      no_phone: consultant.no_phone,
    });
    setIsModalVisible(true);
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setSelectedConsultant(null);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setSelectedConsultant(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const payload = {
      name: values.name,
      no_phone: values.no_phone,
    };
    try {
      if (selectedConsultant) {
        await crudService.put(
          `/api/admin/consultant/${selectedConsultant.consultant_id}/update`,
          payload
        );
      } else {
        await crudService.post("/api/admin/consultant/create", payload);
      }
      notification.success({
        message: selectedConsultant
          ? "Berhasil Mengedit Data Konsultan"
          : "Berhasil Menambah Data Konsultan",
      });

      handleCancelModal();
      consultantMutate();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (consultant_id: string) => {
    setLoading(true);
    try {
      await crudService.delete(
        `/api/admin/consultant/${consultant_id}/delete`,
        consultant_id
      );
      notification.success({
        message: "Berhasil Menghapus Data Konsultan",
      });
      setLoading(false);
      consultantMutate();
    } catch (error) {
      setLoading(false);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return {
    consultantData,
    handleDetail,
    handleEdit,
    handleDelete,
    isModalVisible,
    setIsModalVisible,
    selectedConsultant,
    setSelectedConsultant,
    form,
    isLoadingConsultant,
    handleOpenModal,
    handleSubmit,
    handleCancelModal,
    loading,
  };
};
