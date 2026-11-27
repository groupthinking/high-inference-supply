# High Inference (`highinference.com`) — Shopify Theme & Headless Storefront

This repository contains **both** production Shopify implementations with **zero hardcoded mockups and zero fake carts**:

## 1. Shopify Online Store 2.0 Theme (`shopify-theme/` + `high-inference-theme.zip`)

Upload `high-inference-theme.zip` directly in **Shopify Admin → Online Store → Themes → Add theme → Upload zip file**.

- Pulls **only real Shopify products & variants** synced from your fulfillment vendor (e.g., Printify / SwiftPOD).
- Uses Shopify's native **Cart AJAX API** (`/cart.js`, `/cart/add.js`, `/cart/change.js`), native `{% form 'product' %}`, `{{ form | payment_button }}`, and real **Shopify Checkout**.
- Automatically renders all Shopify-required legal policies (`shop.policies`: Privacy Policy, Terms of Service, Refund Policy, Shipping Policy, Contact Information) and `shop.enabled_payment_types` in `sections/footer.liquid`.
- Includes `{{ product | structured_data }}` JSON-LD and optional garment metafields (`custom.garment_blank`, `custom.print_method`).
- Includes opt-in `Haptics [ Off / On ]` toggle (`assets/haptics.js`).

## 2. Headless Shopify Storefront (`src/`)

A Vite storefront powered directly by the **Shopify Storefront GraphQL API (`2026-01`)**:

- Queries live `products`, `variants`, and `shop` policies (`privacyPolicy`, `termsOfService`, `refundPolicy`, `shippingPolicy`).
- Mutates real Shopify carts via `cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, and `cartLinesRemove`, routing straight to `cart.checkoutUrl`.
- Copy `.env.example` to `.env` (or add the variables in Vercel) to connect your live `highinference.com` Shopify store:

```bash
VITE_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
VITE_SHOPIFY_STOREFRONT_TOKEN=your-public-storefront-access-token
```

When `.env` is not configured, it connects to Shopify's official `https://mock.shop/api/2026-01/graphql.json` reference API so every GraphQL query and cart mutation runs against real Shopify Storefront infrastructure.
