import {
  Table,
  Tag,
  Button,
  Card,
  Divider,
  Flex,
  Modal,
  Form,
  Select,
  DatePicker,
  Input,
  Alert,
  Row,
  Col,
  Checkbox,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import useTimeSheetTeacherViewModel from "./useTimeSheetTeacherViewModel";
import { MethodType } from "@/app/model/enums";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration, { Duration } from "dayjs/plugin/duration";
import Title from "antd/es/typography/Title";
import { useState } from "react";
dayjs.extend(utc);
dayjs.extend(duration);

const { RangePicker } = DatePicker;

interface TimesheetTeacherItem {
  meeting_id: string;
  method?: MethodType | null | string;
  meetLink?: string | null;
  platform?: string | null;
  teacher_id: string;
  student_id: string;
  is_started?: boolean | null;
  alpha?: boolean | null;
  absent?: boolean | null;
  started_time?: string | null;
  finished_time?: string | null;
  dateTime?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  name_program?: string | null;
  is_cancelled?: boolean | null;
  status?: string | null; // "PENDING" | "PROGRES" | "FINISHED" | "CANCEL"
  reminder_sent_at?: string | null;
  createdAt?: string | null;
  student?: { username: string };
  teacher?: { username: string };
}

function formatDuration(dur: Duration) {
  const hours = Math.floor(dur.asHours());
  const minutes = dur.minutes();
  const seconds = dur.seconds();
  return `${hours} jam ${minutes} menit ${seconds} detik`;
}

const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const MEETING_COLUMNS = [
  { label: "Nama Siswa", value: "student.username" },
  { label: "Nama Program", value: "name_program" },
  { label: "Waktu", value: "waktu" },
  { label: "Tanggal", value: "dateTime" },
  { label: "Durasi", value: "duration" },
  { label: "Selisih Waktu", value: "lateness" },
  { label: "Status", value: "status" },
  { label: "Pembuat", value: "teacher.username" },
];

export default function TimeSheetTableComponent() {
  const {
    meetingData,
    month,
    year,
    isOpen,
    modalOpen,
    modalClose,
    form,
    loading,
    handleFinish,
  } = useTimeSheetTeacherViewModel();

  const data = (meetingData?.data || []) as TimesheetTeacherItem[];

  // Helpers
  const humanizeMs = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours} jam ${minutes} menit ${seconds} detik`;
  };

  const toUtc = (d?: string | null) => (d ? dayjs.utc(d) : null);

  const scheduledMs = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.startTime);
    const e = toUtc(r.endTime);
    if (!s || !e) return null;
    return e.diff(s);
  };

  const actualMs = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.started_time);
    const e = toUtc(r.finished_time);
    if (!s || !e) return null;
    const ms = e.diff(s);
    return ms < 0 ? 0 : ms;
  };

  const deltaMs = (r: TimesheetTeacherItem) => {
    const S = scheduledMs(r);
    const A = actualMs(r);
    if (S == null || A == null) return null;
    return A - S;
  };

  // ====== AGREGASI ======
  // Hanya FINISHED untuk durasi & total durasi
  const finishedRows = data.filter((r) => r.status === "FINISHED");

  let totalDuration = dayjs.duration(0);

  // Program stats: tampilkan FINISHED (count & duration) + CANCEL (count)
  type ProgramStats = {
    finishedCount: number;
    finishedDuration: number;
    cancelCount: number;
  };
  const programStats: Record<string, ProgramStats> = {};

  // Kumpulkan FINISHED
  finishedRows.forEach((item) => {
    const ms = actualMs(item);
    if (ms != null) {
      totalDuration = totalDuration.add(ms, "milliseconds");
      const key = item.name_program ?? "Tidak ada program";
      if (!programStats[key]) {
        programStats[key] = {
          finishedCount: 0,
          finishedDuration: 0,
          cancelCount: 0,
        };
      }
      programStats[key].finishedCount += 1;
      programStats[key].finishedDuration += ms;
    }
  });

  // Kumpulkan CANCEL (hanya menambah count; durasi tidak dihitung)
  const cancelRows = data.filter((r) => r.status === "CANCEL");
  cancelRows.forEach((item) => {
    const key = item.name_program ?? "Tidak ada program";
    if (!programStats[key]) {
      programStats[key] = {
        finishedCount: 0,
        finishedDuration: 0,
        cancelCount: 0,
      };
    }
    programStats[key].cancelCount += 1;
  });
  // =======================

  // Range default
  const monthNum = Number(month ?? "1");
  const yearNum = Number(year ?? new Date().getFullYear());
  const startDate = dayjs(
    `${yearNum}-${monthNum.toString().padStart(2, "0")}-01`
  );
  const endDate = startDate.endOf("month");
  const defaultRange = [startDate, endDate];

  const [allChecked, setAllChecked] = useState(false);
  const [formatType, setFormatType] = useState("Lengkap");
  const onColumnsChange = (checkedValues: string[]) => {
    setAllChecked(checkedValues.length === MEETING_COLUMNS.length);
  };

  const safeTimeRange = (r: TimesheetTeacherItem) => {
    const s = toUtc(r.startTime);
    const e = toUtc(r.endTime);
    if (!s || !e || !s.isValid() || !e.isValid()) return "-";
    return `${s.format("HH:mm")} - ${e.format("HH:mm")}`;
  };

  const safeDate = (r: TimesheetTeacherItem) => {
    const d = toUtc(r.dateTime);
    return d && d.isValid() ? d.format("YYYY-MM-DD") : "-";
  };

  const columns = [
    {
      title: "Nama Siswa",
      key: "student_name",
      render: (_: any, record: TimesheetTeacherItem) =>
        record.student?.username || "-",
    },
    {
      title: "Nama Program",
      key: "program_name",
      render: (_: any, record: TimesheetTeacherItem) =>
        record.name_program || "-",
    },
    {
      title: "Waktu",
      key: "time",
      render: (record: TimesheetTeacherItem) => safeTimeRange(record),
    },
    {
      title: "Tanggal",
      key: "dateTime",
      render: (_: any, record: TimesheetTeacherItem) => safeDate(record),
    },
    {
      title: "Durasi",
      key: "duration",
      render: (_: any, r: TimesheetTeacherItem) => {
        // Hanya untuk FINISHED (pakai actual). Selain itu: "-"
        if (r.status !== "FINISHED") return "-";
        const ms = actualMs(r);
        return ms == null ? "-" : humanizeMs(ms);
      },
    },
    {
      title: "Selisih Durasi",
      key: "lateness",
      render: (_: any, r: TimesheetTeacherItem) => {
        // Selisih hanya relevan jika ada actual (FINISHED)
        if (r.status !== "FINISHED") return "-";
        const d = deltaMs(r);
        if (d == null) return "-";
        const sign = d >= 0 ? "+" : "-";
        const color = d >= 0 ? "green" : "red";
        return (
          <Tag color={color} style={{ fontWeight: 600, fontSize: 13 }}>
            {sign} {humanizeMs(Math.abs(d))}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      render: (_: any, record: TimesheetTeacherItem) => {
        let color: any = "default";
        let text = "Belum Dimulai";

        switch (record.status) {
          case "PROGRES":
            color = "blue";
            text = "Diproses";
            break;
          case "PENDING":
            color = "orange";
            text = "Pending";
            break;
          case "FINISHED":
            color = "green";
            text = "Selesai";
            break;
          case "CANCEL":
            color = "red";
            text = "Absent";
            break;
        }

        return (
          <Tag color={color} style={{ fontWeight: 600, fontSize: 13 }}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: "Pembuat",
      key: "teacher",
      render: (_: any, record: TimesheetTeacherItem) =>
        record.teacher?.username
          ? `${record.teacher.username} – OSS Bali`
          : "-",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "32px 0" }}>
      <div style={{ maxWidth: 1500, margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            marginBottom: 24,
            background: "#fff",
            borderRadius: 16,
            padding: "16px 32px",
            boxShadow: "0 4px 24px rgba(30, 56, 109, 0.08)",
            width: "100%",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            style={{ width: "100%" }}
          >
            <Title
              level={4}
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: "#24292f",
                margin: 0,
                letterSpacing: "-1px",
                lineHeight: 1.2,
              }}
            >
              Timesheet {data[0]?.teacher?.username ?? "-"}
            </Title>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={modalOpen}
            >
              Download
            </Button>
          </Flex>

          <div style={{ marginTop: 4 }}>
            <Title
              level={5}
              style={{
                fontWeight: 500,
                fontSize: 20,
                color: "#24292f",
                margin: 0,
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              Bulan {MONTH_NAMES[Number(month ?? "1") - 1]} Tahun {year}
            </Title>
          </div>
        </div>

        <Card
          style={{
            borderRadius: 16,
            boxShadow: "0 4px 16px rgba(30,56,109,0.07)",
            border: "1px solid #e5e7eb",
            marginBottom: 24,
          }}
          bodyStyle={{ padding: "32px 24px 18px 24px" }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "24px",
              alignItems: "stretch",
              fontSize: 16,
            }}
          >
            {/* Total Durasi: hanya FINISHED (actual) */}
            <div
              style={{
                flex: "1 1 260px",
                background: "#fff",
                borderRadius: 12,
                padding: "20px 24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #e5e7eb",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#555",
                  fontSize: 15,
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Total Durasi
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#1f2937" }}>
                {formatDuration(totalDuration)}
              </div>
            </div>

            {/* Jumlah Program: FINISHED (count+durasi) + CANCEL (count) */}
            <div
              style={{
                flex: "2 1 320px",
                background: "#fff",
                borderRadius: 12,
                padding: "20px 24px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#555",
                  fontSize: 15,
                  marginBottom: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Jumlah Program
              </div>
              <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                {Object.entries(programStats).map(
                  ([
                    program,
                    { finishedCount, finishedDuration, cancelCount },
                  ]) => (
                    <li
                      key={program}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <span style={{ fontWeight: 500, color: "#374151" }}>
                        {program}
                      </span>
                      <span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: "#16a34a",
                            marginRight: 8,
                          }}
                          title="Jumlah pertemuan selesai"
                        >
                          {finishedCount} kali
                        </span>
                        <span style={{ color: "#6b7280", marginRight: 8 }}>
                          – total {humanizeMs(finishedDuration)}
                        </span>
                        {cancelCount > 0 && (
                          <span
                            style={{ color: "#ef4444", fontWeight: 600 }}
                            title="Jumlah pertemuan cancel/absent"
                          >
                            (+ {cancelCount} absent)
                          </span>
                        )}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <Divider style={{ margin: "32px 0 24px 0" }} />

          {/* Tabel: semua baris; Durasi hanya untuk FINISHED */}
          <Table<TimesheetTeacherItem>
            columns={columns}
            dataSource={data.map((item, idx) => ({ ...item, key: idx }))}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} data`,
            }}
            bordered
            rowClassName={(_, idx) =>
              idx % 2 === 0 ? "" : "ant-table-row-alt"
            }
            style={{
              background: "#fff",
              borderRadius: 12,
              marginTop: 0,
              overflow: "hidden",
            }}
          />
        </Card>
      </div>

      {/* Modal Export */}
      <Modal
        open={isOpen}
        onCancel={modalClose}
        title="Ekspor Laporan"
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          autoComplete="off"
        >
          <Form.Item
            name="date"
            label="Tanggal"
            initialValue={defaultRange}
            rules={[{ required: true, message: "Tanggal wajib diisi!" }]}
          >
            <RangePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              defaultPickerValue={[defaultRange[0], defaultRange[1]]}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Kirimkan File ke Email"
            rules={[
              { required: true, message: "Email wajib diisi!" },
              { type: "email", message: "Format email tidak valid!" },
            ]}
          >
            <Input placeholder="Email" autoComplete="off" allowClear />
          </Form.Item>

          <Form.Item
            name="format"
            label="Pilih Format Laporan"
            initialValue="Lengkap"
            rules={[{ required: true, message: "Pilih format laporan!" }]}
          >
            <Select
              style={{ width: "100%" }}
              placeholder="Pilih format laporan"
              onChange={(value) => {
                setFormatType(value);
                if (value !== "Pilih Kolom") {
                  form.setFieldsValue({
                    columns: MEETING_COLUMNS.map((col) => col.value),
                  });
                }
              }}
            >
              <Select.Option value="Lengkap">Lengkap</Select.Option>
              <Select.Option value="Ringkas">Ringkas</Select.Option>
              <Select.Option value="Pilih Kolom">Pilih Kolom</Select.Option>
            </Select>
          </Form.Item>

          {formatType === "Pilih Kolom" && (
            <Form.Item
              name="columns"
              label="Pilih Kolom yang Ditampilkan"
              initialValue={MEETING_COLUMNS.map((col) => col.value)}
              rules={[{ required: true, message: "Pilih minimal satu kolom!" }]}
            >
              <Checkbox.Group
                style={{ width: "100%" }}
                onChange={(vals) =>
                  setAllChecked(vals.length === MEETING_COLUMNS.length)
                }
              >
                <div style={{ marginBottom: 8 }}>
                  <Checkbox
                    checked={allChecked}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAllChecked(checked);
                      form.setFieldsValue({
                        columns: checked
                          ? MEETING_COLUMNS.map((c) => c.value)
                          : [],
                      });
                    }}
                  >
                    Pilih Semua
                  </Checkbox>
                </div>
                <div
                  style={{
                    maxHeight: 220,
                    overflowY: "auto",
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    padding: 8,
                    background: "#fff",
                  }}
                >
                  <Row gutter={[0, 8]}>
                    {MEETING_COLUMNS.map((col) => (
                      <Col span={12} key={col.value}>
                        <Checkbox value={col.value}>{col.label}</Checkbox>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Checkbox.Group>
            </Form.Item>
          )}

          <Alert
            type="info"
            style={{
              marginTop: 16,
              background: "#9187f3",
              color: "#fff",
              fontWeight: 500,
              border: "none",
              borderRadius: 6,
            }}
            message={
              <>
                Waktu yang dibutuhkan untuk menerima email hasil ekspor excel
                maksimal <b>20 menit</b>, tergantung banyaknya data yang
                dikumpulkan.
              </>
            }
          />

          <Form.Item style={{ marginTop: 24, textAlign: "right" }}>
            <Button onClick={modalClose} style={{ marginRight: 12 }}>
              Batal
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Ekspor
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
