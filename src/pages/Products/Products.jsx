import { useState, useMemo, useEffect } from "react";

/* -----------------------------------------------------------
   VENTURA — Products
   Filterable, sortable catalogue
   ----------------------------------------------------------- */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Jost:wght@300;400;500&display=swap');

.vp-root {
  --ink-0: #08080d;
  --ink-1: #10101a;
  --ink-2: #191926;
  --ink-3: #21212f;
  --line: rgba(216, 179, 106, 0.20);
  --line-soft: rgba(236,233,224,0.08);
  --gold-0: #d8b36a;
  --gold-1: #f4e6c3;
  --text: #ece9e0;
  --muted: #8f8d99;
  --star: #d8b36a;
  --grad-gold: linear-gradient(96deg, var(--gold-0) 0%, var(--gold-1) 55%, var(--gold-0) 100%);
  --field-bg: rgba(255,255,255,0.02);

  min-height: 100vh;
  background:
    radial-gradient(1000px 460px at 90% -8%, rgba(216,179,106,0.07), transparent 60%),
    var(--ink-0);
  color: var(--text);
  font-family: 'Jost', system-ui, sans-serif;
  font-weight: 300;
}

.vp-shell { max-width: 1360px; margin: 0 auto; padding: 0 clamp(18px, 4vw, 48px) 80px; }

/* Header */
.vp-header { padding: clamp(40px, 6vw, 64px) 0 28px; }
.vp-eyebrow { font-size: 11px; letter-spacing: 0.34em; text-transform: uppercase; color: var(--gold-0); margin: 0 0 14px; }
.vp-h1 {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: clamp(34px, 4.4vw, 52px);
  margin: 0 0 10px;
}
.vp-sub { margin: 0; color: var(--muted); font-size: 15px; max-width: 52ch; line-height: 1.7; }

/* Toolbar */
.vp-toolbar {
  display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  padding: 20px 0; margin-bottom: 8px;
  border-top: 1px solid var(--line-soft);
  border-bottom: 1px solid var(--line-soft);
}

.vp-search {
  flex: 1; min-width: 220px;
  display: flex; align-items: center; gap: 10px;
  border: 1px solid var(--line); border-radius: 999px;
  background: var(--field-bg); padding: 0 16px; height: 44px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}
.vp-search:focus-within { border-color: var(--gold-0); box-shadow: 0 0 0 3px rgba(216,179,106,0.08); }
.vp-search svg { width: 15px; height: 15px; color: var(--muted); flex: none; }
.vp-search input {
  flex: 1; min-width: 0; background: transparent; border: 0; outline: none;
  color: var(--text); font: 300 14px 'Jost', system-ui, sans-serif; letter-spacing: 0.02em;
}
.vp-search input::placeholder { color: var(--muted); }

.vp-sort-wrap { position: relative; }
.vp-sort {
  appearance: none; -webkit-appearance: none;
  height: 44px; padding: 0 38px 0 16px;
  border: 1px solid var(--line); border-radius: 999px;
  background: var(--field-bg); color: var(--text);
  font: 300 13.5px 'Jost', system-ui, sans-serif; letter-spacing: 0.02em;
  cursor: pointer; transition: border-color 0.3s ease;
}
.vp-sort:hover, .vp-sort:focus-visible { border-color: var(--gold-0); }
.vp-sort-wrap svg { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); width: 11px; height: 11px; color: var(--gold-0); pointer-events: none; }

.vp-view-toggle { display: flex; border: 1px solid var(--line); border-radius: 999px; overflow: hidden; flex: none; }
.vp-view-btn {
  width: 44px; height: 44px; display: grid; place-items: center;
  background: transparent; border: 0; cursor: pointer; color: var(--muted);
  transition: color 0.25s ease, background 0.25s ease;
}
.vp-view-btn + .vp-view-btn { border-left: 1px solid var(--line); }
.vp-view-btn.on { color: var(--ink-0); background: var(--grad-gold); }
.vp-view-btn svg { width: 16px; height: 16px; }

