import React from 'react';
import ToolInterface from './ToolInterface';
import { mergePdfs } from '../../lib/pdf-utils';

export default function MergePDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await mergePdfs(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']}
      customDropzoneText="Merge PDFs & Images into one PDF"
      customProcessText="Merge and Optimize"
    />
  );
}
