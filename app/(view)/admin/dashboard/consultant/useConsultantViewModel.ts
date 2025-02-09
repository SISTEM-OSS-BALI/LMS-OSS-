import { fetcher } from "@/app/lib/utils/fetcher";
import { Consultant } from "@prisma/client";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form } from "antd";

interface ConsultantResponse {
  data: Consultant[];
}

export const useConsultantViewModel = () => {
  const router = useRouter();
  const { data: consultantData } = useSWR<ConsultantResponse>(
    "/api/admin/consultant/show",
    fetcher
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [form] = Form.useForm();

  const handleDetail = (consultant_id: string) => {
    router.push(`/admin/dashboard/consultant/${consultant_id}`);
  }


  const handleEdit = (consultant: any) => {
    setSelectedConsultant(consultant);
    form.setFieldsValue({
      name: consultant.name,
    });
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {};

  const handleDelete = async (consultant_id: string) => {};

  return {consultantData, handleDetail, handleEdit, handleUpdate, handleDelete, isModalVisible, setIsModalVisible, selectedConsultant, setSelectedConsultant, form};
};
