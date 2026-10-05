import { api, type ApiEnvelope } from "@/lib/api";
import type { TaskAttachmentResponse } from "@/features/tasks/types/attachment.types";
import type { PageResponse } from "@/features/tasks/types/task.types";

/** Accepts photos (image/*) and PDFs, plus a small set of office/zip types, up to 20MB. */
export async function uploadTaskAttachment(
  taskId: string,
  file: { uri: string; name: string; mimeType: string }
): Promise<TaskAttachmentResponse> {
  const formData = new FormData();
  formData.append(
    "file",
    { uri: file.uri, name: file.name, type: file.mimeType } as unknown as Blob
  );

  const { data } = await api.post<ApiEnvelope<TaskAttachmentResponse>>(
    `/attachments/tasks/${taskId}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.data;
}

export async function listTaskAttachments(
  taskId: string
): Promise<TaskAttachmentResponse[]> {
  const { data } = await api.get<
    ApiEnvelope<PageResponse<TaskAttachmentResponse>>
  >(`/attachments/tasks/${taskId}`, {
    params: { size: 100 },
  });
  return data.data.content;
}
