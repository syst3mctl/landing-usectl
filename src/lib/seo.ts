// The pieces of search/share identity that are the SAME in every language. Everything that gets
// translated — title, description, share description, keywords, the share image's alt — lives in
// the per-language dictionaries (`seo` in src/lib/i18n/en.ts · ka.ts), which is what
// app/[[...lang]]/layout.tsx builds its metadata from.

export const SITE_NAME = "UseCTL";
export const SITE_URL = "https://usectl.com";

// The cheapest plan the pricing calculator starts from — used by the JSON-LD offer.
export const STARTING_PRICE_USD = "15";
