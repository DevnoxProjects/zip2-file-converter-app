import React from 'react';
import ToolInterface from './ToolInterface';
import { removePages } from '../../lib/pdf-utils';

export default function RemovePages({ tool }) {
  const handleProcess = async (files) => {
    const pageNum = prompt('Enter page number to remove (1-indexed):');
    return await removePages(files[0], pageNum);
  };

  return (
    <ToolInterface 
      tool={tool}
      onProcess={handleProcess}
      customDropzoneText="Select PDF to remove pages from"
      customProcessText="Remove Pages"
    />
  );
}