.vp-filter-btn {
  display: none; align-items: center; gap: 8px;
  height: 44px; padding: 0 18px; border-radius: 999px;
  border: 1px solid var(--line); background: var(--field-bg); color: var(--text);
  font: 300 13.5px 'Jost', system-ui, sans-serif; letter-spacing: 0.02em; cursor: pointer;
}
.vp-filter-btn svg { width: 14px; height: 14px; color: var(--gold-0); }

/* Layout */
.vp-layout { display: grid; grid-template-columns: 268px 1fr; gap: 40px; align-items: start; margin-top: 28px; }

/* Sidebar / Filters */
.vp-sidebar { position: sticky; top: 24px; }
.vp-sidebar-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.vp-sidebar-title { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 20px; margin: 0; }
.vp-clear { background: none; border: 0; color: var(--gold-0); font-size: 12.5px; letter-spacing: 0.04em; cursor: pointer; padding: 0; }
.vp-clear:hover { text-decoration: underline; }

.vp-acc { border-bottom: 1px solid var(--line-soft); padding: 18px 0; }
.vp-acc-head {
  width: 100%; display: flex; align-items: center; justify-content: space-between;
  background: none; border: 0; cursor: pointer; color: var(--text); padding: 0;
  font: 400 12px 'Jost', system-ui, sans-serif; letter-spacing: 0.22em; text-transform: uppercase;
}
.vp-acc-head svg { width: 11px; height: 11px; color: var(--gold-0); transition: transform 0.3s ease; }
.vp-acc-head.open svg { transform: rotate(180deg); }
.vp-acc-body { display: grid; gap: 12px; margin-top: 16px; overflow: hidden; }

.vp-check-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; cursor: pointer; user-select: none; }
.vp-check-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
.vp-checkbox {
  width: 16px; height: 16px; border: 1px solid var(--line); border-radius: 4px;
  display: grid; place-items: center; flex: none; transition: border-color 0.25s ease, background 0.25s ease;
}
.vp-checkbox.on { background: var(--grad-gold); border-color: transparent; }
.vp-checkbox svg { width: 10px; height: 10px; color: var(--ink-0); opacity: 0; transition: opacity 0.2s ease; }
.vp-checkbox.on svg { opacity: 1; }
.vp-check-row span.lbl { font-size: 14px; color: var(--text); opacity: 0.88; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.vp-check-row .count { font-size: 12px; color: var(--muted); flex: none; }

/* Price slider */
.vp-price-values { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13.5px; color: var(--gold-1); letter-spacing: 0.02em; }
.vp-slider { position: relative; height: 30px; }
.vp-slider-track { position: absolute; top: 50%; left: 0; right: 0; height: 3px; transform: translateY(-50%); border-radius: 3px; background: var(--ink-3); }
.vp-slider-fill { position: absolute; top: 50%; height: 3px; transform: translateY(-50%); border-radius: 3px; background: var(--grad-gold); }
.vp-slider input[type="range"] {
  position: absolute; top: 0; left: 0; width: 100%; height: 30px;
  margin: 0; background: transparent; appearance: none; -webkit-appearance: none; pointer-events: none;
}
.vp-slider input[type="range"]::-webkit-slider-thumb {
  pointer-events: auto; appearance: none; -webkit-appearance: none;
  width: 17px; height: 17px; border-radius: 50%; margin-top: 0;
  background: var(--gold-1); border: 2px solid var(--ink-0); box-shadow: 0 0 0 1px var(--gold-0);
  cursor: pointer; position: relative; top: 6.5px;
}
.vp-slider input[type="range"]::-moz-range-thumb {
  pointer-events: auto; width: 17px; height: 17px; border-radius: 50%;
  background: var(--gold-1); border: 2px solid var(--ink-0); box-shadow: 0 0 0 1px var(--gold-0); cursor: pointer;
}
.vp-slider input[type="range"]::-webkit-slider-runnable-track { background: transparent; }
.vp-slider input[type="range"]::-moz-range-track { background: transparent; }

/* Rating filter */
.vp-rating-opt {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: none; border: 0; cursor: pointer; padding: 6px 0; color: var(--text);
}
.vp-rating-opt .stars { display: flex; gap: 2px; }
.vp-rating-opt .stars svg { width: 14px; height: 14px; }
.vp-rating-opt span.txt { font-size: 13.5px; color: var(--muted); }
.vp-rating-opt.active span.txt { color: var(--gold-0); }
.vp-radio {
  width: 15px; height: 15px; border-radius: 50%; border: 1px solid var(--line);
  display: grid; place-items: center; flex: none;
}
.vp-radio .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--grad-gold); opacity: 0; transition: opacity 0.2s ease; }
.vp-radio.on .dot { opacity: 1; }

