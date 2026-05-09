import React from 'react';
import ToolInterface from './ToolInterface';
import { protectPdf } from '../../lib/pdf-utils';

export default function ProtectPDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await protectPdf(files[0], options.password);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/zip']}
      customDropzoneText="Select PDF to protect"
      customProcessText="Protect PDF"
    />
  );
}
