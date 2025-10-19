import React from 'react';

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children }) => {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold text-slate-900 border-b-2 border-slate-300 pb-3 mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </section>
  );
};

export default ContentSection;