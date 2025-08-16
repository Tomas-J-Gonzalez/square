export default function TestInlinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#2563eb',
          marginBottom: '2rem'
        }}>
          Inline Styles Test
        </h1>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            This page uses inline styles
          </h2>
          <p style={{
            color: '#6b7280',
            marginBottom: '1rem'
          }}>
            If you can see this styled content, CSS is working but Tailwind might not be.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              Blue Box
            </div>
            <div style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              Green Box
            </div>
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '1rem',
              borderRadius: '4px'
            }}>
              Red Box
            </div>
          </div>
          
          <button style={{
            backgroundColor: '#ec4899',
            color: 'white',
            padding: '0.5rem 1.5rem',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            Test Button
          </button>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          padding: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '1rem'
          }}>
            Tailwind Classes Test
          </h2>
          <div className="bg-blue-500 text-white p-4 rounded mb-4">
            This should be blue if Tailwind is working
          </div>
          <div className="bg-green-500 text-white p-4 rounded mb-4">
            This should be green if Tailwind is working
          </div>
          <div className="bg-red-500 text-white p-4 rounded">
            This should be red if Tailwind is working
          </div>
        </div>
      </div>
    </div>
  );
}
