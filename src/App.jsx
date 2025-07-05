import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState("all");
  const [previewText, setPreviewText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const speechRef = useRef(null);
  const fileInputRef = useRef(null);

  // Render Server Run Uncomment this
  const BASE_URL = "https://vocal-pdf-backend.onrender.com";
  
  // Local Server Run Uncomment this
  // const BASE_URL = "https://vocal-pdf-backend.onrender.com";


  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setIsUploading(true);
    setFile(uploadedFile);
    setSelectedPage("all");
    setPreviewText("");
    setTotalPages(0);
    setTimeout(() => setIsUploading(false), 1000);
  };

  const handlePageChange = (e) => {
    const value = e.target.value;
    setSelectedPage(value);
    if (value !== "all") {
      loadPageContent(parseInt(value));
    }
  };

  const loadPageContent = async (pageNum) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("page", pageNum);

    try {
      const res = await axios.post(`${BASE_URL}/read-preview`, formData);
      setPreviewText(res.data.text);
    } catch (err) {
      alert("Failed to load page text");
    }
  };

  const startSpeech = () => {
    if (!previewText) return;
    stopSpeech();
    const utterance = new SpeechSynthesisUtterance(previewText);
    speechRef.current = utterance;
    utterance.onend = () => {
      setIsPlaying(false);
      speechRef.current = null;
    };
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    setIsPlaying(false);
    window.speechSynthesis.cancel();
    speechRef.current = null;
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file first");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BASE_URL}/get-pages`, formData);
      setTotalPages(res.data.totalPages);
    } catch {
      alert("Failed to get PDF pages");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTotalPages(0);
    setSelectedPage("all");
    setPreviewText("");
    setIsPlaying(false);
    stopSpeech();

    // Reset file input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            PDF to Speech Converter
          </h1>
          <p className="text-blue-100 max-w-xl mx-auto">
            Transform your PDF documents into spoken words. Upload, select
            pages, and listen to your content.
          </p>
        </div>

        <div className="p-6 md:p-8">
          {/* Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload Document
            </h2>

            {/* Make entire area clickable */}
            <label
              htmlFor="pdf-upload"
              className="block border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 p-8 text-center transition-all hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
            >
              <input
                id="pdf-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center">
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-blue-600 font-medium">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </span>
                <p className="text-xs text-gray-500">
                  PDF files only (max. 10MB)
                </p>
              </div>
            </label>

            {file && (
              <div className="mt-4 flex justify-between items-center bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-red-500 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                    {file.name}
                  </p>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="ml-4 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Remove
                </button>
              </div>
            )}

            {isUploading && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-blue-600 font-medium">
                  Processing your document...
                </span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`w-full mt-6 py-3 rounded-xl text-white font-medium transition-all ${
                !file || isUploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg"
              }`}
            >
              Analyze Document
            </button>
          </div>

          {/* Document Controls */}
          {totalPages > 0 && (
            <div className="mb-8 bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Document Controls
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Select pages to preview and listen
                  </p>
                </div>
                <div className="mt-3 md:mt-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {totalPages} {totalPages === 1 ? "page" : "pages"} detected
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Pages
                  </label>
                  <div className="relative">
                    <select
                      value={selectedPage}
                      onChange={handlePageChange}
                      className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    >
                      <option value="all">All Pages</option>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i} value={i + 1}>{`Page ${i + 1}`}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg
                        className="fill-current h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speech Controls
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={startSpeech}
                      disabled={isPlaying || !previewText}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${
                        isPlaying || !previewText
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700 cursor-pointer shadow-md hover:shadow-lg"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Play
                    </button>
                    <button
                      onClick={stopSpeech}
                      className="flex-1 flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Stop
                    </button>
                  </div>
                </div>
              </div>

              {previewText && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Content Preview
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-xl p-5 max-h-80 overflow-y-auto text-gray-700 whitespace-pre-line shadow-inner">
                    {previewText}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Footer */}
          <div className="text-center text-gray-500 text-sm pt-4 border-t border-gray-100">
            <p>
              PDF to Speech Converter v1.0 • Securely process your documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
