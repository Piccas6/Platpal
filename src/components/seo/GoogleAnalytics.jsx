import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function GoogleAnalytics({ measurementId = 'G-XXXXXXXXXX' }) {
  // Solo cargar en producción
  if (process.env.NODE_ENV !== 'production' || !measurementId || measurementId === 'G-XXXXXXXXXX') {
    return null;
  }

  return (
    <Helmet>
      {/* Google Analytics */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}></script>
      <script>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            cookie_flags: 'SameSite=None;Secure'
          });
        `}
      </script>
    </Helmet>
  );
}

// Hook para trackear eventos personalizados
export const useAnalytics = () => {
  const trackEvent = (eventName, eventParams = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
  };

  const trackPageView = (url) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      });
    }
  };

  return { trackEvent, trackPageView };
};

// Eventos comunes
export const AnalyticsEvents = {
  // Menús
  MENU_VIEWED: 'menu_viewed',
  MENU_RESERVED: 'menu_reserved',
  RESERVATION_COMPLETED: 'reservation_completed',
  
  // Campus
  CAMPUS_SELECTED: 'campus_selected',
  
  // Bonos
  BONO_VIEWED: 'bono_viewed',
  BONO_PURCHASED: 'bono_purchased',
  
  // Office
  OFFICE_MENU_VIEWED: 'office_menu_viewed',
  OFFICE_ORDER_PLACED: 'office_order_placed',
  
  // Engagement
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  FAQ_VIEWED: 'faq_viewed',
  
  // Social
  SOCIAL_SHARE: 'social_share'
};