export function initAct4Spread() {
  const section = document.getElementById('act-4');
  if (!section) return;

  section.innerHTML = `
    <div class="gallery-wrap">
      <div class="editorial-quote" data-reveal>
        <span class="chapter-intro__num">Chapter III · Editorial</span>
        <blockquote class="editorial-quote__text">
          “The finest artifacts are built around a community, never a logo — cut in cotton, canvas, and thread to outlast every checkpoint.”
        </blockquote>
        <p class="editorial-quote__attr">High Inference — Probable Systems Archive, Autumn 2026</p>
      </div>

      <div class="lookbook">
        <figure class="lookbook__plate lookbook__plate--hero" data-reveal>
          <img
            src="assets/spread-board-one.webp"
            alt="High Inference Board One — The Archive"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="lookbook__cap">
            <span>Plate I — The Archive</span>
            <span>Field Garments · Volume 01</span>
          </figcaption>
        </figure>

        <div class="lookbook__pair">
          <figure class="lookbook__plate" data-reveal>
            <img
              src="assets/spread-two-ways.webp"
              alt="High Inference, Two Ways — Visual Studies 01"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="lookbook__cap">
              <span>Plate II — Visual Studies</span>
              <span>Low Evidence · High Confidence</span>
            </figcaption>
          </figure>

          <figure class="lookbook__plate" data-reveal>
            <img
              src="assets/spread-board-three.webp"
              alt="High Inference — The Satire Capsule"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="lookbook__cap">
              <span>Plate III — The Satire Capsule</span>
              <span>Human in the Loop</span>
            </figcaption>
          </figure>
        </div>
      </div>

      <div class="atelier-notes" data-reveal>
        <div class="atelier-notes__col">
          <h4>Quiet Provenance</h4>
          <p>
            Every garment is anchored discreetly by our four-tier mark hierarchy — woven satin neck labels,
            tonal hem stamps, and reflective micro-tabs rather than loud chest branding.
          </p>
        </div>
        <div class="atelier-notes__col">
          <h4>Substantial Weight</h4>
          <p>
            No promotional blanks. Each piece is milled on 6.1 oz garment-dyed Comfort Colors 6014,
            270–280 GSM combed cotton, 420 GSM organic fleece, or 12 oz washed duck canvas.
          </p>
        </div>
        <div class="atelier-notes__col">
          <h4>Archival Fulfillment</h4>
          <p>
            Dispatched in matte-black archival packaging with structured catalog metadata and native
            <code>Shopify.actions</code> readiness for seamless human and agentic checkout.
          </p>
        </div>
      </div>
    </div>
  `;
}
