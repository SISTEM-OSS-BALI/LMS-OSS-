import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Program } from "@prisma/client";
import { notification } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

interface ProgramResponse {
  data: Program[];
}

export const useRegisterGroupClassViewModel = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
        await crudService.post("/api/auth/register", values);
        setLoading(false);
        notification.success({
          message: "Registrasi Berhasil",
          description:
            "Anda telah berhasil mendaftar. Silakan tunggu verifikasi akun Anda.",
        });
        router.push("/");
    } catch (error: any) {
      setLoading(false);
      if (error.status === 409) {
        notification.error({
          message: "Email Sudah Terdaftar",
          description:
            "Pengguna dengan email ini sudah ada. Silakan gunakan email lain.",
        });
      } else {
        notification.error({
          message: "Error Registrasi",
          description: "Terjadi kesalahan saat mendaftar.",
        });
      }
    }
  };
  return {
    loading,
    setLoading,
    handleFinish
  };
};
