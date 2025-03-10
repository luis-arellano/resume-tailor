'use client';

import Script from 'next/script';

const redditPixelId = 'a2_gac5vp85s6mi';

// Helper function to call rdt safely
const trackEvent = (eventName, params = {}) => {
  if (typeof window !== 'undefined' && window.rdt) {
    window.rdt('track', eventName, params);
  }
};

export default function RedditPixel() {
  return (
    <>
      <Script
        id="reddit-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt('init','${redditPixelId}');
            rdt('track', 'PageVisit');
          `,
        }}
      />
    </>
  );
}