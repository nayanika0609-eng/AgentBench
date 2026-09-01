import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Database,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Trash2,
  X,
} from 'lucide-react';

import { useAsync } from '../../hooks/useAsync';
import {
  listDocuments,
  uploadDocument,
  deleteDocument,
} from '../../api/documents';

import EmptyState from '../../components/EmptyState';
import { SkeletonList } from '../../components/Skeleton';
import { formatDateTime } from '../../lib/format';
import { getApiErrorMessage } from '../../api/client';
import { useToast } from '../../components/Toast';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

export default function DocumentsTab({
  projectId,
  onDocumentsChanged,
}: {
  projectId: number;
  onDocumentsChanged?: () => void | Promise<void>;
}) {
  const {
    data: documents,
    loading,
    error,
    refetch,
  } = useAsync(
    () => listDocuments(projectId),
    [projectId]
  );

  const { push } = useToast();

  const [dragOver, setDragOver] = useState(false);

  const [uploads, setUploads] = useState<UploadItem[]>(
    []
  );

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [documentToDelete, setDocumentToDelete] =
    useState<{
      id: number;
      filename: string;
    } | null>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  // ---------------------------------
  // Upload
  // ---------------------------------

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const items: UploadItem[] =
        Array.from(files).map((file) => ({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          progress: 0,
          status: 'uploading',
        }));

      setUploads((prev) => [
        ...items,
        ...prev,
      ]);

      for (const item of items) {
        try {
          await uploadDocument(
            projectId,
            item.file,
            (percent) => {
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === item.id
                    ? {
                        ...u,
                        progress: percent,
                      }
                    : u
                )
              );
            }
          );

          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: 'done',
                    progress: 100,
                  }
                : u
            )
          );

          push(
  `${item.file.name} indexed successfully.`,
  'success'
);

