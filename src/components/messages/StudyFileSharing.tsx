
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Upload, File, FileText, Image, Video, PenSquare, 
  BookOpen, FileSpreadsheet, Trash 
} from "lucide-react";

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  url: string;
  uploadedBy: string;
  date: string;
}

const StudyFileSharing = () => {
  const [files, setFiles] = useState<SharedFile[]>([
    {
      id: "1",
      name: "Chapter 5 Notes.pdf",
      type: "pdf",
      size: "2.3 MB",
      url: "#",
      uploadedBy: "Alex",
      date: "10 mins ago"
    },
    {
      id: "2",
      name: "Math Practice Problems.docx",
      type: "docx",
      size: "1.1 MB",
      url: "#",
      uploadedBy: "Sarah",
      date: "Yesterday"
    }
  ]);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="text-red-400" />;
      case "docx":
      case "doc":
        return <File className="text-blue-400" />;
      case "xlsx":
      case "xls":
        return <FileSpreadsheet className="text-green-400" />;
      case "png":
      case "jpg":
      case "jpeg":
        return <Image className="text-purple-400" />;
      case "mp4":
      case "mov":
        return <Video className="text-orange-400" />;
      case "txt":
        return <PenSquare className="text-gray-400" />;
      default:
        return <BookOpen className="text-teal-400" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const newFiles: SharedFile[] = Array.from(fileList).map(file => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2),
        name: file.name,
        type: file.name.split('.').pop() || "unknown",
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: URL.createObjectURL(file),
        uploadedBy: "You",
        date: "Just now"
      }));
      setFiles([...newFiles, ...files]);
    }
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(file => file.id !== id));
  };

  return (
    <div className="p-4 bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg">
      <h3 className="text-lg font-semibold mb-4 gradient-text">Study Materials</h3>
      
      <div className="mb-4">
        <label className="block">
          <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-purple-400 transition-colors cursor-pointer bg-gray-800/30">
            <Upload className="w-5 h-5 mr-2 text-purple-400" />
            <span>Upload study materials</span>
            <Input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
              multiple
            />
          </div>
        </label>
      </div>
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {files.map(file => (
          <div 
            key={file.id} 
            className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center mr-3">
                {getFileIcon(file.type)}
              </div>
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {file.size} • Uploaded by {file.uploadedBy} • {file.date}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => removeFile(file.id)}
              className="text-gray-400 hover:text-red-400"
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyFileSharing;
