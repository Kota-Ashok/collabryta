import React, { useState, DragEvent, ChangeEvent } from "react";
import {
  Upload, FileText, ArrowLeft,
  Loader2, ArrowUpRight,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fileService } from "../../services/fileService";

const UploadFilePage: React.FC = () => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setFileName(droppedFile.name);
      if (!title) setTitle(droppedFile.name.split('.')[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      if (!title) setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setFileName(null);
  };

  const handleSubmit = async () => {
    if (!file || !title) return;
    setUploading(true);
    try {
      await fileService.uploadFile(file, title, description);
      navigate("/files");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 px-8 py-10 lg:px-12 animate-fade-in relative">
      <div className="max-w-3xl mx-auto">

        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/files")}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-all font-bold text-sm group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Files
          </button>
        </div>

        {/* Header & Intro */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">Upload New File</h1>
          <p className="text-sm font-medium text-slate-500">
            Securely add assets to your project storage.
          </p>
        </div>

        {/* Main Upload Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 p-8 md:p-12 shadow-sm relative">

          {/* Dropzone */}
          <div
            className={`relative border-[3px] border-dashed rounded-[32px] p-12 text-center transition-all group overflow-hidden mb-10 ${dragActive
              ? "border-indigo-400 bg-indigo-50/50"
              : fileName
                ? "border-indigo-100 bg-indigo-50/30"
                : "border-slate-100 bg-slate-50/30 hover:border-indigo-200"
              }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 transition-all shadow-sm ${fileName ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-500'
              }`}>
              {fileName ? <FileText size={32} /> : <Upload size={32} />}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {fileName ? "File Selected" : "Select or Drop File"}
            </h3>
            <p className="text-xs font-semibold text-slate-400 mb-8 max-w-[240px] mx-auto leading-relaxed">
              {fileName ? fileName : "Click to browse or drag and drop your file here."}
            </p>

            {fileName ? (
              <button
                onClick={removeFile}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-2 shadow-sm"
              >
                <X size={14} />
                Remove File
              </button>
            ) : (
              <div>
                <label
                  htmlFor="fileUpload"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs hover:bg-indigo-700 cursor-pointer transition-all inline-flex items-center shadow-lg shadow-indigo-100"
                >
                  Browse Device
                </label>
                <input id="fileUpload" type="file" className="hidden" onChange={handleFileChange} />
              </div>
            )}
          </div>

          {/* Form Metadata */}
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">File Title</label>
              <input
                type="text"
                placeholder="e.g. Q4 Performance Report"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Description (Optional)</label>
              <textarea
                placeholder="Add some context about this file..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-6 py-4 bg-white border border-slate-100 rounded-[28px] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none text-sm font-medium text-slate-900 transition-all shadow-sm resize-none leading-relaxed"
              />
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t border-slate-50">
              <button
                onClick={() => navigate("/files")}
                className="w-full sm:w-auto px-10 py-4 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={!fileName || !title || uploading}
                className="w-full sm:w-auto btn-primary shadow-lg shadow-indigo-100 min-w-[200px]"
              >
                {uploading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    Upload Asset
                    <ArrowUpRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

export default UploadFilePage;
