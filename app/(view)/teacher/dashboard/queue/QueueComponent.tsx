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
import { useEffect } from "react";
import { TeacherAbsence } from "@/app/model/user";
import { AddIcon, MinusIcon } from "@/app/components/Icon";
import { Meeting } from "@prisma/client";
import { groupsmigration } from "googleapis/build/src/apis/groupsmigration";

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
      title: "Waktu Mulai",
      dataIndex: "startTime",
      key: "startTime",
      render: (startTime: string) => dayjs.utc(startTime).format("HH:mm"),
    },
    {
      title: "Waktu Selesai",
      dataIndex: "endTime",
      key: "endTime",
      render: (endTime: string) => dayjs.utc(endTime).format("HH:mm"),
    },
    {
      title: "Program",
      dataIndex: "name_program",
      key: "name_program",
    },
    {
      title: "Metode",
      dataIndex: "method",
      key: "method",
    },
    {
      title: "Nama",
      key: "name",
      render: (_, record) =>
        record.typeStudent === "GROUP" ? record.nameGroup : record.studentName,
    },
    {
      title: "Absen",
      dataIndex: "absent",
      key: "absent",
      render: (_, record) => (
        <Space>
          <Tooltip title="Hadir">
            <Button
              loading={loadingState[record.meeting_id] == true}
              disabled={record.absent == true || record.teacherAbsence}
              style={{
                cursor: record.absent == true ? "not-allowed" : "pointer",
                backgroundColor:
                  record.absent == true ? "green" : "transparent",
                color: record.absent == true ? "white" : "black",
              }}
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, true)
              }
            >
              Hadir
            </Button>
          </Tooltip>
          <Tooltip title="Tidak Hadir">
            <Button
              loading={loadingState[record.meeting_id] == false}
              disabled={record.absent == false || record.teacherAbsence}
              style={{
                cursor: record.absent == false ? "not-allowed" : "pointer",
                backgroundColor: record.absent == false ? "red" : "transparent",
                color: record.absent == false ? "white" : "black",
              }}
              onClick={() =>
                updateAbsentStatus(record.meeting_id, record.student_id, false)
              }
            >
              Tidak Hadir
            </Button>
          </Tooltip>
        </Space>
      ),
    },
    // {
    //   title: "Modul",
    //   dataIndex: "module",
    //   key: "module",
    //   render: (module: boolean) => (module ? "Yes" : "No"),
    // },
    {
      title: "Aksi",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            danger
            disabled={record.teacherAbsence}
            onClick={() => handleOpenModalAction(record.meeting_id)}
          >
            {record.teacherAbsence
              ? "Sedang Diproses Admin"
              : "Tidak Bisa Mengajar"}
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
              Tambah Progress Siswa
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
          Daftar Antrian Siswa
        </Title>
        <Flex justify="space-between" gap={10}>
          <DatePicker
            placeholder="Pilih Tanggal"
            onChange={handleChangeDate}
            cellRender={cellRender}
            style={{ width: "100%" }}
          />
          <Input
            placeholder="Cari nama siswa"
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
          expandable={{
            expandedRowRender: (record) =>
              record.typeStudent === "GROUP" ? (
                <div style={{ padding: "16px 24px" }}>
                  <Title level={5} style={{ marginBottom: 12 }}>
                    Anggota
                  </Title>
                  {record.groupMember?.map((student: any, index: number) => (
                    <Row
                      key={index}
                      gutter={[16, 16]}
                      align="middle"
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        padding: "8px 0",
                      }}
                    >
                      <Col flex="auto"> {student.username}</Col>
                      <Col>
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
                        >
                          Tambah Progress
                        </Button>
                      </Col>
                    </Row>
                  ))}
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
            <TextArea placeholder="Masukan Skala Kemapuan Pertemuan Hari Ini" />
          </Form.Item>
          <Form.Item name="student_performance">
            <TextArea placeholder="Masukan Kinerja Siswa Pertemuan Hari Ini" />
          </Form.Item>
          <Form.Item name="progress_student">
            <TextArea placeholder="Masukan Inputan Pertemuan Hari Ini" />
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
        title="Tidak Bisa Mengajar"
        footer={null}
      >
        <Form form={form} onFinish={handleAction}>
          <Form.Item name="reason">
            <TextArea placeholder="Masukan Alasan" />
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
                      Klik atau drag file ke area ini untuk upload
                    </p>
                    <p className="ant-upload-hint">
                      Support untuk single upload. Hanya file PNG, JPEG, dan JPG
                      yang diterima.
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
