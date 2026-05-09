import React from 'react';
import ToolInterface from './ToolInterface';
import { summarizePdf } from '../../lib/pdf-utils';

export default function AISummarizer({ tool }) {
  const handleProcess = async (files) => {
    return await summarizePdf(files[0]);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf', 'image/jpeg', 'image/png', 'application/zip']}
      customDropzoneText="Select PDF for AI summarization"
      customProcessText="Summarize with AI"
    />
  );
}
