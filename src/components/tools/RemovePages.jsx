import React from 'react';
import ToolInterface from './ToolInterface';
import { mergePdfs } from '../../lib/pdf-utils';

export default function RemovePages({ tool }) {
  const handleProcess = async (files, options) => {
    // When shouldSplitPdf is true, 'files' is the array of individual pages
    // Merging them back together effectively removes deleted ones
    return await mergePdfs(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/zip']}
      customDropzoneText="Select PDF to remove pages from"
      customProcessText="Remove Selected Pages"
      shouldSplitPdf={true}
    />
  );
}
