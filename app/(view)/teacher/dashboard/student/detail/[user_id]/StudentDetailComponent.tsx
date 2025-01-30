import { Avatar, Card, Col, Row, Table, Typography } from "antd";
import { useDetailStudentViewModel } from "./useDetailStudentViewModel";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const { Title, Text } = Typography;

export default function StudentDetailComponent() {
  const {
    filteredStudent,
    filteredMeetings,
    filteredPrograms,
    isLoadingStudent,
    isLoadingMeeting,
    isLoadingProgram,
  } = useDetailStudentViewModel();

  const columns: any = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: "Tanggal",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (text: any) => dayjs.utc(text).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Metode", dataIndex: "method", key: "method" },
    {
      title: "Skala Kemampuan ",
      dataIndex: "abilityScale",
      key: "abilityScale",
    },
    {
      title: "Kinerja Siswa",
      dataIndex: "studentPerformance",
      key: "studentPerformance",
    },
    {
      title: "Hasil Inputan Guru",
      dataIndex: "progress_student",
      key: "progress_student",
    },
  ];

  const data = filteredMeetings?.map((meeting) => ({
    key: meeting.meeting_id,
    method: meeting.method,
    progress_student: meeting.progress_student,
    abilityScale: meeting.abilityScale,
    studentPerformance: meeting.studentPerformance,
    dateTime: meeting.dateTime,
  }));

  return (
    <div style={{ padding: "24px" }}>
      <Row gutter={[24, 24]}>
        {/* Student Details */}
        <Col md={16}>
          <Card style={{ borderRadius: "12px", padding: "24px" }}>
            <Title level={3} style={{ marginBottom: "24px" }}>
              Student Detail
            </Title>
            <Row align="middle">
              {/* Avatar */}
              <Col span={6} style={{ textAlign: "center" }}>
                <Avatar
                  size={150}
                  src={filteredStudent?.imageUrl}
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                />
              </Col>
              {/* Student Info */}
              <Col span={18}>
                <table style={{ width: "100%", lineHeight: "2" }}>
                  <tbody>
                    <tr>
                      <th>
                        <Text strong>Nama</Text>
                      </th>
                      <td>{filteredStudent?.username}</td>
                    </tr>
                    <tr>
                      <th>
                        <Text strong>No Telpun</Text>
                      </th>
                      <td>{filteredStudent?.no_phone}</td>
                    </tr>
                    <tr>
                      <th>
                        <Text strong>Asal</Text>
                      </th>
                      <td>{filteredStudent?.region}</td>
                    </tr>
                    {filteredPrograms?.map((program) => (
                      <tr key={program.program_id}>
                        <th>
                          <Text strong>Program</Text>
                        </th>
                        <td>{program.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <Title level={3} style={{ marginBottom: "16px" }}>
              Total Pertemuan
            </Title>
            <Text strong style={{ fontSize: "48px", color: "#1890ff" }}>
              {filteredStudent?.count_program}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Meeting History */}
      <Card
        style={{ marginTop: "24px", borderRadius: "12px", padding: "24px" }}
      >
        <Title level={3}>Riwayat Pertemuan</Title>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
}
