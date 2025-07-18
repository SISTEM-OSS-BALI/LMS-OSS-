import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { User } from "@prisma/client";

interface StudentResponse {
  data: User[];
}

export const useStudentViewModel = () => {
  const router = useRouter();
  const { data: studentDataAll, isLoading } = useSWR<StudentResponse>(
    "/api/teacher/student/showAll",
    fetcher
  );

  const [searchTerm, setSearchTerm] = useState<string>("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase());
  };

  const filteredStudent = studentDataAll?.data.filter((student: any) =>
    (
      student.username?.toLowerCase() ||
      student.name_group?.toLowerCase() ||
      ""
    ).includes(searchTerm)
  );

  const handleDetail = (user_id: string) => {
    router.push(`/teacher/dashboard/student/detail/${user_id}`);
  };
  return {
    studentDataAll,
    handleDetail,
    handleSearch,
    filteredStudent,
    isLoading
  };
};
