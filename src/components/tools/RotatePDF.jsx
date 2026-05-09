import React from 'react';
import ToolInterface from './ToolInterface';
import { rotatePdfs } from '../../lib/pdf-utils';

export default function RotatePDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await rotatePdfs(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select PDFs to rotate"
      customProcessText="Rotate PDF"
    />
  );
}
