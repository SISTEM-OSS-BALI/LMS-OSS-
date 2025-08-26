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
import { useDetailStudentViewModel } from "./useDetailStudentViewModel";
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
    handleOpenModal,
    isModalCertificate,
    handleCancel,
    form,
    handleFinish,
    sectionTypes,
    loading,
    userGroup,
    setSelectedGroupMemberId,
    selectedGroupMemberId,
    programDataAll,
  } = useDetailStudentViewModel();

  const query = useParams();
  const student_id = query.user_id;


  type SectionType = "LISTENING" | "READING" | "WRITING" | "SPEAKING";

  const levelOptions: Record<
    SectionType,
    { value: string; label: string; comment: string }[]
  > = {
    LISTENING: [
      {
        value: "A1",
        label: "A1",
        comment: "Student can recognise familiar words and very basic phrases.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can understand phrases and the highest frequency vocabulary related to areas of most immediate personal relevance.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can understand the main points of clear standard speech on familiar matters regularly encountered.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can understand extended speech and lectures and follow even complex lines of argument provided the topic is reasonably familiar.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can understand extended speech even when it is not clearly structured.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student has no difficulty in understanding any kind of spoken language and gets familiar with the accent.",
      },
    ],
    READING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can understand familiar names, words and very simple sentences.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can read very short and simple texts, find specific, predictable information in simple everyday material.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can understand texts that consist mainly of high-frequency everyday or job-related language.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can read articles and reports concerned with contemporary problems in which the writers adopt particular attitudes or viewpoints.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can understand long and complex factual and literary texts, appreciating distinctions of style.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can read with ease virtually all forms of the written language, including abstract, structurally or linguistically complex texts.",
      },
    ],
    WRITING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can write a short, simple postcard, for example, sending holiday greetings.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can write short, simple notes and messages relating to matters in areas of immediate needs.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can write simple connected text on topics which are familiar or of personal interest.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can write clear, detailed text on a wide range of subjects related to their interests.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can express themselves in clear, well-structured text, expressing points of view at some length.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can write clear, smoothly flowing text in an appropriate style and write summaries and reviews of professional or literary works.",
      },
    ],
    SPEAKING: [
      {
        value: "A1",
        label: "A1",
        comment:
          "Student can ask and answer simple questions in areas of immediate need or on very familiar topics.",
      },
      {
        value: "A2",
        label: "A2",
        comment:
          "Student can communicate in simple and routine tasks requiring a simple and direct exchange of information on familiar topics and activities.",
      },
      {
        value: "B1",
        label: "B1",
        comment:
          "Student can enter unprepared into conversations on topics that are familiar, of personal interest, or pertinent to everyday life.",
      },
      {
        value: "B2",
        label: "B2",
        comment:
          "Student can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.",
      },
      {
        value: "C1",
        label: "C1",
        comment:
          "Student can use language flexibly and effectively for social and professional purposes.",
      },
      {
        value: "C2",
        label: "C2",
        comment:
          "Student can take part effortlessly in any conversation or discussion and have a good familiarity with idiomatic expressions and colloquialisms.",
      },
    ],
  };

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
  const handleLevelChange = (value: string, index: number, type: string) => {

    const selectedLevel = levelOptions[type as keyof typeof levelOptions]?.find(
      (level) => level.value === value
    );

    if (selectedLevel) {
      // Update komentar secara otomatis di Form
      form.setFieldsValue({
        sections: form
          .getFieldValue("sections")
          .map((section: any, i: number) =>
            i === index
              ? { ...section, comment: selectedLevel.comment }
              : section
          ),
      });
    }
  };

  const columns: any = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      key: "dateTime",
      render: (text: any) => dayjs.utc(text).format("YYYY-MM-DD HH:mm"),
    },
    { title: "Method", dataIndex: "method", key: "method" },
    { title: "Teacher", dataIndex: "teacherName", key: "teacherName" },
    {
      title: "Ability Scale",
      dataIndex: "abilityScale",
      key: "abilityScale",
    },
    {
      title: "Student Performance",
      dataIndex: "studentPerformance",
      key: "studentPerformance",
    },
    {
      title: "Teacher Input Results",
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
      title: "Information",
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
          {filteredStudent?.username != null ? "Name" : "Group Name"}
        </>
      ),
      value:
        filteredStudent?.username != null
          ? filteredStudent?.username
          : filteredStudent?.name_group || "Not Available",
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
            value: filteredStudent?.no_phone || "Not Available",
          },
        ]
      : []),
    {
      key: "region",
      label: (
        <>
          <EnvironmentOutlined style={{ marginRight: 5 }} />
          From
        </>
      ),
      value: filteredStudent?.region || "Not Available",
    },
    ...(filteredPrograms?.map((program) => ({
      key: program.program_id,
      label: (
        <>
          <BookOutlined style={{ marginRight: 5 }} />
          Name Program
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
          Note
        </>
      ),
      value: filteredStudent?.target || "Not Available",
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
              Detail Student
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
              Total Meetings
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
            Meeting History
          </Title>
          <Flex
            justify="space-between"
            gap={10}
            style={{ width: "100%", flexWrap: "wrap" }}
          >
            <Button
              type="primary"
              disabled={isLoadingProgram}
              href={`/teacher/dashboard/history-test/${student_id}`}
              style={{ flex: 1, minWidth: "200px" }}
            >
              History Placement Test
            </Button>
            {isLoadingProgram ? (
              <Skeleton.Button active />
            ) : (
              <>
                {filteredPrograms &&
                filteredPrograms.length > 0 &&
                filteredStudent?.count_program ===
                  filteredPrograms[0]?.count_program ? (
                  <Button
                    type="primary"
                    onClick={
                      filteredStudent?.is_evaluation
                        ? undefined
                        : handleOpenModal
                    }
                    disabled={filteredStudent?.is_evaluation === true}
                    style={{ flex: 1, minWidth: "200px" }}
                  >
                    {filteredStudent?.is_evaluation
                      ? "Already Assessed Certificate"
                      : "Fill in the Certificate Value"}
                  </Button>
                ) : (
                  <Tooltip title="The meeting is not over yet">
                    <Button
                      type="primary"
                      disabled
                      style={{ flex: 1, minWidth: "200px" }}
                    >
                      Certificate Value
                    </Button>
                  </Tooltip>
                )}
              </>
            )}
          </Flex>
        </Flex>
        {filteredStudent?.type_student === "GROUP" &&
          userGroup &&
          userGroup.length > 0 && (
            <div style={{ width: "100%", marginTop: "20px" }}>
              <Title level={4} style={{ marginBottom: "12px" }}>
                Group Member
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
              View New Program Data
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
              placeholder="Select Old Program"
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

      <Modal
        open={isModalCertificate}
        onCancel={handleCancel}
        title="Certificate Value"
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{
            sections: sectionTypes.map((type) => ({
              section_type: type,
              level: "",
              comment: "",
            })),
          }}
        >
          <Row gutter={[16, 16]}>
            {sectionTypes.map((type, index) => (
              <Col xs={24} sm={12} key={type}>
                <Typography.Text strong>{type}</Typography.Text>

                {/* Select Level */}
                <Form.Item
                  name={["sections", index, "level"]}
                  label="Level"
                  rules={[
                    { required: true, message: `Pilih level untuk ${type}!` },
                  ]}
                >
                  <Select
                    onChange={(value) => handleLevelChange(value, index, type)}
                  >
                    {levelOptions[type as SectionType]?.map((level) => (
                      <Select.Option key={level.value} value={level.value}>
                        {level.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Input Komentar (Menggunakan TextArea) */}
                <Form.Item
                  name={["sections", index, "comment"]}
                  label="Komentar"
                  rules={[
                    {
                      required: true,
                      message: `Enter a comment for ${type}!`,
                    },
                  ]}
                >
                  <TextArea
                    placeholder={`Comments will appear automatically`}
                    autoSize={{ minRows: 2, maxRows: 4 }}
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>

          {/* Tombol Simpan */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Simpan
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
