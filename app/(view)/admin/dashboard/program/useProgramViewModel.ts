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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedId(null);
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

    const url = selectedId
      ? `/api/admin/program/${selectedId}/update`
      : "/api/admin/program/create";
    try {
      await crudService.post(url, payload);
      notification.success({
        message: selectedId
          ? "Program berhasil diperbarui"
          : "Program berhasil dibuat",
      });
      await programDataMutate();
      setIsModalVisible(false);
      setSelectedId(null);
    } catch {
      notification.error({
        message: "Terjadi kesalahan saat menyimpan jadwal.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program_id: string) => {
    setSelectedId(program_id);
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
    } else {
      form.resetFields();
    }
  };

  const handleDelete = (program_id: string) => {
    console.log(program_id);
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
    selectedId,
  };
};
