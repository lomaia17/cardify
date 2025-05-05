// pages/_app.tsx
import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '../context/AuthContext';
import { DefaultSeo } from 'next-seo';
import SEO from '../next-seo-config';
import '../styles/globals.css'
export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <DefaultSeo {...SEO} />
        <Component {...pageProps} />
      </AuthProvider>
    </SessionProvider>
  );
}
