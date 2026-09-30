import type { Map as MapLibreMap } from "maplibre-gl";

export type GeoapifyStyleKey = "light" | "streets" | "dark";

/**
 * `Map#remove()` calls `setStyle(null)`, which runs `delete this.style`. Any later
 * `getLayer`/`getSource` call on that instance throws
 * "Cannot read properties of undefined (reading 'getLayer')".
 * `getStyle()` is the only public probe that reports the torn-down state
 * (returns undefined) instead of throwing or warning, as `isStyleLoaded()` does.
 * Not cheap -- reserve it for effect/teardown paths, never for per-frame work.
 */
export function isMapAlive(map: MapLibreMap | null | undefined): map is MapLibreMap {
  if (!map) return false;
  return map.getStyle() !== undefined;
}

const GEOAPIFY_STYLE_IDS: Record<GeoapifyStyleKey, string> = {
  light: "positron",
  streets: "osm-bright",
  dark: "dark-matter",
};

const STYLE_BASE_URL = "https://maps.geoapify.com/v1/styles";

export function geoapifyApiKey() {
  return process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY ?? "";
}

export function geoapifyStyleUrl(style: GeoapifyStyleKey, apiKey: string) {
  return `${STYLE_BASE_URL}/${GEOAPIFY_STYLE_IDS[style]}/style.json?apiKey=${encodeURIComponent(apiKey)}`;
}

/**
 * Geoapify returns `sprite` with the API key as a query string
 * (`.../sprite?apiKey=KEY`). MapLibre appends its own `.json`/`.png` suffix to
 * the sprite base, producing `.../sprite?apiKey=KEY.json`, which Geoapify
 * rejects with 401. A missing sprite aborts style load, so `load` never fires
 * and the canvas is never painted.
 *
 * Only the sprite needs the query stripped. `glyphs` MUST keep its `?apiKey=`
 * — Geoapify returns 401 for glyph requests without a key, and stripping it
 * also breaks the place/city labels in the style.
 */
export async function fetchGeoapifyStyle(style: GeoapifyStyleKey, apiKey: string): Promise<any> {
  const res = await fetch(geoapifyStyleUrl(style, apiKey), { cache: "no-store" });
  if (!res.ok) throw new Error(`Geoapify style request failed: ${res.status} ${res.statusText}`);
  const spec = (await res.json()) as any;
  if (typeof spec?.sprite === "string") spec.sprite = spec.sprite.split("?")[0];
  return spec;
}