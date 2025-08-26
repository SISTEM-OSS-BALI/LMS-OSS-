"use client";
import {
  UploadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { createClient } from "@supabase/supabase-js";
import { Button, message, Upload, Popconfirm, Typography } from "antd";
import { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useState } from "react";

const { Text } = Typography;

interface PdfItem {
  url: string;
  path: string;
  name: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

interface SupaPdfUploaderProps {
  bucket?: string;
  folder?: string;
  onUpload?: (path: string, url: string) => void;
  onDelete?: (path: string) => void;
  label?: string;
  value?: string | null;
  onChange?: (value: string | null) => void;
}

export default function SupaPdfUploader({
  bucket = "",
  folder = "",
  onUpload,
  onDelete,
  label = "Upload PDF",
  value,
  onChange,
}: SupaPdfUploaderProps) {
  const [previewPdf, setPreviewPdf] = useState<PdfItem | null>(
    value
      ? { url: value, path: "", name: value.split("/").pop() || "file.pdf" }
      : null
  );

  useEffect(() => {
    if (value && (!previewPdf || previewPdf.url !== value)) {
      setPreviewPdf({
        url: value,
        path: "",
        name: value.split("/").pop() || "file.pdf",
      });
    }
    if (!value) {
      setPreviewPdf(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleUpload = async ({
    file,
    onSuccess,
    onError,
  }: RcCustomRequestOptions) => {
    try {
      if (typeof file === "string" || !(file instanceof File)) {
        throw new Error("File upload tidak valid");
      }
      const fileName = file.name ?? "uploaded-pdf.pdf";
      const filePath = folder
        ? `${folder}/${Date.now()}-${fileName}`
        : `${Date.now()}-${fileName}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      const publicUrl = data?.publicUrl;

      if (publicUrl) {
        setPreviewPdf({ url: publicUrl, path: filePath, name: fileName });
        onUpload?.(filePath, publicUrl);
        onChange?.(publicUrl);
        message.success("PDF berhasil diupload!");
        onSuccess?.(filePath, publicUrl);
      } else {
        throw new Error("Gagal mendapatkan URL publik");
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error");
      message.error("Upload gagal: " + err.message);
      onError?.(err);
    }
  };

  const handleDelete = async () => {
    if (!previewPdf?.path && !previewPdf?.url) {
      onChange?.(null);
      setPreviewPdf(null);
      return;
    }
    // Hapus dari Supabase hanya jika ada path
    if (previewPdf?.path) {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([previewPdf.path]);
      if (error) {
        message.error("Gagal menghapus PDF: " + error.message);
        return;
      }
    }
    setPreviewPdf(null);
    onDelete?.(previewPdf?.path);
    onChange?.(null);
    message.success("PDF berhasil dihapus!");
  };

  return (
    <div>
      {!previewPdf && (
        <Upload
          customRequest={handleUpload}
          showUploadList={false}
          accept="application/pdf"
          multiple={false}
        >
          <Button icon={<UploadOutlined />}>{label}</Button>
        </Upload>
      )}

      {previewPdf && (
        <div
          style={{
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "#f5f5f5",
            border: "1px dashed #d9d9d9",
            padding: 12,
            borderRadius: 8,
          }}
        >
          <FilePdfOutlined style={{ fontSize: 32, color: "#c30010" }} />
          <div>
            <Text strong>{previewPdf.name}</Text>
            <div>
              <a
                href={previewPdf.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Lihat PDF
              </a>
            </div>
          </div>
          <Popconfirm
            title="Hapus file ini?"
            onConfirm={handleDelete}
            okText="Ya"
            cancelText="Batal"
          >
            <Button icon={<DeleteOutlined />} danger type="primary">
              Hapus
            </Button>
          </Popconfirm>
        </div>
      )}
    </div>
  );
}
