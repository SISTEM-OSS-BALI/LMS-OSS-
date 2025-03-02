import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Program } from "@prisma/client";
import { Form, notification } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface ProgramResponse {
  data: Program[];
}
export const useRegisterViewModel = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: programData } = useSWR<ProgramResponse>(
    "/api/program/show",
    fetcher
  );

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      await crudService.post("/api/auth/register", values);
      setLoading(false);
      notification.success({
        message: "Registrasi Berhasil",
        description:
          "Anda telah berhasil mendaftar. silahkan tunggu verifikasi akun mu",
      });
      router.push("/");
    } catch (error) {
      setLoading(false);
      notification.error({
        message: "Error Registrasi",
        description: "Terjadi kesalahan saat mendaftar.",
      });
      console.error("Error during registration:", error);
    }
  };

  const [form] = Form.useForm();
  return { programData, form, loading, handleFinish };
};
