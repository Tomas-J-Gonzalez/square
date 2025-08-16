export default function PricingPage() {
  return (
    <section className="bg-white py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
          Pricing Plans
        </h1>
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Free</h3>
            <p className="text-4xl font-bold text-pink-500 mb-6">$0</p>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Basic event creation</li>
              <li>✓ Up to 10 participants</li>
              <li>✓ Standard templates</li>
            </ul>
            <button className="w-full mt-6 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
              Get Started
            </button>
          </div>
          
          <div className="bg-pink-50 p-8 rounded-lg border-2 border-pink-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Pro</h3>
            <p className="text-4xl font-bold text-pink-500 mb-6">$9<span className="text-lg">/month</span></p>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Unlimited events</li>
              <li>✓ Up to 50 participants</li>
              <li>✓ Advanced features</li>
              <li>✓ Priority support</li>
            </ul>
            <button className="w-full mt-6 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
              Start Free Trial
            </button>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enterprise</h3>
            <p className="text-4xl font-bold text-pink-500 mb-6">Custom</p>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Everything in Pro</li>
              <li>✓ Unlimited participants</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
            </ul>
            <button className="w-full mt-6 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
