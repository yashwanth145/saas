'use client';

import { useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { ProcessServerConfigFunction } from 'filepond';

// Register the FilePond plugin
registerPlugin(FilePondPluginFileValidateType);

// Define interface for notification
interface Notification {
  message: string;
  isSuccess: boolean;
  visible: boolean;
}

// Define specific type for FilePond server configuration
interface FilePondServerConfig {
  process: ProcessServerConfigFunction;
}

// Define a more specific response type to replace 'any'
interface ServerResponse {
  review?: string;
  [key: string]: unknown; // Allow additional properties with unknown types
}

export default function AIResumeReviewer() {
  const [review, setReview] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [notification, setNotification] = useState<Notification>({
    message: '',
    isSuccess: false,
    visible: false,
  });

  const showNotification = (message: string, isSuccess: boolean) => {
    setNotification({ message, isSuccess, visible: true });
    setTimeout(() => setNotification({ message: '', isSuccess: false, visible: false }), 3000);
  };

  const handleProcess: FilePondServerConfig = {
    process: (
      fieldName: string,
      file: Blob,
      metadata: Record<string, unknown>,
      load: (response: string | ServerResponse) => void,
      error: (errMsg: string) => void,
      progress?: (isLengthComputable: boolean, loaded: number, total: number) => void,
      abort?: () => void
    ) => {
      setUploading(true);

      const formData = new FormData();
      formData.append('filepond', file);

      const request = new XMLHttpRequest();
      request.open('POST', '/api/resumereview'); // Updated to match the backend endpoint

      request.upload.onprogress = (e) => {
        if (progress) progress(e.lengthComputable, e.loaded, e.total ?? 0); // Handle undefined total
      };

      request.onload = () => {
        setUploading(false);
        if (request.status >= 200 && request.status < 300) {
          try {
            const response = JSON.parse(request.responseText) as ServerResponse;
            if (response.review) {
              setReview(response.review);
              showNotification('Resume review generated successfully!', true);
              load(response.review);
            } else {
              setReview('No review generated');
              showNotification('No review generated.', false);
              error('No review generated');
            }
          } catch {
            setReview('Error parsing response.');
            showNotification('Error parsing response.', false);
            error('Error parsing response');
          }
        } else {
          setReview('Upload failed.');
          showNotification(`Upload failed with status ${request.status}.`, false);
          error(`Upload failed with status ${request.status}`);
        }
      };

      request.onerror = () => {
        setUploading(false);
        setReview('Network error occurred.');
        showNotification('Network error occurred.', false);
        error('Network error occurred');
      };

      request.ontimeout = () => {
        setUploading(false);
        setReview('Request timed out.');
        showNotification('Request timed out.', false);
        error('Request timed out');
      };

      request.send(formData);

      return {
        abort: () => {
          request.abort();
          setUploading(false);
          abort?.();
        },
      };
    },
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black to-purple-900 p-4">
      <div className="w-full max-w-lg bg-gray-950/80 backdrop-blur-lg shadow-xl rounded-3xl p-8 flex flex-col items-center border border-purple-500/20 relative">
        <h1 className="text-3xl font-extrabold text-purple-300 mb-6 text-center tracking-tight">
          AI Resume Reviewer
        </h1>

        <div className="w-full">
          <FilePond
            allowMultiple={false}
            server={handleProcess}
            acceptedFileTypes={['application/pdf']}
            labelIdle='Drag & Drop your resume (PDF) or <span class="filepond--label-action text-purple-400 hover:text-purple-300">Browse</span>'
            className="rounded-xl shadow-lg filepond--panel-root:bg-gray-900/50 filepond--panel-root:border filepond--panel-root:border-purple-500/30"
            onprocessfile={(error) => {
              if (error) {
                showNotification('File processing failed.', false);
              }
            }}
          />
        </div>

        {uploading && <p className="mt-4 text-sm text-purple-300/70">Generating review...</p>}

        {notification.visible && (
          <div
            className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white font-semibold ${
              notification.isSuccess ? 'bg-green-500' : 'bg-red-500'
            } border border-purple-500/30`}
          >
            {notification.message}
          </div>
        )}

        {review && (
          <div className="mt-6 w-full bg-gray-900/50 p-6 rounded-xl shadow-inner border border-purple-500/20 text-purple-200">
            <h2 className="font-semibold text-lg mb-2 text-purple-300">Resume Review:</h2>
            <p className="whitespace-pre-line text-sm">{review}</p>
          </div>
        )}
      </div>
    </main>
  );
}