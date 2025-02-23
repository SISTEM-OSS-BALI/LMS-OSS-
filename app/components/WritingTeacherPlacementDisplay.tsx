import React from "react";
import { Card, Typography, Button, Popconfirm, Flex } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { WritingPlacementTest } from "@prisma/client";

const { Title } = Typography;

interface WritingPlacementProps {
  data: WritingPlacementTest[];
  onEdit: (writing_id: string) => void;
  onDelete: (writing_id: string) => void;
}

const WritingPlacementTestDisplay: React.FC<WritingPlacementProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      {/* Daftar Soal */}
      {data.length > 0 ? (
        data.map(({ writing_id, question, marks }) => (
          <Card key={writing_id} style={{ marginBottom: "20px" }}>
            <Title level={4}>
              <div dangerouslySetInnerHTML={{ __html: question }} />
            </Title>

            {/* Tombol Edit dan Delete di bawah pertanyaan */}
            <div
              style={{
                marginTop: "15px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => onEdit(writing_id)}
                style={{ marginRight: "10px" }}
              >
                Edit
              </Button>

              <Button
                type="primary"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onDelete(writing_id)}
              >
                Hapus
              </Button>
            </div>
          </Card>
        ))
      ) : (
        <p style={{ textAlign: "center", color: "#888" }}>
          Belum ada soal writing. Klik Tambah Soal Writing untuk menambahkan.
        </p>
      )}
    </div>
  );
};

export default WritingPlacementTestDisplay;
