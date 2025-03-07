import { message } from "antd";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useResetPasswordViewModel = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { newPassword: string }) => {
    setLoading(true);
    const res = await fetch("/api/student/profile/resetPassword", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: values.newPassword }),
    });

    const data = await res.json();
    setLoading(false);
    router.push("/");

    if (res.ok) {
      message.success("Password berhasil diubah. Silakan login.");
    } else {
      message.error(data.message || "Terjadi kesalahan");
    }
  };
  return {
    onFinish,
    loading,
  };
};
