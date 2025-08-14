import '../src/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import MainLayout from '../src/layouts/MainLayout';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getAssetUrl } from '../src/utils/assetUrl';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const noLayoutRoutes = new Set(['/login', '/register']);
  const wantsNoLayout = Component.noLayout === true || noLayoutRoutes.has(router.pathname);

  const AuthGatedLayout = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return children;
    return (
      <MainLayout>
        {children}
      </MainLayout>
    );
  };

  return (
    <ErrorBoundary>
      <Head>
        <link rel="icon" href="/favicon.png" sizes="32x32" type="image/png" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <meta name="theme-color" content="#ec4899" />
      </Head>
      <AuthProvider>
        {wantsNoLayout ? (
          <Component {...pageProps} />
        ) : (
          <AuthGatedLayout>
            <Component {...pageProps} />
          </AuthGatedLayout>
        )}
      </AuthProvider>
    </ErrorBoundary>
  );
}

