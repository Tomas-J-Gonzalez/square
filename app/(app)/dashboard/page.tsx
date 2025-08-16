import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link 
              href="/dashboard/create" 
              className="block w-full bg-pink-500 text-white py-2 px-4 rounded-lg text-center hover:bg-pink-600 transition-colors"
            >
              Create New Event
            </Link>
            <Link 
              href="/dashboard/events" 
              className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg text-center hover:bg-gray-200 transition-colors"
            >
              View My Events
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Events</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Events</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Participants</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-gray-500 text-sm">
            <p>No recent activity</p>
            <p className="mt-2">Create your first event to get started!</p>
          </div>
        </div>
      </div>

      {/* Fun Section */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Take a Break</h3>
          <p className="text-gray-600 mb-4">Need a quick break? Play a game while you wait for your event to start!</p>
          <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
            Play Dex Vex
          </button>
        </div>
      </div>
    </div>
  );
}
