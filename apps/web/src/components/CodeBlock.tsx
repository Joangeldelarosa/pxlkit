'use client';

import { useState, useCallback } from 'react';
import { PxlKitIcon } from '@pxlkit/core';
import { Check } from '@pxlkit/ui';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
}

export function CodeBlock({
  code,
  language = 'typescript',
  title,
  showLineNumbers = false,
  maxHeight = '400px',
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split('\n');

  return (
    <div className="relative group border border-retro-border bg-retro-bg rounded-sm overflow-hidden">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-retro-border bg-retro-surface/50">
          <span className="text-xs font-mono text-retro-muted">{title}</span>
          <span className="text-[10px] font-mono text-retro-muted/50 uppercase">{language}</span>
        </div>
      )}

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={`absolute top-2 right-2 px-3 py-1 text-[10px] font-mono border transition-all z-10 ${
          copied
            ? 'bg-retro-green/20 text-retro-green border-retro-green/30'
            : 'bg-retro-surface text-retro-muted border-retro-border hover:text-retro-green hover:border-retro-green/30 opacity-0 group-hover:opacity-100'
        }`}
      >
        {copied ? <><PxlKitIcon icon={Check} size={10} className="inline-block mr-1" /> COPIED</> : 'COPY'}
      </button>

      {/* Code */}
      <div className="overflow-auto" style={{ maxHeight }}>
        <pre className="p-4 text-sm font-mono leading-relaxed">
          {showLineNumbers ? (
            <table className="w-full">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i} className="hover:bg-retro-surface/30">
                    <td className="pr-4 text-retro-muted/40 select-none text-right w-8 text-xs">
                      {i + 1}
                    </td>
                    <td>
                      <SyntaxHighlight code={line} language={language} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>
              {lines.map((line, i) => (
                <div key={i}>
                  <SyntaxHighlight code={line} language={language} />
                </div>
              ))}
            </code>
          )}
        </pre>
      </div>
    </div>
  );
}

/** Simple syntax highlighting for TypeScript/JSON */
function SyntaxHighlight({ code, language }: { code: string; language: string }) {
  if (language === 'bash' || language === 'shell') {
    return <span className="text-retro-text">{code}</span>;
  }

  // Simple token-based highlighting
  const tokens = tokenize(code);

  return (
    <span>
      {tokens.map((token, i) => (
        <span key={i} className={getTokenColor(token.type)}>
          {token.value}
        </span>
      ))}
    </span>
  );
}

type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'type' | 'punctuation' | 'property' | 'text';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let remaining = code;

  while (remaining.length > 0) {
    // Comments
    const commentMatch = remaining.match(/^(\/\/.*)/);
    if (commentMatch) {
      tokens.push({ type: 'comment', value: commentMatch[0] });
      remaining = remaining.slice(commentMatch[0].length);
      continue;
    }

    // Strings
    const stringMatch = remaining.match(/^('[^']*'|"[^"]*"|`[^`]*`)/);
    if (stringMatch) {
      tokens.push({ type: 'string', value: stringMatch[0] });
      remaining = remaining.slice(stringMatch[0].length);
      continue;
    }

    // Keywords
    const kwMatch = remaining.match(
      /^(import|export|from|const|let|var|type|interface|function|return|if|else|new|typeof|as|default)\b/
    );
    if (kwMatch) {
      tokens.push({ type: 'keyword', value: kwMatch[0] });
      remaining = remaining.slice(kwMatch[0].length);
      continue;
    }

    // Types
    const typeMatch = remaining.match(
      /^(PxlKitData|PxlKitIcon|IconPack|GridSize|Pixel|SvgOptions|string|number|boolean)\b/
    );
    if (typeMatch) {
      tokens.push({ type: 'type', value: typeMatch[0] });
      remaining = remaining.slice(typeMatch[0].length);
      continue;
    }

    // Numbers
    const numMatch = remaining.match(/^(\d+\.?\d*)/);
    if (numMatch) {
      tokens.push({ type: 'number', value: numMatch[0] });
      remaining = remaining.slice(numMatch[0].length);
      continue;
    }

    // Punctuation
    const punctMatch = remaining.match(/^([{}()\[\]:;,.<>=+\-*/&|!?@#$%^~])/);
    if (punctMatch) {
      tokens.push({ type: 'punctuation', value: punctMatch[0] });
      remaining = remaining.slice(punctMatch[0].length);
      continue;
    }

    // Default: plain text word or whitespace
    const textMatch = remaining.match(/^(\s+|\w+)/);
    if (textMatch) {
      tokens.push({ type: 'text', value: textMatch[0] });
      remaining = remaining.slice(textMatch[0].length);
    } else {
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }
  }

  return tokens;
}

function getTokenColor(type: TokenType): string {
  switch (type) {
    case 'keyword':
      return 'text-retro-purple';
    case 'string':
      return 'text-retro-green';
    case 'number':
      return 'text-retro-gold';
    case 'comment':
      return 'text-retro-muted/60 italic';
    case 'type':
      return 'text-retro-cyan';
    case 'punctuation':
      return 'text-retro-muted';
    case 'property':
      return 'text-retro-red';
    case 'text':
    default:
      return 'text-retro-text';
  }
}
