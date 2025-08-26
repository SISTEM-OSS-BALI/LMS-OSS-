import {
  Badge,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Space,
  Typography,
  Grid,
  Card,
  Flex,
  Image,
  Tooltip,
  Tag,
  Collapse,
  Row,
  Col,
} from "antd";
import Table, { ColumnProps, ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import TextArea from "antd/es/input/TextArea";
import { useQueueViewModel } from "./useQueueViewModel";
import Dragger from "antd/es/upload/Dragger";
import Icon, { InboxOutlined } from "@ant-design/icons";
import { Meeting } from "@prisma/client";

const { Title } = Typography;
const { useBreakpoint } = Grid;

type MeetingTableData = Meeting & {
  studentName?: string | null;
  nameGroup?: string | null;
  teacherAbsence?: boolean;
  progress?: string | null;
  typeStudent?: string | null;
  groupMember?: any;
};

export default function QueueComponent() {
  const screens = useBreakpoint();
  const {
    updateAbsentStatus,
    handleChangeDate,
    setSearchKeyword,
    searchKeyword,
    filteredData,
    showTimes,
    handleAction,
    loadingState,
    isModalVisibleAddProgesStudent,
    handleCancel,
    form,
    handleOpenModalAddProges,
    handleAddProgresStudent,
    loading,
    handleOpenModalAction,
    isModalVisibleAddAction,
    handleCancelAddAction,
    imageUrl,
    handleFileChange,
    handleBeforeUpload,
    fileList,
    teacherAbsenceData,
    updateCancelled,
  } = useQueueViewModel();

  const cellRender = (currentDate: any) => {
    const formattedDate = dayjs(currentDate).format("YYYY-MM-DD");
    const isShowTime = showTimes.includes(formattedDate);

    return (
      <div className="ant-picker-cell-inner">
        {currentDate.date()}
        {isShowTime && (
          <Badge
            status="success"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              transform: "translate(50%, -50%)",
            }}
          />
        )}
      </div>
    );
  };

  const columns: ColumnProps<MeetingTableData>[] = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Name",
      key: "name",
      render: (_, record) =>
        record.typeStudent === "GROUP" ? record.nameGroup : record.studentName,
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) => dayjs.utc(startTime).format("HH:mm"),
    },
    {
      title: "End Time",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) => dayjs.utc(endTime).format("HH:mm"),
    },
    {
      title: "Name Program",
      dataIndex: "name_program",
      key: "name_program",
    },
    {
      title: "Method",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Attendance",
      dataIndex: "absent",
      key: "absent",
      render: (_, record) => (
        <Space direction={screens.xs ? "vertical" : "horizontal"}>
          <Tooltip title="Start Class">
            <Button
              loading={loadingState[`start-${record.meeting_id}`] === true}
              disabled={record.is_started == true || record.teacherAbsence}
              style={{
                cursor: record.is_started == true ? "not-allowed" : "pointer",
                backgroundColor:
                  record.is_started == true ? "green" : "transparent",
                color: record.is_started == true ? "white" : "black",
              }}
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, true)
              }
            >
              Start Class
            </Button>
          </Tooltip>
          <Tooltip title="End Class">
            <Button
              loading={loadingState[`end-${record.meeting_id}`] === true}
              disabled={record.is_started == false || record.teacherAbsence}
              style={{
                cursor: record.is_started == false ? "not-allowed" : "pointer",
                backgroundColor:
                  record.is_started == false ? "red" : "transparent",
                color: record.is_started == false ? "white" : "black",
              }}
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, false)
              }
            >
              End Class
            </Button>
          </Tooltip>

          <Tooltip title="Absent">
            <Button
              loading={loadingState[`cancel-${record.meeting_id}`] === true}
              style={{
                backgroundColor:
                  record.is_cancelled == true ? "red" : "transparent",
                color: record.is_cancelled == true ? "white" : "black",
              }}
              onClick={() =>
                updateCancelled(
                  record.meeting_id,
                  record.student_id,
                  !record?.is_cancelled
                )
              }
            >
              Absent
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            danger
            disabled={record.teacherAbsence}
            onClick={() => handleOpenModalAction(record.meeting_id)}
          >
            {record.teacherAbsence
              ? "Under Processing by Admin"
              : "Cannot Teach"}
          </Button>
          {record.typeStudent !== "GROUP" && (
            <Button
              type="primary"
              onClick={() =>
                handleOpenModalAddProges(
                  record.meeting_id,
                  undefined,
                  record.student_id
                )
              }
              disabled={record.teacherAbsence}
            >
              Add Progress
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Flex justify="space-between" gap={10}>
        <Title level={3} style={{ marginBlock: 0 }}>
          Student Queue List
        </Title>
        <Flex justify="space-between" gap={10}>
          <DatePicker
            placeholder="Select Date"
            onChange={handleChangeDate}
            cellRender={cellRender}
            style={{ width: "100%" }}
          />
          <Input
            placeholder="Search by name student"
            onChange={(e) => setSearchKeyword(e.target.value)}
            value={searchKeyword}
            style={{ width: "100%" }}
          />
        </Flex>
      </Flex>
      <Divider />
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          padding: "20px 0px",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="meeting_id"
          scroll={{ x: true }}
          expandable={{
            expandedRowRender: (record) =>
              record.typeStudent === "GROUP" ? (
                <div style={{ padding: "16px 24px" }}>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    Group Member
                  </Title>
                  <Row gutter={[16, 16]} wrap>
                    {record.groupMember?.map((student: any, index: number) => (
                      <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                        <Card
                          style={{
                            marginBottom: 16,
                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                          }}
                        >
                          <Card.Meta
                            title={student.username}
                            description={
                              <Button
                                type="primary"
                                size="small"
                                onClick={() =>
                                  handleOpenModalAddProges(
                                    record.meeting_id,
                                    student.user_group_id,
                                    undefined
                                  )
                                }
                                disabled={record.teacherAbsence}
                                style={{ width: "100%" }}
                              >
                                Add Progress
                              </Button>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              ) : null,
            rowExpandable: (record) => record.typeStudent === "GROUP",
          }}
        />
      </Card>

      <Modal
        open={isModalVisibleAddProgesStudent}
        title="Progress Pertemuan"
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} onFinish={handleAddProgresStudent}>
          <Form.Item name="ability_scale">
            <TextArea placeholder="Enter Today's Meeting Ability Scale" />
          </Form.Item>
          <Form.Item name="student_performance">
            <TextArea placeholder="Student Performance Feedback for Today's Meeting" />
          </Form.Item>
          <Form.Item name="progress_student">
            <TextArea placeholder="Input for Today's Meeting" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isModalVisibleAddAction}
        onCancel={handleCancelAddAction}
        title="Cannot Teach"
        footer={null}
      >
        <Form form={form} onFinish={handleAction}>
          <Form.Item name="reason">
            <TextArea placeholder="Reason" />
          </Form.Item>
          <Form.Item>
            <Form.Item name="image">
              <Dragger
                name="files"
                listType="picture-card"
                fileList={fileList}
                onChange={handleFileChange}
                beforeUpload={handleBeforeUpload}
                showUploadList={false}
                accept="image/png, image/jpeg"
              >
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Image preview"
                    preview={false}
                    style={{ width: "100%", height: "auto" }}
                  />
                ) : (
                  <div>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">
                      Drag and drop, or click to upload
                    </p>
                    <p className="ant-upload-hint">
                      Support for a single or bulk upload. Strictly prohibited
                      from uploading company data or other banned files
                    </p>
                  </div>
                )}
              </Dragger>
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              loading={loading}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
