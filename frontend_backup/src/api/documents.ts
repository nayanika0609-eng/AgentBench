import { apiClient } from './client';
import type { DocumentItem } from '../types';

export async function listDocuments(projectId: number) {
  const { data } = await apiClient.get<DocumentItem[]>(
    `/documents/project/${projectId}`
  );

  return data;
}

export async function uploadDocument(
  projectId: number,
  file: File,
  onProgress?: (percent: number) => void
) {
  const form = new FormData();

  form.append('file', file);

  const { data } = await apiClient.post(
    `/documents/upload/${projectId}`,
    form,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },

      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(
            Math.round(
              (evt.loaded / evt.total) * 100
            )
          );
        }
      },
    }
  );

  return data;
}


// ---------------------------------
// Delete Document
// ---------------------------------

export async function deleteDocument(
  documentId: number
) {
  const { data } = await apiClient.delete(
    `/documents/${documentId}`
  );

  return data;
}