import { crudService } from "@/app/lib/services/crudServices";
import { Form, message, notification } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export const useChangePasswordViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const handleChangePassword = async (values: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      notification.error({
        message: "Error",
        description: "Password baru dan konfirmasi password tidak cocok!",
      });
      return;
    }

    setLoading(true);
    try {
      await crudService.put("/api/student/profile/changePassword", {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
        token,
      });

      message.success("Password berhasil diubah. Silakan login.");
      form.resetFields();
      router.push("/");
    } catch (error) {
      message.error((error as Error).message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };
  return {
    handleChangePassword,
    loading,
    form,
  };
};
