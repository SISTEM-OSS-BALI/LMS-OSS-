"use client";

import { useMemo, useState } from "react";
import {
  Table,
  Tag,
  Select,
  Card,
  Row,
  Col,
  Typography,
  Space,
  DatePicker,
  Divider,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import useActivityViewModel from "./useActivityViewModel";
import "dayjs/locale/id";

dayjs.locale("id");

const { Option } = Select;
const { Title, Text } = Typography;

export default function MeetingActivity() {
  const { meetingData } = useActivityViewModel();
  const [statusFilter, setStatusFilter] = useState<
    "all" | "absent" | "not_absent" | "cancelled"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());

  const [currentPage, setCurrentPage] = useState(1);

  const normalizedData = useMemo(() => {
    if (!Array.isArray(meetingData?.data)) return [];

    return meetingData.data.map((m) => ({
      ...m,
      program: m.student?.program ?? null,
    }));
  }, [meetingData]);

  const filteredData = useMemo(() => {
    if (!Array.isArray(normalizedData)) return [];

    let data = [...normalizedData];

    if (statusFilter === "absent") {
      data = data.filter((m) => m.absent === true);
    } else if (statusFilter === "not_absent") {
      data = data.filter((m) => m.absent === null || m.absent === undefined);
    } else if (statusFilter === "cancelled") {
      data = data.filter((m) => m.is_cancelled === true);
    }

    if (selectedMonth) {
      data = data.filter((m) =>
        dayjs(m.dateTime).isSame(selectedMonth, "month")
      );
    }

    return data;
  }, [normalizedData, statusFilter, selectedMonth]);

  const totalDuration = useMemo(() => {
    const total = filteredData.reduce((acc, m) => {
      if (m.started_time && m.finished_time) {
        return (
          acc + dayjs(m.finished_time).diff(dayjs(m.started_time), "second")
        );
      }
      return acc;
    }, 0);

    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    return `${h} hours ${m} minutes ${s} seconds`;
  }, [filteredData]);

  const programSummary = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};

    filteredData.forEach((m) => {
      const key = m.program?.name || "Unknown Program";
      const duration =
        m.started_time && m.finished_time
          ? dayjs(m.finished_time).diff(dayjs(m.started_time), "second")
          : 0;

      if (!map[key]) {
        map[key] = { count: 1, total: duration };
      } else {
        map[key].count += 1;
        map[key].total += duration;
      }
    });

    return Object.entries(map).map(([name, { count, total }]) => {
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      return {
        name,
        count,
        duration: `${h} hours ${m} minutes ${s} seconds`,
      };
    });
  }, [filteredData]);

  const columns = [
    {
      title: "Student Name",
      dataIndex: ["student", "username"],
      key: "student",
      render: (_: any, record: any) => record.student?.username || "-",
    },
    {
      title: "Program Name",
      key: "program",
      render: (_: any, record: any) => record.program?.name || "-",
    },
    {
      title: "Time",
      key: "time",
      render: (_: any, record: any) => {
        const start = dayjs(record.startTime).format("HH:mm");
        const end = dayjs(record.endTime).format("HH:mm");
        return `${start} – ${end}`;
      },
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD"),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_: any, record: any) => {
        if (!record.started_time || !record.finished_time) return "-";
        const duration = dayjs(record.finished_time).diff(
          dayjs(record.started_time),
          "second"
        );
        const h = Math.floor(duration / 3600);
        const m = Math.floor((duration % 3600) / 60);
        const s = duration % 60;
        return `${h} hours ${m} minutes ${s} seconds`;
      },
    },
    {
      title: "Duration Difference",
      key: "difference",
      render: (_: any, record: any) => {
        if (!record.started_time || !record.finished_time) return "-";
        const planned = dayjs(record.endTime).diff(
          dayjs(record.startTime),
          "second"
        );
        const actual = dayjs(record.finished_time).diff(
          dayjs(record.started_time),
          "second"
        );
        const diff = actual - planned;

        const abs = Math.abs(diff);
        const h = Math.floor(abs / 3600);
        const m = Math.floor((abs % 3600) / 60);
        const s = abs % 60;
        const color = diff >= 0 ? "green" : "red";
        const prefix = diff >= 0 ? "+" : "-";

        return (
          <Tag
            color={color}
          >{`${prefix} ${h} hours ${m} minutes ${s} seconds`}</Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => {
        let color = "";
        let label = "";

        switch (status) {
          case "FINISHED":
            color = "green";
            label = "Finished";
            break;
          case "PENDING":
            color = "orange";
            label = "Pending";
            break;
          case "CANCEL":
            color = "red";
            label = "Cancelled";
            break;
          default:
            color = "gray";
            label = "Unknown";
            break;
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
  ];

  return (
    <div>
      <Title level={2}>Meeting Activity Tracking</Title>
      <Divider />
      <Card>
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={12}>
            <Card bordered={false}>
              <Text type="secondary">TOTAL DURATION</Text>
              <Title level={5}>{totalDuration}</Title>
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false}>
              <Text type="secondary">PROGRAM SUMMARY</Text>
              <br />
              <Space direction="vertical">
                {programSummary.map((prog) => (
                  <div key={prog.name}>
                    <strong>{prog.name}</strong>{" "}
                    <span style={{ color: "#1677ff" }}>{prog.count} times</span>{" "}
                    – total {prog.duration}
                  </div>
                ))}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }} justify={"end"}>
          <Col>
            <span>Status Filter: </span>
            <Select
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              style={{ width: 200 }}
            >
              <Option value="all">All</Option>
              <Option value="absent">Absent</Option>
              <Option value="not_absent">Present</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Col>
          <Col>
            <span style={{ marginLeft: 24 }}>Month Filter: </span>
            <DatePicker
              picker="month"
              value={selectedMonth}
              onChange={(value) => setSelectedMonth(value)}
              allowClear
              style={{ width: 200 }}
              placeholder="Select Month"
            />
          </Col>
        </Row>

        <Table
          rowKey="meeting_id"
          dataSource={filteredData}
          columns={columns}
          bordered
          pagination={{
            current: currentPage, // state (optional)
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`,
            onChange: (page, pageSize) => {
              setCurrentPage(page); // handle change jika perlu
            },
          }}
        />
      </Card>
    </div>
  );
}
