import React from 'react';
import ToolInterface from './ToolInterface';
import { organizePdf } from '../../lib/pdf-utils';

export default function OrganizePDF({ tool }) {
  const handleProcess = async (files, options) => {
    return await organizePdf(files, options);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      allowedTypes={['application/pdf']}
      customDropzoneText="Drop a PDF to split and organize its pages"
      customProcessText="Organize and Export"
      shouldSplitPdf={true}
    />
  );
}
