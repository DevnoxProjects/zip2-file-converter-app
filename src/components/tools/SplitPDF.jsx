import React from 'react';
import ToolInterface from './ToolInterface';
import { organizePdf } from '../../lib/pdf-utils';

export default function SplitPDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await organizePdf(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/zip']}
      customDropzoneText="Drop a PDF to split and organize its pages"
      customProcessText="Organize and Export"
      shouldSplitPdf={true}
    />
  );
}
