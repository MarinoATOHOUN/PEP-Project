import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';

/**
 * Composant pour afficher le contenu Markdown avec un style panafricain
 * Supporte: titres, listes, code, tableaux, citations, liens, etc.
 */
const MarkdownRenderer = ({ content, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Personnalisation des blocs de code avec coloration syntaxique
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={isDark ? vscDarkPlus : vs}
                language={match[1]}
                PreTag="div"
                className="rounded-md my-4"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded text-sm font-mono border border-accent/30"
                {...props}
              >
                {children}
              </code>
            );
          },
          
          // Personnalisation des titres avec le style panafricain
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mb-4 mt-6 border-b-2 border-primary/30 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-foreground mb-3 mt-5 border-b border-primary/20 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-foreground mb-2 mt-3">
              {children}
            </h4>
          ),
          
          // Personnalisation des paragraphes
          p: ({ children }) => (
            <p className="text-foreground mb-4 leading-relaxed">
              {children}
            </p>
          ),
          
          // Personnalisation des listes
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-2 text-foreground ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">
              {children}
            </li>
          ),
          
          // Personnalisation des citations
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 bg-accent/10 pl-4 py-2 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          
          // Personnalisation des liens
          a: ({ href, children }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Personnalisation des tableaux
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/10">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-border">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-accent/5 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-2 text-foreground">
              {children}
            </td>
          ),
          
          // Personnalisation du texte fort (gras)
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          
          // Personnalisation de l'emphase (italique)
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
          
          // Personnalisation du texte barré
          del: ({ children }) => (
            <del className="line-through text-muted-foreground">
              {children}
            </del>
          ),
          
          // Personnalisation des lignes horizontales
          hr: () => (
            <hr className="my-6 border-t-2 border-border" />
          ),
          
          // Personnalisation des images
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg my-4 border border-border shadow-sm"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
