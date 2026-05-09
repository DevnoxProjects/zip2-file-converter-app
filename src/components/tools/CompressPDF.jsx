import React from 'react';
import ToolInterface from './ToolInterface';
import { compressPdf } from '../../lib/pdf-utils';

export default function CompressPDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await compressPdf(files[0], options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select PDF to compress"
      customProcessText="Compress PDF"
    />
  );
}
