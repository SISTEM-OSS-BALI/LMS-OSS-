import {
  Avatar,
  Button,
  Card,
  Col,
  Flex,
  Row,
  Table,
  Tooltip,
  Typography,
  Skeleton,
  Modal,
  Form,
  Select,
  Space,
  Input,
  Tag,
} from "antd";
;
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import TextArea from "antd/es/input/TextArea";
import {
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  BookOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStudentDetailReportViewModel } from "./useStudentDetailReport";
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
    programDataAll,
    selectedGroupMemberId,
    setSelectedGroupMemberId,
    userGroup,
  } = useStudentDetailReportViewModel();

  const query = useParams();
  const student_id = query.user_id;

 

  // Data meeting untuk table (individual & group)
  const data = filteredMeetings?.flatMap((meeting) => {
    if (filteredStudent?.type_student === "GROUP") {
      const groupMeeting = meeting as typeof meeting & {
        groupProgress?: {
          user_group_id: string;
          progress_student: string;
          abilityScale: string;
          studentPerformance: string;
        }[];
      };
      const progress = groupMeeting.groupProgress?.find(
        (p) => p.user_group_id === selectedGroupMemberId
      );
      if (!progress) return [];
      return {
        key: `${meeting.meeting_id}-${progress.user_group_id}`,
        method: meeting.method,
        teacherName: meeting.teacherName,
        progress_student: progress.progress_student,
        abilityScale: progress.abilityScale,
        studentPerformance: progress.studentPerformance,
        dateTime: meeting.dateTime,
      };
    } else {
      // PENTING! Jangan lupa programType dan programId disertakan!
      return {
        key: meeting.meeting_id,
        method: meeting.method,
        teacherName: meeting.teacherName,
        progress_student: meeting.progress_student,
        abilityScale: meeting.abilityScale,
        studentPerformance: meeting.studentPerformance,
        dateTime: meeting.dateTime,
        programType: meeting.programType,
        programId: meeting.programId,
      };
    }
  });

  // Get default program type (NEW_PROGRAM preferred, else OLD_PROGRAM)

  // Hanya OLD_PROGRAM yang muncul di dropdown
  const programTypeOptions = useMemo(() => {
    if (!filteredMeetings) return [];
    const typeLabel = {
      OLD_PROGRAM: "Program sebelumnya: ",
    };
    const types = Array.from(
      new Set(filteredMeetings.map((m) => m.programType))
    ).filter((type) => type === "OLD_PROGRAM");
    return types.map((type) => {
      const sampleMeeting = filteredMeetings.find(
        (m) => m.programType === type
      );
      const programName =
        programDataAll?.data.find(
          (p) => p.program_id === sampleMeeting?.programId
        )?.name || "-";
      return {
        value: type,
        label: `${typeLabel[type] || ""}${programName}`,
      };
    });
  }, [filteredMeetings, programDataAll]);

 const [selectedProgramType, setSelectedProgramType] = useState<string>("");
