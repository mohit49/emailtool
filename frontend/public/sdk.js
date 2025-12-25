/**
 * Przio Popup SDK
 * 
 * Usage:
 * <script src="https://yourdomain.com/sdk.js" data-project-id="YOUR_PROJECT_ID"></script>
 * 
 * Or initialize manually:
 * <script>
 *   window.PrzioSDK.init({ projectId: 'YOUR_PROJECT_ID' });
 * </script>
 */

(function(window, document) {
  'use strict';

  // Configuration
  const SDK_VERSION = '1.0.0';
  const API_BASE_URL = window.location.origin + '/api/sdk';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // State
  let config = {
    projectId: null,
    apiUrl: API_BASE_URL,
    debug: false,
  };

  let cache = {
    activities: null,
    timestamp: null,
  };

  let injectedPopups = new Set();

  // Utility functions
  function log(...args) {
    if (config.debug) {
      console.log('[PrzioSDK]', ...args);
    }
  }

  function error(...args) {
    console.error('[PrzioSDK]', ...args);
  }

  /**
   * Get current URL path and query
   */
  function getCurrentUrl() {
    return window.location.pathname + window.location.search;
  }

  /**
   * Get current hostname
   */
  function getCurrentHostname() {
    return window.location.hostname;
  }

  /**
   * Check if URL matches a condition
   */
  function matchesCondition(url, condition) {
    const { type, value, domain } = condition;
    const currentUrl = getCurrentUrl();
    const currentHostname = getCurrentHostname();

    // Check domain match if specified
    if (domain && domain.trim()) {
      const conditionDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
      if (currentHostname !== conditionDomain && !currentHostname.endsWith('.' + conditionDomain)) {
        return false;
      }
    }

    // Check URL condition
    switch (type) {
      case 'contains':
        return currentUrl.includes(value);
      case 'equals':
        return currentUrl === value || currentUrl === (value.startsWith('/') ? value : '/' + value);
      case 'startsWith':
        return currentUrl.startsWith(value);
      case 'doesNotContain':
        return !currentUrl.includes(value);
      case 'landing':
        // Landing page = root path with no query params
        return currentUrl === '/' || currentUrl.split('?')[0] === '/';
      default:
        return false;
    }
  }

  /**
   * Check if popup should be shown based on URL conditions
   */
  function shouldShowPopup(activity) {
    const { urlConditions, logicOperator } = activity;

    if (!urlConditions || urlConditions.length === 0) {
      return true; // No conditions = show everywhere
    }

    const results = urlConditions.map(condition => matchesCondition(getCurrentUrl(), condition));

    if (logicOperator === 'AND') {
      return results.every(result => result === true);
    } else {
      // OR (default)
      return results.some(result => result === true);
    }
  }

  /**
   * Fetch popup activities from API
   */
  async function fetchActivities() {
    // Check cache first
    if (cache.activities && cache.timestamp) {
      const age = Date.now() - cache.timestamp;
      if (age < CACHE_DURATION) {
        log('Using cached activities');
        return cache.activities;
      }
    }

    try {
      const url = `${config.apiUrl}/popups?projectId=${config.projectId}`;
      log('Fetching activities from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const activities = data.activities || [];

      // Update cache
      cache.activities = activities;
      cache.timestamp = Date.now();

      log('Fetched', activities.length, 'activities');
      return activities;
    } catch (err) {
      error('Failed to fetch activities:', err);
      return [];
    }
  }

  /**
   * Inject popup HTML into the page
   */
  function injectPopup(activity) {
    const popupId = `przio-popup-${activity._id}`;

    // Check if already injected
    if (injectedPopups.has(popupId)) {
      log('Popup already injected:', popupId);
      return;
    }

    try {
      // Parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(activity.html || '', 'text/html');

      // Extract style and popup element
      const styleEl = doc.querySelector('style');
      const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');

      if (!popupEl) {
        error('No popup element found in HTML for activity:', activity._id);
        return;
      }

      // Create container for popup
      const container = document.createElement('div');
      container.id = popupId;
      container.className = 'przio-popup-container';

      // Inject styles
      if (styleEl) {
        const styleClone = styleEl.cloneNode(true);
        container.appendChild(styleClone);
      }

      // Inject popup element
      const popupClone = popupEl.cloneNode(true);
      
      // Ensure popup has proper z-index and positioning
      const popupElement = popupClone;
      if (!popupElement.style.zIndex) {
        popupElement.style.zIndex = '999999';
      }
      if (!popupElement.style.position) {
        popupElement.style.position = 'fixed';
      }

      container.appendChild(popupElement);

      // Add animate.css if animation is set
      const animation = activity.popupSettings?.animation;
      if (animation) {
        // Check if animate.css is already loaded
        if (!document.querySelector('link[href*="animate.css"]')) {
          const animateLink = document.createElement('link');
          animateLink.rel = 'stylesheet';
          animateLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css';
          document.head.appendChild(animateLink);
        }

        // Add animation classes after a short delay to ensure CSS is loaded
        setTimeout(() => {
          popupElement.classList.add('animate__animated', animation);
        }, 100);
      }

      // Append to body
      document.body.appendChild(container);
      injectedPopups.add(popupId);

      log('Injected popup:', popupId);

      // Add close functionality if close button exists
      const closeButtons = container.querySelectorAll('[data-przio-close], .przio-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          container.remove();
          injectedPopups.delete(popupId);
        });
      });

      // Close on outside click if configured
      container.addEventListener('click', (e) => {
        if (e.target === container || e.target === popupElement) {
          // Check if close on outside click is enabled
          const closeOnOutside = activity.popupSettings?.closeOnOutsideClick;
          if (closeOnOutside) {
            container.remove();
            injectedPopups.delete(popupId);
          }
        }
      });

    } catch (err) {
      error('Failed to inject popup:', err);
    }
  }

  /**
   * Process and inject popups
   */
  async function processPopups() {
    if (!config.projectId) {
      error('Project ID is required');
      return;
    }

    const activities = await fetchActivities();

    for (const activity of activities) {
      if (shouldShowPopup(activity)) {
        log('Showing popup:', activity.name);
        injectPopup(activity);
      } else {
        log('Skipping popup (conditions not met):', activity.name);
      }
    }
  }

  /**
   * Initialize SDK
   */
  function init(options = {}) {
    // Merge config
    config = { ...config, ...options };

    // Get project ID from data attribute if not provided
    if (!config.projectId) {
      const script = document.querySelector('script[data-project-id]');
      if (script) {
        config.projectId = script.getAttribute('data-project-id');
      }
    }

    if (!config.projectId) {
      error('Project ID is required. Provide it via data-project-id attribute or init options.');
      return;
    }

    log('Initializing Przio SDK v' + SDK_VERSION, 'Project ID:', config.projectId);

    // Process popups when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processPopups);
    } else {
      processPopups();
    }

    // Re-check on URL changes (for SPA support)
    let lastUrl = getCurrentUrl();
    const checkUrlChange = () => {
      const currentUrl = getCurrentUrl();
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        log('URL changed, re-checking popups');
        // Clear injected popups and re-process
        injectedPopups.clear();
        processPopups();
      }
    };

    // Use MutationObserver for SPA navigation detection
    const observer = new MutationObserver(checkUrlChange);
    observer.observe(document.body, { childList: true, subtree: true });

    // Also check periodically (fallback)
    setInterval(checkUrlChange, 1000);
  }

  // Auto-initialize if script has data-project-id
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const script = document.querySelector('script[data-project-id]');
      if (script) {
        init();
      }
    });
  } else {
    const script = document.querySelector('script[data-project-id]');
    if (script) {
      init();
    }
  }

  // Expose API
  window.PrzioSDK = {
    init,
    processPopups,
    version: SDK_VERSION,
    config: () => config,
  };

})(window, document);

