'use client';

import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Code, FileText, Settings, Layers, Zap } from 'lucide-react';

export default function FormIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/integration" className="inline-flex items-center text-pink-600 hover:text-pink-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Integration Guide
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-red-600 rounded-2xl mb-6 mx-auto">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-pink-600 via-red-600 to-orange-600 bg-clip-text text-transparent">
              Form Integration
            </span>
            <br />
            Complete Tutorial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to integrate <strong>PRZIO form builder</strong> into your website. Add <strong>contact forms</strong>, 
            <strong>lead capture forms</strong>, <strong>survey forms</strong>, and <strong>multi-step forms</strong> with advanced validation.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">1.</span>
              <span>Create Your PRZIO Account & Project</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">2.</span>
              <span>Create Your First Form</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">3.</span>
              <span>Add Form Fields & Configure Validation</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">4.</span>
              <span>Create Multi-Step Forms (Optional)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">5.</span>
              <span>Embed Form in Popup or Standalone</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">6.</span>
              <span>Install PRZIO Form SDK</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-pink-600">7.</span>
              <span>Test Form Submission</span>
            </li>
          </ol>
        </div>

        {/* Step 1: Create Account & Project */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">1</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Your PRZIO Account & Project</h2>
              <p className="text-gray-600 mt-1">Get started with <strong>PRZIO form builder</strong> platform</p>
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
                <li>Enter a <strong>project name</strong> (e.g., &quot;My Website Forms&quot;)</li>
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
                <strong>💡 Pro Tip:</strong> Keep your <strong>Project ID</strong> handy - you&apos;ll need it for <strong>form integration</strong>. 
                You can find it in the project settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Create Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">2</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Your First Form</h2>
              <p className="text-gray-600 mt-1">Design your <strong>contact form</strong> or <strong>lead capture form</strong></p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.1: Navigate to Form Builder</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Go to your <strong>project dashboard</strong></li>
                <li>Click on <strong>&quot;Forms&quot;</strong> in the sidebar</li>
                <li>Click <strong>&quot;Create New Form&quot;</strong> button</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Forms Dashboard
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the forms list page with create button
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.2: Choose Form Type</h3>
              <p className="text-gray-700 mb-4">
                Select the type of <strong>form</strong> you want to create:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Contact Form</strong> - For general inquiries and messages</li>
                <li><strong>Lead Capture Form</strong> - For collecting email addresses and lead information</li>
                <li><strong>Survey Form</strong> - For collecting feedback and responses</li>
                <li><strong>Newsletter Signup</strong> - For email subscriptions</li>
                <li><strong>Custom Form</strong> - Build your own form from scratch</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Type Selection
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing form type selection screen with all options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.3: Name Your Form</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Enter a <strong>form name</strong> (e.g., &quot;Contact Us Form&quot;)</li>
                <li>Add a <strong>form description</strong> (optional)</li>
                <li>Click <strong>&quot;Continue&quot;</strong> to proceed to form builder</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 3: Add Form Fields */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">3</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Add Form Fields & Configure Validation</h2>
              <p className="text-gray-600 mt-1">Build your <strong>form</strong> with custom fields and <strong>validation rules</strong></p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.1: Add Form Fields</h3>
              <p className="text-gray-700 mb-4">
                Add <strong>form fields</strong> to collect the data you need:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Text Input</strong> - For names, addresses, and short text</li>
                <li><strong>Email Input</strong> - For email addresses with validation</li>
                <li><strong>Phone Input</strong> - For phone numbers</li>
                <li><strong>Textarea</strong> - For longer messages and comments</li>
                <li><strong>Select Dropdown</strong> - For single choice selections</li>
                <li><strong>Radio Buttons</strong> - For single choice from options</li>
                <li><strong>Checkboxes</strong> - For multiple selections</li>
                <li><strong>Date Picker</strong> - For date selection</li>
                <li><strong>File Upload</strong> - For file attachments</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Builder with Field Options
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the form builder interface with drag-and-drop field options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.2: Configure Field Settings</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click on a <strong>field</strong> to edit its properties</li>
                <li>Set the <strong>field label</strong> (e.g., &quot;Full Name&quot;)</li>
                <li>Set the <strong>field name</strong> (used for form submission)</li>
                <li>Mark fields as <strong>required</strong> or optional</li>
                <li>Add <strong>placeholder text</strong> for better UX</li>
                <li>Set <strong>default values</strong> if needed</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Field Configuration Panel
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing field settings panel with all configuration options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.3: Set Up Validation Rules</h3>
              <p className="text-gray-700 mb-4">
                Configure <strong>form validation</strong> to ensure data quality:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Required Fields</strong> - Mark fields that must be filled</li>
                <li><strong>Email Validation</strong> - Automatic validation for email fields</li>
                <li><strong>Min/Max Length</strong> - Set character limits for text fields</li>
                <li><strong>Pattern Matching</strong> - Custom regex patterns for validation</li>
                <li><strong>Custom Error Messages</strong> - Personalized error messages</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Validation Rules Configuration
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing validation settings with examples
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.4: Customize Form Styling</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Choose <strong>form layout</strong> (single column, two columns, etc.)</li>
                <li>Customize <strong>colors</strong> and <strong>fonts</strong></li>
                <li>Style the <strong>submit button</strong></li>
                <li>Add <strong>custom CSS</strong> for advanced styling</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 4: Multi-Step Forms */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">4</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Multi-Step Forms (Optional)</h2>
              <p className="text-gray-600 mt-1">Build <strong>multi-step forms</strong> for better user experience</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.1: Enable Multi-Step Mode</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>In the <strong>form builder</strong>, toggle <strong>&quot;Multi-Step Form&quot;</strong> option</li>
                <li>Create multiple <strong>form steps</strong> by clicking <strong>&quot;Add Step&quot;</strong></li>
                <li>Organize fields into different <strong>steps</strong></li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Multi-Step Form Builder
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing multi-step form interface with step navigation
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.2: Configure Step Navigation</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Add <strong>&quot;Next&quot;</strong> and <strong>&quot;Previous&quot;</strong> buttons</li>
                <li>Set <strong>step validation</strong> - validate current step before proceeding</li>
                <li>Add <strong>progress indicator</strong> to show form completion</li>
                <li>Customize <strong>step titles</strong> and descriptions</li>
              </ol>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.3: Preview Multi-Step Form</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click <strong>&quot;Preview&quot;</strong> to see how your <strong>multi-step form</strong> works</li>
                <li>Test navigation between steps</li>
                <li>Verify validation works on each step</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Multi-Step Form Preview
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing a multi-step form with progress indicator
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 5: Embed Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">5</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Embed Form in Popup or Standalone</h2>
              <p className="text-gray-600 mt-1">Choose how to display your <strong>form</strong> on your website</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Option 5.1: Embed in Popup</h3>
              <p className="text-gray-700 mb-4">
                Add your <strong>form</strong> to a <strong>popup</strong> for better conversion:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Create a <strong>popup</strong> in PRZIO (see Popup Integration tutorial)</li>
                <li>In the <strong>popup editor</strong>, click <strong>&quot;Add Form&quot;</strong></li>
                <li>Select your <strong>form</strong> from the dropdown</li>
                <li>The <strong>form</strong> will be embedded in the <strong>popup</strong></li>
                <li>Configure <strong>popup triggers</strong> to show when form should appear</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Embedded in Popup
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing a popup with embedded form
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Option 5.2: Standalone Form</h3>
              <p className="text-gray-700 mb-4">
                Embed your <strong>form</strong> directly on a webpage:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>In your <strong>form settings</strong>, copy the <strong>form embed code</strong></li>
                <li>Paste the code where you want the <strong>form</strong> to appear on your website</li>
                <li>The <strong>form</strong> will render automatically</li>
              </ol>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mt-4">
                <pre className="text-green-400 text-sm">
{`<!-- Form Embed Code -->
<div id="przio-form-container" data-form-id="YOUR_FORM_ID"></div>
<script src="https://przio.com/sdk.js" data-project-id="YOUR_PROJECT_ID"></script>`}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Standalone Form on Webpage
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing a form embedded directly on a webpage
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 6: Install SDK */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">6</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Install PRZIO Form SDK</h2>
              <p className="text-gray-600 mt-1">Add the <strong>PRZIO form SDK</strong> to handle form submissions</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.1: Include SDK Script</h3>
              <p className="text-gray-700 mb-4">
                The <strong>PRZIO form SDK</strong> is included automatically when you use the <strong>popup SDK</strong> or embed code. 
                If you&apos;re using standalone forms, include the SDK:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://przio.com/sdk.js" data-project-id="YOUR_PROJECT_ID"></script>`}
                </code>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> HTML with Form SDK
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing HTML file with SDK script and form container
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.2: Form Auto-Initialization</h3>
              <p className="text-gray-700 mb-4">
                When the <strong>PRZIO SDK</strong> loads, it automatically:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Finds all <strong>forms</strong> with <code className="bg-gray-100 px-2 py-1 rounded">data-form-id</code> attribute</li>
                <li>Initializes <strong>form validation</strong> and <strong>submission handlers</strong></li>
                <li>Sets up <strong>multi-step navigation</strong> if applicable</li>
                <li>Handles <strong>form submission</strong> to PRZIO API</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Step 7: Test Form */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">7</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Test Form Submission</h2>
              <p className="text-gray-600 mt-1">Verify your <strong>form</strong> is working correctly</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.1: Test Form Display</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Open your website in a browser</li>
                <li>Navigate to the page where your <strong>form</strong> is embedded</li>
                <li>Verify the <strong>form</strong> displays correctly</li>
                <li>Check that all <strong>fields</strong> are visible and properly styled</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Displayed on Website
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the form displayed on a webpage
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.2: Test Form Validation</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Try submitting the <strong>form</strong> without filling required fields</li>
                <li>Verify <strong>validation error messages</strong> appear</li>
                <li>Test <strong>email validation</strong> with invalid email addresses</li>
                <li>Test <strong>field length</strong> validation if configured</li>
                <li>Verify error messages are clear and helpful</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Validation Errors
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing validation error messages on form
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.3: Test Form Submission</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Fill out all <strong>form fields</strong> correctly</li>
                <li>Click the <strong>submit button</strong></li>
                <li>Verify <strong>success message</strong> appears</li>
                <li>Check PRZIO dashboard to confirm <strong>form submission</strong> was received</li>
                <li>Verify all <strong>form data</strong> is captured correctly</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Form Submission Success
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing successful form submission message
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.4: Test Multi-Step Form (If Applicable)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Navigate through all <strong>form steps</strong> using Next/Previous buttons</li>
                <li>Verify <strong>step validation</strong> prevents moving forward with invalid data</li>
                <li>Check <strong>progress indicator</strong> updates correctly</li>
                <li>Submit the <strong>form</strong> from the final step</li>
                <li>Verify all <strong>step data</strong> is submitted together</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Multi-Step Form Navigation
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing multi-step form with progress indicator
                </p>
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
              <span className="text-gray-700">Form designed with all required fields</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Form validation rules configured</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Form embedded in popup or webpage</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">PRZIO Form SDK installed and initialized</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Form tested and submissions working</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Congratulations! You&apos;ve successfully integrated <strong>PRZIO form builder</strong> into your website. 
              You can now:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>View all <strong>form submissions</strong> in PRZIO dashboard</li>
              <li>Export <strong>form data</strong> to CSV or Excel</li>
              <li>Set up <strong>email notifications</strong> for new submissions</li>
              <li>Integrate with <strong>webhooks</strong> for real-time data processing</li>
              <li>Create multiple <strong>forms</strong> for different purposes</li>
              <li>Use <strong>forms in popups</strong> for better conversion rates</li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <Link href="/integration/email" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors">
                Learn Email Integration →
              </Link>
              <Link href="/integration/popup" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-colors">
                Learn Popup Integration →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
