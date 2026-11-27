/**
 * Real Shopify Storefront GraphQL API client (2026-01).
 * Connects to your live store when VITE_SHOPIFY_STORE_DOMAIN and
 * VITE_SHOPIFY_STOREFRONT_TOKEN are configured, or falls back to
 * Shopify's official mock.shop reference Storefront API without credentials.
 */

const API_VERSION = '2026-01';
const CONFIGURED_DOMAIN = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || '').trim();
const CONFIGURED_TOKEN = (import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '').trim();

export const IS_LIVE_STORE = Boolean(CONFIGURED_DOMAIN && CONFIGURED_TOKEN);
export const ENDPOINT = IS_LIVE_STORE
  ? `https://${CONFIGURED_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/api/${API_VERSION}/graphql.json`
  : `https://mock.shop/api/${API_VERSION}/graphql.json`;

export const STOREFRONT_QUERY = `
  query StorefrontCatalog($first: Int!) {
    shop {
      name
      description
      privacyPolicy {
        title
        body
      }
      termsOfService {
        title
        body
      }
      refundPolicy {
        title
        body
      }
      shippingPolicy {
        title
        body
      }
    }
    products(first: $first) {
      edges {
        node {
          id
          handle
          title
          vendor
          description
          availableForSale
          featuredImage {
            url
            altText
          }
          images(first: 6) {
            edges {
              node {
                url
                altText
              }
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 25) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    cost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
    }
    lines(first: 50) {
      edges {
        node {
          id
          quantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          merchandise {
            ... on ProductVariant {
              id
              title
              product {
                title
                handle
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  }
`;

export const CART_QUERY = `
  ${CART_FRAGMENT}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`;

export const CART_CREATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_ADD_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_UPDATE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export const CART_LINES_REMOVE_MUTATION = `
  ${CART_FRAGMENT}
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFields
      }
      userErrors {
        field
        message
      }
    }
  }
`;

export async function storefrontFetch(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (IS_LIVE_STORE) {
    headers['X-Shopify-Storefront-Access-Token'] = CONFIGURED_TOKEN;
  }

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify Storefront API error (${res.status})`);
  }

  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data;
}

export async function fetchStorefrontCatalog(first = 24) {
  return storefrontFetch(STOREFRONT_QUERY, { first });
}

export async function fetchCart(cartId) {
  const data = await storefrontFetch(CART_QUERY, { cartId });
  return data.cart;
}

export async function createCartWithLine(merchandiseId, quantity = 1) {
  const data = await storefrontFetch(CART_CREATE_MUTATION, {
    lines: [{ merchandiseId, quantity }],
  });
  const err = data.cartCreate.userErrors?.[0];
  if (err) throw new Error(err.message);
  return data.cartCreate.cart;
}

export async function addCartLine(cartId, merchandiseId, quantity = 1) {
  const data = await storefrontFetch(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });
  const err = data.cartLinesAdd.userErrors?.[0];
  if (err) throw new Error(err.message);
  return data.cartLinesAdd.cart;
}

export async function updateCartLine(cartId, lineId, quantity) {
  if (quantity <= 0) {
    return removeCartLine(cartId, lineId);
  }
  const data = await storefrontFetch(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  const err = data.cartLinesUpdate.userErrors?.[0];
  if (err) throw new Error(err.message);
  return data.cartLinesUpdate.cart;
}

export async function removeCartLine(cartId, lineId) {
  const data = await storefrontFetch(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId],
  });
  const err = data.cartLinesRemove.userErrors?.[0];
  if (err) throw new Error(err.message);
  return data.cartLinesRemove.cart;
}

export function formatMoney(money) {
  if (!money) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode || 'USD',
  }).format(Number(money.amount || 0));
}
