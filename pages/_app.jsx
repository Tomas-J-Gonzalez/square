import '../src/index.css';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/contexts/AuthContext';
import MainLayout from '../src/layouts/MainLayout';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const noLayoutRoutes = new Set(['/login', '/register']);
  const wantsNoLayout = Component.noLayout === true || noLayoutRoutes.has(router.pathname);

  return (
    <ErrorBoundary>
      <AuthProvider>
        {wantsNoLayout ? (
          <Component {...pageProps} />
        ) : (
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

