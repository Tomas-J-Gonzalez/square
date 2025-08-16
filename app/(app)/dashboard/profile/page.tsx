export default function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Your Name</h3>
                <p className="text-gray-600">your@email.com</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="First Name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Last Name"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            </div>
            
            <div className="pt-4">
              <button className="bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors">
                Update Profile
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Stats</h2>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">0</div>
              <div className="text-sm text-gray-600">Events Created</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">0</div>
              <div className="text-sm text-gray-600">Events Attended</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">0</div>
              <div className="text-sm text-gray-600">Friends Made</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
