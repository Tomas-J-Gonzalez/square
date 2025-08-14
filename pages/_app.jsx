import '../src/index.css';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/contexts/AuthContext';
import MainLayout from '../src/layouts/MainLayout';

export default function MyApp({ Component, pageProps }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainLayout>
          <Component {...pageProps} />
        </MainLayout>
      </AuthProvider>
    </ErrorBoundary>
  );
}

