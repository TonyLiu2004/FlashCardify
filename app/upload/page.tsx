'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import LoadingDots from '@/components/ui/LoadingDots';

export default function UploadPage() {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [parsedText, setParsedText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setParsedText('');
    setError(null);

    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setError(`File "${file.name}" is too large. Maximum file size is 10MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploadedFiles(validFiles);
    setLoading(true);

    for (const file of validFiles) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64File = reader.result?.toString().split(',')[1];

          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: base64File,
              fileType: file.type,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setParsedText((prev) => prev + '\n\n' + data.extractedText);
          } else {
            setError('Error uploading file: ' + response.statusText);
          }
        } catch (err) {
          console.error('Error reading or uploading file:', err);
          setError('Error processing the file. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Upload and Transcribe Materials</h1>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-10 rounded-lg cursor-pointer hover:border-blue-500 transition"
        >
          <input {...getInputProps()} />
          <p className="text-gray-500 text-center">Drag & drop some files here, or click to select files</p>
          <p className="text-sm text-center text-gray-400">Supported formats: .docx, .pdf, .pptx. Max file size: 10MB</p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Uploaded Files:</h2>
            <ul className="list-disc list-inside text-gray-600">
              {uploadedFiles.map((file, idx) => (
                <li key={idx} className="truncate">{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        {loading && (
          <div className="flex justify-center mt-4">
            <LoadingDots />
          </div>
        )}

        {error && (
          <div className="mt-4 text-red-500 text-center">
            <p>{error}</p>
          </div>
        )}

        {parsedText && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Extracted Text:</h2>
            <div className="bg-gray-100 p-4 rounded-lg text-gray-600 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {parsedText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
