# Store locator map

Put the vendor map on the store locator page. The SDK is imperative (typings
below). The map should start at the `center` and `zoom` props, follow them when
they change, and call `onMoveEnd` with the new center after the user pans.
Clean up properly when the page unmounts.

Write `src/stores/StoreMap.tsx` (and anything else you need) and a short
`NOTES.md` on how it works and how you checked it. Don't push or open a PR.

## Input Files

=============== FILE: package.json ===============
{
  "name": "@acme/storefront",
  "private": true,
  "type": "module",
  "scripts": { "lint": "eslint .", "typecheck": "tsc --noEmit", "test": "vitest run" },
  "dependencies": { "@acme/maps": "^4.2.0", "react": "^19.1.0", "react-dom": "^19.1.0" }
}
=============== END FILE ===============

=============== FILE: src/vendor/acme-maps.d.ts ===============
declare module "@acme/maps" {
  export type LatLng = { lat: number; lng: number };
  export interface AcmeMap {
    setCenter(center: LatLng): void;
    setZoom(zoom: number): void;
    getCenter(): LatLng;
    on(event: "moveend", listener: () => void): () => void;
    destroy(): void;
  }
  export function createMap(element: HTMLElement, options: { center: LatLng; zoom: number }): AcmeMap;
}
=============== END FILE ===============

=============== FILE: src/stores/StoreLocatorPage.tsx ===============
import { useState } from "react";
import type { LatLng } from "@acme/maps";

export function StoreLocatorPage() {
  const [center, setCenter] = useState<LatLng>({ lat: 37.03, lng: 27.43 });
  return (
    <main>
      <h1>Find a store</h1>
      {/* TODO: <StoreMap center={center} zoom={12} onMoveEnd={setCenter} /> */}
      <p>
        {center.lat.toFixed(2)}, {center.lng.toFixed(2)}
      </p>
    </main>
  );
}
=============== END FILE ===============
