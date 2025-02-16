import { fetcher } from "@/app/lib/utils/fetcher";
import useSWR from "swr";
import { useParams, useRouter } from "next/navigation";
import { Program, User } from "@prisma/client";

interface Consultant {
  consultant_id: string;
  name: string;
  no_phone: string;
  students: User[];
}

interface ProgramResponse {
  data: Program[];
}

interface DetailConsultantResponse {
  data: Consultant;
}

export const useDetailConsultantViewModel = () => {
  const query = useParams();
  const consultant_id = query.consultant_id;
  const { data: detailConsultantData, isLoading: isLoadingConsultant } = useSWR<DetailConsultantResponse>(
    `/api/admin/consultant/${consultant_id}`,
    fetcher
  );
  const {
    data: programData,
    mutate: programDataMutate,
    isLoading,
  } = useSWR<ProgramResponse>("/api/admin/program/show", fetcher);
  const router = useRouter();

  const studentData = detailConsultantData?.data.students ?? [];
  const programDataList = programData?.data ?? [];

  const mergedDataStudent = studentData.map((student) => {
    const program = programDataList.find(
      (p) => p.program_id === student.program_id
    );

    const halfProgram = Math.floor(program?.count_program! / 2);

    let status;
    if (program?.count_program == student?.count_program) {
      status = "DONE";
    } else if (
      student?.count_program! >= halfProgram &&
      student?.count_program! < program?.count_program!
    ) {
      status = "HALF";
    } else {
      status = "";
    }

    return {
      ...student,
      program_name: program ? program.name : "Unknown Program",
      status: status,
    };
  });
  const countStudent = detailConsultantData?.data.students.length;

  const handlePushDetail = (student_id: string) => {
    router.push(`/admin/dashboard/consultant/${consultant_id}/${student_id}`);
  };

  return {
    detailConsultantData,
    mergedDataStudent,
    countStudent,
    handlePushDetail,
    isLoadingConsultant,
    isLoading
  };
};
