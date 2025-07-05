import { useState, useRef, useEffect } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPage, setSelectedPage] = useState("all");
  const [previewText, setPreviewText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const speechRef = useRef(null);
  const fileInputRef = useRef(null);

  const BASE_URL =
    "https://vocal-pdf-backend.onrender.com" || "http://localhost:5000";

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setIsUploading(true);
    setFile(uploadedFile);
    setSelectedPage("all");
    setPreviewText("");
    setTotalPages(0);
    
    // Simulate processing time
    setTimeout(() => {
      setIsUploading(false);
    }, 1200);
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
    
    setIsPageLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("page", pageNum);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const res = await axios.post(`${BASE_URL}/read-preview`, formData);
      setPreviewText(res.data.text);
    } catch (err) {
      alert("Failed to load page text");
    } finally {
      setIsPageLoading(false);
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
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const res = await axios.post(`${BASE_URL}/get-pages`, formData);
      setTotalPages(res.data.totalPages);
    } catch {
      alert("Failed to get PDF pages");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTotalPages(0);
    setSelectedPage("all");
    setPreviewText("");
    setIsPlaying(false);
    stopSpeech();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-900">
      {/* CSS Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 via-blue-900/20 to-purple-900/20"></div>
        
        {/* Floating Circles */}
        <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse-slower"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse-medium"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-700/10 rounded-full filter blur-3xl animate-pulse-slow"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>
      
      {/* Main content container */}
      <div className="max-w-4xl w-full bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-20 animate-pulse-slow"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 relative z-10">
            PDF to Speech Converter
          </h1>
          <p className="text-blue-100 max-w-xl mx-auto relative z-10">
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
              className={`block border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isUploading 
                  ? "border-blue-400 bg-blue-50" 
                  : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              <input
                id="pdf-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center justify-center">
                <div className={`border-2 rounded-xl w-16 h-16 flex items-center justify-center mb-4 ${
                  isUploading 
                    ? "border-blue-400 bg-blue-100 animate-pulse" 
                    : "border-dashed border-gray-300 bg-gray-200"
                }`}>
                  {isUploading ? (
                    <div className="w-6 h-6 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full animate-spin"></div>
                  ) : (
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
                  )}
                </div>
                <span className="block text-sm font-medium text-gray-700 mb-2">
                  {isUploading ? (
                    <span className="text-blue-600 font-medium">Processing your file...</span>
                  ) : (
                    <>
                      <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                    </>
                  )}
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
                  className="ml-4 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 cursor-pointer flex items-center transition-colors"
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

            <button
              onClick={handleUpload}
              disabled={!file || isUploading || isAnalyzing}
              className={`w-full mt-6 py-3 rounded-xl text-white font-medium transition-all flex items-center justify-center ${
                !file || isUploading || isAnalyzing
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-t-2 border-white border-r-2 border-r-transparent rounded-full animate-spin mr-2"></div>
                  Analyzing Document...
                </>
              ) : (
                "Analyze Document"
              )}
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
                      disabled={isPageLoading}
                    >
                      <option value="all">All Pages</option>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <option key={i} value={i + 1}>{`Page ${i + 1}`}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      {isPageLoading ? (
                        <div className="w-4 h-4 border-t-2 border-blue-500 border-r-2 border-r-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg
                          className="fill-current h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      )}
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
                      disabled={isPlaying || !previewText || isPageLoading}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all ${
                        isPlaying || !previewText || isPageLoading
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
                      disabled={!isPlaying}
                      className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all ${
                        !isPlaying
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
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
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Stop
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Content Preview
                </h3>
                <div className="bg-white border border-gray-200 rounded-xl p-5 min-h-[200px] max-h-80 overflow-y-auto text-gray-700 whitespace-pre-line shadow-inner relative">
                  {isPageLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 border-t-4 border-blue-500 border-r-4 border-r-transparent rounded-full animate-spin mb-2"></div>
                        <p className="text-gray-500 text-sm">Loading page content...</p>
                      </div>
                    </div>
                  ) : previewText ? (
                    previewText
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-3 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p>Select a page to preview its content</p>
                    </div>
                  )}
                </div>
              </div>
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
      
      {/* Custom animations */}
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.05); }
        }
        
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.03); }
        }
        
        @keyframes pulse-medium {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(1.07); }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-slower {
          animation: pulse-slower 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-medium {
          animation: pulse-medium 5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

export default App;