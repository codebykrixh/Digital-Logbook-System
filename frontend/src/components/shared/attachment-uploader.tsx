'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query';
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ApiClientError } from '@/lib/api';
import type { AttachmentDto } from '@/types/common';

const ACCEPTED = {
  'image/jpeg': [],
  'image/png': [],
  'image/webp': [],
  'image/gif': [],
  'application/pdf': [],
  'application/msword': [],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [],
  'application/vnd.ms-excel': [],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentUploaderProps {
  attachments: AttachmentDto[];
  readOnly: boolean;
  onUpload: (file: File) => Promise<unknown>;
  onRemove: (attachmentId: string) => Promise<unknown>;
  invalidateKey: QueryKey;
}

/** Drag-and-drop upload + list, generic over any parent resource (shift log, event, incident). */
export function AttachmentUploader({
  attachments,
  readOnly,
  onUpload,
  onRemove,
  invalidateKey,
}: AttachmentUploaderProps) {
  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: onUpload,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invalidateKey });
      toast.success('Attachment uploaded');
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : 'Upload failed');
    },
  });

  const remove = useMutation({
    mutationFn: onRemove,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: invalidateKey });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : 'Failed to remove attachment');
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: ACCEPTED,
    maxSize: 10 * 1024 * 1024,
    disabled: readOnly || upload.isPending,
    onDrop: (accepted, rejected) => {
      rejected.forEach((r) => {
        toast.error(`${r.file.name}: ${r.errors[0]?.message ?? 'File rejected'}`);
      });
      accepted.forEach((file) => upload.mutate(file));
    },
  });

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
          }`}
        >
          <input {...getInputProps()} />
          {upload.isPending ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-sm font-medium">
            {isDragActive ? 'Drop the file here' : 'Drag & drop, or click to upload'}
          </p>
          <p className="text-xs text-muted-foreground">Images, PDF, Word, Excel — up to 10 MB</p>
        </div>
      )}

      {attachments.length > 0 && (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-xl border bg-background p-3">
              {a.mimeType.startsWith('image/') ? (
                <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <FileText className="h-4 w-4 shrink-0 text-primary" />
              )}
              <a
                href={
                  a.url.startsWith('http')
                    ? a.url
                    : `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api').replace(/\/api$/, '')}${a.url}`
                }
                target="_blank"
                rel="noreferrer"
                className="min-w-0 flex-1 truncate text-sm font-medium hover:text-primary hover:underline"
              >
                {a.fileName}
              </a>
              <span className="shrink-0 text-xs text-muted-foreground">{formatSize(a.sizeBytes)}</span>
              {!readOnly && (
                <button
                  onClick={() => remove.mutate(a.id)}
                  disabled={remove.isPending}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
