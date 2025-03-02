"use client";

import { useState, useEffect } from "react";
import { Modal, Checkbox, Button, Typography, Divider } from "antd";
import dayjs from "dayjs";
import SignatureCanvas from "react-signature-canvas";

const { Title, Paragraph } = Typography;

interface FormValues {
  username: string;
  birth_date: string | null;
  address: string;
  no_phone: string;
}

export default function TermsCheckbox({
  formValues,
  setIsAgreed,
  setSignature,
}: {
  formValues: FormValues;
  setIsAgreed: (value: boolean) => void;
  setSignature: (value: string | null) => void;
}) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [currentValues, setCurrentValues] = useState<FormValues>({
    username: "",
    birth_date: null,
    address: "",
    no_phone: "",
  });
  // Removed duplicate signature state
  let sigPad: any = null;

  useEffect(() => {
    setCurrentValues(formValues);
  }, [formValues]);

  const formatDate = (date: string | null) => {
    return date ? dayjs(date).format("DD-MM-YYYY") : "-";
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    if (sigPad && !sigPad.isEmpty()) {
      setSignature && setSignature(sigPad.toDataURL());
      setIsChecked(true);
      setIsAgreed(true);
      setIsModalVisible(false);
    } else {
      alert("Silakan tanda tangani terlebih dahulu.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const clearSignature = () => {
    sigPad.clear();
    setSignature && setSignature(null);
    setIsChecked(false);
    setIsAgreed(false);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Checkbox checked={isChecked} disabled>
        Saya menyetujui{" "}
        <a
          onClick={showModal}
          style={{ color: "#1890ff", cursor: "pointer", fontWeight: "bold" }}
        >
          Syarat dan Ketentuan
        </a>
      </Checkbox>

      <Modal
        title={
          <Title level={3} style={{ textAlign: "center" }}>
            Syarat dan Ketentuan
          </Title>
        }
        width={700}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button
            key="ok"
            type="primary"
            onClick={handleOk}
            style={{ width: "100%" }}
          >
            Setuju
          </Button>,
        ]}
      >
        <Title level={4} style={{ textAlign: "center", color: "#0056b3" }}>
          SURAT PERNYATAAN SISWA ENGLISH COURSE
        </Title>
        <Divider />
        <Paragraph>
          <strong>Yang bertanda tangan di bawah ini:</strong>
        </Paragraph>
        <Paragraph>
          <strong>Nama:</strong> {currentValues.username || "-"} <br />
          <strong>Tanggal Lahir:</strong> {formatDate(currentValues.birth_date)}{" "}
          <br />
          <strong>Alamat:</strong> {currentValues.address || "-"} <br />
          <strong>No. Telepon:</strong> {currentValues.no_phone || "-"}
        </Paragraph>
        <Divider />
        <Paragraph>
          Dengan ini menyatakan bahwa saya adalah siswa yang mengikuti program
          English Course di One Step Solution (OSS) Bali. Saya telah membaca dan
          memahami seluruh isi Surat Pernyataan ini serta Syarat dan Ketentuan
          yang berlaku, dan dengan ini saya menyetujui serta bersedia untuk
          mematuhi seluruh ketentuan tersebut.
        </Paragraph>
        <Divider />
        <Title level={4} style={{ color: "#0056b3" }}>
          Ketentuan yang telah disetujui
        </Title>
        <Paragraph style={{ lineHeight: "1.8", fontSize: "14px" }}>
          - Saya akan mengikuti seluruh sesi pelajaran dengan disiplin dan penuh
          tanggung jawab.
          <br />
          - Saya berkomitmen untuk aktif dalam setiap kegiatan belajar mengajar
          di kelas.
          <br />
          - Saya bertanggung jawab atas segala kewajiban pembayaran biaya kursus
          sesuai dengan ketentuan yang berlaku.
          <br />
          - Saya siap mengikuti kursus dengan rentang waktu maksimal 2 bulan.
          <br />
          - Saya dapat membatalkan dan menjadwalkan kembali (reschedule) dengan
          maksimal 12 jam sebelum waktu kelas dimulai dengan menyertakan bukti
          yang mendukung.
          <br />
          - Untuk situasi khusus di luar ketentuan di atas, saya dapat
          mengajukan permohonan khusus melalui sistem persetujuan (approval)
          yang disediakan oleh OSS Bali.
          <br />- Saya bertanggung jawab atas segala tindakan saya selama
          mengikuti kursus dan akan menanggung konsekuensi atas pelanggaran
          terhadap ketentuan yang berlaku.
        </Paragraph>
        <Divider />
        <Title level={4} style={{ color: "#0056b3" }}>
          Tanda Tangan
        </Title>
        <div
          style={{
            border: "2px solid #ccc",
            padding: "10px",
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          <SignatureCanvas
            penColor="black"
            canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
            ref={(ref) => {
              sigPad = ref;
            }}
          />
          <Button
            onClick={clearSignature}
            style={{
              marginTop: "10px",
              backgroundColor: "#d9534f",
              color: "white",
            }}
          >
            Hapus Tanda Tangan
          </Button>
        </div>
        <Paragraph
          style={{ marginTop: "20px", textAlign: "center", fontWeight: "bold" }}
        >
          Denpasar, {dayjs().format("DD-MM-YYYY")}
          <br />
          {currentValues.username || "-"}
        </Paragraph>
      </Modal>
    </div>
  );
}