await refetch();
await onDocumentsChanged?.();
        } catch (err) {
          const message =
            getApiErrorMessage(
              err,
              'Upload failed.'
            );

          setUploads((prev) =>
            prev.map((u) =>
              u.id === item.id
                ? {
                    ...u,
                    status: 'error',
                    error: message,
                  }
                : u
            )
          );

          push(
            `Failed to upload ${item.file.name}: ${message}`,
            'error'
          );
        }
      }
    },
    [projectId, push, refetch]
  );

  // ---------------------------------
  // Delete
  // ---------------------------------

  const handleDelete = async () => {
    if (!documentToDelete) return;

    const documentId =
      documentToDelete.id;

    setDeletingId(documentId);

    try {
      await deleteDocument(
        documentId
      );

      push(
        `${documentToDelete.filename} deleted successfully.`,
        'success'
      );

      setDocumentToDelete(null);

      await refetch();

    } catch (err) {
      const message =
        getApiErrorMessage(
          err,
          'Failed to delete document.'
        );

      push(
        `Failed to delete ${documentToDelete.filename}: ${message}`,
        'error'
      );

    } finally {
      setDeletingId(null);
    }
  };

  // ---------------------------------
  // Metrics
  // ---------------------------------

  const totalChunks =
    (documents ?? []).reduce(
      (sum, d) =>
        sum + d.chunk_count,
      0
    );

  return (
    <div className="space-y-6">

      {/* ---------------------------------
          Summary cards
      --------------------------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="panel p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
            <FileText
              className="h-[18px] w-[18px] text-accent-600"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="label">
              Documents
            </p>

            <p className="text-xl font-display font-semibold text-ink-900">
              {documents?.length ?? 0}
            </p>
          </div>
        </div>

        <div className="panel p-5 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
            <Database
              className="h-[18px] w-[18px] text-teal-600"
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="label">
              Chunks Indexed
            </p>

            <p className="text-xl font-display font-semibold text-ink-900">
              {totalChunks}
            </p>
          </div>
        </div>

        <div className="panel p-5 flex items-center gap-4">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              totalChunks > 0
                ? 'bg-teal-50'
                : 'bg-ink-100'
            }`}
          >
            <CheckCircle2
              className={`h-[18px] w-[18px] ${
                totalChunks > 0
                  ? 'text-teal-600'
                  : 'text-ink-400'
              }`}
              strokeWidth={1.8}
            />
          </div>

          <div>
            <p className="label">
              Retrieval Status
            </p>

            <p className="text-sm font-medium text-ink-900 mt-0.5">
              {totalChunks > 0
                ? 'Ready for retrieval'
                : 'Not indexed yet'}
            </p>
          </div>
        </div>

      </div>

      {/* ---------------------------------
          Upload area
      --------------------------------- */}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() =>
          setDragOver(false)
        }
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);

          handleFiles(
            e.dataTransfer.files
          );
        }}
        className={`rounded-xl2 border-2 border-dashed p-10 text-center transition-colors ${
          dragOver
            ? 'border-accent-400 bg-accent-50/50'
            : 'border-line-strong bg-surface-soft'
        }`}
      >
        <div className="h-12 w-12 rounded-xl bg-surface border border-line flex items-center justify-center mx-auto mb-4 shadow-soft">
          <UploadCloud
            className="h-5 w-5 text-accent-500"
            strokeWidth={1.75}
          />
        </div>

        <p className="text-sm font-medium text-ink-800">
          Drag & drop files here
        </p>

        <p className="text-xs text-ink-500 mt-1">
          or
        </p>

        <button
          className="btn-secondary mt-3"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          Browse files
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(
              e.target.files
            );

            e.target.value = '';
          }}
        />

        <p className="text-[11px] text-ink-400 mt-3 font-mono">
          Documents are chunked and embedded automatically for RAG
        </p>
      </div>

      {/* ---------------------------------
          Upload progress
      --------------------------------- */}

      <AnimatePresence>
        {uploads.length > 0 && (
          <div className="space-y-2">

            {uploads.map((u) => (
              <motion.div
                key={u.id}
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: 'auto',
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="panel-soft p-3.5 flex items-center gap-3"
              >
                <FileText className="h-4 w-4 text-ink-400 shrink-0" />

                <div className="flex-1 min-w-0">

                  <p className="text-sm text-ink-800 truncate">
                    {u.file.name}
                  </p>

                  {u.status === 'uploading' && (
                    <div className="h-1 bg-ink-100 rounded-full mt-1.5 overflow-hidden">

                      <motion.div
                        className="h-full bg-accent-400 rounded-full"
                        animate={{
                          width: `${u.progress}%`,
                        }}
                      />

                    </div>
                  )}

                  {u.status === 'error' && (
                    <p className="text-xs text-rose-500 mt-0.5">
                      {u.error}
                    </p>
                  )}

                </div>

                {u.status === 'uploading' && (
                  <Loader2
                    className="h-4 w-4 text-accent-500 animate-spin shrink-0"
                  />
                )}

                {u.status === 'done' && (
                  <CheckCircle2
                    className="h-4 w-4 text-teal-500 shrink-0"
                  />
                )}

                {u.status === 'error' && (
                  <AlertCircle
                    className="h-4 w-4 text-rose-500 shrink-0"
                  />
                )}

              </motion.div>
            ))}

          </div>
        )}
      </AnimatePresence>

      {/* ---------------------------------
          Knowledge Base
      --------------------------------- */}

      <div>

        <h3 className="text-sm font-semibold text-ink-800 mb-3">
          Knowledge Base
        </h3>

        {loading ? (

          <SkeletonList rows={3} />

        ) : error ? (

          <EmptyState
            icon={Database}
            title="Couldn't load documents"
            description={error}
          />

        ) : documents &&
          documents.length > 0 ? (

          <div className="space-y-2">

            {documents.map(
              (doc, i) => (

                <motion.div
                  key={doc.id}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: i * 0.04,
                    duration: 0.3,
                  }}
                  className="panel p-4 flex items-center gap-3.5"
                >

                  <div className="h-10 w-10 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
                    <FileText
                      className="h-[18px] w-[18px] text-ink-500"
                      strokeWidth={1.7}
                    />
                  </div>

                  <div className="flex-1 min-w-0">

                    <p className="text-sm font-medium text-ink-800 truncate">
                      {doc.filename}
                    </p>

                    <p className="text-xs text-ink-400 mt-0.5 font-mono">
                      {doc.filetype.toUpperCase()} ·{' '}
                      {formatDateTime(
                        doc.uploaded_at
                      )}
                    </p>

                  </div>

                  <div className="text-right shrink-0 mr-2">

                    <p className="text-sm font-medium text-ink-800">
                      {doc.chunk_count}
                    </p>

                    <p className="text-[11px] text-ink-400">
                      chunks
                    </p>

                  </div>

                  {/* Delete button */}

                  <button
                    type="button"
                    disabled={
                      deletingId === doc.id
                    }
                    onClick={() =>
                      setDocumentToDelete({
                        id: doc.id,
                        filename: doc.filename,
                      })
                    }
                    className="h-9 w-9 rounded-lg border border-line flex items-center justify-center text-ink-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete document"
                    aria-label={`Delete ${doc.filename}`}
                  >
                    {deletingId === doc.id ? (
                      <Loader2
                        className="h-4 w-4 animate-spin"
                      />
                    ) : (
                      <Trash2
                        className="h-4 w-4"
                        strokeWidth={1.8}
                      />
                    )}
                  </button>

                </motion.div>

              )
            )}

          </div>

        ) : (

          <EmptyState
            icon={Database}
            title="Upload documents to enable RAG"
            description="Once documents are uploaded, they're automatically chunked and indexed for retrieval-augmented benchmarks."
          />

        )}

      </div>

      {/* ---------------------------------
          Delete confirmation modal
      --------------------------------- */}

      <AnimatePresence>
        {documentToDelete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* Backdrop */}

            <motion.div
              className="absolute inset-0 bg-canvas/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (deletingId === null) {
                  setDocumentToDelete(null);
                }
              }}
            />

            {/* Modal */}

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-document-title"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 8,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 8,
              }}
              className="relative w-full max-w-md panel p-6 shadow-xl"
            >

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() =>
                  setDocumentToDelete(null)
                }
                className="absolute right-4 top-4 h-8 w-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="h-10 w-10 rounded-lg bg-rose-50 flex items-center justify-center mb-4">
                <Trash2
                  className="h-[18px] w-[18px] text-rose-500"
                  strokeWidth={1.8}
                />
              </div>

              <h2
                id="delete-document-title"
                className="text-lg font-display font-semibold text-ink-900"
              >
                Delete document?
              </h2>

              <p className="text-sm text-ink-500 mt-2 leading-relaxed">
                This will permanently remove{' '}
                <span className="font-medium text-ink-800">
                  {documentToDelete.filename}
                </span>{' '}
                and its indexed chunks from this project.
              </p>

              <div className="flex justify-end gap-2 mt-6">

                <button
                  type="button"
                  disabled={
                    deletingId !== null
                  }
                  onClick={() =>
                    setDocumentToDelete(null)
                  }
                  className="btn-secondary"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId !== null
                  }
                  onClick={handleDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-rose-500 text-ink-900 hover:bg-rose-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {deletingId !== null ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}