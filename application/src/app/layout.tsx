import type { Metadata } from 'next';
import { Geist, Geist_Mono, Roboto, Plus_Jakarta_Sans, Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { Providers } from 'context/Providers';
import WithLoadingSpinner from 'components/Common/LoadingSpinner/LoadingSpinner';
import { I18nProvider } from 'context/I18nContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta-sans',
});

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SeaNotes',
  description: 'SeaNotes - A SaaS Starter Kit note-taking app from DigitalOcean',
};

/**
 * Root layout of the application.
 * Applies global fonts, base styles and provides shared context through the Providers component.
 *
 * @returns HTML layout with fonts and providers applied.
 */
const RootLayout = ({ children }: { children: React.ReactNode }) => {
  const locale = cookies().get('locale')?.value === 'en' ? 'en' : 'ar';
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={`${roboto.variable} ${plusJakartaSans.variable} ${inter.variable}`}>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{ margin: 0, WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' }}
      >
        <I18nProvider initialLocale={locale}>
          <Providers>
            <WithLoadingSpinner>{children}</WithLoadingSpinner>
          </Providers>
        </I18nProvider>
      </body>
    </html>
  );
};

export default RootLayout;
