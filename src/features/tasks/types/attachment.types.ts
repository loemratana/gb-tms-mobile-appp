export type TaskAttachmentResponse = {
  id: string;
  originalName: string;
  fileType: string | null;
  fileSize: number | null;
  downloadUrl: string;
  uploadedByUserId: string | null;
  uploadedByName: string | null;
  taskId: string;
  createdAt: string;
};
