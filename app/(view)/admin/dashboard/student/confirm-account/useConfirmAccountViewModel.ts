import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Consultant, TermsAgreement, User } from "@prisma/client";
import { Form, notification } from "antd";
import { useState } from "react";
import useSWR from "swr";

interface ConfirmAccountResponse {
  data: TermsAgreement[];
}

interface ConsultantResponse {
  data: Consultant[];
}

interface StudentResponse {
  data: User[];
}
export const useConfirmAccountViewModel = () => {
  const {
    data: confirmAccount,
    isLoading: isLoadingConfirmAccount,
    mutate: confirmAccountMutate,
  } = useSWR<ConfirmAccountResponse>("/api/admin/confirmAccount/show", fetcher);

  const {
    data: consultantData,
    isLoading: isLoadingConsultant,
    mutate: consultantMutate,
  } = useSWR<ConsultantResponse>("/api/admin/consultant/show", fetcher);

  const {
    data: studentData,
    isLoading: isLoadingStudent,
    mutate: studentMutate,
  } = useSWR<StudentResponse>("/api/admin/student/show", fetcher);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isModalDataVisible, setIsModalDataVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleApprove = async (userId: string, isApproved: boolean) => {
    const payload = {
      user_id: userId,
      is_approved: isApproved,
    };
    setLoadingId(userId);
    try {
      await crudService.patch(
        "/api/admin/confirmAccount/handleApproved",
        payload
      );
      notification.success({ message: "Akun berhasil disetujui" });
      confirmAccountMutate();
    } catch (error) {
      notification.error({ message: "Terjadi kesalahan saat menyetujui akun" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleOpenModal = (user_id: string) => {
    setIsModalDataVisible(true);
    setSelectedStudentId(user_id);

    const selectedStudent = studentData?.data.find(
      (student) => student.user_id === user_id
    );

    if (selectedStudent) {
      form.setFieldsValue({
        target: selectedStudent.target,
        consultant_id: selectedStudent.consultant_id,
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalDataVisible(false);
    setSelectedStudentId(null);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    const payload = {
      user_id: selectedStudentId,
      ...values,
    };
    setLoading(true);
    try {
      await crudService.patch("/api/admin/confirmAccount/createData", payload);
      notification.success({ message: "Berhasil tambah data" });
      handleCloseModal();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notification.error({ message: "Terjadi kesalahan saat menyetujui akun" });
    }
  };

  const handleDelete = async (userId: string) => {
    setLoadingId(userId);
    try {
      await crudService.delete(
        `/api/admin/confirmAccount/${userId}/delete`,
        userId
      );
      notification.success({ message: "Data berhasil dihapus" });
      confirmAccountMutate();
    } catch (error) {
      notification.error({ message: "Terjadi kesalahan saat menghapus data" });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredStudent = confirmAccount?.data.filter((student: any) =>
    student.username.toLowerCase().includes(searchTerm)
  );

  return {
    confirmAccount,
    isLoadingConfirmAccount,
    loadingId,
    handleApprove,
    isModalDataVisible,
    handleCloseModal,
    handleOpenModal,
    form,
    consultantData,
    handleFinish,
    loading,
    handleDelete,
    handleSearch,
    filteredStudent,
  };
};
