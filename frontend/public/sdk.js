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

  /**
   * Check if SDK is running in an iframe within a preview page
   * This prevents popups from showing in preview/split mode
   */
  function isInPreviewIframe() {
    try {
      // Check for preview query parameter (most reliable method)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('przio-preview') === 'true') {
        return true;
      }

      // Check if running in an iframe
      if (window.self === window.top) {
        return false; // Not in an iframe
      }

      // Try to access parent window URL to check if it's a preview page
      try {
        const parentUrl = window.top.location.href;
        // Check for popup preview pages
        if (parentUrl.includes('/popups/') || 
            parentUrl.includes('/preview/') ||
            parentUrl.includes('/tool')) {
          return true;
        }
      } catch (e) {
        // Cross-origin iframe - can't access parent
        // Check referrer as fallback (might be set by preview page)
        const referrer = document.referrer;
        if (referrer && (referrer.includes('/popups/') || 
                         referrer.includes('/preview/') ||
                         referrer.includes('/tool'))) {
          return true;
        }
        // If cross-origin and no referrer match, allow SDK to run
        // (might be legitimate embedding)
        return false;
      }

      return false;
    } catch (e) {
      // Error accessing window properties - allow SDK to run
      return false;
    }
  }

  // If in preview iframe, disable SDK completely
  if (isInPreviewIframe()) {
    // Expose a minimal API that does nothing
    window.PrzioSDK = {
      init: function() {
        console.log('[PrzioSDK] SDK disabled in preview iframe');
      },
      processPopups: function() {},
      version: SDK_VERSION,
      config: function() { return {}; },
    };
    // Exit early - don't initialize anything
    return;
  }

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
   * Cookie utility functions
   */
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Session storage utility functions
   */
  function setSessionStorage(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch (e) {
      log('SessionStorage not available:', e);
    }
  }

  function getSessionStorage(key) {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      log('SessionStorage not available:', e);
      return null;
    }
  }

  /**
   * Check if popup was closed (cookie or session based)
   */
  function wasPopupClosed(activity) {
    const popupId = activity._id;
    const cookieEnabled = activity.popupSettings?.cookieEnabled;
    const sessionEnabled = activity.popupSettings?.sessionEnabled;

    if (cookieEnabled) {
      const cookieName = `przio-popup-closed-${popupId}`;
      if (getCookie(cookieName) !== null) {
        return true;
      }
    }
    
    if (sessionEnabled) {
      const sessionKey = `przio-popup-closed-${popupId}`;
      if (getSessionStorage(sessionKey) !== null) {
        return true;
      }
    }

    return false;
  }

  /**
   * Mark popup as closed (save to cookie or session)
   */
  function markPopupAsClosed(activity) {
    const popupId = activity._id;
    const cookieEnabled = activity.popupSettings?.cookieEnabled;
    const sessionEnabled = activity.popupSettings?.sessionEnabled;
    const cookieExpiry = activity.popupSettings?.cookieExpiry || 30; // Default 30 days

    if (cookieEnabled) {
      const cookieName = `przio-popup-closed-${popupId}`;
      setCookie(cookieName, 'true', cookieExpiry);
      log('Popup closed, saved to cookie:', cookieName);
    }
    
    if (sessionEnabled) {
      const sessionKey = `przio-popup-closed-${popupId}`;
      setSessionStorage(sessionKey, 'true');
      log('Popup closed, saved to session:', sessionKey);
    }
  }

  /**
   * Check if element exists in DOM
   */
  function waitForElement(selector, callback, timeout = 30000) {
    const element = document.querySelector(selector);
    if (element) {
      callback(element);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        callback(element);
      }
    });

    // Only observe if document.body exists, otherwise use document.documentElement
    const targetNode = document.body || document.documentElement;
    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true
      });

      // Timeout after specified time
      setTimeout(() => {
        observer.disconnect();
        log('Element not found within timeout:', selector);
      }, timeout);
    } else {
      // If neither body nor documentElement exists, just use timeout
      setTimeout(() => {
        const element = document.querySelector(selector);
        if (element) {
          callback(element);
        } else {
          log('Element not found within timeout:', selector);
        }
      }, timeout);
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
   * Check trigger conditions for popup
   */
  function checkTrigger(activity, callback) {
    const trigger = activity.popupSettings?.trigger || 'pageLoad';
    const cookieEnabled = activity.popupSettings?.cookieEnabled;
    const sessionEnabled = activity.popupSettings?.sessionEnabled;

    // Check if popup was already closed (cookie/session) - works with any trigger
    if (cookieEnabled || sessionEnabled) {
      if (wasPopupClosed(activity)) {
        log('Popup was closed previously, skipping:', activity.name);
        return;
      }
    }

    switch (trigger) {
      case 'pageLoad':
        // Show immediately
        callback();
        break;

      case 'timeout':
        const timeout = activity.popupSettings?.timeout || 3000; // Default 3 seconds
        setTimeout(() => {
          callback();
        }, timeout);
        break;

      case 'elementExists':
        const selector = activity.popupSettings?.elementSelector;
        if (!selector) {
          error('Element selector required for elementExists trigger');
          return;
        }
        waitForElement(selector, () => {
          log('Element found, showing popup:', selector);
          callback();
        });
        break;

      case 'scrollPercentage':
        setupScrollPercentage(activity, callback);
        break;

      case 'exitIntent':
        setupExitIntent(activity, callback);
        break;

      default:
        // Default to pageLoad
        callback();
    }
  }

  /**
   * Setup scroll percentage detection
   */
  function setupScrollPercentage(activity, callback) {
    const scrollPercentage = activity.popupSettings?.scrollPercentage || 50;
    let hasShown = false;

    const checkScroll = () => {
      if (hasShown) return;

      // Calculate scroll percentage
      const windowHeight = window.innerHeight;
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
      );
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollableHeight = documentHeight - windowHeight;
      const currentScrollPercentage = scrollableHeight > 0 
        ? Math.round((scrollTop / scrollableHeight) * 100)
        : 0;

      if (currentScrollPercentage >= scrollPercentage) {
        log(`Scroll percentage reached: ${currentScrollPercentage}% >= ${scrollPercentage}%`);
        hasShown = true;
        callback();
        // Remove scroll listener after showing
        window.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };

    // Check immediately in case page is already scrolled
    checkScroll();

    // Listen for scroll events
    window.addEventListener('scroll', checkScroll, { passive: true });
    // Also listen for resize in case content height changes
    window.addEventListener('resize', checkScroll);
  }

  /**
   * Setup exit intent detection with inactivity timeout
   */
  function setupExitIntent(activity, callback) {
    const inactivityTimeout = (activity.popupSettings?.inactivityTimeout || 30) * 1000; // Convert to milliseconds
    let inactivityTimer = null;
    let mouseLeaveTimer = null;
    let hasShown = false;

    // Track user activity
    const resetInactivityTimer = () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      inactivityTimer = setTimeout(() => {
        if (!hasShown) {
          log('User inactive, showing exit intent popup');
          hasShown = true;
          callback();
          // Clean up listeners after showing
          document.removeEventListener('mousemove', resetInactivityTimer);
          document.removeEventListener('keypress', resetInactivityTimer);
          document.removeEventListener('scroll', resetInactivityTimer);
          document.removeEventListener('click', resetInactivityTimer);
          document.removeEventListener('mouseleave', handleMouseLeave);
        }
      }, inactivityTimeout);
    };

    // Handle mouse leave (traditional exit intent)
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        // Mouse left the top of the window
        log('Exit intent detected (mouse leave)');
        hasShown = true;
        callback();
        // Clean up
        document.removeEventListener('mousemove', resetInactivityTimer);
        document.removeEventListener('keypress', resetInactivityTimer);
        document.removeEventListener('scroll', resetInactivityTimer);
        document.removeEventListener('click', resetInactivityTimer);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Start inactivity timer
    resetInactivityTimer();

    // Listen for user activity
    document.addEventListener('mousemove', resetInactivityTimer);
    document.addEventListener('keypress', resetInactivityTimer);
    document.addEventListener('scroll', resetInactivityTimer);
    document.addEventListener('click', resetInactivityTimer);
    document.addEventListener('mouseleave', handleMouseLeave);
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

      // Extract style, custom CSS, custom JS, form scripts, and popup element
      const styleEl = doc.querySelector('style:not([data-custom-css])');
      const customStyleEl = doc.querySelector('style[data-custom-css]');
      const customScriptEl = doc.querySelector('script[data-custom-js]');
      // Get all scripts (including form submission scripts)
      const allScripts = doc.querySelectorAll('script');
      const popupEl = doc.querySelector('.przio') || doc.querySelector('.przio-popup');

      if (!popupEl) {
        error('No popup element found in HTML for activity:', activity._id);
        return;
      }

      // Create container for popup
      const container = document.createElement('div');
      container.id = popupId;
      container.className = 'przio-popup-container';

      // Inject main styles
      if (styleEl) {
        const styleClone = styleEl.cloneNode(true);
        container.appendChild(styleClone);
      }

      // Inject custom CSS
      if (customStyleEl) {
        const customStyleClone = customStyleEl.cloneNode(true);
        container.appendChild(customStyleClone);
      }

      // Inject popup element
      const popupClone = popupEl.cloneNode(true);
      
      // Extract scripts from popup element before appending (scripts won't execute when cloned)
      const scriptsInPopup = popupClone.querySelectorAll('script');
      const scriptsToExecute = [];
      scriptsInPopup.forEach(scriptEl => {
        if (scriptEl.textContent.trim()) {
          scriptsToExecute.push(scriptEl.textContent);
          // Remove script from clone (we'll execute it separately)
          scriptEl.remove();
        }
      });
      
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

      // Append to body first so computed styles work correctly
      document.body.appendChild(container);

      // Helper function to add close button
      const addCloseButton = () => {
        // Ensure popup element has non-static position for close button absolute positioning
        const computedStyle = window.getComputedStyle(popupElement);
        if (computedStyle.position === 'static') {
          popupElement.style.position = 'relative';
        }

        // Create close icon button
        const closeButton = document.createElement('button');
        closeButton.className = 'przio-close';
        closeButton.setAttribute('data-przio-close', 'true');
        closeButton.setAttribute('aria-label', 'Close popup');
        
        const buttonSize = activity.popupSettings?.closeButtonSize || '32px';
        const closeButtonColor = activity.popupSettings?.closeButtonColor || '#666666';
        const closeButtonPosition = activity.popupSettings?.closeButtonPosition || 'top-right';
        
        // Calculate position based on setting
        let positionStyles = '';
        switch (closeButtonPosition) {
          case 'top-left':
            positionStyles = 'top: 8px; left: 8px;';
            break;
          case 'top-right':
            positionStyles = 'top: 8px; right: 8px;';
            break;
          case 'bottom-left':
            positionStyles = 'bottom: 8px; left: 8px;';
            break;
          case 'bottom-right':
            positionStyles = 'bottom: 8px; right: 8px;';
            break;
          default:
            positionStyles = 'top: 8px; right: 8px;';
        }
        
        closeButton.style.cssText = `
          position: absolute;
          ${positionStyles}
          width: ${buttonSize};
          height: ${buttonSize};
          min-width: ${buttonSize};
          min-height: ${buttonSize};
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 1000000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          outline: none;
        `;

        // Create SVG close icon (X)
        closeButton.innerHTML = `
          <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="${closeButtonColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        `;

        // Add hover effect
        closeButton.addEventListener('mouseenter', function() {
          this.style.opacity = '0.7';
          this.style.transform = 'scale(1.1)';
        });
        closeButton.addEventListener('mouseleave', function() {
          this.style.opacity = '1';
          this.style.transform = 'scale(1)';
        });

        // Insert close button into popup element
        popupElement.appendChild(closeButton);
      };

      // Add close icon if showCloseButton is enabled
      const showCloseButton = activity.popupSettings?.showCloseButton !== false; // Default to true if not specified
      if (showCloseButton) {
        // Check if close button already exists in the HTML
        const existingCloseButton = popupElement.querySelector('[data-przio-close], .przio-close');
        
        if (!existingCloseButton) {
          // Use requestAnimationFrame to ensure element is in DOM before checking computed styles
          requestAnimationFrame(() => {
            addCloseButton();
          });
        }
      }
      injectedPopups.add(popupId);

      log('Injected popup:', popupId);

      // Add close functionality if close button exists
      const closeButtons = container.querySelectorAll('[data-przio-close], .przio-close');
      closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          container.remove();
          injectedPopups.delete(popupId);
          // Mark popup as closed if using cookie or session trigger
          markPopupAsClosed(activity);
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

      // Inject and execute all scripts (custom JS and form scripts)
      // Execute scripts after popup is in DOM so form selectors work
      // Use requestAnimationFrame to ensure DOM is ready, then add a small delay
      requestAnimationFrame(() => {
        setTimeout(() => {
        // Execute custom JavaScript
        if (customScriptEl) {
          const customScriptClone = customScriptEl.cloneNode(true);
          const script = document.createElement('script');
          script.textContent = customScriptClone.textContent || '';
          document.head.appendChild(script);
          // Remove after execution to avoid duplicates
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 0);
        }

        // Execute scripts extracted from popup element (form submission scripts, etc.)
        log('Executing', scriptsToExecute.length, 'scripts from popup');
        scriptsToExecute.forEach((scriptContent, index) => {
          log('Executing script', index + 1, 'of', scriptsToExecute.length);
          const script = document.createElement('script');
          script.textContent = scriptContent;
          // Add error handler
          script.onerror = function(err) {
            error('Script execution error:', err);
          };
          document.head.appendChild(script);
          
          // Remove after execution
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 100); // Increased delay to ensure script executes
        });

        // Initialize form handlers for any forms in the popup
        initializeFormHandlers(container);

        // Execute any other scripts from document head (if any)
        allScripts.forEach((scriptEl) => {
          // Skip custom-js scripts (already handled above), scripts in popup (handled above), and empty scripts
          if (scriptEl.hasAttribute('data-custom-js') || 
              popupEl.contains(scriptEl) || 
              !scriptEl.textContent.trim()) {
            return;
          }

          // Create and execute script
          const script = document.createElement('script');
          script.textContent = scriptEl.textContent || '';
          document.head.appendChild(script);
          
          // Remove after execution
          setTimeout(() => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          }, 0);
        });
        }, 200); // Delay to ensure popup is fully rendered
      });

    } catch (err) {
      error('Failed to inject popup:', err);
    }
  }

  /**
   * Initialize form validation and submission handlers
   */
  function initializeFormHandlers(container) {
    const forms = container.querySelectorAll('form.przio-form[data-form-id]');
    
    forms.forEach((form) => {
      const formId = form.getAttribute('data-form-id');
      const fieldsJson = form.getAttribute('data-form-fields');
      
      if (!formId || !fieldsJson) {
        log('Form missing formId or fields data:', formId);
        return;
      }
      
      let formFields;
      try {
        formFields = JSON.parse(fieldsJson);
      } catch (e) {
        error('Failed to parse form fields:', e);
        return;
      }
      
      log('Initializing form handler for:', formId);
      
      // Get submit button
      const submitButton = form.querySelector('button.przio-form-submit-btn');
      if (!submitButton) {
        log('Submit button not found for form:', formId);
        return;
      }
      
      // Validation function
      function validateForm() {
        const errors = [];
        let hasErrors = false;
        
        for (let i = 0; i < formFields.length; i++) {
          const field = formFields[i];
          const fieldEl = form.querySelector('[name="' + field.name + '"]');
          const errorEl = document.getElementById('error-field-' + field.id);
          
          if (!fieldEl) continue;
          
          let value = '';
          
          // Get value based on field type
          if (field.type === 'radio') {
            const radios = form.querySelectorAll('[name="' + field.name + '"]');
            for (let j = 0; j < radios.length; j++) {
              if (radios[j].checked) {
                value = radios[j].value;
                break;
              }
            }
          } else if (field.type === 'checkbox') {
            const checkboxes = form.querySelectorAll('[name="' + field.name + '[]"]');
            const checked = [];
            for (let j = 0; j < checkboxes.length; j++) {
              if (checkboxes[j].checked) {
                checked.push(checkboxes[j].value);
              }
            }
            value = checked;
          } else {
            value = fieldEl.value ? fieldEl.value.trim() : '';
          }
          
          // Clear previous errors
          if (errorEl) {
            errorEl.style.display = 'none';
          }
          if (fieldEl) {
            fieldEl.style.borderColor = '#d1d5db';
            fieldEl.style.borderWidth = '1px';
          }
          
          // Check if value is empty
          const isEmpty = !value || 
                          (Array.isArray(value) && value.length === 0) || 
                          (typeof value === 'string' && value.trim() === '');
          
          // Validate required fields
          if (field.required && isEmpty) {
            hasErrors = true;
            const msg = field.label + ' is required';
            errors.push({ field: field.id, message: msg });
            if (errorEl) {
              errorEl.textContent = msg;
              errorEl.style.display = 'block';
            }
            if (fieldEl) {
              fieldEl.style.borderColor = '#ef4444';
              fieldEl.style.borderWidth = '2px';
            }
          } else if (value && !isEmpty) {
            // Validate field types
            if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              hasErrors = true;
              const msg = 'Please enter a valid email address';
              errors.push({ field: field.id, message: msg });
              if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
              }
              if (fieldEl) {
                fieldEl.style.borderColor = '#ef4444';
                fieldEl.style.borderWidth = '2px';
              }
            } else if (field.type === 'number' && isNaN(value)) {
              hasErrors = true;
              const msg = 'Please enter a valid number';
              errors.push({ field: field.id, message: msg });
              if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
              }
              if (fieldEl) {
                fieldEl.style.borderColor = '#ef4444';
                fieldEl.style.borderWidth = '2px';
              }
            } else if (field.type === 'url' && !/^https?:\/\/.+/.test(value)) {
              hasErrors = true;
              const msg = 'Please enter a valid URL (starting with http:// or https://)';
              errors.push({ field: field.id, message: msg });
              if (errorEl) {
                errorEl.textContent = msg;
                errorEl.style.display = 'block';
              }
              if (fieldEl) {
                fieldEl.style.borderColor = '#ef4444';
                fieldEl.style.borderWidth = '2px';
              }
            }
          }
        }
        
        // Scroll to first error
        if (hasErrors && errors.length > 0) {
          const firstError = document.getElementById('error-field-' + errors[0].field);
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
        
        return !hasErrors;
      }
      
      // Get API URL
      function getPrzioApiUrl() {
        const sdkScript = document.querySelector('script[src*="sdk.js"], script[src*="przio"]');
        if (sdkScript && sdkScript.src) {
          try {
            const a = document.createElement('a');
            let srcUrl = sdkScript.src;
            if (srcUrl.indexOf('://') === -1) {
              srcUrl = window.location.protocol + '//' + window.location.host + srcUrl;
            }
            a.href = srcUrl;
            const origin = a.protocol + '//' + a.host;
            return origin + '/api/forms/submit';
          } catch (e) {
            error('Error parsing SDK URL:', e);
          }
        }
        return window.location.origin + '/api/forms/submit';
      }
      
      // Handle form submission
      async function handleSubmit(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        
        // Validate form
        if (!validateForm()) {
          log('Form validation failed for:', formId);
          return;
        }
        
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        // Collect form data
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
          if (data[key]) {
            if (Array.isArray(data[key])) {
              data[key].push(value);
            } else {
              data[key] = [data[key], value];
            }
          } else {
            data[key] = value;
          }
        }
        
        try {
          const apiUrl = getPrzioApiUrl();
          log('Submitting form to:', apiUrl, 'Form ID:', formId);
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formId: formId, data: data })
          });
          
          const result = await response.json();
          
          if (response.ok) {
            submitButton.textContent = 'Submitted!';
            submitButton.style.background = 'linear-gradient(90deg,#10b981,#059669)';
            
            setTimeout(() => {
              submitButton.disabled = false;
              submitButton.textContent = originalText;
              submitButton.style.background = 'linear-gradient(90deg,#4f46e5,#0ea5e9)';
              form.reset();
              
              // Clear all error messages and reset borders
              const allErrors = form.querySelectorAll('.form-error');
              for (let k = 0; k < allErrors.length; k++) {
                allErrors[k].style.display = 'none';
              }
              const allInputs = form.querySelectorAll('input,textarea,select');
              for (let k = 0; k < allInputs.length; k++) {
                allInputs[k].style.borderColor = '#d1d5db';
                allInputs[k].style.borderWidth = '1px';
              }
            }, 2000);
          } else {
            throw new Error(result.error || 'Submission failed');
          }
        } catch (err) {
          error('Form submission error:', err);
          submitButton.textContent = 'Error - Try Again';
          submitButton.style.background = 'linear-gradient(90deg,#ef4444,#dc2626)';
          
          setTimeout(() => {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            submitButton.style.background = 'linear-gradient(90deg,#4f46e5,#0ea5e9)';
          }, 3000);
        }
      }
      
      // Attach event handlers
      form.addEventListener('submit', handleSubmit);
      submitButton.addEventListener('click', handleSubmit);
      
      log('Form handler attached for:', formId);
    });
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
      // First check URL conditions
      if (!shouldShowPopup(activity)) {
        log('Skipping popup (URL conditions not met):', activity.name);
        continue;
      }

      // Then check trigger conditions
      checkTrigger(activity, () => {
        log('Showing popup:', activity.name);
        injectPopup(activity);
      });
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
    // Only observe if document.body exists
    if (document.body) {
      const observer = new MutationObserver(checkUrlChange);
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      // If body doesn't exist yet, wait for it
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            const observer = new MutationObserver(checkUrlChange);
            observer.observe(document.body, { childList: true, subtree: true });
          }
        });
      }
    }

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

