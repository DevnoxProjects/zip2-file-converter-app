import React from 'react';
import ToolInterface from './ToolInterface';
import { protectPdf } from '../../lib/pdf-utils';

export default function ProtectPDF({ tool }) {
  const handleProcess = async (files) => {
    const password = prompt('Enter a password to protect the PDF:');
    return await protectPdf(files[0], password);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select PDF to protect"
      customProcessText="Protect PDF"
    />
  );
}
