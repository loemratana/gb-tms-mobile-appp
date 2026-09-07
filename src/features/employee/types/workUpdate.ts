import type { TaskStatus as RealTaskStatus } from "@/features/tasks/types/task.types";

export type AttachmentKind = "image" | "document";

export type WorkAttachment = {
  id: string;
  uri: string;
  name: string;
  size: number;
  mimeType: string;
  kind: AttachmentKind;
};

export type WorkUpdatePayload = {
  update: string;
  notes: string;
  /** null means the employee didn't request a status change as part of this submission. */
  status: RealTaskStatus | null;
  attachments: WorkAttachment[];
};

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageMime(mimeType?: string | null, name?: string): boolean {
  if (mimeType?.startsWith("image/")) return true;
  const lower = name?.toLowerCase() ?? "";
  return /\.(png|jpe?g|gif|webp|heic|bmp)$/i.test(lower);
}

export function getDocumentIcon(
  mimeType: string,
  name: string
): "document-text-outline" | "document-outline" | "image-outline" {
  const lower = `${mimeType} ${name}`.toLowerCase();
  if (lower.includes("pdf")) return "document-text-outline";
  if (lower.includes("image")) return "image-outline";
  return "document-outline";
}
