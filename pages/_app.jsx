import '../src/index.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import ErrorBoundary from '../src/components/ErrorBoundary';
import { AuthProvider } from '../src/contexts/AuthContext';
import MainLayout from '../src/layouts/MainLayout';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const noLayoutRoutes = new Set(['/login', '/register']);
  const wantsNoLayout = Component.noLayout === true || noLayoutRoutes.has(router.pathname);

  return (
    <ErrorBoundary>
      <Head>
        <link rel="icon" href="/favicon.svg" />
        <meta name="theme-color" content="#ec4899" />
      </Head>
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

