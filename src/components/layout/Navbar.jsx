import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ChevronDown, Menu, X, Image as ImageIcon, MonitorPlay, FileSpreadsheet, Code, FileCheck, Combine, Scissors, Minimize2, Wrench, FileStack, RefreshCcw, Type, FileEdit, Unlock, Lock, FileSignature, ShieldCheck, ArrowLeftRight, Globe, FileUp, Layout, Binary, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils.js';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showConvertMenu, setShowConvertMenu] = useState(false);
  const [showAllToolsMenu, setShowAllToolsMenu] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto relative flex lg:grid lg:grid-cols-[200px_1fr_200px] items-center justify-between lg:justify-items-center">
        {/* Left: Logo */}
        <div className="flex items-center justify-start w-full">
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="Zip2" className="h-10 w-auto group-hover:scale-105 transition-transform" />
          </Link>
        </div>

        {/* Center: Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          <NavItem label="MERGE PDF" />
          <NavItem label="SPLIT PDF" />
          <NavItem label="COMPRESS PDF" />
          
          <div 
            className="group py-2"
            onMouseEnter={() => setShowConvertMenu(true)}
            onMouseLeave={() => setShowConvertMenu(false)}
          >
              <button className={cn(
                "flex items-center gap-1 text-xs font-bold transition-colors tracking-wide cursor-pointer",
                showConvertMenu ? "text-primary" : "text-gray-600 hover:text-primary"
              )}>
                CONVERT PDF <ChevronDown size={14} className={cn("transition-transform duration-200", showConvertMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showConvertMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                  >
                    <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 flex min-w-[640px]">
                      {/* Convert To PDF */}
                      <div className="flex-1 p-6 border-r border-gray-50">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">CONVERT TO PDF</h4>
                        <div className="flex flex-col gap-1">
                          <MegaMenuItem icon={<ImageIcon size={18} className="text-[#0052CC]" />} label="JPG to PDF" link="/tool/jpg-to-pdf" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<FileText size={18} className="text-[#00CEC9]" />} label="WORD to PDF" link="/tool/word-to-pdf" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<MonitorPlay size={18} className="text-[#0052CC]" />} label="POWERPOINT to PDF" link="/tool/powerpoint-to-pdf" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<FileSpreadsheet size={18} className="text-[#00CEC9]" />} label="EXCEL to PDF" link="/tool/excel-to-pdf" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<Code size={18} className="text-[#0052CC]" />} label="HTML to PDF" link="/tool/html-to-pdf" onClick={() => setShowConvertMenu(false)} />
                        </div>
                      </div>

                      {/* Convert From PDF */}
                      <div className="flex-1 p-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">CONVERT FROM PDF</h4>
                        <div className="flex flex-col gap-1">
                          <MegaMenuItem icon={<ImageIcon size={18} className="text-[#00CEC9]" />} label="PDF to JPG" link="/tool/pdf-to-jpg" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<FileText size={18} className="text-[#0052CC]" />} label="PDF to WORD" link="/tool/pdf-to-word" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<MonitorPlay size={18} className="text-[#00CEC9]" />} label="PDF to POWERPOINT" link="/tool/pdf-to-powerpoint" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<FileSpreadsheet size={18} className="text-[#0052CC]" />} label="PDF to EXCEL" link="/tool/pdf-to-excel" onClick={() => setShowConvertMenu(false)} />
                          <MegaMenuItem icon={<FileCheck size={18} className="text-[#00CEC9]" />} label="PDF to PDF/A" link="/tool/pdf-to-pdfa" onClick={() => setShowConvertMenu(false)} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div 
              className="group py-2"
              onMouseEnter={() => setShowAllToolsMenu(true)}
              onMouseLeave={() => setShowAllToolsMenu(false)}
            >
              <button className={cn(
                "flex items-center gap-1 text-xs font-bold transition-colors tracking-wide cursor-pointer",
                showAllToolsMenu ? "text-primary" : "text-gray-600 hover:text-primary"
              )}>
                ALL PDF TOOLS <ChevronDown size={14} className={cn("transition-transform duration-200", showAllToolsMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showAllToolsMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-4"
                  >
                    <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-50 p-8 flex gap-8 min-w-[1150px]">
                      <div className="flex flex-col gap-1 font-sans">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">ORGANIZE PDF</h4>
                        <MegaMenuItem icon={<Combine size={18} className="text-[#0052CC]" />} label="Merge PDF" link="/tool/merge-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Scissors size={18} className="text-[#0052CC]" />} label="Split PDF" link="/tool/split-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<X size={18} className="text-[#0052CC]" />} label="Remove pages" link="/tool/remove-pages" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileUp size={18} className="text-[#0052CC]" />} label="Extract pages" link="/tool/extract-pages" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Layout size={18} className="text-[#0052CC]" />} label="Organize PDF" link="/tool/organize-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Binary size={18} className="text-[#0052CC]" />} label="Scan to PDF" link="/tool/scan-to-pdf" onClick={() => setShowAllToolsMenu(false)} />

                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 mt-6">PDF INTELLIGENCE</h4>
                        <MegaMenuItem icon={<FileText size={18} className="text-[#00CEC9]" />} label="AI Summarizer" link="/tool/ai-summarizer" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Globe size={18} className="text-[#00CEC9]" />} label="Translate PDF" link="/tool/translate-pdf" onClick={() => setShowAllToolsMenu(false)} />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">OPTIMIZE PDF</h4>
                        <MegaMenuItem icon={<Minimize2 size={18} className="text-[#0052CC]" />} label="Compress PDF" link="/tool/compress-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Wrench size={18} className="text-[#0052CC]" />} label="Repair PDF" link="/tool/repair-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileStack size={18} className="text-[#0052CC]" />} label="OCR PDF" link="/tool/ocr-pdf" onClick={() => setShowAllToolsMenu(false)} />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">CONVERT TO PDF</h4>
                        <MegaMenuItem icon={<ImageIcon size={18} className="text-[#00CEC9]" />} label="JPG to PDF" link="/tool/jpg-to-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileText size={18} className="text-[#00CEC9]" />} label="WORD to PDF" link="/tool/word-to-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<MonitorPlay size={18} className="text-[#00CEC9]" />} label="POWERPOINT to PDF" link="/tool/powerpoint-to-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileSpreadsheet size={18} className="text-[#00CEC9]" />} label="EXCEL to PDF" link="/tool/excel-to-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Code size={18} className="text-[#00CEC9]" />} label="HTML to PDF" link="/tool/html-to-pdf" onClick={() => setShowAllToolsMenu(false)} />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">CONVERT FROM PDF</h4>
                        <MegaMenuItem icon={<ImageIcon size={18} className="text-[#0052CC]" />} label="PDF to JPG" link="/tool/pdf-to-jpg" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileText size={18} className="text-[#0052CC]" />} label="PDF to WORD" link="/tool/pdf-to-word" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<MonitorPlay size={18} className="text-[#0052CC]" />} label="PDF to POWERPOINT" link="/tool/pdf-to-powerpoint" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileSpreadsheet size={18} className="text-[#0052CC]" />} label="PDF to EXCEL" link="/tool/pdf-to-excel" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileCheck size={18} className="text-[#0052CC]" />} label="PDF to PDF/A" link="/tool/pdf-to-pdfa" onClick={() => setShowAllToolsMenu(false)} />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">EDIT PDF</h4>
                        <MegaMenuItem icon={<RefreshCcw size={18} className="text-[#00CEC9]" />} label="Rotate PDF" link="/tool/rotate-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Binary size={18} className="text-[#00CEC9]" />} label="Add page numbers" link="/tool/add-page-numbers" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Type size={18} className="text-[#00CEC9]" />} label="Add watermark" link="/tool/watermark" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Scissors size={18} className="text-[#00CEC9]" />} label="Crop PDF" link="/tool/crop-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileEdit size={18} className="text-[#00CEC9]" />} label="Edit PDF" link="/tool/edit-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileText size={18} className="text-[#00CEC9]" />} label="PDF Forms" link="/tool/pdf-forms" onClick={() => setShowAllToolsMenu(false)} />
                      </div>

                      <div className="flex flex-col gap-1">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">PDF SECURITY</h4>
                        <MegaMenuItem icon={<Unlock size={18} className="text-[#0052CC]" />} label="Unlock PDF" link="/tool/unlock-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<Lock size={18} className="text-[#0052CC]" />} label="Protect PDF" link="/tool/protect-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<FileSignature size={18} className="text-[#0052CC]" />} label="Sign PDF" link="/tool/sign-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<ShieldCheck size={18} className="text-[#0052CC]" />} label="Redact PDF" link="/tool/redact-pdf" onClick={() => setShowAllToolsMenu(false)} />
                        <MegaMenuItem icon={<ArrowLeftRight size={18} className="text-[#0052CC]" />} label="Compare PDF" link="/tool/compare-pdf" onClick={() => setShowAllToolsMenu(false)} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        {/* Right: Actions */}
        <div className="flex items-center justify-end w-full gap-4">
          <Link to="/login" className="hidden sm:block text-xs font-semibold text-gray-600 hover:text-primary transition-colors">
            LOGIN
          </Link>
          <Link to="/signup" className="hidden sm:flex items-center justify-center bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-lg hover:shadow-lg transition-all active:scale-95">
            SIGN UP
          </Link>
          <button 
            className="lg:hidden p-2 text-gray-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden bg-white mt-3"
          >
            <div className="flex flex-col gap-4 py-4 px-2 border-t border-gray-100">
              <MobileNavItem label="MERGE PDF" link="/tool/merge-pdf" onClick={() => setIsOpen(false)} />
              <MobileNavItem label="SPLIT PDF" link="/tool/split-pdf" onClick={() => setIsOpen(false)} />
              <MobileNavItem label="COMPRESS PDF" link="/tool/compress-pdf" onClick={() => setIsOpen(false)} />
              <MobileNavItem label="ALL PDF TOOLS" link="/" onClick={() => setIsOpen(false)} />
              <MobileNavItem label="LOGIN" link="/login" onClick={() => setIsOpen(false)} />
              <MobileNavItem label="SIGN UP" link="/signup" primary onClick={() => setIsOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavItem({ label }) {
  return (
    <Link to={`/${label.toLowerCase().replace(/ /g, '-')}`} className="text-xs font-bold text-gray-600 hover:text-primary transition-colors uppercase tracking-wide">
      {label}
    </Link>
  );
}

function MegaMenuItem({ icon, label, link, onClick }) {
  return (
    <Link 
      to={link} 
      onClick={onClick}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <div className="shrink-0">
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-700 group-hover:text-black transition-colors tracking-tight">
        {label}
      </span>
    </Link>
  );
}

function MobileNavItem({ label, primary, link, onClick }) {
  const to = link || `/${label.toLowerCase().replace(/ /g, '-')}`;
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className={`text-sm font-bold p-3 rounded-lg ${primary ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`}
    >
      {label}
    </Link>
  );
}
