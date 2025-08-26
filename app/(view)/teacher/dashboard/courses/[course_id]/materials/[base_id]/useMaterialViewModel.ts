import { fetcher } from "@/app/lib/utils/fetcher";
import { Material } from "@/app/model/material";
import { Form, message, notification } from "antd";
import { useParams } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import Cookies from "js-cookie";
import { RcFile, UploadRequestOption } from "rc-upload/lib/interface";
import { crudService } from "@/app/lib/services/crudServices";

interface ContentItem {
  type: "text" | "url" | "image" | "pdf" | null;
  value: string;
  index: number;
}

interface MaterialResponse {
  data: Material;
}
export const useAssignmentViewModel = () => {
  const query = useParams();
  const base_id = query.base_id as string;
  const course_id = query.course_id;
  const [loading, setLoading] = useState(false);
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { type: null, value: "", index: 0 },
  ]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [materialId, setMaterialId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { data, error, mutate } = useSWR<MaterialResponse>(
    `/api/teacher/material/${base_id}/show`,
    fetcher
  );

  const { data: nameMaterial } = useSWR(
    `/api/teacher/materialAssignmentBase/${course_id}/${base_id}/detail`,
    fetcher
  );

  const moveItem = (
    dragIndex: number,
    hoverIndex: number,
    materialId: string
  ) => {
    const materialToMove =
      data?.data.material_id === materialId ? data.data : null;

    if (!materialToMove) {
      message.error("Material not found");
      return;
    }

    // Gabungkan semua items menjadi satu array
    const allItems: ContentItem[] = [
      ...(materialToMove.texts || []).map((text: any) => ({
        type: "text" as ContentItem["type"],
        value: text.contentText,
        index: text.index,
      })),
      ...(materialToMove.urls || []).map((url: any) => ({
        type: "url" as ContentItem["type"],
        value: url.contentUrl,
        index: url.index,
      })),
      ...(materialToMove.images || []).map((image: any) => ({
        type: "image" as ContentItem["type"],
        value: image.imageUrl,
        index: image.index,
      })),
      ...(materialToMove.pdf || []).map((pdf: any) => ({
        type: "pdf" as ContentItem["type"],
        value: pdf.pdfUrl,
        index: pdf.index,
      })),
    ].sort((a, b) => a.index - b.index);

    // Validasi indeks
    if (
      dragIndex < 0 ||
      dragIndex >= allItems.length ||
      hoverIndex < 0 ||
      hoverIndex >= allItems.length
    ) {
      message.error("Invalid drag or hover index");
      return;
    }

    const draggedItem = allItems[dragIndex];
    const updatedItems = [...allItems];
    updatedItems.splice(dragIndex, 1);
    updatedItems.splice(hoverIndex, 0, draggedItem);

    updatedItems.forEach((item, index) => {
      item.index = index;
    });

    materialToMove.texts = updatedItems
      .filter((item) => item.type === "text")
      .map((item) => ({
        text_id: "", // You need to provide a value for text_id
        material_id: materialToMove.material_id, // Assuming material_id is a property of materialToMove
        contentText: item.value,
        index: item.index,
      }));
    materialToMove.urls = updatedItems
      .filter((item) => item.type === "url")
      .map((item) => ({
        url_id: "", // You need to provide a value for url_id
        material_id: materialToMove.material_id, // Assuming material_id is a property of materialToMove
        contentUrl: item.value,
        index: item.index,
      }));
    materialToMove.images = updatedItems
      .filter((item) => item.type === "image")
      .map((item) => ({
        image_id: "",
        material_id: materialToMove.material_id,
        imageUrl: item.value,
        index: item.index,
      }));

    setContentItems(updatedItems);
    onDragEnd(updatedItems);
  };

  const onDragEnd = async (updatedItems: ContentItem[]) => {
    if (updatedItems.length === 0) return;

    await updateContentItemsOnBackend(updatedItems);
  };

  const updateContentItemsOnBackend = async (updatedItems: ContentItem[]) => {
    const materialId = data?.data.material_id;
    const payload = { updatedItems, materialId };

    await fetch(`/api/teacher/material/${base_id}/${materialId}/updateIndex`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingIndex(null);
  };

  const handleAddContent = () => {
    const nextIndex = contentItems.length;
    setContentItems([
      ...contentItems,
      { type: null, value: "", index: nextIndex },
    ]);
  };

  const handleContentTypeChange = (
    index: number,
    type: "text" | "url" | "image" | "pdf" | null
  ) => {
    if (type) {
      // Pastikan type tidak null
      const updatedItems = [...contentItems];
      updatedItems[index].type = type;
      updatedItems[index].value = "";
      setContentItems(updatedItems);
    }
  };

  const handleContentValueChange = (index: number, value: string) => {
    const updatedItems = [...contentItems];
    updatedItems[index].value = value;
    setContentItems(updatedItems);
  };

  const handleImageUpload = (
    index: number,
    options: UploadRequestOption<RcFile>
  ) => {
    const { file, onSuccess, onError } = options;
    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        const updatedItems = [...contentItems];
        updatedItems[index].value = base64String;
        setContentItems(updatedItems);
        if (onSuccess) {
          const file = new File([base64String], "image.png", {
            type: "image/png",
          });
          onSuccess(file as RcFile);
        }
      };

      reader.onerror = (error) => {
        if (onError) onError(error);
        message.error("Failed to upload image");
      };

      reader.readAsDataURL(file);
    } else {
      message.error("Invalid file type");
      if (onError) onError(new Error("Invalid file type"));
    }
  };

  const onFinish = async () => {
    setLoading(true);

    const payload = {
      base_id: base_id,
      contentItems: contentItems.filter((item) => item.type && item.value),
    };

    try {
      const apiUrl =
        editingIndex === null
          ? "/api/teacher/material/create"
          : `/api/teacher/material/${base_id}/${materialId}/update`;

      const method = editingIndex === null ? "post" : "put";

      const result = await crudService[method](apiUrl, payload);

      if (result.status === 200) {
        notification.success({
          message: "Materi berhasil dibuat",
        });
      } else {
        notification.error({
          message: "Materi gagal dibuat",
        });
      }

      setIsModalVisible(false);
      await mutate();
      setMaterialId(result.data.material_id);
      form.resetFields();
      setContentItems([{ type: null, value: "", index: 0 }]);
      setEditingIndex(null);
    } catch (error) {
      console.error("Error saving material:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (materialId: string, itemIndex: number) => {
    const materialToEdit = data?.data;

    if (materialToEdit) {
      const editContentItems: ContentItem[] = [];

      materialToEdit.texts?.forEach((textItem) => {
        editContentItems.push({
          type: "text",
          value: textItem.contentText,
          index: textItem.index,
        });
      });

      materialToEdit.urls?.forEach((urlItem) => {
        editContentItems.push({
          type: "url",
          value: urlItem.contentUrl,
          index: urlItem.index,
        });
      });

      materialToEdit.images?.forEach((imageItem) => {
        editContentItems.push({
          type: "image",
          value: imageItem.imageUrl,
          index: imageItem.index,
        });
      });

      const itemToEdit = editContentItems.find(
        (item) => item.index === itemIndex
      );

      if (itemToEdit) {
        setContentItems([{ ...itemToEdit }]);
        setMaterialId(materialId);
        setIsModalVisible(true);
        setEditingIndex(itemIndex);
      } else {
        message.error("Item not found for editing");
        form.resetFields();
      }
    } else {
      message.error("Material not found");
    }
  };

  const handleDelete = async (
    index: number,
    materialId: string,
    type: "text" | "url" | "image" | "pdf"
  ) => {
    try {
      const response = await fetch(
        `/api/teacher/material/${base_id}/${materialId}/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
          body: JSON.stringify({ index, type }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete material");
      }

      await mutate();
      notification.success({ message: "Materi berhasil dihapus" });
    } catch (error) {
      message.error(`Gagal menghapus materi: ${error}`);
    }
  };

  const material = data?.data || { texts: [], urls: [], images: [], pdf: [] };
  const name = nameMaterial?.data?.title;
  return {
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
    editingIndex,
    form,
  };
};
