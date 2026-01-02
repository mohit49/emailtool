'use client';

import { useEffect, useState, useRef } from 'react';

export default function ExternalScripts() {
  const [scripts, setScripts] = useState<Array<{ id?: string; scriptTag: string; injectInHead: boolean }>>([]);
  const loadedScriptsRef = useRef<Set<string>>(new Set());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loadScripts = async () => {
      try {
        console.log('[ExternalScripts] Fetching scripts from /api/external-js');
        const response = await fetch('/api/external-js', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('[ExternalScripts] Loaded scripts:', data.scripts);
          setScripts(data.scripts || []);
          setIsReady(true);
        } else {
          console.error('[ExternalScripts] Failed to fetch:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('[ExternalScripts] Error response:', errorText);
        }
      } catch (error) {
        console.error('[ExternalScripts] Fetch error:', error);
      }
    };

    // Wait for DOM to be ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          console.log('[ExternalScripts] DOMContentLoaded fired');
          loadScripts();
        });
      } else {
        console.log('[ExternalScripts] DOM already ready, loading scripts');
        loadScripts();
      }
    }
  }, []);

  // Inject scripts via useEffect
  useEffect(() => {
    if (!isReady || scripts.length === 0) {
      console.log('[ExternalScripts] Not ready or no scripts. Ready:', isReady, 'Scripts count:', scripts.length);
      return;
    }

    console.log('[ExternalScripts] Starting script injection for', scripts.length, 'scripts');

    scripts.forEach((script, index) => {
      const scriptKey = script.id || `script-${index}-${Date.now()}`;
      
      // Check if script already exists or is already loaded
      if (loadedScriptsRef.current.has(scriptKey)) {
        console.log('[ExternalScripts] Script already loaded:', scriptKey);
        return;
      }

      // Check if script tag already exists in DOM
      const existingScript = document.querySelector(`script[data-external-js-id="${scriptKey}"]`);
      if (existingScript) {
        console.log('[ExternalScripts] Script already in DOM:', scriptKey);
        loadedScriptsRef.current.add(scriptKey);
        return;
      }

      console.log('[ExternalScripts] Processing script:', script.scriptTag);
      console.log('[ExternalScripts] Inject in head:', script.injectInHead);

      // Parse the script tag HTML
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(script.scriptTag, 'text/html');
        const scriptElement = doc.querySelector('script');

        if (!scriptElement) {
          console.error('[ExternalScripts] Invalid script tag format:', script.scriptTag);
          return;
        }

        // Create a new script element
        const newScript = document.createElement('script');
        
        // Copy all attributes from the parsed script
        Array.from(scriptElement.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
          console.log('[ExternalScripts] Set attribute:', attr.name, '=', attr.value);
        });

        // Copy inline script content if any
        if (scriptElement.textContent) {
          newScript.textContent = scriptElement.textContent;
          console.log('[ExternalScripts] Set inline script content');
        }

        // Add identifier attribute
        newScript.setAttribute('data-external-js-id', scriptKey);

        // Add error handling
        newScript.onerror = (error) => {
          console.error('[ExternalScripts] Script load error:', error, 'Script:', script.scriptTag);
          loadedScriptsRef.current.delete(scriptKey);
          if (newScript.parentNode) {
            newScript.parentNode.removeChild(newScript);
          }
        };

        newScript.onload = () => {
          console.log('[ExternalScripts] Script loaded successfully:', scriptKey);
          loadedScriptsRef.current.add(scriptKey);
        };

        // Inject into head or body based on setting
        if (script.injectInHead) {
          console.log('[ExternalScripts] Injecting into <head>');
          if (document.head) {
            document.head.appendChild(newScript);
            console.log('[ExternalScripts] Script appended to head');
          } else {
            console.error('[ExternalScripts] document.head is not available');
          }
        } else {
          console.log('[ExternalScripts] Injecting into <body>');
          if (document.body) {
            document.body.appendChild(newScript);
            console.log('[ExternalScripts] Script appended to body');
          } else {
            console.error('[ExternalScripts] document.body is not available, waiting...');
            // Wait for body to be available
            const checkBody = setInterval(() => {
              if (document.body) {
                clearInterval(checkBody);
                document.body.appendChild(newScript);
                console.log('[ExternalScripts] Script appended to body after wait');
              }
            }, 100);
            // Timeout after 5 seconds
            setTimeout(() => clearInterval(checkBody), 5000);
          }
        }
      } catch (error) {
        console.error('[ExternalScripts] Error processing script:', error, 'Script:', script.scriptTag);
      }
    });
  }, [scripts, isReady]);

  return null;
}

