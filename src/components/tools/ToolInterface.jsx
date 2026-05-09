import React, { useState, useRef, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Upload, File, X, ArrowRight, CheckCircle2, Download, 
  AlertCircle, Loader2, Settings2, Check, ChevronDown,
  GripVertical, SortAsc, SortDesc, Hash, Zap, RotateCw
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import confetti from 'canvas-confetti';
import { useCompression } from '../../hooks/useCompression';
import { generateThumbnail } from '../../lib/pdf-utils';

const PAGE_SIZE_OPTIONS = [
  { id: 'original', label: 'Original size', description: 'Keep source dimensions' },
  { id: 'A4', label: 'A4', description: '210 x 297 mm' },
  { id: 'Letter', label: 'Letter', description: '8.5 x 11 in' },
  { id: 'Legal', label: 'Legal', description: '8.5 x 14 in' },
  { id: 'A3', label: 'A3', description: '297 x 420 mm' },
  { id: 'custom', label: 'Custom size', description: 'Define your own' },
];

const UNITS = ['mm', 'cm', 'in', 'px'];

const SortableFileCard = memo(({ fileObj, index, isProcessing, canReorder, resultUrl, removeFile, rotateFile, onPreview }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileObj.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative h-full">
      <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: isDragging ? 1 : 1.02 }}
        className={cn(
          "relative bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm group flex flex-col items-center gap-4 select-none w-full h-full min-h-[280px] sm:min-h-[320px] transition-all duration-200",
          isProcessing ? "pointer-events-none opacity-50" : "hover:border-[#0052CC]/40 hover:shadow-xl",
          isDragging && "invisible"
        )}
      >
        {/* Serial Number Badge */}
        <div className="absolute top-3 left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-lg">
          {(index + 1).toString().padStart(2, '0')}
        </div>

        {/* Remove/Rotate Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              removeFile(fileObj.id);
            }}
            className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all shadow-sm"
          >
            <X size={12} sm:size={14} strokeWidth={3} />
          </button>
          {canReorder && !resultUrl && !isProcessing && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                rotateFile(fileObj.id);
              }}
              className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-primary hover:text-white p-2 rounded-lg transition-all shadow-sm"
            >
              <RotateCw size={12} sm:size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* File Card Content */}
        <div 
          className="w-full flex-grow flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => !isProcessing && onPreview(fileObj)}
        >
          <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
            {fileObj.preview ? (
              <motion.img 
                src={fileObj.preview} 
                alt={fileObj.file.name} 
                animate={{ rotate: fileObj.rotation }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                 <File className="text-primary/20" size={24} sm:size={32} />
                 <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 text-center break-all">
                   {fileObj.file.name.split('.').pop()}
                 </span>
              </div>
            )}
            
            {/* Distinct, always-visible drag handle area */}
            {canReorder && !resultUrl && !isProcessing && (
              <div 
                {...attributes}
                {...listeners}
                className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-12 h-6 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing hover:bg-white hover:border-[#0052CC]/30 transition-all group/handle"
              >
                <GripVertical size={16} className="text-gray-400 group-hover/handle:text-[#0052CC]" />
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
          
          <div className="w-full text-center px-1">
            <p className="text-[10px] sm:text-xs font-black text-gray-900 line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem]" title={fileObj.file.name}>
              {fileObj.file.name}
            </p>
            <div className="flex flex-col items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2">
              <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-[8px] sm:text-[9px] text-primary font-black uppercase tracking-widest leading-none mt-1">
                {fileObj.file.type.split('/')[1]?.toUpperCase() || 'PDF'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

const FileCard = memo(({ fileObj, index, isProcessing, canReorder, resultUrl, removeFile, rotateFile, onPreview }) => {
  const controls = useDragControls();

  return (
    <Reorder.Item 
      value={fileObj}
      dragListener={false}
      dragControls={controls}
      layout="position"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ 
        layout: { 
          type: "spring", 
          stiffness: 350, 
          damping: 30,
          mass: 1
        },
        opacity: { duration: 0.2 }
      }}
      whileDrag={{ 
        scale: 1.05, 
        boxShadow: "0 25px 60px -12px rgba(0, 82, 204, 0.5)",
        zIndex: 1000,
        borderColor: "rgba(0, 82, 204, 0.4)",
      }}
      className={cn(
        "relative bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm group flex flex-col items-center gap-4 select-none w-full h-full min-h-[280px] sm:min-h-[320px] transition-[border-color,box-shadow,background-color] duration-200",
        isProcessing ? "pointer-events-none opacity-50" : "hover:border-[#0052CC]/40 hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Serial Number Badge */}
      <div className="absolute top-3 left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-lg">
        {(index + 1).toString().padStart(2, '0')}
      </div>

      {/* Remove/Rotate Buttons */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            removeFile(fileObj.id);
          }}
          className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-all shadow-sm"
        >
          <X size={12} sm:size={14} strokeWidth={3} />
        </button>
        {canReorder && !resultUrl && !isProcessing && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              rotateFile(fileObj.id);
            }}
            className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-primary hover:text-white p-2 rounded-lg transition-all shadow-sm"
          >
            <RotateCw size={12} sm:size={14} strokeWidth={3} />
          </button>
        )}
      </div>

      {/* File Card Content */}
      <div 
        className="w-full flex-grow flex flex-col items-center gap-3 cursor-pointer"
        onClick={() => !isProcessing && onPreview(fileObj)}
      >
        <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
          {fileObj.preview ? (
            <motion.img 
              src={fileObj.preview} 
              alt={fileObj.file.name} 
              animate={{ rotate: fileObj.rotation }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              draggable={false}
            />
          ) : (
            <div className="flex flex-col items-center gap-2">
               <File className="text-primary/20" size={24} sm:size={32} />
               <span className="text-[8px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest px-2 text-center break-all">
                 {fileObj.file.name.split('.').pop()}
               </span>
            </div>
          )}
          {/* Distinct, always-visible drag handle area */}
          {canReorder && !resultUrl && !isProcessing && (
            <div 
              onPointerDown={(e) => controls.start(e)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-12 h-6 bg-white/95 backdrop-blur-sm border border-gray-100 rounded-full flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing hover:bg-white hover:border-[#0052CC]/30 transition-all group/handle"
            >
              <GripVertical size={16} className="text-gray-400 group-hover/handle:text-[#0052CC]" />
            </div>
          )}
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
        
        <div className="w-full text-center px-1">
          <p className="text-[10px] sm:text-xs font-black text-gray-900 line-clamp-2 leading-tight min-h-[2rem] sm:min-h-[2.5rem]" title={fileObj.file.name}>
            {fileObj.file.name}
          </p>
          <div className="flex flex-col items-center gap-0.5 sm:gap-1 mt-1 sm:mt-2">
            <p className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">
              {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB
            </p>
            <p className="text-[8px] sm:text-[9px] text-primary font-black uppercase tracking-widest leading-none mt-1">
              {fileObj.file.type.split('/')[1]?.toUpperCase() || 'PDF'}
            </p>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
});

export default function ToolInterface({ tool, onProcess, customDropzoneText, customProcessText, allowedTypes, shouldSplitPdf }) {
  const [files, setFiles] = useState([]); // Array of { id, file, preview }
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultUrl, setResultUrl] = useState(null);
  const [resultType, setResultType] = useState(null);
  const [resultSize, setResultSize] = useState(null);
  const [error, setError] = useState(null);
  const [pageSize, setPageSize] = useState('A4');
  const [customSize, setCustomSize] = useState({ width: 210, height: 297, unit: 'mm' });
  const [compression, setCompression] = useState({ 
    enabled: ['compress-pdf', 'merge-pdf'].includes(tool.id), 
    targetSize: 2 
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [pageNumber, setPageNumber] = useState('1');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setFiles((items) => {
        const oldIndex = items.findIndex(p => p.id === active.id);
        const newIndex = items.findIndex(p => p.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const activeFile = useMemo(() => files.find(f => f.id === activeId), [files, activeId]);

  const { compressFile, isProcessing: isCompressing, progress: compressProgress } = useCompression();

  const effectiveProgress = isCompressing ? compressProgress : progress;
  const effectiveIsProcessing = isCompressing || isProcessing;

  const needsPassword = ['protect-pdf', 'unlock-pdf'].includes(tool.id);
  const needsPageNumber = tool.id === 'remove-pages';

  // Cleanup previews
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.preview && f.preview.startsWith('blob:')) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, [files]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const supportsPageSize = ['organize', 'convert-to', 'edit'].includes(tool.category) && 
    !['split-pdf', 'compress-pdf', 'unlock-pdf', 'protect-pdf', 'pdf-to-jpg', 'remove-pages'].includes(tool.id);

  const supportsCompression = ['merge-pdf', 'compress-pdf', 'jpg-to-pdf', 'rotate-pdf'].includes(tool.id);

  const canReorder = ['merge-pdf', 'jpg-to-pdf', 'rotate-pdf', 'organize-pdf'].includes(tool.id);

  // Simulate progress when isProcessing is true
  useEffect(() => {
    let interval;
    if (isProcessing) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev < 95) {
            // Incremental progress gets slower as it approaches 95%
            const increment = (100 - prev) * 0.1;
            return prev + increment;
          }
          return prev;
        });
      }, 300);
    } else if (resultUrl) {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isProcessing, resultUrl]);

  const handleFileChange = async (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      let filesToProcess = selectedFiles;
      if (shouldSplitPdf) {
        const { splitPdfToPages } = await import('../../lib/pdf-utils');
        const splitResults = await Promise.all(selectedFiles.map(async (file) => {
          if (file.type === 'application/pdf') {
            return await splitPdfToPages(file);
          }
          return [file];
        }));
        filesToProcess = splitResults.flat();
      }

      const newFiles = await Promise.all(filesToProcess.map(async (file) => {
        let preview = null;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        } else if (file.type === 'application/pdf') {
          preview = await generateThumbnail(file);
        }
        
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview,
          rotation: 0
        };
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) URL.revokeObjectURL(fileToRemove.preview);
      return prev.filter(f => f.id !== id);
    });
    if (files.length <= 1) setResultUrl(null);
  };

  const sortAlphabetically = () => {
    const sorted = [...files].sort((a, b) => a.file.name.localeCompare(b.file.name));
    setFiles(sorted);
  };

  const sortNumerically = () => {
    const sorted = [...files].sort((a, b) => {
      const numA = parseFloat(a.file.name.replace(/^\D+/g, '')) || 0;
      const numB = parseFloat(b.file.name.replace(/^\D+/g, '')) || 0;
      return numA - numB;
    });
    setFiles(sorted);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const matchesAllowed = (file) => {
        if (!allowedTypes) return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        return allowedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          if (type.includes('*')) {
            const [base] = type.split('/');
            return file.type.startsWith(base + '/');
          }
          return file.type === type;
        });
      };

      const droppedFiles = Array.from(e.dataTransfer.files).filter(matchesAllowed);
      if (droppedFiles.length > 0) {
        let filesToProcess = droppedFiles;
        if (shouldSplitPdf) {
          const { splitPdfToPages } = await import('../../lib/pdf-utils');
          const splitResults = await Promise.all(droppedFiles.map(async (file) => {
            if (file.type === 'application/pdf') {
              return await splitPdfToPages(file);
            }
            return [file];
          }));
          filesToProcess = splitResults.flat();
        }

        const newFiles = await Promise.all(filesToProcess.map(async (file) => {
          let preview = null;
          if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file);
          } else if (file.type === 'application/pdf') {
            preview = await generateThumbnail(file);
          }
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview,
            rotation: 0
          };
        }));
        
        setFiles(prev => [...prev, ...newFiles]);
        setError(null);
      } else {
        setError('Please drop valid files.');
      }
    }
  };

  const rotateFile = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, rotation: (f.rotation + 90) % 360 };
      }
      return f;
    }));
  };

  const processFiles = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setResultUrl(null);
    setError(null);
    setProgress(0);

    try {
      let finalFiles = files.map(f => f.file);
      const rotations = files.map(f => f.rotation);
      
      // If single file compression brand Zip2 style
      if (compression.enabled && files.length === 1 && (files[0].file.type.startsWith('image/') || files[0].file.type === 'application/pdf')) {
        const compressed = await compressFile(files[0].file, compression.targetSize);
        finalFiles = [new File([compressed], files[0].file.name, { type: compressed.type })];
      }

      const resultBlob = await onProcess(finalFiles, { 
        pageSize, 
        customSize: pageSize === 'custom' ? customSize : null,
        compression: compression.enabled ? compression : null,
        password,
        pageNumber,
        rotations,
        onProgress: (p) => setProgress(p)
      });

      if (resultBlob) {
        setResultSize((resultBlob.size / 1024 / 1024).toFixed(2));
        setResultType(resultBlob.type);
        const url = URL.createObjectURL(resultBlob);
        setResultUrl(url);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: [tool.color, '#ffffff']
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while processing your files. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl">
      <AnimatePresence mode="wait">
        {files.length === 0 ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] sm:rounded-[2.5rem] p-12 sm:p-32 text-center cursor-pointer hover:border-primary transition-all group relative overflow-hidden bento-card w-full"
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
            <div className="bg-gray-900 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xl">
              <Upload className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              {customDropzoneText || 'Universal Compression Engine'}
            </h2>
            <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">Drop files to optimize securely</p>
            <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">PDF</span>
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">IMG</span>
              <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">VID</span>
            </div>
            <input 
              type="file" 
              multiple 
              hidden 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept={allowedTypes?.join(',') || '.pdf,image/*,video/*'}
            />
          </motion.div>
        ) : (
          <div 
            onDragOver={e => e.preventDefault()}
            onDrop={onDrop}
            className="flex flex-col lg:flex-row gap-8 items-start w-full"
          >
            <motion.div
              key="filelist"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-grow space-y-6 w-full"
            >
              {/* Sorting Controls */}
              {!resultUrl && !isProcessing && files.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-2 gap-4">
                  <div className="flex flex-col">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">
                      {files.length} Files • {(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB Total
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Drag cards to reorder manually</p>
                  </div>
                  {files.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mr-2">Quick Sort:</span>
                      <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button 
                          onClick={sortAlphabetically}
                          className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-black text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          title="Sort Alphabetically"
                        >
                          <SortAsc size={12} strokeWidth={3} />
                          BY NAME
                        </button>
                        <button 
                          onClick={sortNumerically}
                          className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-black text-gray-500 hover:text-primary hover:bg-white hover:shadow-sm rounded-lg transition-all"
                          title="Sort Numerically"
                        >
                          <Hash size={12} strokeWidth={3} />
                          BY NUMBER
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}              {!resultUrl && (
                tool.id === 'organize-pdf' ? (
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={files.map(f => f.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 pb-8 overflow-visible">
                        {files.map((fileObj, index) => (
                          <SortableFileCard
                            key={fileObj.id}
                            fileObj={fileObj}
                            index={index}
                            isProcessing={effectiveIsProcessing}
                            canReorder={canReorder}
                            resultUrl={resultUrl}
                            removeFile={removeFile}
                            rotateFile={rotateFile}
                            onPreview={setSelectedFile}
                          />
                        ))}
                        {!resultUrl && !isProcessing && (
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-full min-h-[280px] sm:min-h-[320px] rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                          >
                            <div className="w-8 h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload size={16} sm:size={18} />
                            </div>
                            <span className="text-[8px] sm:text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center px-4">Add more files</span>
                          </button>
                        )}
                      </div>
                    </SortableContext>
                    
                    <DragOverlay dropAnimation={null} zIndex={10000}>
                      {activeId && activeFile ? (
                        <motion.div
                          initial={{ scale: 1, rotate: 0 }}
                          animate={{ 
                            scale: 1.08, 
                            rotate: 3,
                            boxShadow: "0 25px 60px -12px rgba(0, 82, 204, 0.5)" 
                          }}
                          className="relative bg-white p-4 sm:p-6 rounded-[2rem] border-2 border-[#0052CC] shadow-2xl flex flex-col items-center gap-4 select-none w-full h-full min-h-[280px] sm:min-h-[320px] cursor-grabbing"
                        >
                           <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
                            {activeFile.preview ? (
                              <img 
                                src={activeFile.preview} 
                                alt={activeFile.file.name} 
                                style={{ transform: `rotate(${activeFile.rotation}deg)` }}
                                className="w-full h-full object-cover"
                                draggable={false}
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <File className="text-primary/20" size={24} sm:size={32} />
                              </div>
                            )}
                          </div>
                          <div className="w-full text-center px-1">
                            <p className="text-[10px] sm:text-xs font-black text-gray-900 line-clamp-2 leading-tight">
                              {activeFile.file.name}
                            </p>
                          </div>
                        </motion.div>
                      ) : null}
                    </DragOverlay>
                  </DndContext>
                ) : (
                  <Reorder.Group 
                    values={files} 
                    onReorder={setFiles}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 pb-8 overflow-visible"
                  >
                    <AnimatePresence mode="popLayout" initial={false}>
                      {files.map((fileObj, index) => (
                        <FileCard
                          key={fileObj.id}
                          fileObj={fileObj}
                          index={index}
                          isProcessing={isProcessing}
                          canReorder={canReorder}
                          resultUrl={resultUrl}
                          removeFile={removeFile}
                          rotateFile={rotateFile}
                          onPreview={setSelectedFile}
                        />
                      ))}
                    </AnimatePresence>
                    
                    {!resultUrl && !isProcessing && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full min-h-[280px] sm:min-h-[320px] rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload size={16} sm:size={18} />
                        </div>
                        <span className="text-[8px] sm:text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-center px-4">Add more files</span>
                      </button>
                    )}
                  </Reorder.Group>
                )
              )}

              <div className="flex flex-col items-center gap-6 mt-12">
                {effectiveIsProcessing && (
                  <div className="w-full max-w-md space-y-4 font-mono">
                    <div className="flex items-center justify-between text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin text-primary" size={14} />
                          <span>Zip2 Engine: {tool.name}</span>
                        </div>
                        {compression.enabled && (
                          <span className="text-[10px] text-primary animate-pulse ml-6">
                            TARGET: {compression.targetSize}MB • PASS 01
                          </span>
                        )}
                      </div>
                      <span>{Math.round(effectiveProgress)}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                      <motion.div 
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${effectiveProgress}%` }}
                        transition={{ type: 'spring', damping: 20, stiffness: 50 }}
                      />
                    </div>
                    <p className="text-center text-[9px] text-gray-400 font-bold uppercase tracking-widest">Processing Securely on Device</p>
                  </div>
                )}

                {!resultUrl && (
                  <button
                    onClick={processFiles}
                    disabled={effectiveIsProcessing}
                    className={cn(
                      "flex items-center gap-4 bg-gray-900 text-white font-black px-10 sm:px-16 py-5 sm:py-6 rounded-2xl sm:rounded-[2rem] text-lg sm:text-xl shadow-2xl hover:bg-primary transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:bg-gray-200",
                      effectiveIsProcessing && "opacity-0 scale-95 pointer-events-none"
                    )}
                  >
                    {(customProcessText || tool.name).toUpperCase()}
                    <ArrowRight size={24} />
                  </button>
                )}

                <input 
                  type="file" 
                  multiple 
                  hidden 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                {resultUrl && (
                  <div className="w-full flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-50 text-green-700 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] w-full text-center flex flex-col items-center gap-6 border-2 border-green-100"
                    >
                      <CheckCircle2 size={48} className="text-green-500 sm:w-16 sm:h-16" />
                      <div>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Files Processed!</h2>
                        <p className="text-sm sm:text-base text-green-600">Your {resultSize} MB result is ready.</p>
                      </div>
                      <a 
                        href={resultUrl} 
                        download={`zip2-${tool.id}${resultType === 'image/jpeg' ? '.jpg' : (resultType === 'application/zip' ? '.zip' : '.pdf')}`}
                        className="bg-green-600 text-white font-bold px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all flex items-center justify-center gap-3 w-full sm:w-auto"
                      >
                        <Download size={22} />
                        DOWNLOAD
                      </a>
                      <button 
                        onClick={() => {
                          setFiles([]);
                          setResultUrl(null);
                          setResultType(null);
                          setResultSize(null);
                          setProgress(0);
                        }}
                        className="text-green-600 font-bold text-sm hover:underline"
                      >
                        Process another file
                      </button>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Settings Sidebar */}
            {(supportsPageSize || supportsCompression || needsPassword || needsPageNumber) && !resultUrl && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full lg:w-80 bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8 sticky top-24"
              >
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-50">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Settings2 size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase tracking-widest text-sm">Output Settings</h3>
                </div>

                <div className="space-y-8">
                  {needsPassword && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">
                        {tool.id === 'protect-pdf' ? 'Set Password' : 'Enter Password'}
                      </label>
                      <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl p-4 text-sm font-bold outline-none transition-all shadow-inner"
                      />
                    </div>
                  )}

                  {needsPageNumber && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block">
                        Page Number
                      </label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="number"
                          min="1"
                          value={pageNumber}
                          onChange={(e) => setPageNumber(e.target.value)}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl p-4 text-sm font-bold outline-none transition-all shadow-inner"
                        />
                      </div>
                      <p className="text-[9px] text-gray-400 italic">Enter the number of page you want to remove</p>
                    </div>
                  )}

                  {supportsPageSize && (
                    <div className="space-y-6">
                      <div className="relative" ref={dropdownRef}>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Page Size</label>
                        
                        <button
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl hover:border-primary transition-all group"
                        >
                          <div className="text-left text-xs">
                            <div className="font-black text-gray-900 uppercase tracking-tight">
                              {PAGE_SIZE_OPTIONS.find(o => o.id === pageSize)?.label || 'Select size'}
                            </div>
                            <div className="text-[10px] text-gray-400 font-medium">
                              {PAGE_SIZE_OPTIONS.find(o => o.id === pageSize)?.description}
                            </div>
                          </div>
                          <ChevronDown className={cn("text-gray-400 transition-transform", isDropdownOpen && "rotate-180")} size={18} />
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2"
                            >
                              {PAGE_SIZE_OPTIONS.map((option) => (
                                <button
                                  key={option.id}
                                  onClick={() => {
                                    setPageSize(option.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left",
                                    pageSize === option.id && "bg-primary/5"
                                  )}
                                >
                                  <div>
                                    <div className={cn("text-xs font-bold", pageSize === option.id ? "text-primary" : "text-gray-700")}>
                                      {option.label}
                                    </div>
                                    <div className="text-[10px] text-gray-400">{option.description}</div>
                                  </div>
                                  {pageSize === option.id && <Check className="text-primary" size={14} strokeWidth={3} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {pageSize === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Width</label>
                                <input 
                                  type="number"
                                  value={customSize.width}
                                  onChange={(e) => setCustomSize({ ...customSize, width: e.target.value })}
                                  className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl p-3 text-xs font-bold outline-none transition-all"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Height</label>
                                <input 
                                  type="number"
                                  value={customSize.height}
                                  onChange={(e) => setCustomSize({ ...customSize, height: e.target.value })}
                                  className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl p-3 text-xs font-bold outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Unit</label>
                              <div className="flex gap-2">
                                {UNITS.map((u) => (
                                  <button
                                    key={u}
                                    onClick={() => setCustomSize({ ...customSize, unit: u })}
                                    className={cn(
                                      "flex-1 py-1.5 text-[9px] font-black rounded-lg border-2 transition-all uppercase",
                                      customSize.unit === u 
                                        ? "bg-primary text-white border-primary" 
                                        : "bg-gray-50 border-gray-50 text-gray-400 hover:border-gray-200"
                                    )}
                                  >
                                    {u}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {supportsCompression && (
                    <div className="pt-6 border-t border-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Quality Settings</label>
                        {tool.id !== 'compress-pdf' && (
                          <button 
                            onClick={() => setCompression({ ...compression, enabled: !compression.enabled })}
                            className={cn(
                              "w-10 h-5 rounded-full relative transition-all duration-300",
                              compression.enabled ? "bg-primary" : "bg-gray-200"
                            )}
                          >
                            <div className={cn(
                              "absolute top-1 w-3 h-3 bg-white rounded-full transition-all duration-300",
                              compression.enabled ? "right-1" : "left-1"
                            )} />
                          </button>
                        )}
                      </div>

                      <div className="mb-4 space-y-1">
                        <div className="flex justify-between items-center px-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                            Original Total: <span className="text-gray-900">{(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB</span>
                          </p>
                          {compression.enabled && (
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest">
                              Target: {compression.targetSize} MB
                            </p>
                          )}
                        </div>
                      </div>

                      <AnimatePresence initial={tool.id === 'compress-pdf'}>
                        {(compression.enabled || tool.id === 'compress-pdf') && (
                          <motion.div
                            initial={tool.id === 'compress-pdf' ? false : { opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50 space-y-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Compress to (MB)</label>
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number"
                                      min="0.1"
                                      max="200"
                                      step="0.1"
                                      value={compression.targetSize}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        setCompression({ ...compression, targetSize: isNaN(val) ? 0.1 : val });
                                      }}
                                      className="w-16 bg-white border border-gray-200 rounded-lg px-2 py-1 text-[10px] font-black text-primary text-center outline-none focus:border-primary transition-all"
                                    />
                                    <span className="text-[9px] font-bold text-gray-400">MB</span>
                                  </div>
                                </div>
                                <input 
                                  type="range"
                                  min="0.1"
                                  max={Math.max(10, Math.ceil(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024))}
                                  step="0.1"
                                  value={Math.min(compression.targetSize, Math.max(10, Math.ceil(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024)))}
                                  onChange={(e) => setCompression({ ...compression, targetSize: parseFloat(e.target.value) })}
                                  className="w-full accent-primary h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              <div className="flex gap-2">
                                {[1, 2, 3].map(size => (
                                  <button
                                    key={size}
                                    onClick={() => setCompression({ ...compression, targetSize: size })}
                                    className={cn(
                                      "flex-1 py-1 text-[8px] font-black rounded-md border transition-all",
                                      compression.targetSize === size 
                                        ? "bg-primary text-white border-primary" 
                                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                                    )}
                                  >
                                    {size}MB
                                  </button>
                                ))}
                              </div>
                              <p className="text-[9px] text-gray-400 italic text-center">
                                {tool.id === 'compress-pdf' 
                                  ? "Structural optimization will be applied to the existing PDF." 
                                  : "Lower target size applies more aggressive image re-compression."}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-[10px] leading-relaxed text-gray-500 font-medium italic">
                    Output will be optimized for selected format.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Large Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedFile(null)}
            className="fixed inset-0 z-[100] bg-gray-900/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-12"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[3rem] overflow-hidden max-w-4xl w-full max-h-full flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-gray-900 text-lg sm:text-xl truncate max-w-[200px] sm:max-w-md">
                    {selectedFile.file.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                    {(selectedFile.file.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.file.type || 'Document'}
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-auto p-4 sm:p-12 bg-gray-50 flex items-center justify-center min-h-[40vh]">
                {selectedFile.preview ? (
                  <img 
                    src={selectedFile.preview} 
                    alt="Large Preview" 
                    className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-300">
                    <File size={120} strokeWidth={1} />
                    <span className="font-black uppercase tracking-widest text-sm">Preview Unavailable</span>
                  </div>
                )}
              </div>
              <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-12 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-primary transition-all"
                >
                  CLOSE PREVIEW
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
