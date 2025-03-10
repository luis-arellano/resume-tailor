const REDDIT_ACCESS_TOKEN = process.env.REDDIT_CONVERSION_ACCESS_TOKEN;
const REDDIT_PIXEL_ID = 'a2_gac5vp85s6mi';  // Comes from Reddit site.

/**
 * Sends a conversion event to Reddit's API
 * @param {string} eventType - The type of conversion event (e.g., 'Purchase')
 * @param {Object} eventData - Additional data for the event (e.g., value, currency)
 * @returns {Promise} - The API response
 */
export async function sendRedditConversion(eventType, eventData = {}) {
  try {
    const response = await fetch(`https://ads-api.reddit.com/api/v2.0/conversions/events/${REDDIT_PIXEL_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REDDIT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test_mode: process.env.NODE_ENV !== 'production',
        events: [{
          event_at: new Date().toISOString(),
          event_type: {
            tracking_type: eventType
          },
          ...eventData
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Reddit conversion tracking error:', error);
    // You might want to log this error to your error tracking service
    throw error;
  }
}