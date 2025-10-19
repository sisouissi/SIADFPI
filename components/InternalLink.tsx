import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionId } from '../types';

interface InternalLinkProps {
  sectionId: SectionId;
  anchorId: string;
  children: React.ReactNode;
  className?: string;
}

const InternalLink: React.FC<InternalLinkProps> = ({ sectionId, anchorId, children, className }) => {
    const navigate = useNavigate();
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents parent click handlers (like accordions) from firing
        navigate(`/${sectionId}`, { state: { anchorId } });
    };
    return (
        <a href={`#/${sectionId}`} onClick={handleClick} className={`text-accent-blue font-semibold hover:underline cursor-pointer ${className}`}>
            {children}
        </a>
    );
};

export default InternalLink;
