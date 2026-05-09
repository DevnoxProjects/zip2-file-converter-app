import { 
  Combine, 
  Scissors, 
  Minimize2, 
  FileEdit, 
  FileSignature, 
  FileText, 
  Image as ImageIcon, 
  FileStack, 
  Lock, 
  Unlock, 
  RefreshCcw, 
  ArrowLeftRight, 
  FileUp, 
  Type, 
  Layout, 
  ShieldCheck, 
  Wrench, 
  Binary,
  FileSpreadsheet,
  MonitorPlay,
  Code,
  FileCheck,
  Globe
} from 'lucide-react';
import React from 'react';

export const TOOLS = [
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
    icon: <Combine size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'organize'
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
    icon: <Scissors size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'organize'
  },
  {
    id: 'compress-pdf',
    name: 'Compress PDF',
    description: 'Reduce file size while optimizing for maximal PDF quality.',
    icon: <Minimize2 size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'optimize'
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
    icon: <FileText size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'convert-from'
  },
  {
    id: 'pdf-to-powerpoint',
    name: 'PDF to PPTX',
    description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
    icon: <MonitorPlay size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'convert-from'
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
    icon: <FileSpreadsheet size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'convert-from'
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
    icon: <FileText size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'convert-to'
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
    icon: <ImageIcon size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'convert-to'
  },
  {
    id: 'edit-pdf',
    name: 'Edit PDF',
    description: 'Add text, images, shapes or freehand annotations to a PDF document.',
    icon: <FileEdit size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'edit'
  },
  {
    id: 'sign-pdf',
    name: 'Sign PDF',
    description: 'Sign a document and request signatures. Send a signature request to others.',
    icon: <FileSignature size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'edit'
  },
  {
    id: 'watermark',
    name: 'Watermark',
    description: 'Choose an image or text to stamp over your PDF. Select typography and position.',
    icon: <Type size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'edit'
  },
  {
    id: 'rotate-pdf',
    name: 'Rotate PDF',
    description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
    icon: <RefreshCcw size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'organize'
  },
  {
    id: 'unlock-pdf',
    name: 'Unlock PDF',
    description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
    icon: <Unlock size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'security'
  },
  {
    id: 'protect-pdf',
    name: 'Protect PDF',
    description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
    icon: <Lock size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'security'
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Extract all images that are inside a PDF or convert each page to a JPG image.',
    icon: <ImageIcon size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'convert-from'
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    description: 'Transform your PDF to PDF/A for archiving and long-term preservation.',
    icon: <FileCheck size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'security'
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert web pages to PDF documents with high accuracy.',
    icon: <Code size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'convert-to'
  },
  {
    id: 'powerpoint-to-pdf',
    name: 'PPT to PDF',
    description: 'Convert your PowerPoint presentations to PDF files.',
    icon: <MonitorPlay size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'convert-to'
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert your Excel spreadsheets to PDF documents.',
    icon: <FileSpreadsheet size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'convert-to'
  },
  {
    id: 'remove-pages',
    name: 'Remove Pages',
    description: 'Remove pages from a PDF document with ease.',
    icon: <Scissors size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'organize'
  },
  {
    id: 'extract-pages',
    name: 'Extract Pages',
    description: 'Extract pages from your PDF file in high quality.',
    icon: <FileUp size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'organize'
  },
  {
    id: 'organize-pdf',
    name: 'Organize PDF',
    description: 'Sort, add and delete PDF pages. Drag and drop the page thumbnails.',
    icon: <Layout size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'organize'
  },
  {
    id: 'scan-to-pdf',
    name: 'Scan to PDF',
    description: 'Scan documents and convert them to PDF directly.',
    icon: <Binary size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'organize'
  },
  {
    id: 'repair-pdf',
    name: 'Repair PDF',
    description: 'Repair a damaged PDF and recover data from corrupt PDF.',
    icon: <Wrench size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'optimize'
  },
  {
    id: 'ocr-pdf',
    name: 'OCR PDF',
    description: 'Convert scanned PDF and images into editable Word, Excel, PPT and PDF documents.',
    icon: <FileStack size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'optimize'
  },
  {
    id: 'add-page-numbers',
    name: 'Add page numbers',
    description: 'Add page numbers into PDFs with ease. Choose position, dimensions, typography.',
    icon: <FileStack size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'edit'
  },
  {
    id: 'crop-pdf',
    name: 'Crop PDF',
    description: 'Trim the edges of your PDF pages, adjusting the visible area.',
    icon: <Scissors size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'edit'
  },
  {
    id: 'pdf-forms',
    name: 'PDF Forms',
    description: 'Fill in PDF forms or create your own with various field types.',
    icon: <FileEdit size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'edit'
  },
  {
    id: 'redact-pdf',
    name: 'Redact PDF',
    description: 'Permanently remove sensitive information from your PDF documents.',
    icon: <ShieldCheck size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'security'
  },
  {
    id: 'compare-pdf',
    name: 'Compare PDF',
    description: 'Compare two PDFs and see the differences between them instantly.',
    icon: <ArrowLeftRight size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'security'
  },
  {
    id: 'ai-summarizer',
    name: 'AI Summarizer',
    description: 'Summarize your PDF documents quickly using AI.',
    icon: <FileText size={40} strokeWidth={1.5} />,
    color: '#0052CC',
    category: 'intelligence'
  },
  {
    id: 'translate-pdf',
    name: 'Translate PDF',
    description: 'Translate your PDF documents into over 100 languages.',
    icon: <Globe size={40} strokeWidth={1.5} />,
    color: '#00CEC9',
    category: 'intelligence'
  }
];
