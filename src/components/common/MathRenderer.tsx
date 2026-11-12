import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedContent = useMemo(() => {
    if (!content) return '';

    // Replace display math $$...$$
    let formatted = content.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
      try {
        return `<div class="my-2 overflow-x-auto text-center py-1">${katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false
        })}</div>`;
      } catch (e) {
        return `<code>$$${math}$$</code>`;
      }
    });

    // Replace inline math $...$
    formatted = formatted.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false
        });
      } catch (e) {
        return `<code>$${math}$</code>`;
      }
    });

    // Convert newlines to breaks
    formatted = formatted.replace(/\n/g, '<br/>');

    return formatted;
  }, [content]);

  return (
    <div
      className={`text-slate-200 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
};