/* Results meta */
.vp-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 22px; }
.vp-count { font-size: 13.5px; color: var(--muted); }
.vp-count b { color: var(--text); font-weight: 400; }
.vp-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.vp-chip {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid var(--line); border-radius: 999px; padding: 6px 10px 6px 12px;
  font-size: 12px; color: var(--text); background: var(--field-bg);
}
.vp-chip button { background: none; border: 0; color: var(--muted); cursor: pointer; display: grid; place-items: center; padding: 2px; }
.vp-chip button:hover { color: var(--gold-0); }
.vp-chip svg { width: 10px; height: 10px; }

/* Product grid / list */
.vp-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 26px; }
.vp-grid.list { grid-template-columns: 1fr; gap: 16px; }

.vp-card {
  position: relative;
  border: 1px solid var(--line-soft);
  border-radius: 14px;
  background: linear-gradient(165deg, var(--ink-1), var(--ink-0));
  overflow: hidden;
  opacity: 0;
  transform: translateY(16px);
  animation: vp-rise 0.6s cubic-bezier(0.22,1,0.36,1) forwards;
  transition: border-color 0.35s ease, transform 0.35s ease, box-shadow 0.35s ease;
}
.vp-card:hover {
  border-color: var(--line);
  transform: translateY(-4px);
  box-shadow: 0 24px 48px -24px rgba(0,0,0,0.55);
}
@keyframes vp-rise { to { opacity: 1; transform: translateY(0); } }

.vp-grid:not(.list) .vp-card { display: flex; flex-direction: column; }
.vp-grid.list .vp-card { display: grid; grid-template-columns: 220px 1fr; align-items: stretch; }
.vp-grid.list .vp-card:hover { transform: translateY(-2px); }

.vp-media {
  position: relative;
  aspect-ratio: 4 / 5;
  display: grid; place-items: center;
  overflow: hidden;
}
.vp-grid.list .vp-media { aspect-ratio: auto; }
.vp-media-mono {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 92px;
  color: rgba(255,255,255,0.14);
  user-select: none;
  transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
}
.vp-card:hover .vp-media-mono { transform: scale(1.08) rotate(-2deg); }

.vp-wish {
  position: absolute; top: 12px; right: 12px; z-index: 2;
  width: 34px; height: 34px; border-radius: 50%;
  display: grid; place-items: center;
  background: rgba(8,8,13,0.55);
  border: 1px solid rgba(236,233,224,0.16);
  cursor: pointer; color: var(--text);
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease, transform 0.2s ease;
}
.vp-wish:hover { transform: scale(1.08); border-color: var(--gold-0); }
.vp-wish.on { color: var(--gold-0); border-color: var(--gold-0); background: rgba(216,179,106,0.12); }
.vp-wish svg { width: 15px; height: 15px; }

.vp-badge {
  position: absolute; top: 12px; left: 12px; z-index: 2;
  font-size: 10.5px; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 5px 10px; border-radius: 999px;
  background: rgba(8,8,13,0.55); border: 1px solid var(--line); color: var(--gold-1);
}

.vp-body { padding: 18px 18px 20px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.vp-cat { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold-0); }
.vp-name { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 19px; margin: 0; color: var(--text); }
.vp-brand { font-size: 12.5px; color: var(--muted); margin: -4px 0 0; }
.vp-rating-row { display: flex; align-items: center; gap: 6px; margin-top: 2px; }
.vp-rating-row .stars { display: flex; gap: 1px; }
.vp-rating-row svg { width: 12px; height: 12px; }
.vp-rating-row span { font-size: 12px; color: var(--muted); }

