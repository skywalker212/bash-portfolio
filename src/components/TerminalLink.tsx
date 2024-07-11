import React from 'react';

interface TerminalLinkProps {
    href: string;
    children: React.ReactNode;
}

const TerminalLink: React.FC<TerminalLinkProps> = ({ href, children }) => {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline hover:text-blue-300"
        >
            {children}
        </a >
    );
};

export default TerminalLink;