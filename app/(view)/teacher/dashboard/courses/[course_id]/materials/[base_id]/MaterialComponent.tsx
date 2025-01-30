import React from "react";
import {
  Button,
  Image,
  Modal,
  Form,
  Select,
  Input,
  Upload,
  Divider,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import CustomAlert from "@/app/components/CustomAlert";
import Title from "antd/es/typography/Title";
import MaterialList from "@/app/components/DragableItem";
import { useAssignmentViewModel } from "./useMaterialViewModel";

const { Option } = Select;

export default function MaterialComponent() {
  const {
    name,
    material,
    loading,
    isModalVisible,
    setIsModalVisible,
    onFinish,
    handleEdit,
    handleDelete,
    handleAddContent,
    handleCancel,
    handleImageUpload,
    contentItems,
    handleContentTypeChange,
    handleContentValueChange,
    moveItem,
    error,
    data,
    form,
    editingIndex,
  } = useAssignmentViewModel();

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Title level={3}>{name}</Title>
        {!material.texts?.length &&
          !material.urls?.length &&
          !material.images?.length && (
            <Button onClick={() => setIsModalVisible(true)}>Buat Materi</Button>
          )}
      </div>
      <Divider />
      {!material ||
      (!material.texts?.length &&
        !material.urls?.length &&
        !material.images?.length) ? (
        <CustomAlert type="info" message="Tidak ada data materi" />
      ) : (
        <MaterialList
          material={material}
          moveItem={moveItem}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}

      <Modal
        title={editingIndex !== null ? "Edit Materi" : "Buat Materi"} // Ganti judul berdasarkan tindakan
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {contentItems.map((item, index) => (
            <div key={index} style={{ marginBottom: "20px" }}>
              <Form.Item>
                <Select
                  value={item.type || undefined}
                  onChange={(value) => handleContentTypeChange(index, value)}
                  placeholder="Pilih jenis konten"
                >
                  <Option value="text">Teks</Option>
                  <Option value="url">URL</Option>
                  <Option value="image">Gambar</Option>
                </Select>
              </Form.Item>

              {item.type === "text" && (
                <Form.Item label="Konten Teks">
                  <ReactQuill
                    value={item.value}
                    onChange={(value) => handleContentValueChange(index, value)}
                  />
                </Form.Item>
              )}

              {item.type === "url" && (
                <Form.Item label="URL">
                  <Input
                    value={item.value}
                    onChange={(e) =>
                      handleContentValueChange(index, e.target.value)
                    }
                  />
                </Form.Item>
              )}

              {item.type === "image" && (
                <Form.Item label="Gambar">
                  <Upload
                    customRequest={(options) =>
                      handleImageUpload(index, options)
                    }
                    listType="picture"
                    maxCount={1}
                  >
                    <Button icon={<PlusOutlined />}>Unggah Gambar</Button>
                  </Upload>
                  {item.value && (
                    <Image
                      src={item.value}
                      alt="Gambar"
                      height={150}
                      style={{ marginTop: "10px" }}
                    />
                  )}
                </Form.Item>
              )}
            </div>
          ))}

          <Form.Item>
            <Button type="dashed" onClick={handleAddContent}>
              Tambahkan Konten
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingIndex === null ? "Simpan" : "Update"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
