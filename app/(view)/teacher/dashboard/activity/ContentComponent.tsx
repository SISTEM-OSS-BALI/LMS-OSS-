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
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

dayjs.locale("id");

const { Option } = Select;
const { Title, Text } = Typography;

type MeetingRow = {
  meeting_id: string;
  student?: { username?: string; program?: { name?: string } };
  program?: { name?: string } | null; // normalized
  dateTime?: string;
  startTime?: string;
  endTime?: string;
  started_time?: string | null;
  finished_time?: string | null;
  is_cancelled?: boolean | null;
  absent?: boolean | null;
  status?: "FINISHED" | "PENDING" | "CANCEL" | string;
};

export default function MeetingActivity() {
  const { meetingData } = useActivityViewModel();

  const [statusFilter, setStatusFilter] = useState<
    "all" | "absent" | "not_absent" | "cancelled"
  >("all");
  const [selectedMonth, setSelectedMonth] = useState<Dayjs | null>(dayjs());
  const [currentPage, setCurrentPage] = useState(1);

  // Normalisasi: taruh program di root untuk mudah dipakai
  const normalizedData: MeetingRow[] = useMemo(() => {
    if (!Array.isArray(meetingData?.data)) return [];
    return meetingData.data.map((m: any) => ({
      ...m,
      program: m.student?.program ?? null,
    }));
  }, [meetingData]);

  // Filter status & bulan (tanpa mengubah aturan perhitungan durasi)
  const filteredData: MeetingRow[] = useMemo(() => {
    if (!Array.isArray(normalizedData)) return [];
    let data = [...normalizedData];

    if (statusFilter === "absent") {
      data = data.filter((m) => m.absent === true);
    } else if (statusFilter === "not_absent") {
      data = data.filter((m) => m.absent === null || m.absent === undefined);
    } else if (statusFilter === "cancelled") {
      data = data.filter(
        (m) => m.is_cancelled === true || m.status === "CANCEL"
      );
    }

    if (selectedMonth) {
      data = data.filter((m) =>
        dayjs(m.dateTime).isSame(selectedMonth, "month")
      );
    }

    return data;
  }, [normalizedData, statusFilter, selectedMonth]);

  // === Helpers waktu/durasi ===
  const diffSeconds = (a?: string | null, b?: string | null) =>
    a && b ? Math.max(0, dayjs(b).diff(dayjs(a), "second")) : null;

  const fmtHMS = (total: number) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h} hours ${m} minutes ${s} seconds`;
  };

  // === TOTAL DURATION: hanya FINISHED (actual) ===
  const totalDuration = useMemo(() => {
    const finishedOnly = filteredData.filter((m) => m.status === "FINISHED");
    const totalSec = finishedOnly.reduce((acc, m) => {
      const sec = diffSeconds(m.started_time, m.finished_time) ?? 0;
      return acc + sec;
    }, 0);
    return fmtHMS(totalSec);
  }, [filteredData]);

  // === PROGRAM SUMMARY: FINISHED (count + durasi), CANCEL (count) ===
  const programSummary = useMemo(() => {
    type S = {
      finishedCount: number;
      finishedSec: number;
      cancelCount: number;
    };
    const map: Record<string, S> = {};

    // FINISHED
    filteredData
      .filter((m) => m.status === "FINISHED")
      .forEach((m) => {
        const key = m.program?.name || "Unknown Program";
        if (!map[key])
          map[key] = { finishedCount: 0, finishedSec: 0, cancelCount: 0 };
        map[key].finishedCount += 1;
        map[key].finishedSec +=
          diffSeconds(m.started_time, m.finished_time) ?? 0;
      });

    // CANCEL
    filteredData
      .filter((m) => m.status === "CANCEL" || m.is_cancelled === true)
      .forEach((m) => {
        const key = m.program?.name || "Unknown Program";
        if (!map[key])
          map[key] = { finishedCount: 0, finishedSec: 0, cancelCount: 0 };
        map[key].cancelCount += 1;
      });

    // ke array siap render
    return Object.entries(map).map(
      ([name, { finishedCount, finishedSec, cancelCount }]) => ({
        name,
        finishedCount,
        finishedDuration: fmtHMS(finishedSec),
        cancelCount,
      })
    );
  }, [filteredData]);

  // === Kolom tabel ===
  const columns = [
    {
      title: "Student Name",
      dataIndex: ["student", "username"],
      key: "student",
      render: (_: any, record: MeetingRow) => record.student?.username || "-",
    },
    {
      title: "Program Name",
      key: "program",
      render: (_: any, record: MeetingRow) => record.program?.name || "-",
    },
    {
      title: "Time",
      key: "time",
      render: (_: any, record: MeetingRow) => {
        const start = record.startTime
          ? dayjs.utc(record.startTime).format("HH:mm")
          : "-";
        const end = record.endTime
          ? dayjs.utc(record.endTime).format("HH:mm")
          : "-";
        return `${start} – ${end}`;
      },
    },
    {
      title: "Date",
      dataIndex: "dateTime",
      render: (text: string) => (text ? dayjs(text).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Duration",
      key: "duration",
      render: (_: any, record: MeetingRow) => {
        // ⬇ hanya tampil untuk FINISHED
        if (record.status !== "FINISHED") return "-";
        const sec = diffSeconds(record.started_time, record.finished_time);
        return sec == null ? "-" : fmtHMS(sec);
      },
    },
    {
      title: "Duration Difference",
      key: "difference",
      render: (_: any, record: MeetingRow) => {
        // ⬇ hanya tampil untuk FINISHED
        if (record.status !== "FINISHED") return "-";
        const planned = diffSeconds(record.startTime, record.endTime);
        const actual = diffSeconds(record.started_time, record.finished_time);
        if (planned == null || actual == null) return "-";
        const diff = actual - planned;
        const abs = Math.abs(diff);
        const color = diff >= 0 ? "green" : "red";
        const prefix = diff >= 0 ? "+" : "-";
        return <Tag color={color}>{`${prefix} ${fmtHMS(abs)}`}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => {
        let color = "default";
        let label = "Unknown";
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
            label = "Absent";
            break;
          default:
            color = "gray";
            label = "Unknown";
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
              <Title level={5} style={{ marginTop: 8 }}>
                {totalDuration}
              </Title>
            </Card>
          </Col>
          <Col span={12}>
            <Card bordered={false}>
              <Text type="secondary">PROGRAM SUMMARY</Text>
              <br />
              <Space direction="vertical" style={{ marginTop: 8 }}>
                {programSummary.length === 0 ? (
                  <Text type="secondary">No data</Text>
                ) : (
                  programSummary.map((prog) => (
                    <div key={prog.name}>
                      <strong>{prog.name}</strong>{" "}
                      <span style={{ color: "#16a34a", fontWeight: 600 }}>
                        {prog.finishedCount} times
                      </span>{" "}
                      – total {prog.finishedDuration}
                      {prog.cancelCount > 0 && (
                        <span style={{ color: "#ef4444", fontWeight: 600 }}>
                          {" "}
                          (+ {prog.cancelCount} Absent)
                        </span>
                      )}
                    </div>
                  ))
                )}
              </Space>
            </Card>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: 16 }} justify="end">
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
          columns={columns as any}
          bordered
          pagination={{
            current: currentPage,
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20", "50"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} dari ${total} data`,
            onChange: (page) => setCurrentPage(page),
          }}
        />
      </Card>
    </div>
  );
}
