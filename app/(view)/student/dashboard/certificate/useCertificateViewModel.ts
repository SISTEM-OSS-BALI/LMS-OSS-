import { crudService } from "@/app/lib/services/crudServices";
import { fetcher } from "@/app/lib/utils/fetcher";
import { Section } from "@prisma/client";
import { notification } from "antd";
import { useForm } from "antd/es/form/Form";
import jsPDF from "jspdf";
import { useState } from "react";
import useSWR from "swr";

interface Certificate {
  certificate_id: string;
  no_certificate: string;
  student_id: string;
  is_complated_meeting: boolean;
  is_complated_testimoni: boolean;
  overall: string | null;
  is_download: boolean;
  student_name: string;
  program_name: string;
}

interface CertificateResponse {
  data: Certificate;
}

interface EvaluationResponse {
  data: Section[];
}

export const useCertificateViewModel = () => {
  const {
    data: certificateData,
    isLoading,
    mutate: mutateCertificateData,
  } = useSWR<CertificateResponse>(`/api/student/certificate/show`, fetcher);
  const {
    data: evaluationData,
    isLoading: evaluationLoading,
    mutate: mutateEvaluationData,
  } = useSWR<EvaluationResponse>(
    `/api/student/certificate/showEvaluation`,
    fetcher
  );

  const [isModalTestimoniVisible, setIsModalTestimoniVisible] = useState(false);
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [certificateFrontPreview, setCertificateFrontPreview] = useState<
    string | null
  >(null);
  const [certificateBackPreview, setCertificateBackPreview] = useState<
    string | null
  >(null);

  const certificate: Certificate | null = certificateData?.data ?? null;

  const generateCertificatePreview = async () => {
    if (certificate && evaluationData) {
      const { student_name, no_certificate } = certificate;

      const doc = new jsPDF("landscape", "px", "a4");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      /** ---- Generate Halaman Depan ---- **/
      const imgFront: HTMLImageElement = document.createElement("img");
      imgFront.src = "/assets/images/certificate_front.png";

      await new Promise((resolve) => {
        imgFront.onload = () => resolve(null);
      });

      canvas.width = imgFront.width;
      canvas.height = imgFront.height;

      if (context) {
        context.drawImage(imgFront, 0, 0);
        context.fillStyle = "black";
        context.font = "bold 150px Montserrat";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(student_name, canvas.width / 2, 1300);
        context.font = "italic 100px Montserrat";
        context.fillText(
          `NO: ${no_certificate ?? "-"}`,
          canvas.width / 2,
          1800
        );
      }

      setCertificateFrontPreview(canvas.toDataURL("image/png"));

      /** ---- Generate Halaman Belakang ---- **/
      const imgBack: HTMLImageElement = document.createElement("img");
      imgBack.src = "/assets/images/certificate_back.png";

      await new Promise((resolve) => {
        imgBack.onload = () => resolve(null);
      });

      canvas.width = imgBack.width;
      canvas.height = imgBack.height;

      if (context) {
        context.drawImage(imgBack, 0, 0);

        let startY = 1020;
        let commentY = 1000;
        const sectionX = 570;
        const levelX = 1050;
        const commentX = 1350;
        const rowHeight = 250;

        context.fillStyle = "black";
        context.font = "bold 60px Montserrat";
        context.textAlign = "left";

        evaluationData.data.forEach((evalItem: any) => {
          const maxWidthComment = 500;
          const trimmedComment =
            evalItem.comment.length > 30
              ? evalItem.comment.slice(0, 30) + "..."
              : evalItem.comment;

          context.font = "bold 60px Montserrat";
          context.fillText(evalItem.section_type, sectionX, startY);
          context.font = "bold 60px Montserrat";
          context.fillText(evalItem.level, levelX, startY);
          context.font = "bold 40px Montserrat";
          context.fillText(trimmedComment, commentX, commentY, maxWidthComment);

          startY += rowHeight;
          commentY += rowHeight;
        });

        setCertificateBackPreview(canvas.toDataURL("image/png"));
      }
    }
  };

  const handleOpenModalTestimoni = () => {
    setIsModalTestimoniVisible(true);
  };

  const handleCancelModalTestimoni = () => {
    setIsModalTestimoniVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      lesson_satisfaction: values.lesson_satisfaction || 0,
      teaching_method_effectiveness: values.teaching_method_effectiveness || 0,
      exercise_and_assignment_relevance:
        values.exercise_and_assignment_relevance || 0,
      material_relevance: values.material_relevance || 0,
      teacher_identity: values.teacher_identity || "",
      teaching_delivery: values.teaching_delivery || 0,
      teacher_attention: values.teacher_attention || 0,
      teacher_ethics: values.teacher_ethics || 0,
      teacher_motivation: values.teacher_motivation || 0,
      class_experience: values.class_experience || "",
      favorite_part: values.favorite_part || "",
      improvement_suggestions: values.improvement_suggestions || "",
    };

    try {
      setLoading(true);
      await crudService.post("/api/student/testimoni/create", payload);
      notification.success({
        message: "Berhasil",
        description: "Berhasil menambahkan testimoni",
      });
      mutateCertificateData();
      mutateEvaluationData();
      handleCancelModalTestimoni();
      setLoading(false);
    } catch (error) {
      console.error("Error submitting testimoni:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    certificateData,
    evaluationData,
    isLoading,
    evaluationLoading,
    certificateBackPreview,
    certificateFrontPreview,
    generateCertificatePreview,
    certificate,
    handleCancelModalTestimoni,
    handleOpenModalTestimoni,
    isModalTestimoniVisible,
    form,
    handleSubmit,
    loading,
  };
};
