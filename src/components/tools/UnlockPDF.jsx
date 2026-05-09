import React from 'react';
import ToolInterface from './ToolInterface';
import { unlockPdf } from '../../lib/pdf-utils';

export default function UnlockPDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await unlockPdf(files[0], options.password);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/zip']}
      customDropzoneText="Select PDF to unlock"
      customProcessText="Unlock PDF"
    />
  );
}
