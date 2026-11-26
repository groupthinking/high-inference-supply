export function initAct4Spread() {
  const section = document.getElementById('act-4');
  if (!section) return;

  section.innerHTML = `
    <div class="chapter-header">
      <div class="chapter-header__index">ACT 04 // ANALOG SPREAD</div>
      <div class="chapter-header__body">
        <h2 class="chapter-header__title">Shoppers Go Analog</h2>
        <p class="chapter-header__desc">
          The best merch is built around the community, not the logo. Heavyweight cotton, cracked plastisol,
          brass rivets, and screenprinted schematics built to outlast the next model checkpoint.
        </p>
      </div>
    </div>

    <div class="spread-layout">
      <figure class="spread-plate spread-plate--wide" data-reveal>
        <img
          src="assets/spread-board-one.webp"
          alt="High Inference Board One — The Archive flatlay"
          loading="lazy"
          decoding="async"
        />
        <figcaption class="spread-plate__cap">
          <span>PLATE 01 // BOARD ONE — THE ARCHIVE</span>
          <span>FIELD GARMENTS · VOLUME 01</span>
        </figcaption>
      </figure>

      <div class="spread-duo">
        <figure class="spread-plate" data-reveal>
          <img
            src="assets/spread-two-ways.webp"
            alt="High Inference, Two Ways — Neural Archive and Optical Study"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="spread-plate__cap">
            <span>PLATE 02 // VISUAL STUDIES 01</span>
            <span>LOW EVIDENCE · HIGH CONFIDENCE</span>
          </figcaption>
        </figure>

        <figure class="spread-plate" data-reveal>
          <img
            src="assets/spread-board-three.webp"
            alt="High Inference Board Three — The Satire Capsule"
            loading="lazy"
            decoding="async"
          />
          <figcaption class="spread-plate__cap">
            <span>PLATE 03 // THE SATIRE CAPSULE</span>
            <span>HUMAN IN THE LOOP = ME</span>
          </figcaption>
        </figure>
      </div>

      <div class="manifesto-strip" data-reveal>
        <div class="manifesto-strip__col">
          <span class="mono-tag">01 / MARK HIERARCHY</span>
          <p>
            Anchored quietly by our 4-tier identity system: Horizon Flare woven neck labels,
            Lab Spec Plate (HI—01) hem stamps, Vector Apex reflective hits, and Tensor HI micro-tabs.
          </p>
        </div>
        <div class="manifesto-strip__col">
          <span class="mono-tag">02 / TACTILE SPECIFICATION</span>
          <p>
            Zero thin blanks. Every piece is spec’d on 6.1 oz garment-dyed Comfort Colors 6014,
            270–280 GSM combed cotton, 420 GSM boxy fleece, or 12 oz washed duck canvas.
          </p>
        </div>
        <div class="manifesto-strip__col">
          <span class="mono-tag">03 / AGENTIC READY</span>
          <p>
            Structured catalog metadata, variant packaging specs, and standard <code>Shopify.actions</code>
            hooks ensure seamless human and WebMCP browser-agent checkout on highinference.com.
          </p>
        </div>
      </div>
    </div>
  `;
}
