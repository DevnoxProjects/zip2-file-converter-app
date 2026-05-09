import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils.js';

export default function ToolCard({ tool }) {
  const isFeatured = tool.id === 'compress-pdf';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="h-full"
    >
      <Link 
        to={`/tool/${tool.id}`}
        className={cn(
          "flex flex-col items-center justify-center p-6 rounded-2xl bento-card h-full text-center group",
          isFeatured && "bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-lg items-start text-left px-8"
        )}
      >
        <div 
          className={cn(
            "p-4 rounded-xl mb-4 transition-transform group-hover:scale-110",
            isFeatured ? "bg-white/20 order-2 ml-auto" : "bg-primary/5"
          )}
          style={{ color: isFeatured ? 'white' : tool.color }}
        >
          {tool.icon}
        </div>
        <div className={isFeatured ? "order-1" : ""}>
          {isFeatured && <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2 block">Most Popular</span>}
          <h3 className={cn(
            "font-bold mb-1 tracking-tight transition-colors",
            isFeatured ? "text-2xl font-black text-white" : "text-lg text-gray-800"
          )}>
            {tool.name}
          </h3>
          <p className={cn(
            "text-xs leading-relaxed",
            isFeatured ? "opacity-90 text-sm" : "text-gray-500"
          )}>
            {tool.description}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
