export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 marketing-heading">
          Terms of Service
        </h1>
        
        <div className="bg-white shadow rounded-lg p-8">
          <p className="text-gray-600 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              By accessing and using Show Up or Else, you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to abide by the above, please do 
              not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Use License
            </h2>
            <p className="text-gray-700 mb-4">
              Permission is granted to temporarily use Show Up or Else for personal, non-commercial 
              event planning purposes. This is the grant of a license, not a transfer of title, and 
              under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any commercial purpose</li>
              <li>Attempt to reverse engineer any portion of the service</li>
              <li>Remove any copyright or other proprietary notations</li>
              <li>Transfer the materials to another person</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              User Responsibilities
            </h2>
            <p className="text-gray-700 mb-4">
              As a user of Show Up or Else, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account</li>
              <li>Use the service in compliance with applicable laws</li>
              <li>Respect the privacy and rights of other users</li>
              <li>Not use the service for harmful or malicious purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Event Hosting
            </h2>
            <p className="text-gray-700 mb-4">
              When hosting events through our platform:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>You are responsible for the content and conduct of your events</li>
              <li>Ensure your events comply with local laws and regulations</li>
              <li>Respect participant privacy and preferences</li>
              <li>Use appropriate and respectful language in event communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Disclaimers
            </h2>
            <p className="text-gray-700 mb-4">
              The materials on Show Up or Else are provided on an 'as is' basis. We make no 
              warranties, expressed or implied, and hereby disclaim and negate all other warranties 
              including without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property.
            </p>
            <p className="text-gray-700">
              We are not responsible for the success, safety, or conduct of events created through 
              our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Limitations
            </h2>
            <p className="text-gray-700">
              In no event shall Show Up or Else or its suppliers be liable for any damages 
              (including, without limitation, damages for loss of data or profit, or due to business 
              interruption) arising out of the use or inability to use the materials on our platform.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Termination
            </h2>
            <p className="text-gray-700">
              We may terminate or suspend your account and access to the service at any time, 
              without prior notice, for conduct that we believe violates these Terms of Service 
              or is harmful to other users, us, or third parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Changes to Terms
            </h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. We will notify users of any 
              material changes by posting the new Terms of Service on this page and updating the 
              "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 marketing-heading">
              Contact Information
            </h2>
            <p className="text-gray-700">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <a 
                href="mailto:legal@showuporelse.com" 
                className="text-pink-600 hover:text-pink-500 underline focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 rounded px-1 py-0.5"
                aria-label="Send email to legal@showuporelse.com"
              >
                legal@showuporelse.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
