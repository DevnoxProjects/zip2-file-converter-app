import React from 'react';
import ToolInterface from './ToolInterface';
import { 
  generatePlaceholderPdf, 
  pdfToJpg, 
  mergePdfs, 
  jpgToPdf, 
  protectPdf, 
  unlockPdf, 
  removePages, 
  summarizePdf 
} from '../../lib/pdf-utils';

export default function GenericTool({ tool }) {
  const handleProcess = async (files, options = {}) => {
    switch (tool.id) {
      case 'pdf-to-jpg':
        return await pdfToJpg(files, options);
      case 'merge-pdf':
        return await mergePdfs(files, options);
      case 'jpg-to-pdf':
        return await jpgToPdf(files, options);
      case 'protect-pdf':
        return await protectPdf(files[0], options.password);
      case 'unlock-pdf':
        return await unlockPdf(files[0], options.password);
      case 'remove-pages':
        return await removePages(files[0], options.pageNumber);
      case 'organize-pdf':
        return await mergePdfs(files, options);
      case 'ai-summarizer':
        return await summarizePdf(files[0]);
      default:
        // Fallback for others
        await new Promise(r => setTimeout(r, 2000));
        if (tool.id.includes('to-pdf')) {
          const sizeNote = options.pageSize && options.pageSize !== 'original' ? ` (Resized to ${options.pageSize})` : '';
          return await generatePlaceholderPdf(`Result of ${tool.name}${sizeNote}`);
        }
        return new Blob(['dummy content'], { type: 'application/octet-stream' });
    }
  };

  const getAllowedTypes = () => {
    switch (tool.id) {
      case 'word-to-pdf': 
        return ['.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      case 'excel-to-pdf': 
        return ['.xls', '.xlsx', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      case 'powerpoint-to-pdf': 
        return ['.ppt', '.pptx', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      case 'html-to-pdf': 
        return ['.html', '.htm', 'text/html'];
      case 'jpg-to-pdf':
        return ['image/jpeg', 'image/png', 'image/webp'];
      case 'pdf-to-jpg':
      case 'pdf-to-word':
      case 'pdf-to-excel':
      case 'pdf-to-powerpoint':
      case 'pdf-to-pdfa':
      case 'extract-pages':
      case 'organize-pdf':
      case 'scan-to-pdf':
      case 'repair-pdf':
      case 'ocr-pdf':
      case 'add-page-numbers':
      case 'crop-pdf':
      case 'pdf-forms':
      case 'redact-pdf':
      case 'compare-pdf':
      case 'translate-pdf':
        return ['application/pdf', '.pdf', 'image/jpeg', 'image/png', 'application/zip'];
      default:
        return ['application/pdf', '.pdf', 'image/jpeg', 'image/png', 'application/zip'];
    }
  };

  const getDropzoneText = () => {
    if (tool.id.includes('to-pdf')) return `Select ${tool.name.split(' ')[0]} files`;
    return `Select PDF files for ${tool.name}`;
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText={getDropzoneText()}
      customProcessText={tool.name}
      allowedTypes={getAllowedTypes()}
    />
  );
}
