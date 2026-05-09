import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Facebook, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <FooterColumn 
          title="ZIP2" 
          links={['Home', 'Features', 'Pricing', 'Tools', 'FAQ']} 
        />
        <FooterColumn 
          title="PRODUCT" 
          links={['Zip2 Desktop', 'Zip2 Mobile', 'Developers', 'WordPress Plugin', 'iloveimg.com']} 
        />
        <FooterColumn 
          title="SOLUTIONS" 
          links={['Business', 'Education']} 
        />
        <FooterColumn 
          title="COMPANY" 
          links={['Our Story', 'Blog', 'Press', 'Legal & Privacy', 'Contact']} 
        />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-50 text-gray-400 text-xs">
        <div className="flex items-center gap-6 mb-4 md:mb-0">
          <Link to="/" className="hover:text-primary transition-colors">
            <Globe size={20} />
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            <Twitter size={20} />
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            <Facebook size={20} />
          </Link>
          <Link to="/" className="hover:text-primary transition-colors">
            <Github size={20} />
          </Link>
        </div>
        <div className="flex gap-4">
          <span>© Zip2 2026 ® - Your File Suite</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-6">{title}</h4>
      <ul className="flex flex-col gap-4">
        {links.map((link) => (
          <li key={link}>
            <Link to="#" className="text-xs font-medium text-gray-500 hover:text-primary transition-colors">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
