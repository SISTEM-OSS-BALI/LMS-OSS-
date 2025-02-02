import {
  Drawer,
  FloatButton,
  Card,
  List,
  Typography,
  Modal,
  Form,
  Avatar,
  Button,
  Input,
  Flex,
} from "antd";
import { useDetailPlacementTestViewModel } from "./useDetailPlacemetTestViewModel";
import { useState } from "react";
import Title from "antd/es/typography/Title";
import MultipleChoiceTeacherPlacementDisplay from "@/app/components/MultipleChoiceTeacherPlacementDisplay";

export default function DetailPlacementComponent() {
  const {
    dataDetailPlacementTest,
    dataDetailMultipleChoice,
    filteredStudent,
    handleSearch,
    handleCancelModalAccess,
    isModalAccessVisible,
    selectedStudent,
    setSelectedStudent,
    form,
    handleOpenModalAccess,
    handleSubmit,
    loading,
  } = useDetailPlacementTestViewModel();
  const detailPlacement = dataDetailPlacementTest?.data;
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const renderMultipleChoice = () => {
    if (!Array.isArray(dataDetailMultipleChoice?.data)) {
      return <div>Data tidak tersedia</div>;
    }

    return (
      <MultipleChoiceTeacherPlacementDisplay
        data={dataDetailMultipleChoice.data.map((detail: any) => ({
          mcq_id: detail.mcq_id,
          question: detail.question,
          options: Array.isArray(detail.options)
            ? detail.options.map(String)
            : [],
          correctAnswer: detail.correctAnswer,
          placement_test_id: detail.placement_test_id,
        }))}
        onEdit={(mcq_id: string) => {
          console.log("Edit:", mcq_id);
        }}
        onDelete={(mcq_id: string) => {
          console.log("Delete:", mcq_id);
        }}
      />
    );
  };

  return (
    <div style={{ padding: "24px" }}>
      <Flex justify="space-between">
        <Title level={3}>Detail {detailPlacement?.name}</Title>
        <Button type="primary" onClick={handleOpenModalAccess}>
          Akses
        </Button>
      </Flex>
      <FloatButton onClick={() => setIsDrawerVisible(true)} />

      <div>{renderMultipleChoice()}</div>

      <Drawer
        title="Detail Placement Test"
        placement="right"
        onClose={() => setIsDrawerVisible(false)}
        open={isDrawerVisible}
      >
        <List
          bordered
          dataSource={[
            {
              label: "Deskripsi",
              value: detailPlacement?.description || "No description available",
            },
            {
              label: "Waktu Pengerjaan",
              value: detailPlacement?.timeLimit
                ? `${detailPlacement.timeLimit} menit`
                : "Waktu belum diatur",
            },
          ]}
          renderItem={(item) => (
            <List.Item>
              <Typography.Text strong>{item.label}:</Typography.Text>{" "}
              {item.value}
            </List.Item>
          )}
        />
      </Drawer>
      <Modal
        title="Pilih Siswa"
        open={isModalAccessVisible}
        onCancel={handleCancelModalAccess}
        footer={null}
        bodyStyle={{ maxHeight: "500px", overflowY: "hidden" }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Input
            placeholder="Cari Siswa"
            style={{ marginBottom: 10 }}
            onChange={handleSearch}
          />

          <div
            style={{
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "5px",
            }}
          >
            <List
              dataSource={filteredStudent || []}
              renderItem={(student) => {
                const isSelected = selectedStudent === student.user_id;

                return (
                  <List.Item key={student.user_id}>
                    <Card
                      onClick={() => setSelectedStudent(student.user_id)}
                      style={{
                        width: "100%",
                        cursor: "pointer",
                        border: isSelected
                          ? "2px solid #1890ff"
                          : "1px solid #d9d9d9",
                        borderRadius: "10px",
                        boxShadow: isSelected
                          ? "0 4px 12px rgba(24, 144, 255, 0.3)"
                          : "none",
                        padding: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <Avatar src={student.imageUrl} size={64} />
                        <Title level={5} style={{ margin: 0 }}>
                          {student.username}
                        </Title>
                      </div>
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>

          <Form.Item style={{ marginTop: 16, textAlign: "right" }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              disabled={!selectedStudent}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
