import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { TOOLS } from '../constants';
import { ArrowRight } from 'lucide-react';

// Tool Components
import MergePDF from '../components/tools/MergePDF';
import CompressPDF from '../components/tools/CompressPDF';
import JpgToPdf from '../components/tools/JpgToPdf';
import ProtectPDF from '../components/tools/ProtectPDF';
import RotatePDF from '../components/tools/RotatePDF';
import RemovePages from '../components/tools/RemovePages';
import UnlockPDF from '../components/tools/UnlockPDF';
import AISummarizer from '../components/tools/AISummarizer';
import OrganizePDF from '../components/tools/OrganizePDF';
import GenericTool from '../components/tools/GenericTool';

const TOOL_COMPONENTS = {
  'merge-pdf': MergePDF,
  'compress-pdf': CompressPDF,
  'jpg-to-pdf': JpgToPdf,
  'protect-pdf': ProtectPDF,
  'rotate-pdf': RotatePDF,
  'remove-pages': RemovePages,
  'unlock-pdf': UnlockPDF,
  'ai-summarizer': AISummarizer,
  'organize-pdf': OrganizePDF,
  // Add more as they are created
};

export default function ToolPage() {
  const { id } = useParams();
  const tool = TOOLS.find(t => t.id === id);

  if (!tool) return <div>Tool not found</div>;

  const ToolComponent = TOOL_COMPONENTS[id] || GenericTool;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start pt-12 px-4 pb-20">
      <div className="max-w-5xl w-full text-center mb-12">
        <div 
          className="inline-flex p-4 rounded-3xl bg-white shadow-sm mb-6"
          style={{ color: tool.color }}
        >
          {tool.icon}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{tool.name}</h1>
        <p className="text-gray-500 max-w-xl mx-auto">{tool.description}</p>
      </div>

      <ToolComponent tool={tool} />

      <div className="mt-20 text-center">
        <Link to="/" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-2 font-medium">
          <ArrowRight size={16} className="rotate-180" />
          Back to all tools
        </Link>
      </div>
    </div>
  );
}
