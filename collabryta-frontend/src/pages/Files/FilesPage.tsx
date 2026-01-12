import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File,
  Video,
  Upload,
  Search,
  MoreHorizontal,
  Download,
  Trash2,
  Clock,
  ChevronRight,
  HardDrive,
  Zap,
  Layers,
  Activity,
  Shield,
  Star,
  Plus,
  Loader2,
  ArrowUpRight,
  Filter,
  MoreVertical
} from "lucide-react";
import { fileService, FileData } from "../../services/fileService";

import { motion, AnimatePresence } from "framer-motion";

const FilesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentFiles, setRecentFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchFiles = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const files = await fileService.getAllFiles();
      setRecentFiles(files);
    } catch (error) {
      console.error("Failed to load files", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const getFileCounts = (files: FileData[]) => {
    const counts = { word: 0, pdf: 0, spread: 0, image: 0, other: 0 };
    files.forEach(f => {
      const ext = f.filename.split('.').pop()?.toLowerCase() || '';
      if (['doc', 'docx'].includes(ext)) counts.word++;
      else if (['pdf'].includes(ext)) counts.pdf++;
      else if (['xls', 'xlsx', 'csv'].includes(ext)) counts.spread++;
      else if (['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext)) counts.image++;
      else counts.other++;
    });
    return counts;
  };

  const counts = getFileCounts(recentFiles);

  const fileCategories = [
    { id: "word", name: "Documents", count: counts.word, icon: <FileText size={24} />, color: "indigo" },
    { id: "pdf", name: "PDF Files", count: counts.pdf, icon: <FileText size={24} />, color: "rose" },
    { id: "spread", name: "Spreadsheets", count: counts.spread, icon: <FileSpreadsheet size={24} />, color: "emerald" },
    { id: "image", name: "Images", count: counts.image, icon: <ImageIcon size={24} />, color: "amber" },
    { id: "other", name: "Other", count: counts.other, icon: <File size={24} />, color: "slate" },
  ];

  useEffect(() => {
    fetchFiles();
    const pollInterval = setInterval(() => {
      fetchFiles(false);
    }, 60000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const mapFileType = (ftype: string | undefined, filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['doc', 'docx'].includes(ext)) return <FileText size={20} className="text-indigo-600" />;
    if (['pdf'].includes(ext)) return <FileText size={20} className="text-rose-600" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet size={20} className="text-emerald-600" />;
    if (['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext)) return <ImageIcon size={20} className="text-amber-600" />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <Video size={20} className="text-violet-600" />;
    return <File size={20} className="text-slate-400" />;
  };

  const filteredFiles = recentFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.title && file.title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!selectedCategory) return matchesSearch;

    const ext = file.filename.split('.').pop()?.toLowerCase() || '';
    let isCategoryMatch = false;

    switch (selectedCategory) {
      case 'word': isCategoryMatch = ['doc', 'docx'].includes(ext); break;
      case 'pdf': isCategoryMatch = ['pdf'].includes(ext); break;
      case 'spread': isCategoryMatch = ['xls', 'xlsx', 'csv'].includes(ext); break;
      case 'image': isCategoryMatch = ['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext); break;
      case 'other':
        isCategoryMatch = !['doc', 'docx', 'pdf', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext);
        break;
      default: isCategoryMatch = true;
    }

    return matchesSearch && isCategoryMatch;
  });

  return (
    <div className="min-h-screen bg-[#fcfdfe] text-slate-900 px-8 py-10 lg:px-12 animate-fade-in relative">
      <div className="max-w-7xl mx-auto">

        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Files</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage, share and categorize your team assets.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                className="w-64 pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:outline-none transition-all font-bold text-sm text-slate-900 placeholder:text-slate-400 shadow-sm"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/files/upload")}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Upload size={18} strokeWidth={2.5} />
              Upload File
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {fileCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-6 rounded-2xl border transition-all relative group text-left overflow-hidden ${selectedCategory === cat.id
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200'
                : 'bg-white border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md'
                }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-105 ${selectedCategory === cat.id ? 'bg-white/20 text-white' : `bg-slate-50 text-slate-400`
                }`}>
                {cat.icon}
              </div>
              <h3 className={`text-sm font-bold truncate mb-1 ${selectedCategory === cat.id ? 'text-white' : 'text-slate-900'}`}>
                {cat.name}
              </h3>
              <p className={`text-xs font-semibold uppercase tracking-wider ${selectedCategory === cat.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {cat.count} Files
              </p>
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-10">

          {/* File List */}
          <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Recent Files</h3>
                <p className="text-sm text-slate-500 font-medium">Quick access to your latest uploads</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
                  <Filter size={18} />
                </button>
                <div className="w-px h-4 bg-slate-200 mx-2" />
                <button className="text-xs font-bold text-blue-600 hover:underline underline-offset-4">View All</button>
              </div>
            </div>

            {loading ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 border-4 border-slate-50 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm font-semibold text-slate-400">Accessing storage...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="py-24 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <HardDrive className="text-slate-300" size={32} />
                </div>
                <h4 className="text-lg font-bold text-slate-900">No files found</h4>
                <p className="text-sm text-slate-400 font-medium mt-1">Try uploading a new file or changing filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredFiles.map((file) => (
                  <div key={file.id} className="p-6 bg-white border border-slate-200 rounded-3xl flex flex-col group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2">
                      <a
                        href={`http://localhost:8000/${file.file_path.replace(/\\/g, '/').replace(/^app\//, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all flex items-center justify-center"
                        title="Download"
                      >
                        <Download size={16} />
                      </a>
                      <button className="p-2 bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"><Trash2 size={16} /></button>
                    </div>

                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                      {mapFileType(file.file_type, file.filename)}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{file.filename}</h4>

                    <div className="mt-auto pt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-50">
                      <span className="flex items-center gap-1.5"><HardDrive size={14} className="text-slate-300" /> {formatSize(file.file_size_bytes)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-slate-300" /> {new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FilesPage;
