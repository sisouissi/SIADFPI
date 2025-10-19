import React from 'react';

interface InfoCapsuleProps {
  id?: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}

const InfoCapsule: React.FC<InfoCapsuleProps> = ({ id, title, icon: Icon, children, className = '' }) => {
  return (
    <div id={id} className={`bg-white rounded-xl p-6 shadow-md border border-slate-200 transition-all duration-300 hover:shadow-lg hover:border-accent-blue ${className}`}>
      <div className="flex items-center mb-4">
        <div className="p-2 bg-sky-100 rounded-full mr-4">
          <Icon className="w-6 h-6 text-accent-blue" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      <div className="text-slate-600 space-y-3">
        {children}
      </div>
    </div>
  );
};

export default InfoCapsule;