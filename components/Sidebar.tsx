import React from 'react';
import { SECTIONS } from '../constants';
import { SectionId } from '../types';

interface SidebarProps {
  activeSectionId: SectionId;
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  onNavigate: (sectionId: SectionId) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSectionId, isOpen, setOpen, onNavigate }) => {

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: SectionId) => {
    e.preventDefault();
    onNavigate(sectionId);
    setOpen(false); // Close sidebar on mobile after clicking
  };

  const navSections = SECTIONS.filter(s => s.id !== 'algorithm' && s.id !== 'patient-records');

  return (
    <aside className={`fixed top-0 left-0 z-20 h-full w-72 bg-sapphire-medium text-text-light transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:fixed shadow-2xl`}>
      <div className="p-4">
        <h1 className="text-4xl font-bold text-center text-text-light mt-4 mb-10 font-poppins">SIAD-FPI</h1>
        <nav>
          <ul>
            {navSections.map((section) => (
              <li key={section.id} className="mb-2">
                <a
                  href={`#/${section.id}`}
                  onClick={(e) => handleNavClick(e, section.id as SectionId)}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 border-l-4 ${
                    activeSectionId === section.id
                      ? 'bg-sapphire-light text-accent-blue font-semibold border-accent-blue'
                      : 'border-transparent text-text-medium hover:bg-sapphire-light hover:text-text-light'
                  }`}
                >
                  <section.icon className="w-5 h-5 mr-3" />
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-text-medium">
          <p>Basé sur le guide Tunisien FPI</p>
          <p>© 2022 STMRA</p>
      </div>
    </aside>
  );
};

export default Sidebar;