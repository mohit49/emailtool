'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export default function ThirdPartyIntegrationPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const codeExamples = {
    basic: `<!-- Include PRZIO SDK -->
<script src="https://przio.com/przio-sdk.js"></script>

<script>
  // Initialize SDK
  const przio = new PrzioSDK({
    apiKey: 'przio_xxxxxxxxxxxxx',
    projectId: 'your-project-id-here',
    baseUrl: 'https://przio.com' // optional
  });

  // Connect to PRZIO
  przio.connect()
    .then(() => {
      console.log('Connected to PRZIO!');
      
      // Send email using project defaults
      return przio.sendEmail({
        recipients: ['user@example.com'],
        subject: 'Hello from my website',
        html: '<html><body><h1>Hello!</h1><p>This is a test email.</p></body></html>'
      });
    })
    .then(result => {
      console.log('Email sent successfully!', result);
    })
    .catch(error => {
      console.error('Error:', error);
    });
</script>`,
    
    withTemplate: `// Using a specific template
przio.connect().then(() => {
  return przio.sendEmail({
    recipients: ['user@example.com'],
    subject: 'Welcome Email',
    templateId: 'your-template-id', // Uses this template
    // smtpId is optional - uses project default if not provided
  });
});`,
    
    asyncAwait: `// Using async/await
async function sendWelcomeEmail() {
  try {
    await przio.connect();
    
    const result = await przio.sendEmail({
      recipients: ['user@example.com', 'admin@example.com'],
      subject: 'Welcome to our service',
      html: '<html><body><h1>Welcome!</h1></body></html>'
    });
    
    console.log('Emails sent:', result.sent);
    console.log('Failed:', result.failed);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

sendWelcomeEmail();`,
    
    getTemplates: `// Get available templates
przio.connect().then(() => {
  return przio.getTemplates();
}).then(templates => {
  console.log('Available templates:', templates.templates);
  // Use template._id in sendEmail()
});`,
    
    getHistory: `// Get email history
przio.connect().then(() => {
  return przio.getEmailHistory({
    page: 1,
    limit: 10,
    status: 'success' // optional: 'pending', 'sent', 'failed', 'success'
  });
}).then(history => {
  console.log('Email history:', history.emailHistory);
  console.log('Stats:', history.stats);
});`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Third-Party Integration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate PRZIO email sending capabilities into your website or application using our JavaScript SDK
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Get Your API Key</h3>
                <p className="text-gray-600">
                  Go to your project settings and generate an API key. Only project owners and Project Admins can create API keys.
                </p>
                <Link 
                  href="/projects" 
                  className="text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block"
                >
                  Go to Projects →
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Set Project Defaults (Optional)</h3>
                <p className="text-gray-600">
                  Configure a default template and SMTP in your project settings. This allows you to send emails without specifying templateId and smtpId each time.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Include the SDK</h3>
                <p className="text-gray-600 mb-2">
                  Add the PRZIO SDK script to your HTML page:
                </p>
                <div className="bg-gray-900 rounded-lg p-4 relative">
                  <code className="text-green-400 text-sm">
                    {'<script src="https://przio.com/przio-sdk.js"></script>'}
                  </code>
                  <button
                    onClick={() => copyToClipboard('<script src="https://przio.com/przio-sdk.js"></script>', 'sdk-script')}
                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                    title="Copy code"
                  >
                    {copiedCode === 'sdk-script' ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Initialize and Send</h3>
                <p className="text-gray-600">
                  Initialize the SDK with your API key and project ID, then start sending emails!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <div className="space-y-8">
          {/* Basic Example */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Basic Integration</h2>
              <button
                onClick={() => copyToClipboard(codeExamples.basic, 'basic')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {copiedCode === 'basic' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              This example shows the simplest way to send an email using project defaults for template and SMTP.
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{codeExamples.basic}</code>
              </pre>
            </div>
          </div>

          {/* Using Template */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Using a Specific Template</h2>
              <button
                onClick={() => copyToClipboard(codeExamples.withTemplate, 'template')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {copiedCode === 'template' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Use a specific template from your project. The SMTP will use the project default if not specified.
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{codeExamples.withTemplate}</code>
              </pre>
            </div>
          </div>

          {/* Async/Await Example */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Using Async/Await</h2>
              <button
                onClick={() => copyToClipboard(codeExamples.asyncAwait, 'async')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {copiedCode === 'async' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Modern JavaScript async/await syntax for cleaner code.
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{codeExamples.asyncAwait}</code>
              </pre>
            </div>
          </div>

          {/* Get Templates */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Get Available Templates</h2>
              <button
                onClick={() => copyToClipboard(codeExamples.getTemplates, 'templates')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {copiedCode === 'templates' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Fetch all available templates for your project to use in sendEmail().
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{codeExamples.getTemplates}</code>
              </pre>
            </div>
          </div>

          {/* Get History */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Get Email History</h2>
              <button
                onClick={() => copyToClipboard(codeExamples.getHistory, 'history')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                {copiedCode === 'history' ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Retrieve email sending history with pagination and status filtering.
            </p>
            <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{codeExamples.getHistory}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">API Reference</h2>
          
          <div className="space-y-6">
            {/* Constructor */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Constructor</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  new PrzioSDK(config)
                </code>
              </div>
              <div className="ml-4 space-y-2">
                <p className="text-gray-600"><strong>config.apiKey</strong> (required) - Your project API key</p>
                <p className="text-gray-600"><strong>config.projectId</strong> (required) - Your project ID</p>
                <p className="text-gray-600"><strong>config.baseUrl</strong> (optional) - PRZIO API base URL, defaults to current origin</p>
              </div>
            </div>

            {/* connect() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">connect()</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.connect() → Promise
                </code>
              </div>
              <p className="text-gray-600 ml-4">
                Authenticates with PRZIO using your API key and project ID. Sets an HTTP-only cookie for subsequent API calls. Must be called before using other methods.
              </p>
            </div>

            {/* sendEmail() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">sendEmail(options)</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.sendEmail(options) → Promise
                </code>
              </div>
              <div className="ml-4 space-y-2">
                <p className="text-gray-600"><strong>options.recipients</strong> (required) - Array of email addresses</p>
                <p className="text-gray-600"><strong>options.subject</strong> (required) - Email subject line</p>
                <p className="text-gray-600"><strong>options.html</strong> (optional) - HTML email content. Required if templateId not provided and no default template set.</p>
                <p className="text-gray-600"><strong>options.templateId</strong> (optional) - Template ID to use. Uses project default if not provided.</p>
                <p className="text-gray-600"><strong>options.smtpId</strong> (optional) - SMTP configuration ID. Uses project default if not provided.</p>
              </div>
            </div>

            {/* getTemplates() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">getTemplates()</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.getTemplates() → Promise
                </code>
              </div>
              <p className="text-gray-600 ml-4">
                Returns all available email templates for the project.
              </p>
            </div>

            {/* getEmailHistory() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">getEmailHistory(options)</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.getEmailHistory(options) → Promise
                </code>
              </div>
              <div className="ml-4 space-y-2">
                <p className="text-gray-600"><strong>options.page</strong> (optional) - Page number, defaults to 1</p>
                <p className="text-gray-600"><strong>options.limit</strong> (optional) - Items per page, defaults to 50</p>
                <p className="text-gray-600"><strong>options.status</strong> (optional) - Filter by status: &apos;pending&apos;, &apos;sent&apos;, &apos;failed&apos;, &apos;success&apos;</p>
              </div>
            </div>

            {/* isConnected() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">isConnected()</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.isConnected() → Boolean
                </code>
              </div>
              <p className="text-gray-600 ml-4">
                Returns true if connected to PRZIO API, false otherwise.
              </p>
            </div>

            {/* disconnect() */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">disconnect()</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-2">
                <code className="text-sm text-gray-800">
                  przio.disconnect()
                </code>
              </div>
              <p className="text-gray-600 ml-4">
                Clears local connection state. Note: Cookie remains until it expires.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Best Practices */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Security & Best Practices</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Never expose your API key</strong> in client-side code that&apos;s publicly accessible. For public websites, consider using a backend proxy.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Set project defaults</strong> for template and SMTP to simplify your integration code.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Handle errors gracefully</strong> - Always use try/catch or .catch() when calling SDK methods.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Validate email addresses</strong> on your end before sending to ensure better deliverability.</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span><strong>Monitor email history</strong> regularly to track delivery rates and identify issues.</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mt-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to Integrate?</h2>
          <p className="text-lg mb-6 opacity-90">
            Get your API key from your project settings and start sending emails today!
          </p>
          <Link
            href="/projects"
            className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Go to Projects
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

