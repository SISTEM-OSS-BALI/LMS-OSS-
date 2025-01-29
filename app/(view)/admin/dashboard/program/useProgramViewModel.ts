import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Program } from "@/app/model/program";
import { Form, notification } from "antd";
import { duration } from "html2canvas/dist/types/css/property-descriptors/duration";
import { useState } from "react";
import useSWR from "swr";

interface ProgramResponse {
  data: Program[];
}

export const useProgramViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const {
    data: programData,
    mutate: programDataMutate,
    isLoading,
  } = useSWR<ProgramResponse>("/api/admin/program/show", fetcher);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedProgram(null);
    form.resetFields();
  };
  const handleOk = async (values: any) => {
    setLoading(true);
    const payload = {
      name: values.name,
      description: values.description,
      count_program: values.count_program,
      duration: values.duration,
    };

    const url = selectedProgram
      ? `/api/admin/program/${selectedProgram.program_id}/update`
      : "/api/admin/program/create";
    const method = selectedProgram ? "put" : "post";

    try {
      await crudService[method](url, payload);
      notification.success({
        message: selectedProgram
          ? "Program berhasil diperbarui"
          : "Program berhasil dibuat",
      });
      await programDataMutate();
      setIsModalVisible(false);
      setSelectedProgram(null);
    } catch {
      notification.error({
        message: "Terjadi kesalahan saat menyimpan jadwal.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program_id: string) => {
    setIsModalVisible(true);

    const selectedProgram = programData?.data.find(
      (item: any) => item.program_id === program_id
    );

    if (selectedProgram) {
      form.setFieldsValue({
        name: selectedProgram?.name,
        description: selectedProgram?.description,
        count_program: selectedProgram?.count_program,
        duration: selectedProgram?.duration,
      });
      setSelectedProgram(selectedProgram);
    } else {
      form.resetFields();
    }
  };

  const handleDelete = (program_id: string) => {
    try {
      crudService.delete(`/api/admin/program/${program_id}/delete`, program_id);
      notification.success({ message: "Program berhasil dihapus." });
      programDataMutate();
    } catch (error) {
      console.log(error);
    }
  };

  const filteredData = programData?.data.filter((program) =>
    program.name.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return {
    handleOk,
    programData,
    isLoading,
    handleCancel,
    form,
    isModalVisible,
    setIsModalVisible,
    loading,
    handleEdit,
    handleDelete,
    filteredData,
    setSearchKeyword,
    searchKeyword,
    selectedProgram,
  };
};
