import { useState, useEffect } from "react";
import { useCertificateViewModel } from "./useCertificateViewModel";
import {
  Col,
  Row,
  Checkbox,
  Button,
  Image,
  Spin,
  Card,
  Skeleton,
  Typography,
} from "antd";
import { jsPDF } from "jspdf";
import generateCertificate from "@/app/lib/utils/generateCertificate";

const { Title } = Typography;

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

export default function CertificateComponent() {
  const { certificateData, isLoading } = useCertificateViewModel();
  const certificate: Certificate | null = certificateData?.data ?? null;
  const [certificatePreview, setCertificatePreview] = useState<string | null>(
    null
  );

  // Fungsi untuk membuat pratinjau sertifikat
  const generateCertificatePreview = async () => {
    if (certificate) {
      const { student_name, program_name } = certificate;
      const completionDate = new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const doc = new jsPDF("landscape", "px", "a4");
      const canvas = document.createElement("canvas");

      const img: HTMLImageElement = document.createElement("img");
      img.src = "/assets/images/certificate.png"; //

      await new Promise((resolve) => {
        img.onload = () => resolve(null);
      });

      canvas.width = img.width;
      canvas.height = img.height;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(img, 0, 0);
        context.fillStyle = "black";

        context.font = "bold 70px Montserrat";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(student_name, canvas.width / 2, 670);

        context.font = "45px Montserrat";
        context.fillText(program_name, canvas.width / 2, 830);

        context.font = "40px Montserrat";
        context.fillText(completionDate, canvas.width / 2, 950);
      }

      setCertificatePreview(canvas.toDataURL("image/png"));
    }
  };

  useEffect(() => {
    if (certificate) {
      generateCertificatePreview();
    }
  }, [certificate]);

  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <Title level={3} style={{ marginBottom: "20px", color: "#1890ff" }}>
        Cetak Sertifikat
      </Title>

      {isLoading ? (
        <Card style={{ borderRadius: "10px", padding: "24px" }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      ) : !certificate ? (
        <Spin tip="Memuat sertifikat..." />
      ) : (
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={12}>
            <Card
              title="Status Sertifikat"
              style={{
                borderRadius: "10px",
                textAlign: "left",
                height: "100%",
              }}
            >
              <Checkbox
                checked={certificate.is_complated_meeting ?? false}
                disabled
              >
                Pertemuan Selesai
              </Checkbox>
              <br />
              <Checkbox
                checked={certificate.is_complated_testimoni ?? false}
                disabled
              >
                Testimoni Selesai
              </Checkbox>
              <br />
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="Pratinjau Sertifikat"
              style={{ borderRadius: "10px", textAlign: "center" }}
            >
              {certificatePreview ? (
                <Image
                  src={certificatePreview}
                  alt="Sertifikat Preview"
                  width={300}
                  preview={true}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  }}
                />
              ) : (
                <Spin tip="Membuat pratinjau sertifikat..." />
              )}
              <br />
              <Button
                type="primary"
                disabled={!certificate.is_download}
                onClick={() =>
                  generateCertificate(
                    certificate.student_name,
                    certificate.program_name,
                    new Date().toLocaleDateString("id-ID"),
                    "/assets/images/certificate.png"
                  )
                }
                style={{ marginTop: 20, width: "100%" }}
              >
                Download Sertifikat
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
