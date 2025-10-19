import React, { useCallback, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { SECTIONS } from './constants';
import { SectionId } from './types';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dérive l'ID de la section active du chemin de l'URL
  const activeSectionId = location.pathname.substring(1) as SectionId;

  const handleSectionChange = useCallback((sectionId: SectionId) => {
    navigate(`/${sectionId}`);
  }, [navigate]);

  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return;

    const { anchorId } = (location.state as { anchorId?: string }) || {};

    // Give router a moment to render the new page before scrolling
    setTimeout(() => {
      if (anchorId) {
        const element = document.getElementById(anchorId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-scroll');
          setTimeout(() => {
            element.classList.remove('highlight-scroll');
          }, 2000); // Animation duration matches CSS
        } else {
           mainContent.scrollTo(0, 0);
        }
      } else {
        mainContent.scrollTo(0, 0);
      }
    }, 100);
  }, [location]);

  const isValidSection = SECTIONS.some(s => s.id === activeSectionId);

  return (
    <Layout 
      activeSectionId={isValidSection ? activeSectionId : 'home'}
      onNavigate={handleSectionChange}
    >
      <Routes>
        {SECTIONS.map(section => (
          <Route 
            key={section.id}
            path={`/${section.id}`} 
            element={
              <div id={section.id} className="section-wrapper">
                <section.component />
              </div>
            }
          />
        ))}
        {/* Redirection de la racine vers la page d'accueil */}
        <Route path="/" element={<Navigate to="/home" replace />} />
        {/* Redirection pour les chemins inconnus vers l'accueil */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;