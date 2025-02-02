import React from "react";
import { Card, Radio, Typography, Button, Popconfirm } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { MultipleChoicePlacementTest } from "@prisma/client";

const { Title } = Typography;

interface MultipleChoiceProps {
  data: MultipleChoicePlacementTest[];
  onEdit: (mcq_id: string) => void;
  onDelete: (mcq_id: string) => void;
}

const MultipleChoiceTeacherPlacementDisplay: React.FC<MultipleChoiceProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {data.map(({ mcq_id, question, options, correctAnswer }) => {
        // Pastikan `options` adalah array string
        const validOptions = Array.isArray(options) ? options.map(String) : [];

        return (
          <Card key={mcq_id} style={{ marginBottom: "20px" }}>
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
                onClick={() => onEdit(mcq_id)}
                style={{ marginRight: "10px" }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Yakin menghapus soal ini?"
                onConfirm={() => onDelete(mcq_id)}
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Hapus
                </Button>
              </Popconfirm>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default MultipleChoiceTeacherPlacementDisplay;
