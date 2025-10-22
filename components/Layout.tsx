import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { SectionId } from '../types';
import PageNavigation from './PageNavigation';
import SearchBar from './SearchBar';

interface LayoutProps {
  children: React.ReactNode;
  activeSectionId: SectionId;
  onNavigate: (sectionId: SectionId) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeSectionId, onNavigate }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-sapphire-dark text-text-light">
      <div className="fixed top-0 left-0 z-30 lg:hidden">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="p-2 m-2 text-text-light bg-sapphire-medium rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
          aria-label="Ouvrir le menu"
          aria-expanded={isSidebarOpen}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
          </svg>
        </button>
      </div>

      <Sidebar activeSectionId={activeSectionId} isOpen={isSidebarOpen} setOpen={setSidebarOpen} onNavigate={onNavigate} />
      
      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          aria-hidden="true"
        ></div>
      )}
      
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto lg:ml-72 bg-slate-100 text-slate-700">
         <div className="max-w-4xl mx-auto flex flex-col min-h-full">
            <div className="relative z-10 mb-8 mt-12 lg:mt-0">
                <SearchBar onNavigate={onNavigate} />
            </div>
            <div className="flex-grow">
                {children}
            </div>
            <PageNavigation activeSectionId={activeSectionId} onNavigate={onNavigate} />
            <footer className="text-center text-sm text-slate-500 mt-8 py-4">
              © 2025 SIAD-FPI Application développée par Docteur Zouhair Souissi basée sur le Guide FPI 2022 de la STMRA.
            </footer>
        </div>
      </main>
    </div>
  );
};

export default Layout;