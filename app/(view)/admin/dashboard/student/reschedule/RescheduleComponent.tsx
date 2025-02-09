import { useEffect, useState } from "react";
import { useRescheduleViewModel } from "./UseRescheduleViewModel";
import {
  Card,
  List,
  Typography,
  Button,
  Image,
  Row,
  Col,
  Divider,
  Tag,
  Flex,
} from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

const { Title, Text } = Typography;

export default function RescheduleApprovalComponent() {
  const { mergedData, handleApproveReschedule, loadingState } =
    useRescheduleViewModel();
  const [showHistory, setShowHistory] = useState(false);

  // Mapping untuk opsi alasan
  const optionReasonMapping: Record<string, string> = {
    NATURAL_DISASTERS: "Bencana Alam",
    GRIEF: "Duka",
    SICK: "Sakit",
  };

  // Filter data berdasarkan is_deleted
  const filteredData = showHistory
    ? mergedData?.filter((item) => item.is_deleted === true) || []
    : mergedData?.filter((item) => item.is_deleted === false) || [];

  return (
    <div style={{ padding: "32px" }}>
      <Flex
        justify="space-between"
        align="center"
        style={{ marginBottom: "32px" }}
      >
        <Title level={3} style={{ marginBlock: 0 }}>
          {showHistory ? "Riwayat Reschedule" : "Pengajuan Emergency Pertemuan"}
        </Title>
        <Button onClick={() => setShowHistory(!showHistory)} type="primary">
          {showHistory ? "Kembali ke Pengajuan" : "Riwayat Reschedule"}
        </Button>
      </Flex>
      <Card title="Daftar Pengajuan">
        <List
          dataSource={filteredData}
          renderItem={(item) => (
            <Card
              style={{
                marginBottom: 24,
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#fff",
                padding: "16px",
              }}
              title={
                <Row justify="space-between" align="middle">
                  <Col>
                    <Title level={4} style={{ margin: 0 }}>
                      {item.program_name} - {item.student_name}
                    </Title>
                  </Col>
                  <Col>
                    <Tag
                      color={
                        item.status === "PENDING"
                          ? "orange"
                          : item.status === "APPROVED"
                          ? "green"
                          : item.status === "REJECTED"
                          ? "red"
                          : "default"
                      }
                      style={{ fontSize: "14px", padding: "4px 10px" }}
                    >
                      {item.status}
                    </Tag>
                  </Col>
                </Row>
              }
              extra={
                <Text type="secondary">
                  {dayjs(item.createdAt).add(8, "hours").format("DD MMM YYYY")}
                </Text>
              }
            >
              <Row gutter={[16, 16]}>
                {/* Meeting Sebelumnya - TIDAK DITAMPILKAN di RIWAYAT */}
                {!showHistory && (
                  <Col xs={24} md={8}>
                    <Card
                      bordered
                      style={{
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        padding: "16px",
                      }}
                    >
                      <Title
                        level={5}
                        style={{ marginBottom: "12px", color: "#1890ff" }}
                      >
                        Meeting Sebelumnya
                      </Title>
                      <Text>
                        <strong>Guru:</strong> {item.teacher_name}
                      </Text>
                      <br />
                      <Text>
                        <strong>Tanggal:</strong>{" "}
                        {dayjs.utc(item.dateTime).format("DD MMM YYYY, HH:mm")}{" "}
                        -{dayjs.utc(item.endTime).format(" HH:mm")}
                      </Text>
                      <br />
                      <Text>
                        <strong>Metode:</strong> {item.method || "-"}
                      </Text>
                      <br />
                      <Text>
                        <strong>Platform:</strong> {item.platform || "-"}
                      </Text>
                    </Card>
                  </Col>
                )}

                {/* Meeting yang Diajukan */}
                <Col xs={24} md={showHistory ? 12 : 8}>
                  <Card
                    bordered
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "16px",
                    }}
                  >
                    <Title
                      level={5}
                      style={{ marginBottom: "12px", color: "#52c41a" }}
                    >
                      Meeting yang Diajukan
                    </Title>
                    <Text>
                      <strong>Guru:</strong> {item.teacher_name}
                    </Text>
                    <br />
                    <Text>
                      <strong>Tanggal:</strong>{" "}
                      {dayjs
                        .utc(item.new_dateTime)
                        .format("DD MMM YYYY, HH:mm")}{" "}
                      - {dayjs.utc(item.new_endTime).format(" HH:mm")}
                    </Text>
                    <br />
                    <Text>
                      <strong>Metode:</strong> {item.new_method || "-"}
                    </Text>
                    <br />
                    <Text>
                      <strong>Platform:</strong> {item.new_platform || "-"}
                    </Text>
                  </Card>
                </Col>

                {/* Keterangan & Bukti */}
                <Col xs={24} md={showHistory ? 12 : 8}>
                  <Card
                    bordered
                    style={{
                      borderRadius: "10px",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      padding: "16px",
                    }}
                  >
                    <Row gutter={16}>
                      {/* Keterangan */}
                      <Col span={12}>
                        <Title
                          level={5}
                          style={{ marginBottom: "12px", color: "#fa8c16" }}
                        >
                          Keterangan
                        </Title>
                        <Text>
                          <strong>Alasan:</strong> {item.reason}
                        </Text>
                        <br />
                        <Text>
                          <strong>Keterangan:</strong>{" "}
                          {optionReasonMapping[item.option_reason] ||
                            "Tidak Diketahui"}
                        </Text>
                      </Col>

                      {/* Bukti Gambar */}
                      <Col span={12} style={{ textAlign: "center" }}>
                        <Title
                          level={5}
                          style={{ marginBottom: "8px", color: "#fa541c" }}
                        >
                          Bukti
                        </Title>
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt="Bukti"
                            width={120}
                            height={80}
                            style={{
                              display: "block",
                              margin: "0 auto",
                              borderRadius: "6px",
                              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                        ) : (
                          <Text
                            type="secondary"
                            style={{ textAlign: "center", display: "block" }}
                          >
                            Tidak ada bukti
                          </Text>
                        )}
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>

              {/* Tombol Aksi - Tidak ditampilkan untuk Riwayat */}
              {!showHistory && (
                <div style={{ marginTop: 20, textAlign: "right" }}>
                  <Button
                    type="primary"
                    loading={
                      loadingState[item.reschedule_meeting_id] === "APPROVED"
                    }
                    onClick={() =>
                      handleApproveReschedule(item.reschedule_meeting_id, true)
                    }
                    style={{
                      marginRight: 10,
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    Verifikasi
                  </Button>
                  <Button
                    type="default"
                    danger
                    loading={
                      loadingState[item.reschedule_meeting_id] === "REJECTED"
                    }
                    onClick={() =>
                      handleApproveReschedule(item.reschedule_meeting_id, false)
                    }
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  >
                    Tolak
                  </Button>
                </div>
              )}
            </Card>
          )}
        />
      </Card>
    </div>
  );
}
