// Type definitions for Leaflet polyline-encoded 0.0.8
// Project: https://github.com/jieter/Leaflet.encoded
// Definitions by: Romain Deneau <https://github.com/rdeneau>
// TypeScript Version: 2.5

import * as L from 'leaflet';

export as namespace Lx;

export interface PolylineUtilOptions {
  precision: number;
  factor: number;
  dimension: number;
}

export type LatLngTuple = [number, number];

export interface PolylineUtil {
  /**
   * Decode the string `encoded` to an array of `[lat, lng]`-arrays.
   */
  decode(encoded: string, options?: number | PolylineUtilOptions): LatLngTuple[];

  /**
   * Encode an array of `L.LatLng` objects, or an array of arrays.
   */
  encode(points: L.LatLng[] | LatLngTuple[], options?: number | PolylineUtilOptions): string;
}

export class Polyline extends L.Polyline {
  /**
   * Return an encoded string for the current Polyline.
   */
  encodePath(): string;

  /**
   * Construct a new `L.Polyline` from a string, with optional `options` object.
   * Backslashes in strings should be properly escaped.
   */
  fromEncoded(encoded: string, options?: L.PolylineOptions): L.Polyline;
}

export class Polygon extends L.Polygon {
  /**
   * Return an encoded string for the current Polygon.
   */
  encodePath(): string;

  /**
   * Construct a new `L.Polygon` from a string, with optional `options` object.
   * Backslashes in strings should be properly escaped.
   */
  fromEncoded(encoded: string, options?: L.PolylineOptions): L.Polygon;
}
