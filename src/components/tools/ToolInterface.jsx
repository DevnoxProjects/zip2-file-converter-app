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
  Upload, File as FileIcon, X, ArrowRight, CheckCircle2, Download, 
  AlertCircle, Loader2, Settings2, Check, ChevronDown,
  GripVertical, SortAsc, SortDesc, Hash, Zap, RotateCw, Trash2,
  ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
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
          {!resultUrl && !isProcessing && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                rotateFile(fileObj.id);
              }}
              className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-primary hover:text-white p-2 rounded-lg transition-all shadow-sm"
              title="Rotate 90°"
            >
              <RotateCw size={12} sm:size={14} strokeWidth={3} />
            </button>
          )}
        </div>

        {/* File Card Content */}
        <div 
          className="w-full flex-grow flex flex-col items-center gap-3 cursor-pointer"
          onClick={() => !isProcessing && onPreview(fileObj.id)}
        >
          <div className="w-full aspect-[451/638] bg-white flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
            {fileObj.preview ? (
              <motion.img 
                src={fileObj.preview} 
                alt={fileObj.file.name} 
                animate={{ rotate: fileObj.rotation }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="w-full h-full object-contain transition-transform group-hover:scale-105"
                draggable={false}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                 <FileIcon className="text-primary/20" size={24} sm:size={32} />
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

export default function ToolInterface({ tool, onProcess, customDropzoneText, customProcessText, allowedTypes, shouldSplitPdf }) {
  const [files, setFiles] = useState([]); // Array of { id, file, preview }
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [activeId, setActiveId] = useState(null);
  const dragCounter = useRef(0);
  const createdUrls = useRef(new Set());
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedFile = useMemo(() => files.find(f => f.id === selectedFileId), [files, selectedFileId]);
  const selectedFileIndex = useMemo(() => files.findIndex(f => f.id === selectedFileId), [files, selectedFileId]);

  const goToNextFile = (e) => {
    e?.stopPropagation();
    if (selectedFileIndex < files.length - 1) {
      setSelectedFileId(files[selectedFileIndex + 1].id);
      setZoom(1); // Reset zoom on file change
    }
  };

  const goToPrevFile = (e) => {
    e?.stopPropagation();
    if (selectedFileIndex > 0) {
      setSelectedFileId(files[selectedFileIndex - 1].id);
      setZoom(1); // Reset zoom on file change
    }
  };

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };
  
  const rotateFileCounterClockwise = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, rotation: f.rotation - 90 };
      }
      return f;
    }));
  };
  
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
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

  // Cleanup previews ONLY on unmount
  useEffect(() => {
    const urls = createdUrls.current;
    return () => {
      urls.forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

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

  const canReorder = ['merge-pdf', 'jpg-to-pdf', 'rotate-pdf', 'organize-pdf', 'split-pdf', 'remove-pages'].includes(tool.id);

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

  const addFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setError(null); // Clear previous errors
    
    const matchesAllowed = (file) => {
      // Always allow common images for PDF tools to be automatically converted
      const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
      
      if (!allowedTypes || allowedTypes.length === 0) {
        return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || isImage;
      }
      
      const isAllowedExplicitly = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        if (type.includes('*')) {
          const [base] = type.split('/');
          return file.type.startsWith(base + '/');
        }
        return file.type === type;
      });

      return isAllowedExplicitly || isImage;
    };

    const extractZip = async (zipFile) => {
      const zip = new JSZip();
      const content = await zip.loadAsync(zipFile);
      const extractedFiles = [];
      
      const getMimeType = (filename) => {
        const ext = filename.split('.').pop().toLowerCase();
        const mimeMap = {
          'pdf': 'application/pdf',
          'jpg': 'image/jpeg',
          'jpeg': 'image/jpeg',
          'png': 'image/png',
          'webp': 'image/webp',
          'gif': 'image/gif',
          'bmp': 'image/bmp'
        };
        return mimeMap[ext] || 'application/octet-stream';
      };

      for (const [filename, fileData] of Object.entries(content.files)) {
        if (!fileData.dir) {
          const blob = await fileData.async('blob');
          const inferredType = getMimeType(filename);
          const file = new File([blob], filename, { 
            type: (blob.type && blob.type !== 'application/octet-stream') ? blob.type : inferredType 
          });
          extractedFiles.push(file);
        }
      }
      return extractedFiles;
    };

    setIsPreparingFiles(true);
    setError(null);

    try {
      let allFiles = Array.from(selectedFiles);
      let finalFilesToProcess = [];
      let zipRejectionCount = 0;

      for (const file of allFiles) {
        if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
          try {
            const extracted = await extractZip(file);
            finalFilesToProcess.push(...extracted);
          } catch (e) {
            console.error("Error unzipping file:", e);
            zipRejectionCount++;
          }
        } else {
          finalFilesToProcess.push(file);
        }
      }

      const droppedFiles = finalFilesToProcess.filter(matchesAllowed);
      const rejectedFiles = finalFilesToProcess.filter(f => !matchesAllowed(f));

      if (rejectedFiles.length > 0 || zipRejectionCount > 0) {
        const allowedDescription = allowedTypes && allowedTypes.length > 0 
          ? allowedTypes.map(t => t.startsWith('.') ? t.toUpperCase() : t.split('/')[1]?.toUpperCase() || t).join(', ')
          : 'PDF, IMG';
        
        if (droppedFiles.length === 0) {
          setError(`Rejection: ${rejectedFiles.length + zipRejectionCount} file(s) were incompatible. This tool accepts ${allowedDescription}${allowedTypes?.includes('application/zip') ? '' : ' and ZIP'} files.`);
          setIsPreparingFiles(false);
          return;
        }
        setError(`Notice: ${droppedFiles.length} files added, but ${rejectedFiles.length + zipRejectionCount} files were skipped.`);
      }

      if (droppedFiles.length > 0) {
        let filesToProcess = droppedFiles;
        
        // Split PDF if requested
        if (shouldSplitPdf) {
          const { splitPdfToPages } = await import('../../lib/pdf-utils');
          const splitResults = await Promise.all(droppedFiles.map(async (file) => {
            if (file.type === 'application/pdf') {
              try {
                return await splitPdfToPages(file);
              } catch (err) {
                console.error("Failed to split PDF, using original:", err);
                return [file];
              }
            }
            return [file];
          }));
          filesToProcess = splitResults.flat();
        }

        // Automatic Image to PDF conversion if tool supports PDF
        const { jpgToPdf } = await import('../../lib/pdf-utils');
        const expectsPdf = !allowedTypes || allowedTypes.some(t => t.includes('pdf'));
        
        const processedFiles = await Promise.all(filesToProcess.map(async (file) => {
          const isActuallyImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name);
          const isActuallyPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

          if (isActuallyImage && expectsPdf && !isActuallyPdf) {
            try {
              const pdfBlob = await jpgToPdf([file]);
              return new File([pdfBlob], file.name.replace(/\.[^/.]+$/, "") + ".pdf", { type: 'application/pdf' });
            } catch (e) {
              console.error("Image to PDF conversion failed:", e);
              return file;
            }
          }
          return file;
        }));

        const newFiles = await Promise.all(processedFiles.map(async (file) => {
          let preview = null;
          if (file.type.startsWith('image/')) {
            preview = URL.createObjectURL(file);
          } else if (file.type === 'application/pdf') {
            preview = await generateThumbnail(file);
          }
          
          if (preview) createdUrls.current.add(preview);
          
          return {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview,
            rotation: 0
          };
        }));
        
        setFiles(prev => [...prev, ...newFiles]);
      } else if (rejectedFiles.length === 0) {
        setError('Technical issue: No valid files were identified in the selection.');
      }
    } catch (err) {
      console.error("Preparation error:", err);
      setError("Failed to prepare files. Please try again.");
    } finally {
      setIsPreparingFiles(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files) {
      await addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
        createdUrls.current.delete(fileToRemove.preview);
      }
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

  const removeRange = () => {
    const rangeStr = prompt('Enter page numbers or ranges to remove (e.g., "1, 3-5, 10"):');
    if (!rangeStr) return;
    
    const ranges = rangeStr.split(',').map(r => r.trim());
    const indicesToRemove = new Set();
    
    ranges.forEach(r => {
      if (r.includes('-')) {
        const parts = r.split('-').map(Number);
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          for (let i = Math.min(parts[0], parts[1]); i <= Math.max(parts[0], parts[1]); i++) {
            indicesToRemove.add(i - 1);
          }
        }
      } else {
        const index = parseInt(r);
        if (!isNaN(index)) indicesToRemove.add(index - 1);
      }
    });

    setFiles(prev => prev.filter((_, i) => {
      const shouldRemove = indicesToRemove.has(i);
      if (shouldRemove && prev[i].preview) {
        URL.revokeObjectURL(prev[i].preview);
        createdUrls.current.delete(prev[i].preview);
      }
      return !shouldRemove;
    }));
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
    }
  };

  const rotateFile = (id) => {
    setFiles(prev => prev.map(f => {
      if (f.id === id) {
        return { ...f, rotation: f.rotation + 90 };
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
      const rotations = files.map(f => (f.rotation % 360 + 360) % 360);
      
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
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: isDragging ? 0.98 : 1,
              borderColor: isDragging ? tool.color : 'rgb(229, 231, 235)'
            }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={onDrop}
            onClick={() => !isPreparingFiles && fileInputRef.current?.click()}
            className={cn(
              "bg-white border-2 border-dashed rounded-[2rem] sm:rounded-[2.5rem] p-12 sm:p-32 text-center cursor-pointer transition-all group relative overflow-hidden bento-card w-full",
              isDragging ? "shadow-2xl bg-primary/5" : "hover:border-primary border-gray-200",
              isPreparingFiles && "pointer-events-none opacity-50"
            )}
          >
            <AnimatePresence>
              {isPreparingFiles && (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Zap className="text-primary animate-pulse" size={32} />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest mb-1">Preparing Files</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] animate-pulse">Converting to optimized PDF...</p>
                    </div>
                  </motion.div>
              )}
              {isDragging && !isPreparingFiles && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-4 pointer-events-none"
                >
                  <div className="bg-white p-6 rounded-full shadow-2xl scale-125 animate-bounce">
                    <Upload className="text-primary" size={32} />
                  </div>
                  <span className="text-xl font-black text-primary uppercase tracking-widest">Release to Upload</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity" />
            <div className="bg-gray-900 w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-2xl">
              <Upload className="text-white" size={24} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
              {customDropzoneText || 'Universal Compression Engine'}
            </h2>
            <p className="text-gray-400 font-mono text-[10px] uppercase tracking-[0.3em]">Drop files to optimize securely</p>
            <div className="mt-8 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              {allowedTypes && allowedTypes.length > 0 ? (
                allowedTypes.map(type => (
                  <span key={type} className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-primary uppercase">
                    {type.startsWith('.') ? type.slice(1).toUpperCase() : type.split('/')[1]?.toUpperCase() || type}
                  </span>
                ))
              ) : (
                <>
                  <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">PDF</span>
                  <span className="px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase">IMG</span>
                </>
              )}
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
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={onDrop}
            className="flex flex-col lg:flex-row gap-8 items-start w-full relative"
          >
            <AnimatePresence>
              {isPreparingFiles && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[120] rounded-[3rem] flex flex-col items-center justify-center gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  <span className="text-xs font-black text-primary uppercase tracking-widest">Preparing...</span>
                </motion.div>
              )}
              {isDragging && !resultUrl && !isPreparingFiles && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary/10 backdrop-blur-[4px] z-[100] rounded-[3rem] border-4 border-dashed border-primary flex flex-col items-center justify-center gap-6 pointer-events-none"
                >
                  <motion.div 
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="bg-white p-8 rounded-full shadow-2xl"
                  >
                    <Upload className="text-primary" size={48} />
                  </motion.div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-primary uppercase tracking-widest mb-2">Drop to Add More</h3>
                    <p className="text-primary/60 font-bold uppercase tracking-widest text-xs">
                      {allowedTypes ? `Accepted: ${allowedTypes.join(', ')}` : 'All PDF formats accepted'}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
                      <button 
                        onClick={removeRange}
                        className="flex items-center gap-1.5 px-3 py-2 text-[9px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Range"
                      >
                        <Trash2 size={12} strokeWidth={3} />
                        REMOVE RANGE
                      </button>
                    </div>
                  )}
                </div>
              )}              {!resultUrl && (
                canReorder ? (
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
                            onPreview={setSelectedFileId}
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
                           <div className="w-full aspect-[451/638] bg-white flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
                            {activeFile.preview ? (
                              <img 
                                src={activeFile.preview} 
                                alt={activeFile.file.name} 
                                style={{ transform: `rotate(${activeFile.rotation}deg)` }}
                                className="w-full h-full object-contain"
                                draggable={false}
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-2">
                                <FileIcon className="text-primary/20" size={24} sm:size={32} />
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
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-6 pb-8 overflow-visible">
                    {files.map((fileObj, index) => (
                      <div
                        key={fileObj.id}
                        className={cn(
                          "relative bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm group flex flex-col items-center gap-4 select-none w-full h-full min-h-[280px] sm:min-h-[320px] transition-all duration-200",
                          isProcessing ? "pointer-events-none opacity-50" : "hover:border-[#0052CC]/40 hover:shadow-xl"
                        )}
                      >
                         <div className="absolute top-3 left-3 z-10 w-7 h-7 sm:w-8 sm:h-8 bg-gray-900 text-white rounded-lg flex items-center justify-center text-[9px] sm:text-[10px] font-black shadow-lg">
                          {(index + 1).toString().padStart(2, '0')}
                        </div>
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
                          {!resultUrl && !isProcessing && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                rotateFile(fileObj.id);
                              }}
                              className="bg-white/80 backdrop-blur-sm text-gray-400 hover:bg-primary hover:text-white p-2 rounded-lg transition-all shadow-sm"
                              title="Rotate 90°"
                            >
                              <RotateCw size={12} sm:size={14} strokeWidth={3} />
                            </button>
                          )}
                        </div>
                        <div className="w-full flex-grow flex flex-col items-center gap-3 cursor-pointer" onClick={() => !isProcessing && setSelectedFileId(fileObj.id)}>
                           <div className="w-full aspect-[451/638] bg-white flex items-center justify-center rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden relative shadow-inner">
                            {fileObj.preview ? (
                              <motion.img 
                                src={fileObj.preview} 
                                alt={fileObj.file.name} 
                                animate={{ rotate: fileObj.rotation }}
                                className="w-full h-full object-contain transition-transform group-hover:scale-105" 
                              />
                            ) : (
                              <FileIcon className="text-primary/20" size={24} sm:size={32} />
                            )}
                          </div>
                          <p className="text-[10px] sm:text-xs font-black text-gray-900 line-clamp-2 text-center">{fileObj.file.name}</p>
                        </div>
                      </div>
                    ))}
                    {!resultUrl && !isProcessing && (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full min-h-[280px] sm:min-h-[320px] rounded-[2rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                      >
                        <Upload size={16} sm:size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add more</span>
                      </button>
                    )}
                  </div>
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
                  accept={allowedTypes?.join(',') || '.pdf,image/*,video/*'}
                />

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between gap-3 text-red-600 bg-red-50/80 backdrop-blur-sm px-5 py-3 rounded-2xl text-xs font-bold border border-red-100 shadow-sm animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3">
                      <AlertCircle size={14} className="shrink-0" />
                      <span className="flex-grow">{error}</span>
                    </div>
                    <button 
                      onClick={() => setError(null)}
                      className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-400 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
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
            {(supportsPageSize || supportsCompression || needsPassword) && !resultUrl && (
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
            onClick={() => {
              setSelectedFileId(null);
              setZoom(1);
            }}
            className="fixed inset-0 z-[100] bg-[#1d1e21]/95 flex flex-col items-center justify-center p-4 sm:p-12"
          >
            {/* Close Button Top Right */}
            <button 
              onClick={() => {
                setSelectedFileId(null);
                setZoom(1);
              }}
              className="fixed top-8 right-8 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all z-[110]"
              title="Close Preview"
            >
              <X size={28} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative flex flex-col items-center gap-12 w-full max-w-5xl h-full justify-center"
            >
              {/* Document Preview */}
              <div className="relative flex items-center justify-center w-full min-h-0 flex-grow">
                {selectedFile && (() => {
                  const normalizedRotation = Math.abs(selectedFile.rotation) % 180;
                  const isLandscape = normalizedRotation === 90;
                  
                  return (
                    <div 
                      className={cn(
                        "bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] rounded-sm overflow-auto transition-all duration-500 ease-in-out",
                        isLandscape
                          ? "sm:h-[451px] sm:w-[638px] aspect-[638/451]" 
                          : "sm:h-[638px] sm:w-[451px] aspect-[451/638]",
                        "max-w-full max-h-full",
                        zoom <= 1 ? "flex items-center justify-center" : ""
                      )}
                    >
                      {selectedFile.preview ? (
                        <div 
                          className={cn(
                            "transition-all duration-300 flex items-center justify-center",
                            zoom > 1 ? "min-w-max min-h-max" : "w-full h-full"
                          )}
                          style={{
                            width: `${zoom * 100}%`,
                            height: `${zoom * 100}%`,
                          }}
                        >
                          <motion.img 
                            src={selectedFile.preview} 
                            alt="Large Preview" 
                            animate={{ 
                              rotate: selectedFile.rotation,
                            }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            style={{ 
                              width: '100%',
                              height: '100%',
                              maxWidth: zoom > 1 ? 'none' : '100%',
                              maxHeight: zoom > 1 ? 'none' : '100%',
                            }}
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-200 h-full w-full justify-center">
                          <FileIcon size={80} sm:size={120} strokeWidth={1} />
                          <span className="font-black uppercase tracking-widest text-xs sm:text-sm">Preview Unavailable</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Floating Bottom Toolbar */}
              <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-2xl backdrop-blur-md shadow-2xl border border-white/5">
                <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1">
                  {/* Pagination */}
                  <button 
                    onClick={goToPrevFile}
                    disabled={selectedFileIndex === 0}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex items-center gap-2 px-3 sm:px-4 border-l border-r border-gray-100">
                    <span className="text-sm sm:text-base font-black text-gray-900">{selectedFileIndex + 1}</span>
                    <span className="text-xs sm:text-sm text-gray-400 font-bold">/</span>
                    <span className="text-sm sm:text-base font-black text-gray-400">{files.length}</span>
                  </div>

                  <button 
                    onClick={goToNextFile}
                    disabled={selectedFileIndex === files.length - 1}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Zoom Group */}
                <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1">
                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                  <div className="flex items-center justify-center min-w-[3rem] px-1">
                    <span className="text-[10px] font-black text-gray-900 tabular-nums">
                      {Math.round(zoom * 100)}%
                    </span>
                  </div>
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 disabled:opacity-30 transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                </div>

                {/* Actions Group */}
                <div className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1">
                  <button
                    onClick={() => rotateFileCounterClockwise(selectedFile.id)}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 transition-colors"
                    title="Rotate Left"
                  >
                    <RotateCcw size={20} />
                  </button>
                  <button
                    onClick={() => rotateFile(selectedFile.id)}
                    className="p-2 sm:p-3 text-gray-400 hover:text-gray-900 transition-colors"
                    title="Rotate Right"
                  >
                    <RotateCw size={20} />
                  </button>
                  <div className="w-[1px] h-6 bg-gray-100 mx-1" />
                  <button
                    onClick={() => {
                      removeFile(selectedFile.id);
                      setSelectedFileId(null);
                    }}
                    className="p-2 sm:p-3 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
