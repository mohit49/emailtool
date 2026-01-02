/**
 * PRZIO Email SDK
 * Third-party integration SDK for sending emails via PRZIO
 * 
 * Usage:
 *   <script src="https://przio.com/przio-sdk.js"></script>
 *   <script>
 *     const przio = new PrzioSDK({
 *       apiKey: 'your-api-key',
 *       projectId: 'your-project-id',
 *       baseUrl: 'https://przio.com' // optional, defaults to current origin
 *     });
 *     
 *     przio.connect().then(() => {
 *       // Option 1: Use project defaults (templateId and smtpId from project settings)
 *       przio.sendEmail({
 *         recipients: ['email@example.com'],
 *         subject: 'Test Email',
 *         html: '<html><body><h1>Hello!</h1></body></html>'
 *       });
 *       
 *       // Option 2: Use specific template and SMTP
 *       przio.sendEmail({
 *         templateId: 'template-id',
 *         recipients: ['email@example.com'],
 *         subject: 'Test Email',
 *         smtpId: 'smtp-id'
 *       });
 *     });
 *   </script>
 */

(function(window) {
  'use strict';

  /**
   * PRZIO SDK Class
   */
  function PrzioSDK(config) {
    if (!config || !config.apiKey || !config.projectId) {
      throw new Error('PrzioSDK requires apiKey and projectId');
    }

    this.apiKey = config.apiKey;
    this.projectId = config.projectId;
    this.baseUrl = config.baseUrl || window.location.origin;
    this.connected = false;
  }

  /**
   * Connect to PRZIO API using API key
   */
  PrzioSDK.prototype.connect = function() {
    var self = this;
    
    return fetch(this.baseUrl + '/api/auth/api-key', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        apiKey: this.apiKey,
        projectId: this.projectId,
      }),
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'Connection failed');
        });
      }
      return response.json();
    })
    .then(function(data) {
      self.connected = true;
      // Token is stored in HTTP-only cookie automatically
      return data;
    })
    .catch(function(error) {
      self.connected = false;
      throw error;
    });
  };

  /**
   * Send email using template
   * 
   * @param {Object} options - Email options
   * @param {Array<string>} options.recipients - Array of recipient email addresses (required)
   * @param {string} options.subject - Email subject (required)
   * @param {string} [options.html] - HTML content (optional if templateId or default template is set)
   * @param {string} [options.templateId] - Template ID to use (optional, uses project default if not provided)
   * @param {string} [options.smtpId] - SMTP ID to use (optional, uses project default if not provided)
   * 
   * @returns {Promise} Promise that resolves with send result
   * 
   * @example
   * // Using project defaults (templateId and smtpId from project settings)
   * przio.sendEmail({
   *   recipients: ['user@example.com'],
   *   subject: 'Hello from my website',
   *   html: '<html><body><h1>Hello!</h1></body></html>'
   * });
   * 
   * @example
   * // Using specific template and SMTP
   * przio.sendEmail({
   *   recipients: ['user@example.com'],
   *   subject: 'Hello from my website',
   *   templateId: 'template-id-here',
   *   smtpId: 'smtp-id-here'
   * });
   */
  PrzioSDK.prototype.sendEmail = function(options) {
    if (!this.connected) {
      return Promise.reject(new Error('Not connected. Call connect() first.'));
    }

    if (!options || !options.recipients || !Array.isArray(options.recipients) || options.recipients.length === 0) {
      return Promise.reject(new Error('Recipients array is required'));
    }

    if (!options.subject) {
      return Promise.reject(new Error('Subject is required'));
    }

    // Either html or templateId must be provided, or project must have default template
    if (!options.html && !options.templateId) {
      return Promise.reject(new Error('Either html or templateId is required. Or set a default template in project settings.'));
    }

    return fetch(this.baseUrl + '/api/emails/send-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({
        templateId: options.templateId || null,
        html: options.html || null,
        subject: options.subject,
        smtpId: options.smtpId || null,
        recipients: options.recipients,
        projectId: this.projectId,
      }),
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'Failed to send email');
        });
      }
      return response.json();
    });
  };

  /**
   * Get email templates for the project
   */
  PrzioSDK.prototype.getTemplates = function() {
    if (!this.connected) {
      return Promise.reject(new Error('Not connected. Call connect() first.'));
    }

    return fetch(this.baseUrl + '/api/templates?projectId=' + this.projectId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'Failed to fetch templates');
        });
      }
      return response.json();
    });
  };

  /**
   * Get email history
   */
  PrzioSDK.prototype.getEmailHistory = function(options) {
    if (!this.connected) {
      return Promise.reject(new Error('Not connected. Call connect() first.'));
    }

    options = options || {};
    var params = new URLSearchParams({
      page: (options.page || 1).toString(),
      limit: (options.limit || 50).toString(),
    });

    if (options.status) {
      params.append('status', options.status);
    }

    return fetch(this.baseUrl + '/api/projects/' + this.projectId + '/emails?' + params.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
    .then(function(response) {
      if (!response.ok) {
        return response.json().then(function(err) {
          throw new Error(err.error || 'Failed to fetch email history');
        });
      }
      return response.json();
    });
  };

  /**
   * Check connection status
   */
  PrzioSDK.prototype.isConnected = function() {
    return this.connected;
  };

  /**
   * Disconnect (clear local state)
   * Note: Cookie will remain until it expires, but local connection state is cleared
   */
  PrzioSDK.prototype.disconnect = function() {
    this.connected = false;
  };

  // Export to window
  window.PrzioSDK = PrzioSDK;

  // Also support lowercase for convenience
  window.przioSDK = PrzioSDK;

})(window);

