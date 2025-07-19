import Title from "antd/es/typography/Title";
import { useTestimoniViewModel } from "./useTestimoniViewModel";
import {
  Grid,
  Table,
  Tag,
  Skeleton,
  Card,
  Button,
  Divider,
  Modal,
  Flex,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import * as XLSX from "xlsx";
import { DeleteOutlined } from "@ant-design/icons";

const { useBreakpoint } = Grid;

export interface Student {
  username: string;
}

export interface Testimoni {
  testimonial_id: string;
  student_id: string;
  lesson_satisfaction: number;
  teaching_method_effectiveness: number;
  exercise_and_assignment_relevance: number;
  material_relevance: number;
  teacher_identity: string;
  teaching_delivery: number;
  teacher_attention: number;
  teacher_ethics: number;
  teacher_motivation: number;
  class_experience: string;
  favorite_part: string;
  improvement_suggestions: string;
  student: Student;
}

export default function TestimoniComponent() {
  const screens = useBreakpoint();
  const handleExportToExcel = () => {
    if (!dataTestimoni?.data) return;

    const exportData = dataTestimoni.data.map((item, index) => ({
      No: index + 1,
      "Nama Siswa": item.student.username,
      Guru: item.teacher_identity,
      "Kepuasan Pelajaran": item.lesson_satisfaction,
      "Efektivitas Mengajar": item.teaching_method_effectiveness,
      "Relevansi Tugas": item.exercise_and_assignment_relevance,
      "Relevansi Materi": item.material_relevance,
      "Penyampaian Materi": item.teaching_delivery,
      "Perhatian Guru": item.teacher_attention,
      "Etika Guru": item.teacher_ethics,
      "Motivasi Guru": item.teacher_motivation,
      "Pengalaman Kelas": item.class_experience,
      "Bagian Favorit": item.favorite_part,
      "Saran Perbaikan": item.improvement_suggestions,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Testimoni");

    XLSX.writeFile(workbook, "Data_Testimoni_Siswa.xlsx");
  };

  const { dataTestimoni, isLoadingDataTestimoni, handleDelete } =
    useTestimoniViewModel();


  const showDeleteConfirm = (testimonial_id: string) => {
    Modal.confirm({
      title: "Hapus Data",
      content: "Apakah Anda yakin ingin menghapus data ini?",
      okText: "Ya",
      okType: "danger",
      cancelText: "Tidak",
      onOk() {
        handleDelete(testimonial_id);
      },
    });
  };

  const columns: ColumnsType<Testimoni> = [
    {
      title: "No",
      key: "no",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nama Siswa",
      dataIndex: ["student", "username"],
      key: "student_name",
    },
    {
      title: "Guru",
      dataIndex: "teacher_identity",
      key: "teacher_identity",
    },
    {
      title: "Kepuasan Pelajaran",
      dataIndex: "lesson_satisfaction",
      key: "lesson_satisfaction",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Efektivitas Metode Mengajar",
      dataIndex: "teaching_method_effectiveness",
      key: "teaching_method_effectiveness",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Relevansi Tugas dan Latihan",
      dataIndex: "exercise_and_assignment_relevance",
      key: "exercise_and_assignment_relevance",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Relevansi Materi",
      dataIndex: "material_relevance",
      key: "material_relevance",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Penyampaian Materi",
      dataIndex: "teaching_delivery",
      key: "teaching_delivery",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Perhatian Guru",
      dataIndex: "teacher_attention",
      key: "teacher_attention",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Etika Guru",
      dataIndex: "teacher_ethics",
      key: "teacher_ethics",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Motivasi Guru",
      dataIndex: "teacher_motivation",
      key: "teacher_motivation",
      render: (value: number) => <Tag color="blue">{value}/5</Tag>,
    },
    {
      title: "Pengalaman Kelas",
      dataIndex: "class_experience",
      key: "class_experience",
    },
    {
      title: "Bagian Favorit",
      dataIndex: "favorite_part",
      key: "favorite_part",
    },
    {
      title: "Saran Perbaikan",
      dataIndex: "improvement_suggestions",
      key: "improvement_suggestions",
    },
    {
      title: "Aksi",
      key: "action",
      render: (record) => (
        <div>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => showDeleteConfirm(record.testimonial_id)}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: screens.xs ? "10px" : "20px" }}>
      <Title level={screens.xs ? 4 : 3}>Data Testimoni Siswa</Title>
      <Divider />
      <div style={{ marginBottom: 16 }}>
        <Flex justify="space-between" align="center">
          <Button
            type="primary"
            onClick={handleExportToExcel}
            disabled={!dataTestimoni?.data}
          >
            Download Excel
          </Button>
          <Button
            href="/admin/dashboard/student/testimoni/statistic"
            type="primary"
          >
            Statistik Testimoni
          </Button>
        </Flex>
      </div>

      {isLoadingDataTestimoni ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Card
          style={{
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            padding: screens.xs ? "12px" : "20px",
          }}
        >
          <Table
            columns={columns}
            dataSource={dataTestimoni?.data || []}
            rowKey="testimonial_id"
            bordered
            pagination={{ pageSize: 5 }}
            scroll={{ x: "max-content" }} // agar bisa discroll horizontal di mobile
          />
        </Card>
      )}
    </div>
  );
}
