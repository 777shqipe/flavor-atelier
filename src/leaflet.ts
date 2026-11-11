import type * as Leaflet from "leaflet";

export type Lib = typeof Leaflet;

let loading: Promise<Lib> | undefined;

/**
 * Leaflet is about a quarter of the site's script and only the Stores page draws a map,
 * so it is fetched the first time a map is built, not with the home page.
 */
export function loadLeaflet(): Promise<Lib> {
  loading ??= import("leaflet")
    .then((mod) => ((mod as unknown as { default?: Lib }).default ?? mod) as Lib)
    .catch((error: unknown) => {
      loading = undefined;
      throw error;
    });
  return loading;
}
