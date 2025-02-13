import { fetcher } from "@/app/lib/utils/fetcher";
import { User } from "@/app/model/user";
import { Meeting } from "@/app/model/meeting";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Program } from "@prisma/client";
import { useState } from "react";
import { useForm } from "antd/es/form/Form";
import { crudService } from "@/app/lib/services/crudServices";
import { notification } from "antd";

interface StudentResponse {
  data: User[];
}

interface MeetingResponse {
  data: Meeting[];
}

interface ProgramResponse {
  data: Program[];
}

export const useDetailStudentViewModel = () => {
  const { data: studentDataAll, isLoading: isLoadingStudent } =
    useSWR<StudentResponse>("/api/teacher/student/showAll", fetcher);
  const { data: meetingDataAll, isLoading: isLoadingMeeting } =
    useSWR<MeetingResponse>("/api/teacher/student/showMeeting", fetcher);
  const { data: programDataAll, isLoading: isLoadingProgram } =
    useSWR<ProgramResponse>("/api/teacher/student/showProgram", fetcher);
  const [loading, setLoading] = useState(false);
  const [isModalCertificate, setIsModalCertificate] = useState(false);
  const [form] = useForm();
  const query = useParams();
  const student_id = query.user_id;
  const sectionTypes = ["READING", "SPEAKING", "LISTENING", "WRITING"];

  const filteredStudent = studentDataAll?.data.find(
    (student) => student.user_id === student_id
  );
  const filteredMeetings = meetingDataAll?.data.filter(
    (meeting) => meeting.student_id === student_id
  );

  const filteredPrograms = programDataAll?.data.filter(
    (program) => program.program_id === filteredStudent?.program_id
  );

  const handleOpenModal = () => {
    setIsModalCertificate(true);
  };

  const handleCancel = () => {
    setIsModalCertificate(false);
    form.resetFields();
  };

  const handleFinish = async (values: any) => {
    setLoading(true);
    try {
      const formattedData = values.sections.map(
        (section: any, index: number) => ({
          section_type: sectionTypes[index],
          level: section.level,
          comment: section.comment,
        })
      );

      const payload = {
        student_id: student_id,
        sections: formattedData,
      };
      await crudService.post(
        `/api/teacher/certificate/inputEvaluation`,
        payload
      );

      notification.success({
        message: "Success",
        description: "Data berhasil disimpan",
      });

      handleCancel();
    } catch (error) {
      setLoading(false);
      console.error("Error pada handleFinish:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    filteredStudent,
    filteredMeetings,
    filteredPrograms,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
    handleOpenModal,
    isModalCertificate,
    handleCancel,
    form,
    handleFinish,
    sectionTypes,
    loading,
  };
};
