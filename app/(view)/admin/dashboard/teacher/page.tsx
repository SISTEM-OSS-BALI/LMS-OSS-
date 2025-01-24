"use client";

import {
  Button,
  Divider,
  Drawer,
  Flex,
  FloatButton,
  Input,
  Popconfirm,
  Table,
  Tooltip,
  Checkbox,
  TimePicker,
  Space,
  Form,
} from "antd";
import Title from "antd/es/typography/Title";
import {
  AddIcon,
  CalendarIcon,
  DeleteIcon,
  EditIcon,
} from "@/app/components/Icon";
import { ColumnsType } from "antd/es/table";
import Loading from "@/app/components/Loading";
import Icon from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useCalendarViewModel } from "./useCalendarViewModel";
import { User } from "@/app/model/user";
dayjs.extend(utc);

export default function AdminDashboardTeacher() {
  const {
    isLoading,
    selectedTeacher,
    setSelectedTeacher,
    schedule,
    setSchedule,
    searchKeyword,
    setSearchKeyword,
    drawerVisible,
    setIsDrawerVisible,
    handleCheckboxChange,
    handleTimeChange,
    addTimeSlot,
    removeTimeSlot,
    handleSubmit,
    filteredData,
    handleEdit,
    DAYS,
    isLoadingSchedule,
    loadingCheck,
    loading,
  } = useCalendarViewModel();

  const columns: ColumnsType<User> = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Guru",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => a.username.localeCompare(b.username),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Aksi",
      key: "actions",
      render: (_, record) => (
        <Flex justify="start" gap={20}>
          <Tooltip title="Edit">
            <Button type="primary" onClick={() => handleEdit(record.user_id)}>
              <Icon component={EditIcon} />
            </Button>
          </Tooltip>
          <Tooltip title="Jadwal Guru">
            <Button
              type="primary"
              onClick={() => {
                setSelectedTeacher(record);
                setIsDrawerVisible(true);
              }}
            >
              <Icon component={CalendarIcon} />
            </Button>
          </Tooltip>
          <Tooltip title="Hapus">
            <Popconfirm
              title="Yakin ingin menghapus guru ini?"
              okText="Ya"
              cancelText="Tidak"
            >
              <Button danger>
                <Icon component={DeleteIcon} />
              </Button>
            </Popconfirm>
          </Tooltip>
        </Flex>
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <Title level={3} style={{ marginBlock: 0 }}>
          Data Guru
        </Title>
        <Input
          placeholder="Cari nama guru"
          style={{ width: 300 }}
          onChange={(e) => setSearchKeyword(e.target.value)}
          value={searchKeyword}
        />
      </div>
      <Divider />
      <Table
        columns={columns}
        dataSource={filteredData || []}
        rowKey="user_id"
        loading={isLoading}
        bordered
        pagination={{ pageSize: 5 }}
      />
      <FloatButton type="primary" icon={<AddIcon />} />

      <Drawer
        placement="right"
        open={drawerVisible}
        loading={isLoadingSchedule}
        onClose={() => {
          setIsDrawerVisible(false);
          setSelectedTeacher(null);
          setSchedule(
            DAYS.map((day) => ({
              schedule_id: "",
              day,
              isAvailable: false,
              times: [{ start: null, end: null }],
            }))
          );
        }}
        title={"Jadwal " + (selectedTeacher?.username || "")}
      >
        {loadingCheck && <Loading />}
        {selectedTeacher && schedule ? (
          <Form layout="vertical" onFinish={handleSubmit}>
            {schedule.map((item) => (
              <Form.Item key={item.day} style={{ marginBottom: 20 }}>
                <Checkbox
                  checked={item.isAvailable || false}
                  onChange={(e) =>
                    handleCheckboxChange(
                      item.day,
                      e.target.checked,
                      item.schedule_id
                    )
                  }
                >
                  {item.day}
                </Checkbox>

                {item.isAvailable && (
                  <div style={{ marginTop: 16 }}>
                    {item.times.map((time, index) => (
                      <Space
                        key={index}
                        size="middle"
                        align="start"
                        style={{ display: "flex", marginBottom: 8 }}
                      >
                        {/* TimePicker untuk Start */}
                        <Form.Item style={{ marginBottom: 0 }} required>
                          <TimePicker
                            value={
                              time.start ? dayjs(time.start, "HH:mm") : null
                            }
                            onChange={(value) =>
                              handleTimeChange(item.day, index, "start", value)
                            }
                            format="HH:mm"
                            placeholder="Waktu Mulai"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        -{/* TimePicker untuk End */}
                        <Form.Item style={{ marginBottom: 0 }} required>
                          <TimePicker
                            value={time.end ? dayjs(time.end, "HH:mm") : null}
                            onChange={(value) =>
                              handleTimeChange(item.day, index, "end", value)
                            }
                            format="HH:mm"
                            placeholder="Waktu Berakhir"
                            style={{ width: 120 }}
                          />
                        </Form.Item>
                        {/* Tombol Hapus */}
                        <Button
                          type="text"
                          danger
                          onClick={() =>
                            removeTimeSlot(item.day, index, item.schedule_id)
                          }
                          icon={<Icon component={DeleteIcon} />}
                        />
                      </Space>
                    ))}

                    {/* Tombol Tambah Slot Waktu */}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => addTimeSlot(item.day)}
                        style={{ marginTop: 8 }}
                        icon={<Icon component={AddIcon} />}
                      >
                        Tambah Waktu
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.Item>
            ))}

            {/* Tombol Simpan */}
            <Form.Item style={{ marginTop: 20 }}>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Simpan Jadwal
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <Loading />
        )}
      </Drawer>
    </div>
  );
}
