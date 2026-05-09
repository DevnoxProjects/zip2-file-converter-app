import React from 'react';
import ToolInterface from './ToolInterface';
import { jpgToPdf } from '../../lib/pdf-utils';

export default function JpgToPdf({ tool }) {
  const handleProcess = async (files, options) => {
    return await jpgToPdf(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select JPG or PNG images"
      customProcessText="Convert to PDF"
      allowedTypes={['image/jpeg', 'image/jpg', 'image/png']}
    />
  );
}
