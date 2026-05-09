import React from 'react';
import ToolInterface from './ToolInterface';
import { unlockPdf } from '../../lib/pdf-utils';

export default function UnlockPDF({ tool }) {
  const handleProcess = async (files) => {
    const password = prompt('Enter the password to unlock the PDF:');
    return await unlockPdf(files[0], password);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select PDF to unlock"
      customProcessText="Unlock PDF"
    />
  );
}
