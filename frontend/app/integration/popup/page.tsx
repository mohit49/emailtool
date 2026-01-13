'use client';

import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Code, Layout, Settings, Target, Zap } from 'lucide-react';

export default function PopupIntegrationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Link */}
        <Link href="/integration" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Integration Guide
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mb-6 mx-auto">
            <Layout className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
              Popup Integration
            </span>
            <br />
            Complete Tutorial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to integrate <strong>PRZIO popup builder</strong> into your website. Add <strong>conversion popups</strong>, 
            <strong>exit intent popups</strong>, and <strong>lead generation popups</strong> with advanced triggers and targeting.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-gray-600">
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">1.</span>
              <span>Create Your PRZIO Account & Project</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">2.</span>
              <span>Create Your First Popup</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">3.</span>
              <span>Configure Popup Settings & Triggers</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">4.</span>
              <span>Set Up URL Targeting</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">5.</span>
              <span>Install PRZIO Popup SDK</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">6.</span>
              <span>Initialize Popup SDK</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="font-semibold text-purple-600">7.</span>
              <span>Test Your Popup Integration</span>
            </li>
          </ol>
        </div>

        {/* Step 1: Create Account & Project */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Your PRZIO Account & Project</h2>
              <p className="text-gray-600 mt-1">Get started with <strong>PRZIO popup builder</strong> platform</p>
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
                <li>Enter a <strong>project name</strong> (e.g., &quot;My Website Popups&quot;)</li>
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
                <strong>💡 Pro Tip:</strong> Keep your <strong>Project ID</strong> handy - you&apos;ll need it for <strong>popup integration</strong>. 
                You can find it in the project settings page.
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Create Popup */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-pink-600">2</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Create Your First Popup</h2>
              <p className="text-gray-600 mt-1">Design your <strong>conversion popup</strong> in PRZIO editor</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.1: Navigate to Popup Builder</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Go to your <strong>project dashboard</strong></li>
                <li>Click on <strong>&quot;Popups&quot;</strong> in the sidebar</li>
                <li>Click <strong>&quot;Create New Popup&quot;</strong> button</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Popups Dashboard
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the popups list page with create button
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.2: Design Your Popup</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Enter a <strong>popup name</strong> (e.g., &quot;Welcome Popup&quot;)</li>
                <li>Use the <strong>visual editor</strong> to design your popup</li>
                <li>Add <strong>text</strong>, <strong>images</strong>, and <strong>buttons</strong> to your popup</li>
                <li>Customize <strong>colors</strong>, <strong>fonts</strong>, and <strong>layout</strong></li>
                <li>Add a <strong>form</strong> if you want to capture leads (optional)</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Popup Editor Interface
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the popup editor with design tools and preview
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 2.3: Save Your Popup</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Click <strong>&quot;Save&quot;</strong> to save your popup design</li>
                <li>Your popup is now ready for <strong>integration</strong></li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Saved Popup Confirmation
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the success message after saving popup
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Configure Popup Settings */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-red-600">3</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Configure Popup Settings & Triggers</h2>
              <p className="text-gray-600 mt-1">Set up <strong>popup triggers</strong> and <strong>display settings</strong></p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.1: Choose Popup Trigger</h3>
              <p className="text-gray-700 mb-4">
                Select when your <strong>popup</strong> should appear:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Page Load</strong> - Show immediately when page loads</li>
                <li><strong>Exit Intent</strong> - Show when user tries to leave the page</li>
                <li><strong>Scroll Percentage</strong> - Show after user scrolls a certain percentage</li>
                <li><strong>Timeout</strong> - Show after a specific time delay</li>
                <li><strong>Element Exists</strong> - Show when a specific element appears on page</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Popup Trigger Settings
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the trigger selection dropdown with all options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.2: Configure Exit Intent Settings</h3>
              <p className="text-gray-700 mb-4">
                If you chose <strong>Exit Intent</strong> trigger, configure these settings:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Set <strong>minimum time on page</strong> (e.g., 30 seconds)</li>
                <li>Set <strong>minimum scroll percentage</strong> (e.g., 50%)</li>
                <li>Configure <strong>cooldown period</strong> (how often popup can show)</li>
                <li>Set <strong>max per session</strong> (how many times per session)</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Exit Intent Configuration
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing exit intent settings with all configuration options
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 3.3: Configure Display Settings</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Enable/disable <strong>backdrop overlay</strong></li>
                <li>Set <strong>backdrop color</strong> and <strong>opacity</strong></li>
                <li>Configure <strong>close button</strong> position and style</li>
                <li>Set <strong>cookie/session</strong> settings to prevent repeat displays</li>
                <li>Choose <strong>animation</strong> effect (fade, slide, etc.)</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Display Settings Panel
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing all display configuration options
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: URL Targeting */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-orange-600">4</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Set Up URL Targeting</h2>
              <p className="text-gray-600 mt-1">Control where your <strong>popup</strong> appears</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.1: Add URL Conditions</h3>
              <p className="text-gray-700 mb-4">
                Configure <strong>URL targeting</strong> to show popup on specific pages:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li><strong>Contains</strong> - Show if URL contains specific text</li>
                <li><strong>Equals</strong> - Show only on exact URL match</li>
                <li><strong>Starts With</strong> - Show if URL starts with specific path</li>
                <li><strong>Does Not Contain</strong> - Show if URL doesn&apos;t contain text</li>
                <li><strong>Landing</strong> - Show only on homepage</li>
              </ul>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> URL Conditions Configuration
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing URL condition builder with examples
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.2: Set Logic Operator</h3>
              <p className="text-gray-700 mb-4">
                Choose how multiple <strong>URL conditions</strong> are evaluated:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>OR</strong> - Show if any condition matches</li>
                <li><strong>AND</strong> - Show only if all conditions match</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 4.3: Domain Targeting (Optional)</h3>
              <p className="text-gray-700 mb-4">
                Restrict popup to specific <strong>domains</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Enter your <strong>domain name</strong> (e.g., <code className="bg-gray-100 px-2 py-1 rounded">example.com</code>)</li>
                <li>Popup will only show on pages matching this domain</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Step 5: Install SDK */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-green-600">5</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Install PRZIO Popup SDK</h2>
              <p className="text-gray-600 mt-1">Add the <strong>PRZIO popup SDK</strong> to your website</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 5.1: Include SDK Script</h3>
              <p className="text-gray-700 mb-4">
                Add the <strong>PRZIO popup SDK</strong> script to your HTML page. Include it before the closing <code className="bg-gray-100 px-2 py-1 rounded">&lt;/body&gt;</code> tag:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-green-400 text-sm">
                  {`<script src="https://przio.com/sdk.js" data-project-id="YOUR_PROJECT_ID"></script>`}
                </code>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> HTML Code with SDK Script
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing HTML file with the SDK script tag and data-project-id attribute
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Alternative: Manual Initialization</h3>
              <p className="text-gray-700 mb-4">
                You can also initialize the <strong>popup SDK</strong> manually:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`<script src="https://przio.com/sdk.js"></script>
<script>
  PrzioSDK.init({
    projectId: 'YOUR_PROJECT_ID',
    debug: false // Set to true for debugging
  });
</script>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">WordPress Plugin (Alternative)</h3>
              <p className="text-gray-700 mb-4">
                For <strong>WordPress</strong> websites, use our official plugin:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Install the <strong>PRZIO Popup WordPress plugin</strong></li>
                <li>Go to <strong>Settings → PRZIO Popup</strong></li>
                <li>Enter your <strong>Project ID</strong></li>
                <li>Save settings - popup will automatically appear on your site</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> WordPress Plugin Settings
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing WordPress plugin settings page with Project ID field
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 6: Initialize SDK */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">6</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Initialize Popup SDK</h2>
              <p className="text-gray-600 mt-1">Configure <strong>popup SDK</strong> settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.1: Automatic Initialization</h3>
              <p className="text-gray-700 mb-4">
                If you used the <code className="bg-gray-100 px-2 py-1 rounded">data-project-id</code> attribute, 
                the <strong>popup SDK</strong> will initialize automatically when the page loads.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>✅ That&apos;s it!</strong> Your popups will automatically appear based on the triggers and 
                  URL conditions you configured in the PRZIO dashboard.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.2: Manual Initialization (Advanced)</h3>
              <p className="text-gray-700 mb-4">
                For more control, initialize the <strong>popup SDK</strong> manually:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`<script>
  // Wait for SDK to load
  if (typeof PrzioSDK !== 'undefined') {
    PrzioSDK.init({
      projectId: 'YOUR_PROJECT_ID',
      apiUrl: 'https://przio.com/api/sdk', // optional
      debug: true // Enable debug mode to see logs
    });
  }
</script>`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 6.3: Enable Debug Mode</h3>
              <p className="text-gray-700 mb-4">
                Enable <strong>debug mode</strong> to see detailed logs in the browser console:
              </p>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm">
{`PrzioSDK.init({
  projectId: 'YOUR_PROJECT_ID',
  debug: true // Shows detailed logs in console
});`}
                </pre>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Browser Console with Debug Logs
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing browser console with PRZIO SDK debug messages
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 7: Test Integration */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-purple-600">7</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Test Your Popup Integration</h2>
              <p className="text-gray-600 mt-1">Verify your <strong>popup</strong> is working correctly</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.1: Check SDK Loading</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Open your website in a browser</li>
                <li>Open <strong>Developer Tools</strong> (F12 or Right-click → Inspect)</li>
                <li>Go to the <strong>Console</strong> tab</li>
                <li>Look for <strong>&quot;[PrzioSDK] Initializing...&quot;</strong> message</li>
                <li>Verify <strong>Project ID</strong> is correct</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Browser Console with SDK Initialization
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing console with successful SDK initialization message
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.2: Test Popup Display</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Navigate to a page that matches your <strong>URL conditions</strong></li>
                <li>Trigger the popup based on your configured <strong>trigger</strong>:
                  <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                    <li><strong>Page Load</strong> - Refresh the page</li>
                    <li><strong>Exit Intent</strong> - Move mouse to top of browser</li>
                    <li><strong>Scroll</strong> - Scroll down the page</li>
                    <li><strong>Timeout</strong> - Wait for the specified time</li>
                  </ul>
                </li>
                <li>Verify the <strong>popup</strong> appears correctly</li>
                <li>Test the <strong>close button</strong> functionality</li>
              </ol>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-sm text-gray-600 text-center">
                  📸 <strong>Screenshot Placeholder:</strong> Popup Displayed on Website
                </p>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Add screenshot showing the popup displayed on a website page
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Step 7.3: Test Form Submission (If Applicable)</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>If your popup contains a <strong>form</strong>, fill it out</li>
                <li>Submit the form</li>
                <li>Verify form data is captured in PRZIO dashboard</li>
                <li>Check that popup closes after successful submission</li>
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
              <span className="text-gray-700">Popup designed and saved</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Popup triggers and settings configured</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">URL targeting conditions set up</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">PRZIO Popup SDK installed on website</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="text-gray-700">Popup tested and working correctly</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Next Steps</h2>
          <div className="space-y-4">
            <p className="text-gray-700">
              Congratulations! You&apos;ve successfully integrated <strong>PRZIO popup builder</strong> into your website. 
              You can now:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Create multiple <strong>popups</strong> for different pages and purposes</li>
              <li>Track <strong>popup impressions</strong> and <strong>conversion rates</strong> in PRZIO dashboard</li>
              <li>A/B test different <strong>popup designs</strong> and <strong>triggers</strong></li>
              <li>Integrate <strong>forms</strong> into your popups for lead generation</li>
              <li>Use <strong>advanced targeting</strong> to show popups to specific audiences</li>
            </ul>
            <div className="mt-6 flex space-x-4">
              <Link href="/integration/email" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-colors">
                Learn Email Integration →
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
