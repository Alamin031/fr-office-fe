'use client';

import { useEffect, useRef, useState } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import Paragraph from '@editorjs/paragraph';
import List from '@editorjs/list';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Image from '@editorjs/image';

interface EditorJSWrapperProps {
  value?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function EditorJSWrapper({
  value,
  onChange,
  placeholder = 'Write your blog post content here...',
  readOnly = false,
}: EditorJSWrapperProps) {
  const editorRef = useRef<EditorJS | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || editorRef.current) return;

    const initializeEditor = async () => {
      editorRef.current = new EditorJS({
        holder: containerRef.current!,
        placeholder: placeholder,
        readOnly: readOnly,
        inlineToolbar: ['bold', 'italic', 'link'],
        data: value || {
          blocks: [],
          version: EditorJS.version,
          time: Date.now(),
        },
        onChange: async () => {
          if (editorRef.current) {
            const data = await editorRef.current.save();
            onChange(data);
          }
        },
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a heading',
              levels: [1, 2, 3, 4],
              defaultLevel: 2,
            },
          },
          paragraph: {
            class: Paragraph,
            config: {
              placeholder: 'Type or paste your text here...',
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered',
            },
          },
          code: {
            class: Code,
            config: {
              placeholder: 'Enter your code here...',
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote author',
            },
          },
          delimiter: Delimiter,
          image: {
            class: Image,
            config: {
              endpoints: {
                byFile: '/api/upload',
                byUrl: '/api/upload?url=',
              },
              additionalRequestHeaders: {
                'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
              },
              field: 'image',
              types: 'image/jpeg,image/gif,image/png,image/webp',
              captionPlaceholder: 'Enter image caption',
              buttonText: 'Upload Image',
              errorMessage: 'Image upload failed',
            },
          },
        },
      });

      setIsReady(true);
    };

    initializeEditor();

    return () => {
      if (editorRef.current && editorRef.current.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [onChange, placeholder, readOnly]);

  return (
    <div className="editor-js-container">
      <div
        ref={containerRef}
        id="editorjs"
        className="rounded-md border border-border bg-background p-4 text-foreground focus-within:ring-2 focus-within:ring-primary"
      />
      {!isReady && (
        <div className="flex items-center justify-center p-8 text-muted-foreground">
          Loading editor...
        </div>
      )}
      <style jsx>{`
        :global(.editor-js-container .ce-editor__redactor) {
          padding-bottom: 200px;
        }

        :global(.editor-js-container .ce-block) {
          margin-bottom: 1rem;
        }

        :global(.editor-js-container .ce-block__content) {
          max-width: 100%;
        }

        :global(.editor-js-container .ce-paragraph) {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        :global(.editor-js-container .ce-header) {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }

        :global(.editor-js-container .ce-header[data-level="1"]) {
          font-size: 1.875rem;
        }

        :global(.editor-js-container .ce-header[data-level="2"]) {
          font-size: 1.5rem;
        }

        :global(.editor-js-container .ce-header[data-level="3"]) {
          font-size: 1.25rem;
        }

        :global(.editor-js-container .ce-header[data-level="4"]) {
          font-size: 1.125rem;
        }

        :global(.editor-js-container .ce-code) {
          font-family: 'Courier New', monospace;
          background-color: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
        }

        :global(.editor-js-container .ce-quote) {
          border-left: 4px solid hsl(var(--primary));
          padding-left: 1rem;
          font-style: italic;
        }

        :global(.editor-js-container .ce-list__item) {
          margin-bottom: 0.5rem;
        }

        :global(.editor-js-container .ce-image) {
          margin: 1rem 0;
        }

        :global(.editor-js-container .ce-image img) {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
        }

        :global(.editor-js-container .ce-toolbox) {
          opacity: 0.6;
          transition: opacity 0.2s ease;
        }

        :global(.editor-js-container .ce-toolbox:hover) {
          opacity: 1;
        }

        :global(.editor-js-container .ce-settings) {
          background-color: hsl(var(--muted));
          border-radius: 0.375rem;
        }
      `}</style>
    </div>
  );
}
