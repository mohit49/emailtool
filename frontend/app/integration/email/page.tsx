'use client';

import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Code, Mail, Settings, Key, Play } from 'lucide-react';

export default function EmailIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/integration" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Integration Guide
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-6 mx-auto">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Email Integration
            </span>
            <br />
            Complete Tutorial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to integrate <strong>PRZIO email testing</strong> and <strong>bulk email sending</strong> into your application. 
            Send <strong>transactional emails</strong>, <strong>marketing campaigns</strong>, and test <strong>email templates</strong> with ease.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">1.</span>
              <span>Create Your PRZIO Account & Project</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">2.</span>
              <span>Configure SMTP Settings</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">3.</span>
              <span>Generate API Key</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">4.</span>
              <span>Install PRZIO Email SDK</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">5.</span>
              <span>Initialize Email SDK</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">6.</span>
              <span>Send Your First Email</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-indigo-600">7.</span>
              <span>Advanced Email Features</span>
            </li>
          </ol>
        </div>

        {/* Step 1: Create Account & Project */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Your PRZIO Account & Project</h2>
              <p className="text-gray-600 mt-1">Get started with <strong>PRZIO email testing</strong> platform</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 1.1: Sign Up for PRZIO</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Visit the <strong>PRZIO signup page</strong> at <code className="bg-gray-100 px-2 py-1 rounded">/signup</code></li>
                <li>Enter your <strong>email address</strong> and create a <strong>password</strong></li>
                <li>Verify your email address by clicking the link sent to your inbox</li>
                <li>Complete your profile setup</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> PRZIO Signup Page
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the signup form with email and password fields
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 1.2: Create a New Project</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>After logging in, click on <strong>&quot;Create New Project&quot;</strong> button</li>
                <li>Enter a <strong>project name</strong> (e.g., &quot;My Website Emails&quot;)</li>
                <li>Add a <strong>project description</strong> (optional)</li>
                <li>Click <strong>&quot;Create Project&quot;</strong> to proceed</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Create Project Dialog
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the project creation form with name and description fields
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro Tip:</strong> Keep your <strong>Project ID</strong> handy - you&apos;ll need it for <strong>email integration</strong>. 
                You can find it in the project settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Configure SMTP Settings */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Configure SMTP Settings</h2>
              <p className="text-gray-600 mt-1">Set up your <strong>email sending</strong> configuration</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.1: Access Email Settings</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Navigate to your <strong>project dashboard</strong></li>
                <li>Click on <strong>&quot;Email Settings&quot;</strong> in the sidebar</li>
                <li>Select <strong>&quot;SMTP Configuration&quot;</strong> tab</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Email Settings Page
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the email settings page with SMTP configuration options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.2: Add SMTP Configuration</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click <strong>&quot;Add SMTP Configuration&quot;</strong> button</li>
                <li>Enter your <strong>SMTP host</strong> (e.g., <code className="bg-gray-100 px-2 py-1 rounded">smtp.gmail.com</code>)</li>
                <li>Enter your <strong>SMTP port</strong> (typically <code className="bg-gray-100 px-2 py-1 rounded">587</code> for TLS or <code className="bg-gray-100 px-2 py-1 rounded">465</code> for SSL)</li>
                <li>Enter your <strong>SMTP username</strong> (your email address)</li>
                <li>Enter your <strong>SMTP password</strong> (app password for Gmail)</li>
                <li>Set the <strong>from email address</strong></li>
                <li>Click <strong>&quot;Save Configuration&quot;</strong></li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> SMTP Configuration Form
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the SMTP form with all fields filled in
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.3: Test SMTP Connection</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click <strong>&quot;Send Test Email&quot;</strong> button</li>
                <li>Enter a test email address</li>
                <li>Click <strong>&quot;Send&quot;</strong> and verify you receive the test email</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Test Email Dialog
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the test email success message
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> For <strong>Gmail</strong>, you need to generate an <strong>App Password</strong> instead of using your regular password. 
                Enable 2-Step Verification and generate an app password from your Google Account settings.
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Generate API Key */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">3</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Generate API Key</h2>
              <p className="text-gray-600 mt-1">Create an <strong>API key</strong> for <strong>email integration</strong></p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.1: Navigate to API Settings</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Go to your <strong>project settings</strong></li>
                <li>Click on <strong>&quot;API Keys&quot;</strong> tab</li>
                <li>Review the <strong>API integration</strong> documentation</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> API Keys Page
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the API keys management page
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.2: Create New API Key</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click <strong>&quot;Generate New API Key&quot;</strong> button</li>
                <li>Enter a <strong>name</strong> for your API key (e.g., &quot;Website Integration&quot;)</li>
                <li>Select <strong>permissions</strong> (Email Send, Email Read, etc.)</li>
                <li>Click <strong>&quot;Generate&quot;</strong></li>
                <li><strong>Copy and save</strong> your API key immediately (you won&apos;t be able to see it again)</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> API Key Generation Dialog
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the generated API key with copy button
                </p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-800">
                <strong>🔒 Security Warning:</strong> Never share your <strong>API key</strong> publicly or commit it to version control. 
                Store it securely in environment variables or a secure configuration file.
              </p>
            </div>
          </div>
        </div>

        {/* Step 4: Install SDK */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">4</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Install PRZIO Email SDK</h2>
              <p className="text-gray-600 mt-1">Add the <strong>PRZIO email SDK</strong> to your website</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.1: Include SDK Script</h3>
              <p className="text-gray-700 mb-4">
                Add the <strong>PRZIO email SDK</strong> script to your HTML page. You can include it in the <code className="bg-gray-100 px-2 py-1 rounded">&lt;head&gt;</code> or before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag.
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://przio.com/sdk.js"></script>`}
                </code>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> HTML Code with SDK Script
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing HTML file with the SDK script tag included
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Alternative: NPM Installation</h3>
              <p className="text-gray-700 mb-4">
                For <strong>Node.js</strong> projects, you can install via npm:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  npm install @przio/sdk
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Initialize SDK */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">5</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Initialize Email SDK</h2>
              <p className="text-gray-600 mt-1">Connect to <strong>PRZIO email service</strong> using your API key</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 5.1: Create SDK Instance</h3>
              <p className="text-gray-700 mb-4">
                Initialize the <strong>PRZIO Email SDK</strong> with your <strong>API key</strong> and <strong>project ID</strong>:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`const przio = new PrzioSDK.Email({
  apiKey: 'your-api-key-here',
  projectId: 'your-project-id-here',
  baseUrl: 'https://przio.com' // optional
});`}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> JavaScript Code Initialization
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the initialization code in a code editor
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 5.2: Connect to PRZIO</h3>
              <p className="text-gray-700 mb-4">
                Connect to the <strong>PRZIO API</strong> using the <strong>connect()</strong> method:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.connect()
  .then(() => {
    console.log('Connected to PRZIO!');
    // Ready to send emails
  })
  .catch(error => {
    console.error('Connection failed:', error);
  });`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Step 6: Send First Email */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">6</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Send Your First Email</h2>
              <p className="text-gray-600 mt-1">Send <strong>transactional emails</strong> or <strong>marketing emails</strong></p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.1: Send Simple Email</h3>
              <p className="text-gray-700 mb-4">
                Send an email with <strong>HTML content</strong>:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.sendEmail({
  recipients: ['user@example.com'],
  subject: 'Welcome to Our Service!',
  html: '<html><body><h1>Hello!</h1><p>Welcome to our platform.</p></body></html>'
})
.then(result => {
  console.log('Email sent successfully!', result);
})
.catch(error => {
  console.error('Failed to send email:', error);
});`}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Email Sending Code Example
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the complete email sending code
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.2: Send Email Using Template</h3>
              <p className="text-gray-700 mb-4">
                Send an email using a <strong>predefined email template</strong>:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.sendEmail({
  recipients: ['user@example.com'],
  subject: 'Order Confirmation',
  templateId: 'your-template-id-here'
})
.then(result => {
  console.log('Email sent successfully!', result);
});`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.3: Send Bulk Emails</h3>
              <p className="text-gray-700 mb-4">
                Send <strong>bulk emails</strong> to multiple recipients:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.sendEmail({
  recipients: [
    'user1@example.com',
    'user2@example.com',
    'user3@example.com'
  ],
  subject: 'Newsletter - Week 1',
  html: '<html><body><h1>Newsletter</h1><p>Your weekly update...</p></body></html>'
})
.then(result => {
  console.log('Bulk email sent!', result);
});`}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Bulk Email Success Message
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing successful bulk email sending confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 7: Advanced Features */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">7</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Advanced Email Features</h2>
              <p className="text-gray-600 mt-1">Explore <strong>advanced email integration</strong> capabilities</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Email Templates</h3>
              <p className="text-gray-700 mb-4">
                Retrieve all <strong>email templates</strong> for your project:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.getTemplates()
  .then(templates => {
    console.log('Available templates:', templates);
  });`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Email History</h3>
              <p className="text-gray-700 mb-4">
                View <strong>email sending history</strong> and track delivery status:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.getEmailHistory({
  page: 1,
  limit: 50,
  status: 'sent' // optional: 'sent', 'failed', 'pending'
})
.then(history => {
  console.log('Email history:', history);
});`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Use Custom SMTP</h3>
              <p className="text-gray-700 mb-4">
                Send emails using a <strong>specific SMTP configuration</strong>:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`przio.sendEmail({
  recipients: ['user@example.com'],
  subject: 'Test Email',
  html: '<html><body><h1>Hello!</h1></body></html>',
  smtpId: 'your-smtp-config-id'
});`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Success Checklist */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✅ Integration Checklist</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">PRZIO account created and verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Project created in PRZIO dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">SMTP settings configured and tested</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">API key generated and saved securely</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">PRZIO Email SDK installed and initialized</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Test email sent successfully</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Congratulations! You&apos;ve successfully integrated <strong>PRZIO email testing</strong> into your application. 
              You can now:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Send <strong>transactional emails</strong> from your application</li>
              <li>Create and manage <strong>email templates</strong> in PRZIO dashboard</li>
              <li>Track <strong>email delivery</strong> and <strong>open rates</strong></li>
              <li>Implement <strong>bulk email sending</strong> for marketing campaigns</li>
              <li>Explore <strong>advanced features</strong> like email scheduling and personalization</li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <Link href="/integration/popup" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors">
                Learn Popup Integration →
              </Link>
              <Link href="/integration/form" className="px-6 py-3 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg font-semibold hover:from-pink-700 hover:to-red-700 transition-colors">
                Learn Form Integration →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
