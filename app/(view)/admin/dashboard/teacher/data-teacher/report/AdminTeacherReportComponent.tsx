import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useAdminTeacherViewModel } from "./useAdminTeacherReportViewModel";
import {
  Row,
  Col,
  Typography,
  Select,
  Skeleton,
  Empty,
  Alert,
  Card,
  Button,
  Modal,
  Form,
  DatePicker,
  Input,
  Checkbox,
  Flex,
} from "antd";
import { useRouter } from "next/navigation";
import { DownloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const generateYears = (start: number, end: number) => {
  const years = [];
  for (let y = end; y >= start; y--) years.push(y);
  return years;
};

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

export default function ReportTeacherComponent() {
  const {
    data,
    error,
    isLoading,
    selectedYear,
    selectedMonth,
    changeDate,
    modalOpen,
    modalClose,
    form,
    isOpen,
    handleFinish,
    loading,
  } = useAdminTeacherViewModel();

  const years = generateYears(2021, new Date().getFullYear());

  const router = useRouter();

  const handleYearChange = (value: number) => {
    changeDate(value, selectedMonth);
  };

  const [allChecked, setAllChecked] = useState(false);
  const [formatType, setFormatType] = useState("Lengkap");

  const handleMonthChange = (value: number) => {
    changeDate(selectedYear, value);
  };

  const monthNum = Number(selectedMonth ?? "1"); // eg. 8
  const yearNum = Number(selectedYear ?? new Date().getFullYear()); // eg. 2025

  // Awal bulan (1 Agustus 2025)
  const startDate = dayjs(
    `${yearNum}-${monthNum.toString().padStart(2, "0")}-01`
  );
  // Akhir bulan (otomatis)
  const endDate = startDate.endOf("month");

  // Untuk initialValue
  const defaultRange = [startDate, endDate];

  const onColumnsChange = (checkedValues: string[]) => {
    setAllChecked(checkedValues.length === MEETING_COLUMNS.length);
  };

  return (
    <Card
      bordered={false}
      style={{
        padding: 24,
        margin: "16px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
      }}
    >
      <Row
        justify="space-between"
        align="top"
        gutter={[16, 24]}
        style={{ marginBottom: 24 }}
      >
        <Col xs={24} md={12}>
          <Title level={3} style={{ marginBottom: 5 }}>
            Laporan Guru
          </Title>
          <Text type="secondary">
            Laporan kehadiran guru berdasarkan tahun dan bulan
          </Text>
        </Col>

        <Col>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => modalOpen()}
          >
            Cetak Laporan Timesheet
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} justify="start" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Pilih Tahun
          </Text>
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            style={{ width: "100%" }}
          >
            {years.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Text strong style={{ display: "block", marginBottom: 4 }}>
            Pilih Bulan
          </Text>
          <Select
            value={selectedMonth}
            onChange={handleMonthChange}
            style={{ width: "100%" }}
          >
            {months.map((month, index) => (
              <Option key={index + 1} value={index + 1}>
                {month}
              </Option>
            ))}
          </Select>
        </Col>
      </Row>

      <div style={{ height: 420 }}>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : error ? (
          <Alert
            message="Gagal memuat data"
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        ) : data.length === 0 ? (
          <Empty
            description="Tidak ada data yang tersedia"
            style={{ marginTop: 80 }}
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="username" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#1890ff"
                radius={[6, 6, 0, 0]}
                onClick={(barData) => {
                  if (barData && barData.teacher_id) {
                    router.push(
                      `/admin/dashboard/teacher/data-teacher/report/timesheet-teacher?teacher_id=${barData.teacher_id}&month=${selectedMonth}&year=${selectedYear}`
                    );
                  }
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
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
              {
                type: "email",
                message: "Format email tidak valid!",
              },
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
                onChange={onColumnsChange}
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
    </Card>
  );
}
