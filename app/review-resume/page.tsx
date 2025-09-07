'use client';

import { useState, useEffect } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';

export default function AIResumeReviewer() {
  const [review, setReview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState({ message: '', isSuccess: false, visible: false });

  const showNotification = (message, isSuccess) => {
    setNotification({ message, isSuccess, visible: true });
    setTimeout(() => {
      setNotification({ message: '', isSuccess: false, visible: false });
    }, 3000);
  };

  const handleProcess = async (fieldName, file, metadata, load, error) => {
    if (!file.type.includes('pdf')) {
      error('Please upload a valid PDF file.');
      showNotification('Invalid file. Please upload a PDF.', false);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('filepond', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.review) {
        setReview(data.review);
        showNotification('Resume review generated successfully!', true);
        load(data.review);
      } else {
        setReview('No review generated');
        showNotification('No review generated.', false);
        error('No review generated');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setReview('Error generating review. Try again.');
      showNotification('Error generating review. Try again.', false);
      error('Error generating review');
    } finally {
      setUploading(false);
    }
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
            server={{
              process: handleProcess,
            }}
            acceptedFileTypes={['application/pdf']}
            labelIdle='Drag & Drop your resume (PDF) or <span class="filepond--label-action text-purple-400 hover:text-purple-300">Browse</span>'
            className="rounded-xl shadow-lg filepond--panel-root:bg-gray-900/50 filepond--panel-root:border filepond--panel-root:border-purple-500/30"
          />
        </div>

        {uploading && <p className="mt-4 text-sm text-purple-300/70">Generating review...</p>}

        {notification.visible && (
          <div className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white font-semibold animate-fade-in-out
            ${notification.isSuccess ? 'bg-green-500' : 'bg-red-500'} border border-purple-500/30`}>
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