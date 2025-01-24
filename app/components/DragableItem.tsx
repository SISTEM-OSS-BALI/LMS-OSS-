/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useRef } from "react";
import { Button, Image, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDrag, useDrop } from "react-dnd";
import ReactPlayer from "react-player";

const DraggableContentItem = ({
  item,
  index,
  moveItem,
  handleEdit,
  handleDelete,
  materialId,
}: {
  item: {
    type: "text" | "url" | "image";
    value: string;
    index: number;
  };
  index: number;
  moveItem: (dragIndex: number, hoverIndex: number, materialId: string) => void;
  handleEdit: (materialId: string, index: number) => void;
  handleDelete: (
    index: number,
    materialId: string,
    type: "text" | "url" | "image"
  ) => void;
  materialId: string;
}) => {
  // Setup drag
  const [, dragRef] = useDrag({
    type: "content-item",
    item: { index, materialId },
  });

  // Setup drop
  const [, dropRef] = useDrop({
    accept: "content-item",
    hover: (draggedItem: { index: number; materialId: string }) => {
      if (draggedItem.index !== index) {
        moveItem(draggedItem.index, index, draggedItem.materialId);
        draggedItem.index = index;
      }
    },
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    dragRef(node); // Attach dragRef
    dropRef(node); // Attach dropRef
  };

  return (
    <div
      ref={combinedRef}
      style={{
        marginBottom: "20px",
        paddingLeft: 200,
        paddingRight: 200,
        cursor: "move",
      }}
    >
      {/* Render based on item type */}
      {item.type === "text" && (
        <div
          dangerouslySetInnerHTML={{ __html: item.value }}
          style={{
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            textAlign: "justify",
          }}
        />
      )}
      {item.type === "url" && (
        <div
          ref={combinedRef}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {ReactPlayer.canPlay(item.value) ? (
            <ReactPlayer
              url={item.value}
              controls
              width={700}
              height={500}
              style={{ cursor: "move" }}
            />
          ) : (
            <a
              href={item.value}
              target="_blank"
              rel="noopener noreferrer"
              style={{ cursor: "move" }}
            >
              {item.value}
            </a>
          )}
        </div>
      )}
      {item.type === "image" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            src={item.value}
            alt="User uploaded content"
            height={500}
            style={{ maxWidth: "100%" }}
          />
        </div>
      )}

      {/* Edit and Delete Buttons */}
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
          onClick={() => handleEdit(materialId, item.index)}
          style={{ marginRight: "10px" }}
        >
          Edit
        </Button>
        <Popconfirm
          title="Yakin menghapus materi ini?"
          onConfirm={() =>
            handleDelete(
              item.index,
              materialId,
              item.type as "image" | "text" | "url"
            )
          }
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>
            Hapus
          </Button>
        </Popconfirm>
      </div>
    </div>
  );
};

const MaterialList = ({
  material,
  moveItem,
  handleEdit,
  handleDelete,
}: {
  material: any; // Replace `any` with your material type
  moveItem: (dragIndex: number, hoverIndex: number, materialId: string) => void;
  handleEdit: (materialId: string, index: number) => void;
  handleDelete: (
    index: number,
    materialId: string,
    type: "text" | "url" | "image"
  ) => void;
}) => {
  const items = [
    ...(material.texts || []).map((textItem: any) => ({
      type: "text",
      value: textItem.contentText,
      index: textItem.index,
    })),
    ...(material.urls || []).map((urlItem: any) => ({
      type: "url",
      value: urlItem.contentUrl,
      index: urlItem.index,
    })),
    ...(material.images || []).map((imageItem: any) => ({
      type: "image",
      value: imageItem.imageUrl,
      index: imageItem.index,
    })),
  ].sort((a, b) => a.index - b.index);

  return (
    <div style={{ marginBottom: "20px" }}>
      {items.map((item, idx) => (
        <DraggableContentItem
          key={idx}
          item={item}
          index={idx}
          moveItem={moveItem}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          materialId={material.material_id}
        />
      ))}
    </div>
  );
};

export default MaterialList;
