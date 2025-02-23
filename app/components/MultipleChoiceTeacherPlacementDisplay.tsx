import React from "react";
import { Card, Radio, Typography, Button, Popconfirm, Flex } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { MultipleChoicePlacementTest } from "@prisma/client";

const { Title } = Typography;

interface MultipleChoiceProps {
  data: MultipleChoicePlacementTest[];
  onEdit: (mc_id: string) => void;
  onDelete: (mc_id: string) => void;
}

const MultipleChoiceTeacherPlacementDisplay: React.FC<MultipleChoiceProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  return (
    <div>
      {/* Tombol Tambah Soal di atas */}

      {/* Daftar Soal */}
      {data.length > 0 ? (
        data.map(({ mc_id, question, options, correctAnswer }) => {
          const validOptions = Array.isArray(options)
            ? options.map(String)
            : [];

          return (
            <Card key={mc_id} style={{ marginBottom: "20px" }}>
              <Title level={4}>
                <div dangerouslySetInnerHTML={{ __html: question }} />
              </Title>
              <Radio.Group value={correctAnswer} disabled>
                {validOptions.map((option, optionIndex) => (
                  <Radio
                    key={optionIndex}
                    value={option}
                    style={{ display: "block" }}
                  >
                    {option}
                  </Radio>
                ))}
              </Radio.Group>

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
                  onClick={() => onEdit(mc_id)}
                  style={{ marginRight: "10px" }}
                >
                  Edit
                </Button>

                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(mc_id)}
                >
                  Hapus
                </Button>
              </div>
            </Card>
          );
        })
      ) : (
        <p style={{ textAlign: "center", color: "#888" }}>
          Belum ada soal multiple choice. Klik Tambah Soal untuk menambahkan.
        </p>
      )}
    </div>
  );
};

export default MultipleChoiceTeacherPlacementDisplay;
