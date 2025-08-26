import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);


function extFromContentType(ct: string) {
  // e.g. image/png -> png
  const m = ct.match(/^image\/([\w+.-]+)$/i);
  return m ? m[1] : "jpg";
}

export async function uploadBase64Image(
  base64: string,
  fileName: string
): Promise<string> {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const contentType =
    base64.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

  const { error } = await supabase.storage
    .from("teacher-absence")
    .upload(fileName, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("Supabase Upload Error:", error);
    throw new Error("Supabase upload failed: " + error.message);
  }

  const { data } = supabase.storage
    .from("teacher-absence")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

export function buildMaterialImagePath(
  materialId: string,
  index: number,
  contentType = "image/jpeg"
) {
  const ext = extFromContentType(contentType);
  const ts = Date.now();
  return `material/${materialId}/${ts}-${index}.${ext}`;
}
