// pages/_app.tsx
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo-config';
import '../styles/globals.css';

import { useEffect } from 'react';
import Router from 'next/router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Toaster } from 'react-hot-toast';

// Optional layout pattern
type NextPageWithLayout = AppProps['Component'] & {
  getLayout?: (page: React.ReactNode) => React.ReactNode;
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const PageComponent = Component as NextPageWithLayout;
  const getLayout = PageComponent.getLayout ?? ((page) => page);

  // Progress bar for route changes
  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleStop);
    Router.events.on('routeChangeError', handleStop);

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleStop);
      Router.events.off('routeChangeError', handleStop);
    };
  }, []);

  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <DefaultSeo {...SEO} />
        <Toaster position="top-right" reverseOrder={false} />
        {getLayout(<Component {...pageProps} />)}
      </AuthProvider>
    </SessionProvider>
  );
}
