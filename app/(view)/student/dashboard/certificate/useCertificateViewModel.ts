import { fetcher } from "@/app/lib/utils/fetcher";
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

export const useCertificateViewModel = () => {
  const { data: certificateData, isLoading } = useSWR<CertificateResponse>(
    `/api/student/certificate/show`,
    fetcher
  );
  return { certificateData, isLoading };
};
