export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="mt-2 text-gray-600">Page not found</p>
        </div>
        <a href="/" className="btn btn-primary btn-md">Go Home</a>
      </div>
    </div>
  );
}


