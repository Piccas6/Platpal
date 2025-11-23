import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEOHead({
  title = 'PlatPal - Menús Sostenibles desde 2,99€',
  description = 'Rescata deliciosos menús de las cafeterías universitarias antes de que se desperdicien. Comida de calidad por solo 2,99€ y ayuda al medio ambiente.',
  keywords = 'menús baratos, comida estudiantes, menús sostenibles, ahorro comida, cafetería universidad, comida 3 euros, reducir desperdicio alimentario',
  image = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a77c0a8a0286e1f5d59edb/ca5d210a4_ChatGPTImage17sept202520_10_05.png',
  url = typeof window !== 'undefined' ? window.location.href : 'https://platpal.app',
  type = 'website',
  locale = 'es_ES',
  canonicalUrl,
  noindex = false,
  structuredData
}) {
  const siteName = 'PlatPal';
  const twitterHandle = '@platpal';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}
      <meta name="language" content="Spanish" />
      <meta name="author" content="PlatPal Team" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:site" content={twitterHandle} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* PWA Meta Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PlatPal" />
      
      {/* Geo Meta Tags */}
      <meta name="geo.region" content="ES-CA" />
      <meta name="geo.placename" content="Cádiz, España" />
      <meta name="geo.position" content="36.5297;-6.2925" />
      <meta name="ICBM" content="36.5297, -6.2925" />
    </Helmet>
  );
}