(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))r(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const c of n.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&r(c)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function r(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}})();const C="2026-01",E="".trim(),I="".trim(),y=!!(E&&I),w=y?`https://${E.replace(/^https?:\/\//,"").replace(/\/$/,"")}/api/${C}/graphql.json`:`https://mock.shop/api/${C}/graphql.json`,O=`
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
`,f=`
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
`,T=`
  ${f}
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFields
    }
  }
`,P=`
  ${f}
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
`,M=`
  ${f}
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
`,N=`
  ${f}
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
`,A=`
  ${f}
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
`;async function p(t,e={}){var n;const i={"Content-Type":"application/json"};y&&(i["X-Shopify-Storefront-Access-Token"]=I);const r=await fetch(w,{method:"POST",headers:i,body:JSON.stringify({query:t,variables:e})});if(!r.ok)throw new Error(`Shopify Storefront API error (${r.status})`);const s=await r.json();if((n=s.errors)!=null&&n.length)throw new Error(s.errors.map(c=>c.message).join("; "));return s.data}async function k(t=24){return p(O,{first:t})}async function B(t){return(await p(T,{cartId:t})).cart}async function R(t,e=1){var s;const i=await p(P,{lines:[{merchandiseId:t,quantity:e}]}),r=(s=i.cartCreate.userErrors)==null?void 0:s[0];if(r)throw new Error(r.message);return i.cartCreate.cart}async function F(t,e,i=1){var n;const r=await p(M,{cartId:t,lines:[{merchandiseId:e,quantity:i}]}),s=(n=r.cartLinesAdd.userErrors)==null?void 0:n[0];if(s)throw new Error(s.message);return r.cartLinesAdd.cart}async function U(t,e,i){var n;if(i<=0)return S(t,e);const r=await p(N,{cartId:t,lines:[{id:e,quantity:i}]}),s=(n=r.cartLinesUpdate.userErrors)==null?void 0:n[0];if(s)throw new Error(s.message);return r.cartLinesUpdate.cart}async function S(t,e){var s;const i=await p(A,{cartId:t,lineIds:[e]}),r=(s=i.cartLinesRemove.userErrors)==null?void 0:s[0];if(r)throw new Error(r.message);return i.cartLinesRemove.cart}function m(t){return t?new Intl.NumberFormat("en-US",{style:"currency",currency:t.currencyCode||"USD"}).format(Number(t.amount||0)):""}const $="hi_supply_haptics_enabled",x={toggleOn:[14,28,22],addBag:[18,32,28],addCompleteSet:[20,26,20,26,44],stageOpen:[16,24,12],stageClose:[12],drawerOpen:[14,20,14],drawerClose:[10],chapterNav:[12,18,10],sizeChange:[8],angleChange:[10],qtyChange:[8],checkout:[24,30,24,30,50]};class D{constructor(){this.enabled=!1,this.supported=typeof navigator<"u"&&typeof navigator.vibrate=="function",this.loadPreference()}loadPreference(){try{const e=window.localStorage.getItem($);this.enabled=e==="true"}catch{this.enabled=!1}}isEnabled(){return this.enabled}setEnabled(e){this.enabled=!!e;try{window.localStorage.setItem($,String(this.enabled))}catch{}return this.enabled&&this.trigger("toggleOn",!0),this.enabled}toggle(){return this.setEnabled(!this.enabled)}trigger(e,i=!1){if(!this.supported||!this.enabled&&!i)return!1;const r=x[e]??[10];try{return navigator.vibrate(r)}catch{return!1}}}const d=new D,_=y?"hi_shopify_cart_id_live":"hi_shopify_cart_id_mock",a={shop:null,products:[],cart:null,activeProduct:null,activePolicy:null,drawerOpen:!1,busy:!1},o={banner:document.getElementById("api-banner"),storeName:document.getElementById("store-name"),footerStoreName:document.getElementById("footer-store-name"),catalogCount:document.getElementById("catalog-count"),grid:document.getElementById("product-grid"),policyLinks:document.getElementById("policy-links"),hapticsBtn:document.getElementById("haptics-toggle"),hapticsState:document.getElementById("haptics-state"),cartOpenBtn:document.getElementById("cart-open-btn"),cartCount:document.getElementById("cart-count"),backdrop:document.getElementById("modal-backdrop"),productModal:document.getElementById("product-modal"),policyModal:document.getElementById("policy-modal"),drawer:document.getElementById("cart-drawer")};function v(t){try{t?window.localStorage.setItem(_,t):window.localStorage.removeItem(_)}catch{}}function q(){try{return window.localStorage.getItem(_)}catch{return null}}function g(){const t=a.drawerOpen||!!a.activeProduct||!!a.activePolicy;o.backdrop.classList.toggle("is-open",t),document.body.classList.toggle("hi-no-scroll",t)}function L(){const t=d.isEnabled();o.hapticsBtn.setAttribute("aria-pressed",String(t)),o.hapticsState.textContent=t?"On":"Off"}function H(){if(y){o.banner.hidden=!0;return}o.banner.hidden=!1,o.banner.innerHTML=`
    <div class="hi-wrap hi-banner__inner">
      <span>Reference Storefront API (<code>mock.shop</code>) — set <code>VITE_SHOPIFY_STORE_DOMAIN</code> &amp; <code>VITE_SHOPIFY_STOREFRONT_TOKEN</code> in <code>.env</code> to connect live <code>highinference.com</code> vendor inventory.</span>
    </div>
  `}function j(){if(a.products.length===0){o.catalogCount.textContent="0 products",o.grid.innerHTML=`
      <div class="hi-empty">
        <h2>No products returned from Shopify</h2>
        <p>Publish vendor-backed products (e.g. Printify / SwiftPOD) to the Headless or Storefront sales channel in Shopify Admin.</p>
      </div>
    `;return}o.catalogCount.textContent=`${a.products.length} products`,o.grid.innerHTML=a.products.map(t=>{var r;const e=t.featuredImage,i=m((r=t.priceRange)==null?void 0:r.minVariantPrice);return`
        <article class="hi-card">
          <button type="button" class="hi-card__trigger" data-open-product="${t.id}">
            <div class="hi-card__media">
              ${e?`<img src="${e.url}" alt="${e.altText||t.title}" class="hi-card__img" loading="lazy" />`:'<div class="hi-card__empty">No image</div>'}
              ${t.availableForSale?"":'<span class="hi-card__badge">Sold out</span>'}
            </div>
            <div class="hi-card__meta">
              <h2 class="hi-card__title">${t.title}</h2>
              <span class="hi-card__price">${i}</span>
            </div>
            ${t.vendor?`<p class="hi-card__vendor">${t.vendor}</p>`:""}
          </button>
        </article>
      `}).join("")}function V(){if(!a.shop)return;const t=[a.shop.privacyPolicy,a.shop.termsOfService,a.shop.refundPolicy,a.shop.shippingPolicy].filter(e=>e&&e.body);if(t.length===0){o.policyLinks.innerHTML='<span class="hi-footer__note">Configure legal policies in Shopify Admin → Settings → Policies.</span>';return}o.policyLinks.innerHTML=t.map((e,i)=>`<button type="button" class="hi-footer__link" data-open-policy="${i}">${e.title}</button>`).join(""),o.policyLinks._policies=t}function l(){const t=a.activeProduct,e=!!t;if(o.productModal.classList.toggle("is-open",e),o.productModal.setAttribute("aria-hidden",String(!e)),!t){o.productModal.innerHTML="",g();return}const i=t.variants.edges.map(n=>n.node),r=i.find(n=>n.availableForSale)||i[0],s=t.images.edges.map(n=>n.node);o.productModal.innerHTML=`
    <div class="hi-modal__shell">
      <div class="hi-modal__head">
        <span class="hi-kicker">${t.vendor||"Shopify Catalog"}</span>
        <button type="button" class="hi-header__btn" id="close-product-modal">Close</button>
      </div>
      <div class="hi-modal__grid">
        <div class="hi-modal__media">
          ${s.length?s.map(n=>`<img src="${n.url}" alt="${n.altText||t.title}" class="hi-modal__img" />`).join(""):'<div class="hi-card__empty">No image</div>'}
        </div>
        <div class="hi-modal__body">
          <h2 id="modal-title" class="hi-product__title">${t.title}</h2>
          <p class="hi-product__price" id="modal-price">${m(r==null?void 0:r.price)}</p>
          ${t.description?`<p class="hi-product__desc">${t.description}</p>`:""}

          <form id="modal-add-form" class="hi-product__form">
            ${i.length>1?`
              <label for="modal-variant-select" class="hi-label">Option</label>
              <select id="modal-variant-select" class="hi-select">
                ${i.map(n=>`
                  <option value="${n.id}" data-price="${m(n.price)}" ${n.id===(r==null?void 0:r.id)?"selected":""} ${n.availableForSale?"":"disabled"}>
                    ${n.title}${n.availableForSale?"":" — Sold out"}
                  </option>
                `).join("")}
              </select>
            `:`<input type="hidden" id="modal-variant-select" value="${(r==null?void 0:r.id)||""}" />`}
            <button
              type="submit"
              class="hi-btn hi-btn--solid hi-btn--full"
              ${!(r!=null&&r.availableForSale)||a.busy?"disabled":""}
            >
              ${r!=null&&r.availableForSale?a.busy?"Adding…":"Add to bag":"Sold out"}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,g()}function h(){const t=a.activePolicy,e=!!t;if(o.policyModal.classList.toggle("is-open",e),o.policyModal.setAttribute("aria-hidden",String(!e)),!t){o.policyModal.innerHTML="",g();return}o.policyModal.innerHTML=`
    <div class="hi-modal__shell hi-modal__shell--narrow">
      <div class="hi-modal__head">
        <h2 id="policy-modal-title" class="hi-kicker">${t.title}</h2>
        <button type="button" class="hi-header__btn" id="close-policy-modal">Close</button>
      </div>
      <div class="hi-policy-body">${t.body}</div>
    </div>
  `,g()}function u(){var r,s;o.drawer.classList.toggle("is-open",a.drawerOpen),o.drawer.setAttribute("aria-hidden",String(!a.drawerOpen)),o.cartOpenBtn.setAttribute("aria-expanded",String(a.drawerOpen));const t=a.cart,e=(t==null?void 0:t.totalQuantity)||0;o.cartCount.textContent=String(e);const i=((s=(r=t==null?void 0:t.lines)==null?void 0:r.edges)==null?void 0:s.map(n=>n.node))||[];o.drawer.innerHTML=`
    <div class="hi-drawer__head">
      <h2>Bag (${e})</h2>
      <button type="button" class="hi-header__btn" id="cart-close-btn">Close</button>
    </div>
    <div class="hi-drawer__body">
      ${i.length===0?'<p class="hi-footer__note">Your Shopify cart is empty.</p>':i.map(n=>{const c=n.merchandise,b=c.title&&c.title!=="Default Title"?c.title:"";return`
                  <div class="hi-drawer-item">
                    ${c.image?`<img src="${c.image.url}" alt="${c.image.altText||c.product.title}" />`:"<div></div>"}
                    <div>
                      <p class="hi-cart-item__title">${c.product.title}</p>
                      ${b?`<p class="hi-cart-item__variant">${b}</p>`:""}
                      <p class="hi-cart-item__price">${m(n.cost.totalAmount)}</p>
                      <div class="hi-cart-item__controls">
                        <div class="hi-drawer-qty">
                          <button type="button" data-line-id="${n.id}" data-next-qty="${n.quantity-1}" aria-label="Decrease quantity">−</button>
                          <span>${n.quantity}</span>
                          <button type="button" data-line-id="${n.id}" data-next-qty="${n.quantity+1}" aria-label="Increase quantity">+</button>
                        </div>
                        <button type="button" class="hi-header__btn" data-line-id="${n.id}" data-next-qty="0">Remove</button>
                      </div>
                    </div>
                  </div>
                `}).join("")}
    </div>
    ${i.length>0?`
      <div class="hi-drawer__foot">
        <div class="hi-cart-summary__row">
          <span>Subtotal</span>
          <strong>${m(t.cost.subtotalAmount)}</strong>
        </div>
        <p class="hi-cart-summary__note">Taxes and shipping calculated at Shopify Checkout.</p>
        <a
          href="${t.checkoutUrl}"
          class="hi-btn hi-btn--solid hi-btn--full"
          rel="noopener"
        >Proceed to Shopify Checkout</a>
      </div>
    `:""}
  `,g()}async function Y(t){var e;if(!(!t||a.busy)){a.busy=!0,l();try{(e=a.cart)!=null&&e.id?a.cart=await F(a.cart.id,t,1):(a.cart=await R(t,1),v(a.cart.id)),d.trigger("addBag"),a.activeProduct=null,a.drawerOpen=!0}catch(i){alert(i.message||"Unable to add item to Shopify cart.")}finally{a.busy=!1,l(),u()}}}async function G(t,e){var i;if(!(!((i=a.cart)!=null&&i.id)||a.busy)){a.busy=!0;try{a.cart=e<=0?await S(a.cart.id,t):await U(a.cart.id,t,e),d.trigger("qtyChange")}catch(r){alert(r.message||"Unable to update cart.")}finally{a.busy=!1,u()}}}function K(){o.hapticsBtn.addEventListener("click",()=>{d.toggle(),L()}),o.cartOpenBtn.addEventListener("click",()=>{a.activeProduct=null,a.activePolicy=null,a.drawerOpen=!0,d.trigger("drawerOpen"),l(),h(),u()}),o.grid.addEventListener("click",t=>{const e=t.target.closest("[data-open-product]");if(!e)return;const i=a.products.find(r=>r.id===e.dataset.openProduct);i&&(a.activeProduct=i,d.trigger("stageOpen"),l())}),o.policyLinks.addEventListener("click",t=>{const e=t.target.closest("[data-open-policy]");!e||!o.policyLinks._policies||(a.activePolicy=o.policyLinks._policies[Number(e.dataset.openPolicy)]||null,h())}),o.productModal.addEventListener("click",t=>{(t.target===o.productModal||t.target.closest("#close-product-modal"))&&(a.activeProduct=null,d.trigger("stageClose"),l())}),o.productModal.addEventListener("change",t=>{if(t.target.id==="modal-variant-select"){const e=t.target.options[t.target.selectedIndex],i=document.getElementById("modal-price");e!=null&&e.dataset.price&&i&&(i.textContent=e.dataset.price),d.trigger("sizeChange")}}),o.productModal.addEventListener("submit",t=>{if(t.target.id!=="modal-add-form")return;t.preventDefault();const e=document.getElementById("modal-variant-select");e!=null&&e.value&&Y(e.value)}),o.policyModal.addEventListener("click",t=>{(t.target===o.policyModal||t.target.closest("#close-policy-modal"))&&(a.activePolicy=null,h())}),o.drawer.addEventListener("click",t=>{if(t.target.closest("#cart-close-btn")){a.drawerOpen=!1,d.trigger("drawerClose"),u();return}const e=t.target.closest("[data-line-id]");e&&G(e.dataset.lineId,Number(e.dataset.nextQty))}),o.backdrop.addEventListener("click",()=>{a.activeProduct=null,a.activePolicy=null,a.drawerOpen=!1,l(),h(),u()}),window.addEventListener("keydown",t=>{t.key==="Escape"&&(a.activeProduct||a.activePolicy||a.drawerOpen)&&(a.activeProduct=null,a.activePolicy=null,a.drawerOpen=!1,l(),h(),u())})}async function Q(){var t;L(),H(),K();try{const e=await k(24);a.shop=e.shop,a.products=e.products.edges.map(s=>s.node);const i=y&&((t=e.shop)!=null&&t.name)?e.shop.name:"High Inference";o.storeName.textContent=i,o.footerStoreName.textContent=i,j(),V();const r=q();if(r)try{const s=await B(r);s?a.cart=s:v(null)}catch{v(null)}u()}catch(e){o.catalogCount.textContent="Connection error",o.grid.innerHTML=`
      <div class="hi-empty">
        <h2>Unable to reach Shopify Storefront API</h2>
        <p>${e.message}</p>
        <p>Endpoint: <code>${w}</code></p>
      </div>
    `}}Q();