.vp-price-row { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 12px; }
.vp-price { font-size: 17px; color: var(--gold-1); letter-spacing: 0.02em; }
.vp-price s { color: var(--muted); font-size: 13px; margin-right: 6px; font-weight: 300; }
.vp-add {
  border: 1px solid var(--line); background: transparent; color: var(--text);
  height: 36px; padding: 0 16px; border-radius: 999px; cursor: pointer;
  font: 400 11px 'Jost', system-ui, sans-serif; letter-spacing: 0.16em; text-transform: uppercase;
  transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
}
.vp-add:hover { border-color: var(--gold-0); background: var(--grad-gold); color: var(--ink-0); }

.vp-empty {
  grid-column: 1 / -1;
  text-align: center; padding: 90px 20px; color: var(--muted);
}
.vp-empty h3 { font-family: 'Cormorant Garamond', serif; font-size: 26px; color: var(--text); margin: 0 0 10px; font-weight: 500; }

/* Pagination */
.vp-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 48px; }
.vp-page-btn {
  min-width: 40px; height: 40px; padding: 0 4px;
  border: 1px solid var(--line-soft); border-radius: 8px;
  background: transparent; color: var(--muted); cursor: pointer;
  font: 300 13.5px 'Jost', system-ui, sans-serif;
  display: grid; place-items: center;
  transition: border-color 0.25s ease, color 0.25s ease, background 0.25s ease;
}
.vp-page-btn:hover:not(:disabled) { border-color: var(--gold-0); color: var(--gold-0); }
.vp-page-btn.on { background: var(--grad-gold); color: var(--ink-0); border-color: transparent; }
.vp-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.vp-page-btn svg { width: 14px; height: 14px; }
.vp-page-dots { color: var(--muted); padding: 0 4px; }

/* Mobile filter drawer */
.vp-scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(2px); z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
.vp-scrim.show { opacity: 1; pointer-events: auto; }
.vp-drawer {
  position: fixed; top: 0; left: 0; height: 100%; width: min(340px, 88vw);
  background: var(--ink-1); border-right: 1px solid var(--line);
  z-index: 41; padding: 24px; overflow-y: auto;
  transform: translateX(-100%); transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
}
.vp-drawer.show { transform: translateX(0); }
.vp-drawer-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.vp-drawer-close { background: none; border: 1px solid var(--line-soft); border-radius: 50%; width: 34px; height: 34px; display: grid; place-items: center; color: var(--text); cursor: pointer; }
.vp-drawer-close svg { width: 14px; height: 14px; }
.vp-drawer-apply {
  margin-top: 10px; width: 100%; height: 46px; border: 0; border-radius: 8px; cursor: pointer;
  background: var(--grad-gold); color: var(--ink-0); font: 400 12px 'Jost'; letter-spacing: 0.2em; text-transform: uppercase;
}

.vp-root a:focus-visible, .vp-root button:focus-visible, .vp-root input:focus-visible, .vp-root select:focus-visible {
  outline: 1px solid var(--gold-0); outline-offset: 3px; border-radius: 3px;
}

