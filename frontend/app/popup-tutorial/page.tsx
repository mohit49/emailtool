import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'Popup Builder Tutorial - Complete Guide to Creating Popups | PRZIO',
  description: 'Learn how to create engaging popups and nudges with our step-by-step tutorial. Master popup triggers, customization, and SDK integration for your website.',
  keywords: 'popup builder tutorial, how to create popups, popup tutorial, exit intent popup guide, popup builder guide, website popup tutorial, popup SDK integration, popup trigger setup',
};

export default function PopupTutorialPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Popup Builder Tutorial
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete step-by-step guide to creating engaging popups and nudges for your website. 
            Learn how to build, customize, and integrate popups that convert.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Table of Contents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="#step1" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              1. Create a New Popup Activity
            </Link>
            <Link href="#step2" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              2. Configure URL Conditions
            </Link>
            <Link href="#step3" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              3. Design Your Popup
            </Link>
            <Link href="#step4" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              4. Customize Popup Settings
            </Link>
            <Link href="#step5" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              5. Set Up Popup Triggers
            </Link>
            <Link href="#step6" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              6. Add Custom CSS & JavaScript
            </Link>
            <Link href="#step7" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              7. Integrate SDK on Your Website
            </Link>
            <Link href="#step8" className="text-indigo-600 hover:text-indigo-700 hover:underline">
              8. Test & Activate Your Popup
            </Link>
          </div>
        </div>
      </section>

      {/* Step-by-Step Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-20">
          {/* Step 1 */}
          <div id="step1" className="flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                1
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Create a New Popup Activity
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Start by creating a new popup activity in your project. This will be the container for your popup design and settings.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Instructions:</h3>
                <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                  <li>Navigate to your project dashboard</li>
                  <li>Click on &quot;Popup Activities&quot; in the sidebar or navigation</li>
                  <li>Click the &quot;Create Popup Activity&quot; button</li>
                  <li>Enter a descriptive name for your popup (e.g., &quot;Welcome Popup&quot;, &quot;Exit Intent Offer&quot;)</li>
                  <li>Enter your website domain (e.g., example.com)</li>
                  <li>Click &quot;Create Popup Activity&quot;</li>
                </ol>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <p className="text-blue-800">
                  <strong>Tip:</strong> Use clear, descriptive names for your popups so you can easily identify them later. 
                  You can create multiple popups for different purposes (welcome messages, exit intent, special offers, etc.).
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div id="step2" className="flex flex-col md:flex-row-reverse items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                2
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Configure URL Conditions
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Set up URL conditions to control where your popup appears on your website. You can target specific pages, 
                landing pages, or use complex logic with AND/OR operators.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">URL Condition Types:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">• URL Contains:</span>
                    <span>Popup shows when URL contains specific text (e.g., &quot;/products&quot;)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">• URL Equals To:</span>
                    <span>Popup shows only on exact URL match</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">• Is Landing Page:</span>
                    <span>Popup shows only on the home page</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">• URL Starts With:</span>
                    <span>Popup shows on all URLs starting with specific path</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">• URL Does Not Contain:</span>
                    <span>Popup shows on all pages except those containing the text</span>
                  </li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Setup:</h3>
                <div className="space-y-2 text-gray-700 font-mono text-sm bg-white p-4 rounded border">
                  <div>Condition 1: URL Contains &quot;/blog&quot; (OR)</div>
                  <div>Condition 2: URL Contains &quot;/articles&quot;</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Result: Popup shows on blog pages OR article pages
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                <p className="text-yellow-800">
                  <strong>Note:</strong> Use AND operator when you want popup to show only when ALL conditions are met. 
                  Use OR operator when you want popup to show when ANY condition is met.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div id="step3" className="flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                3
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Design Your Popup
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Use our powerful drag-and-drop editor to design your popup. Add elements, customize styles, 
                and see real-time preview of your popup.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Design Tools Available:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Content Elements:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Headings (H1-H6)</li>
                      <li>• Paragraphs & Text</li>
                      <li>• Images</li>
                      <li>• Buttons & Links</li>
                      <li>• Containers & Divs</li>
                      <li>• Tables</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Design Features:</h4>
                    <ul className="space-y-1 text-gray-700 text-sm">
                      <li>• Drag & Drop Elements</li>
                      <li>• Real-time Preview</li>
                      <li>• CSS Editor</li>
                      <li>• Element Styling</li>
                      <li>• Responsive Design</li>
                      <li>• Layers Panel</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step-by-Step Design Process:</h3>
                <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                  <li>Click on any element in the toolbar (Heading, Paragraph, Button, etc.)</li>
                  <li>Drag it into the preview area where you want it to appear</li>
                  <li>Click on the element to select it and customize its properties</li>
                  <li>Use the CSS Editor to add custom styles</li>
                  <li>Use the Layers panel to organize and manage elements</li>
                  <li>Preview your popup in different device sizes (Mobile, Tablet, Desktop)</li>
                </ol>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-800">
                  <strong>Pro Tip:</strong> Start with a simple design and gradually add elements. 
                  Use the preview mode to see how your popup looks on different screen sizes before finalizing.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div id="step4" className="flex flex-col md:flex-row-reverse items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                4
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Customize Popup Settings
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Configure popup position, animations, and close button settings to match your design preferences.
              </p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Position Settings:</h3>
                  <p className="text-gray-700 mb-3">Choose where your popup appears on the screen:</p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• <strong>Center:</strong> Popup appears in the center of the screen</li>
                    <li>• <strong>Top Left/Right:</strong> Popup appears at top corners</li>
                    <li>• <strong>Bottom Left/Right:</strong> Popup appears at bottom corners</li>
                    <li>• <strong>Center Top/Bottom:</strong> Popup appears at top or bottom center</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Animation Settings:</h3>
                  <p className="text-gray-700 mb-3">Add entrance animations to make your popup more engaging:</p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• <strong>Fade In:</strong> Smooth fade-in effect</li>
                    <li>• <strong>Slide In:</strong> Slide from different directions</li>
                    <li>• <strong>Bounce:</strong> Playful bounce animation</li>
                    <li>• <strong>Zoom:</strong> Zoom in effect</li>
                    <li>• <strong>And many more:</strong> Choose from 50+ animation options</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Close Button Settings:</h3>
                  <p className="text-gray-700 mb-3">Customize the close button appearance:</p>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• <strong>Show/Hide:</strong> Toggle close button visibility</li>
                    <li>• <strong>Position:</strong> Top-left, top-right, bottom-left, or bottom-right</li>
                    <li>• <strong>Color:</strong> Choose any color (hex, RGB, or color picker)</li>
                    <li>• <strong>Size:</strong> Set custom size (e.g., 32px, 24px, 40px)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div id="step5" className="flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                5
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Set Up Popup Triggers
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Configure when and how your popup appears. Choose from multiple trigger options to maximize engagement.
              </p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Trigger Types:</h3>
                  
                  <div className="space-y-4">
                    <div className="border-l-4 border-indigo-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">1. Page Load (Immediate)</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        Popup appears immediately when the page loads. Perfect for welcome messages or important announcements.
                      </p>
                    </div>

                    <div className="border-l-4 border-purple-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">2. After Timeout (Delay)</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        Popup appears after a specified delay (in milliseconds). Example: Show popup 5 seconds after page load.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Setting:</strong> Enter delay in milliseconds (e.g., 3000 = 3 seconds)
                      </p>
                    </div>

                    <div className="border-l-4 border-pink-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">3. When Element Exists</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        Popup appears when a specific element appears in the DOM. Useful for dynamic content that loads after page load.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Setting:</strong> Enter CSS selector (e.g., &quot;#my-element&quot; or &quot;.my-class&quot;)
                      </p>
                    </div>

                    <div className="border-l-4 border-red-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">4. Exit Intent (Inactivity)</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        Popup appears when user shows exit intent (mouse leaves top of window) or after period of inactivity.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Setting:</strong> Enter inactivity timeout in seconds (e.g., 30 = 30 seconds of no activity)
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>How it works:</strong> Monitors mouse movement, clicks, keyboard input, and scrolling. 
                        Triggers when user is inactive or moves mouse toward browser exit.
                      </p>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-semibold text-gray-900 mb-2">5. After Scroll Percentage</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        Popup appears when user scrolls to a specific percentage of the page. Great for content engagement popups.
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <strong>Setting:</strong> Enter scroll percentage (0-100). Example: 50 = popup shows at 50% scroll
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Remember User Preferences:</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cookie-Based Remembering:</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        If enabled, when a user closes the popup, it won&apos;t show again until the cookie expires.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 ml-4">
                        <li>• Set cookie expiry in days (e.g., 30 days)</li>
                        <li>• Cookie is stored in user&apos;s browser</li>
                        <li>• Works across different sessions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Session-Based Remembering:</h4>
                      <p className="text-gray-700 text-sm mb-2">
                        If enabled, popup won&apos;t show again during the current browser session. 
                        Will appear again when user opens a new browser session.
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1 ml-4">
                        <li>• Stored in browser session storage</li>
                        <li>• Cleared when browser is closed</li>
                        <li>• Perfect for one-time announcements</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mt-4">
                    <p className="text-yellow-800 text-xs">
                      <strong>Note:</strong> You can enable either cookie-based OR session-based remembering, but not both at the same time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div id="step6" className="flex flex-col md:flex-row-reverse items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                6
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Add Custom CSS & JavaScript
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                For advanced customization, add your own CSS and JavaScript directly in the HTML editor. 
                This gives you complete control over popup styling and behavior.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom CSS:</h3>
                <p className="text-gray-700 mb-3 text-sm">
                  Add custom styles in the <code className="bg-gray-200 px-2 py-1 rounded">&lt;style data-custom-css&gt;</code> tag:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<style data-custom-css>
  .my-custom-class {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  }
  
  .popup-button {
    transition: all 0.3s ease;
  }
  
  .popup-button:hover {
    transform: scale(1.05);
  }
</style>`}
                </pre>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom JavaScript:</h3>
                <p className="text-gray-700 mb-3 text-sm">
                  Add custom scripts in the <code className="bg-gray-200 px-2 py-1 rounded">&lt;script data-custom-js&gt;</code> tag:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<script data-custom-js>
  // Example: Track popup views
  document.addEventListener('DOMContentLoaded', function() {
    const popup = document.querySelector('.przio-popup');
    if (popup) {
      // Your custom JavaScript here
      console.log('Popup loaded!');
      
      // Example: Add click tracking
      popup.addEventListener('click', function(e) {
        if (e.target.tagName === 'BUTTON') {
          // Track button clicks
          console.log('Button clicked!');
        }
      });
    }
  });
</script>`}
                </pre>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Tip:</strong> Custom CSS and JavaScript tags are already included in the HTML editor. 
                  Just find the <code className="bg-blue-100 px-1 rounded">&lt;style data-custom-css&gt;</code> and 
                  <code className="bg-blue-100 px-1 rounded">&lt;script data-custom-js&gt;</code> tags and add your code there.
                </p>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div id="step7" className="flex flex-col md:flex-row items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                7
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Integrate SDK on Your Website
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Add our lightweight JavaScript SDK to your website to enable popup functionality. 
                Just one script tag and you&apos;re ready to go!
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Get Your API Key</h3>
                <ol className="space-y-2 text-gray-700 text-sm list-decimal list-inside">
                  <li>Go to your project settings</li>
                  <li>Navigate to &quot;API Keys&quot; section</li>
                  <li>Copy your project API key (or create a new one if needed)</li>
                </ol>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Add SDK Script to Your Website</h3>
                <p className="text-gray-700 mb-3 text-sm">
                  Add this script tag before the closing <code className="bg-gray-200 px-1 rounded">&lt;/body&gt;</code> tag on all pages where you want popups to appear:
                </p>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
{`<script src="https://your-domain.com/sdk.js" 
        data-api-key="YOUR_API_KEY_HERE">
</script>`}
                </pre>
                <p className="text-gray-600 text-xs mt-2">
                  Replace <code className="bg-gray-200 px-1 rounded">YOUR_API_KEY_HERE</code> with your actual API key.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Verify Integration</h3>
                <p className="text-gray-700 mb-3 text-sm">
                  Once the SDK is added, it will automatically:
                </p>
                <ul className="space-y-2 text-gray-700 text-sm list-disc list-inside">
                  <li>Check URL conditions for each popup</li>
                  <li>Evaluate trigger conditions (timeout, scroll, exit intent, etc.)</li>
                  <li>Respect cookie/session settings</li>
                  <li>Inject and display popups when conditions are met</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <p className="text-green-800 text-sm">
                  <strong>Best Practice:</strong> Add the SDK script to your website&apos;s main template or header file 
                  so it loads on all pages. The SDK is lightweight and won&apos;t impact your page load speed.
                </p>
              </div>
            </div>
          </div>

          {/* Step 8 */}
          <div id="step8" className="flex flex-col md:flex-row-reverse items-start gap-12">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                8
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Test & Activate Your Popup
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Before going live, test your popup thoroughly and then activate it for your website visitors.
              </p>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Testing Checklist:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Test popup appearance in preview mode (mobile, tablet, desktop)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Verify URL conditions work correctly on target pages</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Test trigger conditions (timeout, scroll, exit intent, etc.)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Check cookie/session remembering works (close popup and verify it doesn&apos;t show again)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Test close button functionality</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Verify animations work smoothly</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-green-600 mr-2 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Test on different browsers (Chrome, Firefox, Safari, Edge)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Activation Steps:</h3>
                  <ol className="space-y-3 text-gray-700 text-sm list-decimal list-inside">
                    <li>Once testing is complete, go to your popup activity page</li>
                    <li>Click the &quot;Save Changes&quot; button to save all your settings</li>
                    <li>Change the status from &quot;Draft&quot; to &quot;Activated&quot;</li>
                    <li>Your popup will now appear on your website based on the configured conditions and triggers</li>
                  </ol>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>Pro Tip:</strong> Start with &quot;Draft&quot; status to test on your live website. 
                    Once everything works perfectly, activate it. You can always deactivate or edit popups later without losing your work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-white/50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Best Practices
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tips to create popups that convert without annoying your visitors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Timing is Everything</h3>
            <p className="text-gray-600 text-sm">
              Don&apos;t show popups immediately on page load. Use exit intent or scroll triggers to show popups 
              when users are engaged with your content.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Keep It Simple</h3>
            <p className="text-gray-600 text-sm">
              Focus on one clear message or call-to-action. Too much information can overwhelm visitors and reduce conversions.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Respect User Preferences</h3>
            <p className="text-gray-600 text-sm">
              Always enable cookie or session-based remembering. If a user closes a popup, don&apos;t show it again 
              during that session or until the cookie expires.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Optimization</h3>
            <p className="text-gray-600 text-sm">
              Test your popups on mobile devices. Ensure they&apos;re readable, buttons are easily clickable, 
              and the close button is accessible.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Clear Value Proposition</h3>
            <p className="text-gray-600 text-sm">
              Make it clear what value users get from your popup. Whether it&apos;s a discount, newsletter signup, 
              or important announcement, be direct and compelling.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">A/B Testing</h3>
            <p className="text-gray-600 text-sm">
              Create multiple versions of your popup with different designs, messages, or triggers. 
              Test which version performs better and optimize accordingly.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Ready to Build Your First Popup?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Start creating engaging popups that convert. Follow this tutorial and you&apos;ll have your first popup live in minutes!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/popups"
              className="inline-block px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Go to Popup Builder
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}




