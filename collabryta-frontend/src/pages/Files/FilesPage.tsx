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
  Download,
  Trash2,
  HardDrive,
  Filter,
  ArrowUpRight
} from "lucide-react";
import { fileService, FileData } from "../../services/fileService";
import { motion } from "framer-motion";

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
    { id: "word", name: "Documents", count: counts.word, icon: <FileText size={20} /> },
    { id: "pdf", name: "PDF Files", count: counts.pdf, icon: <FileText size={20} /> },
    { id: "spread", name: "Spreadsheets", count: counts.spread, icon: <FileSpreadsheet size={20} /> },
    { id: "image", name: "Images", count: counts.image, icon: <ImageIcon size={20} /> },
    { id: "other", name: "Other", count: counts.other, icon: <File size={20} /> },
  ];

  useEffect(() => {
    fetchFiles();
    const pollInterval = setInterval(() => {
      fetchFiles(false);
    }, 60000);

    return () => clearInterval(pollInterval);
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
    if (['doc', 'docx'].includes(ext)) return <FileText size={24} className="text-blue-600" />;
    if (['pdf'].includes(ext)) return <FileText size={24} className="text-red-500" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet size={24} className="text-emerald-500" />;
    if (['jpg', 'jpeg', 'png', 'svg', 'gif'].includes(ext)) return <ImageIcon size={24} className="text-indigo-500" />;
    if (['mp4', 'mov', 'avi'].includes(ext)) return <Video size={24} className="text-violet-500" />;
    return <File size={24} className="text-zinc-400" />;
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
    <div className="animate-in space-y-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Files</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage team assets and documents.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
              <input
                className="w-56 pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              onClick={() => navigate("/files/upload")}
              className="btn-primary"
            >
              <Upload size={16} />
              Upload
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {fileCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`p-4 rounded-xl border text-left transition-all ${selectedCategory === cat.id
                ? 'bg-zinc-900 border-zinc-900 text-white'
                : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-900'
                }`}
            >
              <div className={`mb-3 ${selectedCategory === cat.id ? 'text-zinc-300' : 'text-zinc-400'}`}>
                {cat.icon}
              </div>
              <div className="text-sm font-semibold">{cat.name}</div>
              <div className={`text-xs mt-0.5 ${selectedCategory === cat.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {cat.count} items
              </div>
            </button>
          ))}
        </div>

        {/* File List */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50">
            <h3 className="text-sm font-semibold text-zinc-900">All Files</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="w-6 h-6 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Loading storage...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-16 text-center">
              <HardDrive className="text-zinc-300 mx-auto mb-3" size={32} />
              <p className="text-sm text-zinc-900 font-medium">No files found</p>
              <p className="text-xs text-zinc-500">Upload a new file to get started.</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {filteredFiles.map((file) => (
                <div key={file.id} className="p-4 flex items-center gap-4 hover:bg-zinc-50 group transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-zinc-50 flex items-center justify-center shrink-0 border border-zinc-100">
                    {mapFileType(file.file_type, file.filename)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-zinc-900 truncate">{file.filename}</h4>
                    <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                      <span>{formatSize(file.file_size_bytes)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={`http://localhost:8000/${file.file_path.replace(/\\/g, '/').replace(/^app\//, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Download size={16} />
                    </a>
                    <button className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilesPage;
