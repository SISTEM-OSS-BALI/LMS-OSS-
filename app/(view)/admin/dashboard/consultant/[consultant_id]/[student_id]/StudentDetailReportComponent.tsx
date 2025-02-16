import { useParams } from "next/navigation";
import { useStudentDetailReportViewModel } from "./useStudentDetailReport";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Skeleton,
  Table,
  Typography,
  Tag
} from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

dayjs.extend(utc);
const { Title, Text } = Typography;

export default function StudentDetailReportComponent() {
  const {
    filteredMeetings,
    filteredPrograms,
    filteredStudent,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
  } = useStudentDetailReportViewModel();

  const query = useParams();
  const student_id = query.student_id;

  const columns: any = [
    { title: "No", dataIndex: "no", key: "no", render: (_: any, __: any, index: number) => index + 1 },
    { title: "Tanggal", dataIndex: "dateTime", key: "dateTime", render: (text: any) => dayjs.utc(text).format("YYYY-MM-DD HH:mm") },
    { title: "Metode", dataIndex: "method", key: "method" },
    { title: "Skala Kemampuan", dataIndex: "abilityScale", key: "abilityScale" },
    { title: "Kinerja Siswa", dataIndex: "studentPerformance", key: "studentPerformance" },
    { title: "Hasil Inputan Guru", dataIndex: "progress_student", key: "progress_student" },
  ];

  const data = filteredMeetings?.map((meeting, index) => ({
    no: index + 1,
    key: meeting.meeting_id,
    method: meeting.method,
    progress_student: meeting.progress_student,
    abilityScale: meeting.abilityScale,
    studentPerformance: meeting.studentPerformance,
    dateTime: meeting.dateTime,
  }));

  
  const columnsInfo = [
    {
      title: "Informasi",
      dataIndex: "label",
      key: "label",
      render: (text: any) => <Text strong>{text}</Text>,
    },
    {
      title: "Detail",
      dataIndex: "value",
      key: "value",
      render: (text: any, record: any) =>
        record.isTag ? <Tag color="blue">{text}</Tag> : text,
    },
  ];

  const dataInfo = [
    {
      key: "name",
      label: (
        <>
          <UserOutlined style={{ marginRight: 5 }} />
          Nama
        </>
      ),
      value: filteredStudent?.username || "Tidak tersedia",
    },
    {
      key: "phone",
      label: (
        <>
          <PhoneOutlined style={{ marginRight: 5 }} />
          No Telepon
        </>
      ),
      value: filteredStudent?.no_phone || "Tidak tersedia",
    },
    {
      key: "region",
      label: (
        <>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          Asal
        </>
      ),
      value: filteredStudent?.region || "Tidak tersedia",
    },
    ...(filteredPrograms?.map((program) => ({
      key: program.program_id,
      label: (
        <>
          <BookOutlined style={{ marginRight: 5 }} />
          Program
        </>
      ),
      value: program.name,
      isTag: true,
    })) || []),
    {
      key: "target",
      label: (
        <>
          <FileTextOutlined style={{ marginRight: 5 }} />
          Catatan
        </>
      ),
      value: filteredStudent?.target || "Tidak tersedia",
    },
  ];

  const handleDownloadExcel = () => {
    if (!filteredMeetings?.length) {
      alert("Tidak ada data pertemuan yang dapat diekspor.");
      return;
    }

    // 1️⃣ Siapkan Data untuk Excel
    const excelData = filteredMeetings.map((meeting, index) => ({
      "No": index + 1,
      "Tanggal": dayjs.utc(meeting.dateTime).format("YYYY-MM-DD HH:mm"),
      "Metode": meeting.method,
      "Skala Kemampuan": meeting.abilityScale,
      "Kinerja Siswa": meeting.studentPerformance,
      "Hasil Inputan Guru": meeting.progress_student,
    }));

    // 2️⃣ Buat WorkSheet & WorkBook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Pertemuan");

    // 3️⃣ Konversi ke Blob & Simpan sebagai File `.xlsx`
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    saveAs(dataBlob, `Riwayat_Pertemuan_${filteredStudent?.username || "Siswa"}.xlsx`);
  };

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Student Details */}
        <Col md={16}>
          <Card style={{ borderRadius: "12px", padding: "20px" }}>
            <Title level={3} style={{ marginBottom: "24px" }}>Detail Siswa</Title>
            <Row
              gutter={[16, 16]}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* Avatar Section */}
              <Col
                span={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLoadingStudent ? (
                  <Skeleton.Avatar active size={150} />
                ) : (
                  <Avatar
                    size={150}
                    src={filteredStudent?.imageUrl}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "2px solid #eaeaea",
                    }}
                  />
                )}
              </Col>

              {/* Table Section */}
              <Col
                span={17} // Memberikan lebih banyak ruang untuk tabel
                style={{ display: "flex", justifyContent: "flex-start" }}
              >
                {isLoadingStudent ? (
                  <Skeleton active paragraph={{ rows: 5 }} />
                ) : (
                  <Table
                    columns={columnsInfo}
                    dataSource={dataInfo}
                    pagination={false}
                    bordered
                    size="small"
                    style={{ width: "100%", maxWidth: "600px" }} // Membatasi lebar tabel agar proporsional
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Total Meetings */}
        <Col md={8}>
          <Card
            style={{
              textAlign: "center",
              borderRadius: "12px",
              padding: "24px",
              minHeight: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <Title level={3} style={{ marginBottom: "16px" }}>Total Pertemuan</Title>
            {isLoadingStudent ? (
              <Skeleton.Input active size="large" style={{ width: "80px" }} />
            ) : (
              <Text strong style={{ fontSize: "48px", color: "#1890ff" }}>
                {filteredStudent?.count_program}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Meeting History */}
      <Card style={{ marginTop: "24px", borderRadius: "12px", padding: "24px" }}>
        <Flex justify="space-between" style={{ marginBlock: "10px" }}>
          <Title level={3}>Riwayat Pertemuan</Title>
          <Button type="primary" onClick={handleDownloadExcel}>Cetak Pertemuan</Button>
        </Flex>

        {isLoadingMeeting ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table columns={columns} dataSource={data} pagination={{ pageSize: 5 }} />
        )}
      </Card>
    </div>
  );
}
