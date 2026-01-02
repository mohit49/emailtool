'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function ExternalScripts() {
  const [scripts, setScripts] = useState<Array<{ url: string; injectInHead: boolean }>>([]);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await fetch('/api/external-js');
        if (response.ok) {
          const data = await response.json();
          setScripts(data.scripts || []);
        }
      } catch (error) {
        console.error('Failed to load external scripts:', error);
      }
    };

    loadScripts();
  }, []);

  // Inject head scripts via useEffect
  useEffect(() => {
    const headScripts = scripts.filter((script) => script.injectInHead);
    headScripts.forEach((script) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[data-external-js="${script.url}"]`);
      if (!existingScript) {
        const scriptElement = document.createElement('script');
        scriptElement.src = script.url;
        scriptElement.async = true;
        scriptElement.setAttribute('data-external-js', script.url);
        document.head.appendChild(scriptElement);
      }
    });

    // Cleanup function
    return () => {
      headScripts.forEach((script) => {
        const scriptElement = document.querySelector(`script[data-external-js="${script.url}"]`);
        if (scriptElement) {
          scriptElement.remove();
        }
      });
    };
  }, [scripts]);

  // Render body scripts using Next.js Script component
  const bodyScripts = scripts.filter((script) => !script.injectInHead);

  return (
    <>
      {bodyScripts.map((script, index) => (
        <Script
          key={`body-${index}`}
          src={script.url}
          strategy="lazyOnload"
        />
      ))}
    </>
  );
}

