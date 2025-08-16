export default function TestStylingPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind CSS Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Basic Tailwind Classes</h2>
          <p className="text-gray-600 mb-4">This page tests if Tailwind CSS is working properly.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-500 text-white p-4 rounded">Blue Box</div>
            <div className="bg-green-500 text-white p-4 rounded">Green Box</div>
            <div className="bg-red-500 text-white p-4 rounded">Red Box</div>
          </div>
          
          <button className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700 transition-colors">
            Test Button
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Custom CSS Classes</h2>
          <div className="card">
            <h3 className="card-title">Card Title</h3>
            <p className="card-description">This tests our custom CSS classes.</p>
            <div className="card-action">
              <span>Action</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
