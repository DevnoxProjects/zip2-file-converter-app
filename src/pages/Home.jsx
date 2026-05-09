import React from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/home/ToolCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils.js';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-12 pb-16 sm:pt-20 sm:pb-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black text-gray-900 mb-8 tracking-tighter leading-[0.9] px-2"
          >
            Universal <br/> <span className="text-primary italic">Optimization</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-500 mb-12 sm:mb-16 max-w-2xl mx-auto leading-relaxed font-medium px-4"
          >
            Zip2 is a high-end, minimalist creative tool for professional file compression. 
            Privacy-first execution entirely on your device using WebAssembly.
          </motion.p>
        </div>
      </section>

      {/* Tools Grid Area */}
      <section className="pb-24 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Bento Grid logic: mapping tools to specific slots */}
          {TOOLS.map((tool) => {
            const isFeatured = tool.id === 'compress-pdf';
            const isHorizontal = tool.id === 'pdf-to-word' || tool.id === 'jpg-to-pdf';
            
            return (
              <motion.div
                key={tool.id}
                className={cn(
                  isFeatured ? "lg:col-span-2" : "col-span-1",
                  isHorizontal ? "md:col-span-1" : ""
                )}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ToolCard tool={tool} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features Detail Section */}
      <section className="py-32 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-20 tracking-tighter">
            PRO-GRADE <span className="text-primary">INFRASTRUCTURE</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <FeatureItem 
              title="WASM POWERED" 
              description="High-performance compression using WebAssembly engines. No file ever leaves your browser."
            />
            <FeatureItem 
              title="ZERO SERVER DATA" 
              description="Zip2 is 100% serverless. We don't store, process, or even see your documents."
            />
            <FeatureItem 
              title="ITERATIVE LOGIC" 
              description="Sophisticated algorithms that target specific file sizes while maintaining maximum visual fidelity."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ title, description }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
