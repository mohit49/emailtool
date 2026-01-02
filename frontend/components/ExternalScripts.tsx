'use client';

import { useEffect, useState, useRef } from 'react';

export default function ExternalScripts() {
  const [scripts, setScripts] = useState<Array<{ id?: string; scriptTag: string; injectInHead: boolean }>>([]);
  const loadedScriptsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const loadScripts = async () => {
      try {
        const response = await fetch('/api/external-js', {
          cache: 'no-store', // Ensure fresh data
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Loaded external scripts:', data.scripts);
          setScripts(data.scripts || []);
        } else {
          console.error('Failed to fetch external scripts:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to load external scripts:', error);
      }
    };

    // Wait for DOM to be ready
    if (typeof window !== 'undefined') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadScripts);
      } else {
        loadScripts();
      }
    }
  }, []);

  // Inject scripts via useEffect
  useEffect(() => {
    if (scripts.length === 0) return;

    scripts.forEach((script) => {
      const scriptKey = script.id || script.scriptTag;
      
      // Check if script already exists or is already loaded
      if (loadedScriptsRef.current.has(scriptKey)) {
        return;
      }

      // Check if script tag already exists in DOM
      const existingScript = document.querySelector(`script[data-external-js-id="${scriptKey}"]`);
      if (existingScript) {
        loadedScriptsRef.current.add(scriptKey);
        return;
      }

      // Parse the script tag HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(script.scriptTag, 'text/html');
      const scriptElement = doc.querySelector('script');

      if (!scriptElement) {
        console.error('Invalid script tag format:', script.scriptTag);
        return;
      }

      // Create a new script element
      const newScript = document.createElement('script');
      
      // Copy all attributes from the parsed script
      Array.from(scriptElement.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inline script content if any
      if (scriptElement.textContent) {
        newScript.textContent = scriptElement.textContent;
      }

      // Add identifier attribute
      newScript.setAttribute('data-external-js-id', scriptKey);

      // Add error handling
      newScript.onerror = (error) => {
        console.error(`Failed to load external script:`, error);
        loadedScriptsRef.current.delete(scriptKey);
        // Remove the failed script element
        if (newScript.parentNode) {
          newScript.parentNode.removeChild(newScript);
        }
      };

      newScript.onload = () => {
        console.log(`Successfully loaded external script`);
        loadedScriptsRef.current.add(scriptKey);
      };

      // Inject into head or body based on setting
      if (script.injectInHead) {
        console.log(`Injecting script into <head>:`, script.scriptTag);
        document.head.appendChild(newScript);
      } else {
        console.log(`Injecting script before </body>:`, script.scriptTag);
        document.body.appendChild(newScript);
      }
    });
  }, [scripts]);

  return null;
}

