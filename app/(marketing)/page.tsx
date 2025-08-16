import Link from 'next/link';

export default function MarketingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-20 px-0 sm:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 marketing-heading">
              Make plans that stick
            </h1>
            <p className="text-lg sm:text-xl text-gray-300">
              Make event planning fun, collaborative, and flake-proof
            </p>
          </div>
          
          <Link 
            href="/signup" 
            className="btn btn-primary inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
          >
            Create your event
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Feature Ribbon - Moving Ticker */}
      <section className="bg-white py-10 px-4 sm:px-8 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-12 animate-scroll whitespace-nowrap">
            {/* First set of items */}
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Make Events Fun</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Easy Event Creation</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V9H12v11h2v-6h1.5l1.49 6H20zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Collaborative Planning</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Punish Flakers</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Create Memories</span>
            </div>
            {/* Duplicate set for seamless loop */}
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Make Events Fun</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Easy Event Creation</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V9H12v11h2v-6h1.5l1.49 6H20zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Collaborative Planning</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Punish Flakers</span>
            </div>
            <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span className="font-medium text-gray-900 uppercase tracking-wide">Create Memories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-white py-20 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-8 marketing-heading">
            No more maybes. Just memories.
          </h2>
          <p className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Tired of flaky friends ruining your plans? We make event planning fun, collaborative, and flake-proof. 
            Create events, collect RSVPs, and keep everyone accountable with playful punishments and rewards. 
            Finally — planning hangouts that people actually show up to.
          </p>
        </div>
      </section>
    </>
  );
}