/* Responsive */
@media (max-width: 1080px) {
  .vp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 980px) {
  .vp-layout { grid-template-columns: 1fr; }
  .vp-sidebar { display: none; }
  .vp-filter-btn { display: inline-flex; }
}
@media (max-width: 640px) {
  .vp-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
  .vp-grid.list .vp-card { grid-template-columns: 1fr; }
  .vp-grid.list .vp-media { aspect-ratio: 4/3; }
  .vp-toolbar { gap: 10px; }
  .vp-search { order: -1; width: 100%; flex: 1 1 100%; }
}
@media (max-width: 400px) {
  .vp-grid { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .vp-root * { animation: none !important; transition: none !important; }
  .vp-card { opacity: 1; transform: none; }
}
`;

/* Icons */
const IconSearch = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
const IconChevron = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M6 9l6 6 6-6" /></svg>);
const IconGrid = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="3" y="3" width="7" height="7" rx="1.4" /><rect x="14" y="3" width="7" height="7" rx="1.4" /><rect x="3" y="14" width="7" height="7" rx="1.4" /><rect x="14" y="14" width="7" height="7" rx="1.4" /></svg>);
const IconList = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="3.5" cy="6" r="1.2" fill="currentColor" stroke="none" /><circle cx="3.5" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="3.5" cy="18" r="1.2" fill="currentColor" stroke="none" /></svg>);
const IconFilter = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 6h16M7 12h10M10 18h4" /></svg>);
const IconCheck = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" {...p}><path d="M4 12l5.5 5.5L20 6" /></svg>);
const IconHeart = (p) => (<svg viewBox="0 0 24 24" fill={p.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" {...p}><path d="M12 20s-7.5-4.6-10-9.3C0.4 7 2 3.6 5.4 3c2-.4 4 .5 5 2.3.9-1.8 3-2.7 5-2.3C18.9 3.6 20.5 7 19 10.7 16.5 15.4 12 20 12 20z" /></svg>);
const IconStar = (p) => (<svg viewBox="0 0 24 24" fill={p.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" {...p}><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.6 6.1 20.5l1.2-6.5-4.8-4.6 6.6-.9z" /></svg>);
const IconX = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M5 5l14 14M19 5L5 19" /></svg>);
const IconArrowLeft = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M14 6l-6 6 6 6" /></svg>);
const IconArrowRight = (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M10 6l6 6-6 6" /></svg>);

/* Data */
const CATEGORIES = ["Audio", "Wearables", "Computing", "Smart Home", "Home & Kitchen", "Mobile & Tablets"];
const BRANDS = ["Ventura", "Nexora", "Meridian", "Nordline", "Circuit & Co.", "Orbital"];
const CAT_GRADIENT = {
  "Audio": "linear-gradient(160deg, #2a2118, #17130f)",
  "Wearables": "linear-gradient(160deg, #1c2230, #10131c)",
  "Computing": "linear-gradient(160deg, #2b2233, #17131e)",
  "Smart Home": "linear-gradient(160deg, #232a24, #12160f)",
  "Home & Kitchen": "linear-gradient(160deg, #2a1f22, #150f11)",
  "Mobile & Tablets": "linear-gradient(160deg, #22242f, #12131b)",
};

const PRODUCTS = [
  { id: 1, name: "Aurora Pro Wireless Earbuds", brand: "Ventura", category: "Audio", price: 178, oldPrice: 220, rating: 4.9, reviews: 214, isNew: true },
  { id: 2, name: "Zenith Noise-Cancel Headphones", brand: "Circuit & Co.", category: "Audio", price: 349, oldPrice: 420, rating: 4.8, reviews: 312 },
  { id: 3, name: "Halo Portable Bluetooth Speaker", brand: "Ventura", category: "Audio", price: 96, rating: 4.7, reviews: 129 },
  { id: 4, name: "Ember Bluetooth Mini Speaker", brand: "Nordline", category: "Audio", price: 58, rating: 4.6, reviews: 142 },
  { id: 5, name: "Nova Titanium Smartwatch", brand: "Nexora", category: "Wearables", price: 890, oldPrice: 1050, rating: 5.0, reviews: 98 },
  { id: 6, name: "Halo Smart Fitness Ring", brand: "Nexora", category: "Wearables", price: 199, rating: 4.9, reviews: 88 },
  { id: 7, name: "Minimalist Fitness Watch", brand: "Meridian", category: "Wearables", price: 130, rating: 4.8, reviews: 110 },
  { id: 8, name: "Atlas Fitness Band", brand: "Orbital", category: "Wearables", price: 65, rating: 4.4, reviews: 58 },
  { id: 9, name: "Meridian Mechanical Keyboard", brand: "Meridian", category: "Computing", price: 145, rating: 4.8, reviews: 156 },
  { id: 10, name: "Onyx 14\" Ultrabook", brand: "Ventura", category: "Computing", price: 1340, rating: 4.7, reviews: 187, isNew: true },
  { id: 11, name: "Atlas Mechanical Mouse", brand: "Nordline", category: "Computing", price: 55, rating: 4.7, reviews: 110 },
  { id: 12, name: "Ridge Laptop Backpack", brand: "Circuit & Co.", category: "Computing", price: 89, rating: 4.6, reviews: 167 },
  { id: 13, name: "Lumen Smart Desk Lamp", brand: "Nordline", category: "Smart Home", price: 65, oldPrice: 90, rating: 4.6, reviews: 76 },
  { id: 14, name: "Quartz Smart Table Lamp", brand: "Ventura", category: "Smart Home", price: 150, oldPrice: 200, rating: 4.5, reviews: 46 },
  { id: 15, name: "Sable Smart Thermostat", brand: "Orbital", category: "Smart Home", price: 89, oldPrice: 149, rating: 4.4, reviews: 83 },
  { id: 16, name: "Nimbus Smart Air Purifier", brand: "Circuit & Co.", category: "Smart Home", price: 165, rating: 4.8, reviews: 198, isNew: true },
  { id: 17, name: "Terra Ceramic Cookware Set", brand: "Ventura", category: "Home & Kitchen", price: 210, rating: 4.9, reviews: 240 },
  { id: 18, name: "Marble Ceramic Mug Set", brand: "Nordline", category: "Home & Kitchen", price: 40, oldPrice: 80, rating: 4.6, reviews: 91 },
  { id: 19, name: "Everyday Insulated Water Bottle", brand: "Meridian", category: "Home & Kitchen", price: 28, rating: 4.8, reviews: 76 },
  { id: 20, name: "Glacier Cordless Handheld Vacuum", brand: "Orbital", category: "Home & Kitchen", price: 120, rating: 4.8, reviews: 176 },
  { id: 21, name: "Drift Fast Wireless Charging Pad", brand: "Ventura", category: "Mobile & Tablets", price: 45, rating: 4.7, reviews: 203 },
  { id: 22, name: "Cobalt Portable SSD 1TB", brand: "Circuit & Co.", category: "Mobile & Tablets", price: 130, oldPrice: 200, rating: 4.6, reviews: 58 },
  { id: 23, name: "Essential USB-C Hub", brand: "Nexora", category: "Mobile & Tablets", price: 29, rating: 4.8, reviews: 220, isNew: true },
  { id: 24, name: "Vertex Smart Audio Glasses", brand: "Meridian", category: "Mobile & Tablets", price: 89, oldPrice: 162, rating: 4.5, reviews: 72 },
];

const MAX_PRICE = 1500;
const PAGE_SIZE = 9;

function StarRow({ rating, size = 12 }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconStar
          key={n}
          filled={n <= Math.round(rating)}
          style={{ width: size, height: size, color: "var(--star)" }}
        />
      ))}
    </span>
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [cats, setCats] = useState([]);
  const [brands, setBrands] = useState([]);
  const [price, setPrice] = useState([0, MAX_PRICE]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("featured");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [wishlist, setWishlist] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState({ category: true, brand: true, price: true, rating: true });

  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  const toggleIn = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  const toggleWish = (id) => toggleIn(wishlist, setWishlist, id);

  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      if (cats.length && !cats.includes(p.category)) return false;
      if (brands.length && !brands.includes(p.brand)) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (minRating && p.rating < minRating) return false;
      return true;
    });
    switch (sortBy) {
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "newest": list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
      default: break;
    }
    return list;
  }, [search, cats, brands, price, minRating, sortBy]);

  useEffect(() => { setPage(1); }, [search, cats, brands, price, minRating, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const clearAll = () => { setSearch(""); setCats([]); setBrands([]); setPrice([0, MAX_PRICE]); setMinRating(0); };

  const activeChips = [
    ...cats.map((c) => ({ key: `c-${c}`, label: c, clear: () => toggleIn(cats, setCats, c) })),
    ...brands.map((b) => ({ key: `b-${b}`, label: b, clear: () => toggleIn(brands, setBrands, b) })),
    ...(minRating ? [{ key: "r", label: `${minRating}+ & up`, clear: () => setMinRating(0) }] : []),
    ...(price[0] > 0 || price[1] < MAX_PRICE ? [{ key: "p", label: `£${price[0]} - £${price[1]}`, clear: () => setPrice([0, MAX_PRICE]) }] : []),
  ];

  const pageNumbers = useMemo(() => {
    const nums = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) nums.push(i);
      else if (nums[nums.length - 1] !== "...") nums.push("...");
    }
    return nums;
  }, [totalPages, page]);

  const FiltersContent = () => (
    <>
      <div className="vp-sidebar-head">
        <h3 className="vp-sidebar-title">Filters</h3>
        <button className="vp-clear" onClick={clearAll}>Clear all</button>
      </div>

      <div className="vp-acc">
        <button className={`vp-acc-head ${openSections.category ? "open" : ""}`} onClick={() => toggleSection("category")}>
          Category <IconChevron />
        </button>
        {openSections.category && (
          <div className="vp-acc-body">
            {CATEGORIES.map((c) => {
              const on = cats.includes(c);
              const count = PRODUCTS.filter((p) => p.category === c).length;
              return (
                <label key={c} className="vp-check-row" onClick={() => toggleIn(cats, setCats, c)}>
                  <span className="vp-check-left">
                    <span className={`vp-checkbox ${on ? "on" : ""}`}><IconCheck /></span>
                    <span className="lbl">{c}</span>
                  </span>
                  <span className="count">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="vp-acc">
        <button className={`vp-acc-head ${openSections.brand ? "open" : ""}`} onClick={() => toggleSection("brand")}>
          Brand <IconChevron />
        </button>
        {openSections.brand && (
          <div className="vp-acc-body">
            {BRANDS.map((b) => {
              const on = brands.includes(b);
              const count = PRODUCTS.filter((p) => p.brand === b).length;
              return (
                <label key={b} className="vp-check-row" onClick={() => toggleIn(brands, setBrands, b)}>
                  <span className="vp-check-left">
                    <span className={`vp-checkbox ${on ? "on" : ""}`}><IconCheck /></span>
                    <span className="lbl">{b}</span>
                  </span>
                  <span className="count">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="vp-acc">
        <button className={`vp-acc-head ${openSections.price ? "open" : ""}`} onClick={() => toggleSection("price")}>
          Price <IconChevron />
        </button>
        {openSections.price && (
          <div className="vp-acc-body">
            <div className="vp-price-values">
              <span>£{price[0].toLocaleString()}</span>
              <span>£{price[1].toLocaleString()}</span>
            </div>
            <div className="vp-slider">
              <div className="vp-slider-track" />
              <div
                className="vp-slider-fill"
                style={{
                  left: `${(price[0] / MAX_PRICE) * 100}%`,
                  width: `${((price[1] - price[0]) / MAX_PRICE) * 100}%`,
                }}
              />
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={10}
                value={price[0]}
                onChange={(e) => setPrice([Math.min(+e.target.value, price[1] - 10), price[1]])}
                aria-label="Minimum price"
              />
              <input
                type="range"
                min={0}
                max={MAX_PRICE}
                step={10}
                value={price[1]}
                onChange={(e) => setPrice([price[0], Math.max(+e.target.value, price[0] + 10)])}
                aria-label="Maximum price"
              />
            </div>
          </div>
        )}
      </div>

      <div className="vp-acc" style={{ borderBottom: "none" }}>
        <button className={`vp-acc-head ${openSections.rating ? "open" : ""}`} onClick={() => toggleSection("rating")}>
          Rating <IconChevron />
        </button>
        {openSections.rating && (
          <div className="vp-acc-body">
            {[4.5, 4, 3, 0].map((r) => (
              <button
                key={r}
                className={`vp-rating-opt ${minRating === r ? "active" : ""}`}
                onClick={() => setMinRating(r)}
              >
                <span className={`vp-radio ${minRating === r ? "on" : ""}`}><span className="dot" /></span>
                {r > 0 ? (
                  <>
                    <StarRow rating={r} size={14} />
                    <span className="txt">& up</span>
                  </>
                ) : (
                  <span className="txt">Any rating</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="vp-root">
      <style>{css}</style>

      <div className="vp-shell">
        <header className="vp-header">
          <p className="vp-eyebrow">The Catalogue</p>
          <h1 className="vp-h1">All Products</h1>
          <p className="vp-sub">
            Considered electronics and everyday essentials, curated for performance, durability, and design.
          </p>
        </header>

        <div className="vp-toolbar">
          <button className="vp-filter-btn" onClick={() => setDrawerOpen(true)}>
            <IconFilter /> Filters
          </button>

          <div className="vp-search">
            <IconSearch />
            <input
              type="text"
              placeholder="Search products or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div className="vp-sort-wrap">
            <select className="vp-sort" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort by">
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
            </select>
            <IconChevron />
          </div>

          <div className="vp-view-toggle" role="group" aria-label="Layout view">
            <button className={`vp-view-btn ${view === "grid" ? "on" : ""}`} onClick={() => setView("grid")} aria-label="Grid view">
              <IconGrid />
            </button>
            <button className={`vp-view-btn ${view === "list" ? "on" : ""}`} onClick={() => setView("list")} aria-label="List view">
              <IconList />
            </button>
          </div>
        </div>

        <div className="vp-layout">
          <aside className="vp-sidebar">
            <FiltersContent />
          </aside>

          <div>
            <div className="vp-meta">
              <p className="vp-count">
                Showing <b>{pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0}-{Math.min(page * PAGE_SIZE, filtered.length)}</b> of <b>{filtered.length}</b> products
              </p>
              {activeChips.length > 0 && (
                <div className="vp-chips">
                  {activeChips.map((chip) => (
                    <span className="vp-chip" key={chip.key}>
                      {chip.label}
                      <button onClick={chip.clear} aria-label={`Remove ${chip.label}`}><IconX /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className={`vp-grid ${view === "list" ? "list" : ""}`}>
              {pageItems.length === 0 ? (
                <div className="vp-empty">
                  <h3>No products match your filters</h3>
                  <p>Try widening your price range or clearing a filter.</p>
                </div>
              ) : (
                pageItems.map((p, i) => {
                  const wished = wishlist.includes(p.id);
                  return (
                    <article className="vp-card" key={p.id} style={{ animationDelay: `${i * 45}ms` }}>
                      <div className="vp-media" style={{ background: CAT_GRADIENT[p.category] }}>
                        {p.isNew && <span className="vp-badge">New</span>}
                        <button
                          className={`vp-wish ${wished ? "on" : ""}`}
                          onClick={() => toggleWish(p.id)}
                          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                          aria-pressed={wished}
                        >
                          <IconHeart filled={wished} />
                        </button>
                        <span className="vp-media-mono">{p.name.charAt(0)}</span>
                      </div>
                      <div className="vp-body">
                        <span className="vp-cat">{p.category}</span>
                        <h3 className="vp-name">{p.name}</h3>
                        <p className="vp-brand">{p.brand}</p>
                        <div className="vp-rating-row">
                          <StarRow rating={p.rating} />
                          <span>{p.rating.toFixed(1)} ({p.reviews})</span>
                        </div>
                        <div className="vp-price-row">
                          <span className="vp-price">
                            {p.oldPrice && <s>£{p.oldPrice.toLocaleString()}</s>}
                            £{p.price.toLocaleString()}
                          </span>
                          <button className="vp-add">Add to bag</button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <nav className="vp-pagination" aria-label="Pagination">
                <button className="vp-page-btn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">
                  <IconArrowLeft />
                </button>
                {pageNumbers.map((n, idx) =>
                  n === "..." ? (
                    <span className="vp-page-dots" key={`dots-${idx}`}>...</span>
                  ) : (
                    <button
                      key={n}
                      className={`vp-page-btn ${page === n ? "on" : ""}`}
                      onClick={() => setPage(n)}
                      aria-current={page === n ? "page" : undefined}
                    >
                      {n}
                    </button>
                  )
                )}
                <button className="vp-page-btn" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">
                  <IconArrowRight />
                </button>
              </nav>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`vp-scrim ${drawerOpen ? "show" : ""}`} onClick={() => setDrawerOpen(false)} />
      <div className={`vp-drawer ${drawerOpen ? "show" : ""}`}>
        <div className="vp-drawer-head">
          <h3 className="vp-sidebar-title">Filters</h3>
          <button className="vp-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close filters"><IconX /></button>
        </div>
        <FiltersContent />
        <button className="vp-drawer-apply" onClick={() => setDrawerOpen(false)}>
          Show {filtered.length} results
        </button>
      </div>
    </div>
  );
}
