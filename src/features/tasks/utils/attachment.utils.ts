import type { TaskAttachmentResponse } from "@/features/tasks/types/attachment.types";

export function formatAttachmentSize(bytes: number | null): string {
  if (!bytes || bytes < 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageAttachment(attachment: TaskAttachmentResponse): boolean {
  if (attachment.fileType?.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(
    attachment.originalName.toLowerCase()
  );
}