const [viewNewProgram, setViewNewProgram] = useState<boolean>(true);
  


  // Data tabel difilter sesuai selectedProgramType
  const filteredTableData = useMemo(() => {
    if (!data) return [];
   
    if (viewNewProgram) {
      return data.filter((row) => row.programType === "NEW_PROGRAM");
    }

    return data.filter((row) => row.programType === selectedProgramType);
  }, [viewNewProgram, selectedProgramType, data]);


  const columns: any = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Tanggal",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (text: any) => dayjs.utc(text).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Metode", dataIndex: "method", key: "method" },
    { title: "Pengajar", dataIndex: "teacherName", key: "teacherName" },
    {
      title: "Skala Kemampuan",
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

  // const data = filteredMeetings?.flatMap((meeting) => {
  //   if (filteredStudent?.type_student === "GROUP") {
  //     const groupMeeting = meeting as typeof meeting & {
  //       groupProgress?: {
  //         user_group_id: string;
  //         progress_student: string;
  //         abilityScale: string;
  //         studentPerformance: string;
  //       }[];
  //     };

  //     const progress = groupMeeting.groupProgress?.find(
  //       (p) => p.user_group_id === selectedGroupMemberId
  //     );

  //     if (!progress) return [];

  //     return {
  //       key: `${meeting.meeting_id}-${progress.user_group_id}`,
  //       method: meeting.method,
  //       teacherName: meeting.teacherName,
  //       progress_student: progress.progress_student,
  //       abilityScale: progress.abilityScale,
  //       studentPerformance: progress.studentPerformance,
  //       dateTime: meeting.dateTime,
  //     };
  //   } else {
  //     return {
  //       key: meeting.meeting_id,
  //       method: meeting.method,
  //       teacherName: meeting.teacherName,
  //       progress_student: meeting.progress_student,
  //       abilityScale: meeting.abilityScale,
  //       studentPerformance: meeting.studentPerformance,
  //       dateTime: meeting.dateTime,
  //     };
  //   }
  // });



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
          {filteredStudent?.username != null ? "Nama" : "Nama Kelompok"}
        </>
      ),
      value:
        filteredStudent?.username != null
          ? filteredStudent?.username
          : filteredStudent?.name_group || "Tidak tersedia",
    },
    // Hanya render phone jika username tidak null
    ...(filteredStudent?.username != null
      ? [
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
        ]
      : []),
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

  return (
    <div
      style={{
        marginTop: 64,
        padding: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Row gutter={[24, 24]} justify="center" style={{ width: "100%" }}>
        {/* Student Details */}
        <Col
          xs={24}
          sm={24}
          md={16}
          lg={16}
          xl={16}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Card
            style={{ borderRadius: "12px", padding: "20px", width: "100%" }}
          >
            <Title
              level={3}
              style={{
                marginBottom: "24px",
                fontSize: "clamp(18px, 2.5vw, 24px)",
              }}
            >
              Detail Siswa
            </Title>
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
                xs={24}
                sm={24}
                md={6}
                lg={6}
                xl={6}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {isLoadingStudent ? (
                  <Skeleton.Avatar active size={150} />
                ) : filteredStudent?.imageUrl ? (
                  <Avatar
                    size={150}
                    src={filteredStudent?.imageUrl}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "2px solid #eaeaea",
                    }}
                  />
                ) : (
                  <Avatar
                    size={150}
                    icon={<UserOutlined />}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "2px solid #eaeaea",
                    }}
                  />
                )}
              </Col>

              {/* Table Section */}
              <Col
                xs={24}
                sm={24}
                md={17}
                lg={17}
                xl={17}
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
                    style={{ width: "100%", maxWidth: "600px" }}
                  />
                )}
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Total Meetings */}
        <Col
          xs={24}
          sm={24}
          md={8}
          lg={8}
          xl={8}
          style={{ display: "flex", justifyContent: "center" }}
        >
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
              width: "100%",
              maxWidth: "300px",
            }}
          >
            <Title
              level={3}
              style={{
                marginBottom: "16px",
                fontSize: "clamp(18px, 2.5vw, 24px)",
              }}
            >
              Total Pertemuan
            </Title>
            {isLoadingStudent ? (
              <Skeleton.Input active size="large" style={{ width: "80px" }} />
            ) : (
              <Text
                strong
                style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#1890ff" }}
              >
                {filteredStudent?.count_program}
              </Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Meeting History */}
      <Card
        style={{
          marginTop: "24px",
          borderRadius: "12px",
          padding: "24px",
          width: "100%",
        }}
      >
        <Flex
          justify="space-between"
          style={{
            marginBlock: "10px",
            flexDirection: "column",
            gap: "16px",
            alignItems: "flex-start",
          }}
        >
          <Title level={3} style={{ fontSize: "clamp(18px, 2.5vw, 24px)" }}>
            Riwayat Pertemuan
          </Title>
        </Flex>
        {filteredStudent?.type_student === "GROUP" &&
          userGroup &&
          userGroup.length > 0 && (
            <div style={{ width: "100%", marginTop: "20px" }}>
              <Title level={4} style={{ marginBottom: "12px" }}>
                Anggota Kelompok
              </Title>
              <Row gutter={[16, 16]} style={{ marginBottom: "32px" }}>
                {userGroup.map((group: any, index: number) => {
                  const isSelected =
                    selectedGroupMemberId === group.user_group_id;

                  return (
                    <Col
                      key={group.user_group_id || index}
                      xs={24}
                      sm={12}
                      md={8}
                      lg={6}
                    >
                      <Card
                        hoverable
                        onClick={() => {
                          setSelectedGroupMemberId(
                            isSelected ? null : group.user_group_id
                          );
                        }}
                        style={{
                          borderRadius: "12px",
                          border: isSelected
                            ? "2px solid #1890ff"
                            : "1px solid #eaeaea",
                          boxShadow: isSelected
                            ? "0 0 8px rgba(24, 144, 255, 0.5)"
                            : "none",
                        }}
                      >
                        <Text strong>{group.username || group.name}</Text>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </div>
          )}

        {programTypeOptions.length > 0 && (
          <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
            <Button
              type={viewNewProgram ? "primary" : "default"}
              onClick={() => setViewNewProgram(true)}
              // disabled={viewNewProgram}
            >
              Lihat Data New Program
            </Button>
            <Select
              value={viewNewProgram ? undefined : selectedProgramType}
              options={programTypeOptions}
              onChange={(value) => {
                setSelectedProgramType(value);
                setViewNewProgram(false);
              }}
              style={{ minWidth: 220 }}
              // disabled={viewNewProgram}
              placeholder="Pilih Program Lama"
            />
          </div>
        )}

        {isLoadingMeeting ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={
              filteredTableData && filteredTableData.length > 0
                ? filteredTableData
                : data
            }
            pagination={{ pageSize: 5 }}
            scroll={{ x: true }}
          />
        )}
      </Card>

    </div>
  );
}
