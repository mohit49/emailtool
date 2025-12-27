import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

export const metadata = {
  title: 'How to Create Forms and Add Them to Popups - Complete Form Builder Tutorial | PRZIO',
  description: 'Learn how to create custom forms with our form builder and embed them into popups. Step-by-step guide for building subscription forms, contact forms, surveys, and quizzes. Includes form validation, data collection, and popup integration.',
  keywords: 'form builder tutorial, how to create forms, popup forms, form builder guide, contact form builder, survey form builder, subscription form, form validation, embedded forms, lead capture form, form submission, form data collection, popup form integration, form builder help',
};

export default function FormTutorial() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Complete Guide to <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Form Builder</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Learn how to create custom forms and embed them into popups. Build subscription forms, contact forms, surveys, and more.
          </p>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Table of Contents</h2>
          <ul className="space-y-3 text-gray-700">
            <li><a href="#step1" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 1: Create a New Form</a></li>
            <li><a href="#step2" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 2: Choose Form Type</a></li>
            <li><a href="#step3" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 3: Add Form Fields</a></li>
            <li><a href="#step4" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 4: Configure Field Settings</a></li>
            <li><a href="#step5" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 5: Add Form to Popup</a></li>
            <li><a href="#step6" className="text-indigo-600 hover:text-indigo-700 hover:underline">Step 6: View Form Submissions</a></li>
            <li><a href="#best-practices" className="text-indigo-600 hover:text-indigo-700 hover:underline">Best Practices</a></li>
          </ul>
        </div>
      </section>

      {/* Step 1 */}
      <section id="step1" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              1
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create a New Form</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              To create a new form, navigate to your project&apos;s popup activities page. You&apos;ll find a <strong>&quot;Create Forms&quot;</strong> button next to the &quot;Create Popup Activity&quot; button.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Steps:</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Go to your project&apos;s popup activities page</li>
                <li>Click the <strong>&quot;Create Forms&quot;</strong> button (purple button)</li>
                <li>You&apos;ll be redirected to the forms page</li>
                <li>Click <strong>&quot;Create New Form&quot;</strong> to start building</li>
              </ol>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Tip:</strong> Make sure you&apos;re in the correct project before creating forms, as forms are project-specific.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 2 */}
      <section id="step2" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              2
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Choose Form Type</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              When creating a new form, you&apos;ll need to provide a unique <strong>Form ID</strong> and select a <strong>Form Type</strong>. The form type helps categorize your form and can guide your field selection.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Form Types:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Subscription Form:</strong> For email newsletters, mailing lists, and subscriptions</li>
                <li><strong>Survey Form:</strong> For collecting feedback, opinions, and survey responses</li>
                <li><strong>Contact Us Form:</strong> For contact pages, support requests, and inquiries</li>
                <li><strong>Custom Form:</strong> For any other purpose - fully customizable</li>
                <li><strong>Quiz Form:</strong> For quizzes, assessments, and interactive content</li>
              </ul>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Note:</strong> The form type is primarily for organization. You can customize the form fields regardless of the type you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section id="step3" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              3
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Add Form Fields</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              The form builder allows you to add and customize form fields. Click the <strong>&quot;Add Field&quot;</strong> button to add new fields to your form.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Field Types:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Text Input</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Text - Single line text input</li>
                    <li>Email - Email address input</li>
                    <li>Number - Numeric input</li>
                    <li>Tel - Phone number input</li>
                    <li>URL - Website URL input</li>
                    <li>Date - Date picker</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Other Inputs</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    <li>Textarea - Multi-line text input</li>
                    <li>Select - Dropdown selection</li>
                    <li>Radio - Radio button group</li>
                    <li>Checkbox - Multiple selection</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Tip:</strong> You can add as many fields as you need. Use the remove button (trash icon) to delete fields you no longer need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4 */}
      <section id="step4" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              4
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Configure Field Settings</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              For each field, you can configure several settings to customize its behavior and appearance.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Field Configuration Options:</h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Field Name:</strong> Internal identifier for the field (used in form data)
                </li>
                <li>
                  <strong>Label:</strong> The text displayed to users above the field
                </li>
                <li>
                  <strong>Placeholder:</strong> Hint text shown inside the field when empty
                </li>
                <li>
                  <strong>Required:</strong> Check this to make the field mandatory. Users must fill required fields before submitting.
                </li>
                <li>
                  <strong>Options:</strong> For select, radio, and checkbox fields, add the available options (one per line)
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Important:</strong> Required fields are automatically validated when users try to submit the form. Invalid submissions will show error messages.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Automatic Validation:</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Email fields are validated for proper email format</li>
                <li>Number fields are validated for numeric values</li>
                <li>URL fields are validated for proper URL format (must start with http:// or https://)</li>
                <li>Required fields must have a value before submission</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 5 */}
      <section id="step5" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              5
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Add Form to Popup</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Once you&apos;ve created and saved your form, you can add it to any popup activity.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Steps to Add Form to Popup:</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Navigate to your popup activity editor page</li>
                <li>Look for the <strong>&quot;Form&quot;</strong> element in the right-side toolbar</li>
                <li>Drag the <strong>&quot;Form&quot;</strong> element into your popup design area</li>
                <li>A modal will appear showing all available forms in your project</li>
                <li>Select the form you want to add from the list</li>
                <li>Click <strong>&quot;Add Form&quot;</strong> to insert it into your popup</li>
                <li>The form will appear in your popup HTML editor</li>
              </ol>
            </div>

            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Note:</strong> You can add multiple forms to a single popup if needed. Each form will function independently.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Form Styling:</h4>
              <p className="text-gray-700">
                Forms automatically inherit the font styling from the parent popup element. You can customize the form appearance by:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                <li>Adding custom CSS in the popup&apos;s custom CSS section</li>
                <li>Wrapping the form in styled containers</li>
                <li>Using inline styles in the HTML editor</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Step 6 */}
      <section id="step6" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mr-4">
              6
            </div>
            <h2 className="text-3xl font-bold text-gray-900">View Form Submissions</h2>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              All form submissions are automatically collected and stored. You can view them anytime from the form&apos;s data page.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">How to View Submissions:</h3>
              <ol className="list-decimal list-inside space-y-3 text-gray-700">
                <li>Go to the forms list page</li>
                <li>Click on the form you want to view submissions for</li>
                <li>Navigate to the <strong>&quot;Data&quot;</strong> tab or click <strong>&quot;View Submissions&quot;</strong></li>
                <li>You&apos;ll see a table with all submissions, including:</li>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Submission date and time</li>
                  <li>All field values submitted</li>
                  <li>IP address (if available)</li>
                  <li>User agent information</li>
                </ul>
              </ol>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-4 mb-6">
              <p className="text-gray-800">
                <strong>Data Privacy:</strong> Form submissions are stored securely and are only accessible to users with access to the project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Best Practices</h2>
          
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Form Design</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Keep forms short and focused - only ask for essential information</li>
                  <li>Use clear, descriptive labels for all fields</li>
                  <li>Provide helpful placeholder text to guide users</li>
                  <li>Group related fields together logically</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Field Validation</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Mark required fields clearly with an asterisk (*)</li>
                  <li>Use appropriate field types (email, number, URL) for automatic validation</li>
                  <li>Test your form validation before publishing</li>
                  <li>Provide clear error messages when validation fails</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Popup Integration</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Test forms in popup preview mode before activating</li>
                  <li>Ensure forms are readable and accessible in popup context</li>
                  <li>Consider popup size when designing forms - keep them compact</li>
                  <li>Use appropriate popup triggers (exit intent, scroll, etc.) for form popups</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Data Collection</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Regularly check form submissions to ensure data quality</li>
                  <li>Export submission data periodically for backup</li>
                  <li>Respect user privacy and comply with data protection regulations</li>
                  <li>Use clear privacy notices if collecting sensitive information</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Your First Form?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start building forms and embedding them into popups today. It&apos;s free and easy to get started!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/popup-tutorial"
              className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-lg font-semibold text-lg hover:bg-white/10 transition-all"
            >
              Learn About Popups
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}




