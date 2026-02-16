import { getSupabaseAdmin } from "./supabaseClient.ts";

const BUCKET_NAME = "analysis-images";

export async function uploadImage(
  base64Data: string,
  mimeType: string,
  folder: "food" | "stool",
): Promise<{ path: string; publicUrl: string }> {
  const supabase = getSupabaseAdmin();

  // base64 → Uint8Array 변환
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // 고유 파일명 생성
  const ext = mimeType.split("/")[1] || "jpg";
  const timestamp = Date.now();
  const randomSuffix = crypto.randomUUID().slice(0, 8);
  const filePath = `${folder}/${timestamp}-${randomSuffix}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, bytes.buffer, {
      contentType: mimeType,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}
