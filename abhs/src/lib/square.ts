/**
 * Square API client — singleton for server-side Square SDK access.
 * Requires SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in .env.local.
 *
 * Setup:
 *   1. Go to https://developer.squareup.com/apps
 *   2. Create an application (or use existing)
 *   3. Copy the Access Token (sandbox for testing, production for live)
 *   4. Find your Location ID: Square Dashboard → Settings → Locations
 *   5. Set SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT in .env.local
 */

import { SquareClient, SquareEnvironment } from 'square';

let client: SquareClient | null = null;

/** Returns a configured Square SDK client. Throws if token is missing. */
export function getSquareClient(): SquareClient {
  if (!client) {
    const token = process.env.SQUARE_ACCESS_TOKEN;
    if (!token) throw new Error('SQUARE_ACCESS_TOKEN not configured');

    client = new SquareClient({
      token,
      environment:
        process.env.SQUARE_ENVIRONMENT === 'production'
          ? SquareEnvironment.Production
          : SquareEnvironment.Sandbox,
    });
  }
  return client;
}

/** Returns the configured location ID. Throws if missing. */
export function getLocationId(): string {
  const id = process.env.SQUARE_LOCATION_ID;
  if (!id) throw new Error('SQUARE_LOCATION_ID not configured');
  return id;
}

/**
 * Recursively converts BigInt values to strings for JSON serialization.
 * Square SDK uses BigInt for monetary amounts and version numbers,
 * but JSON.stringify() cannot handle BigInt natively.
 */
export function serializeBigInt(obj: unknown): unknown {
  return JSON.parse(
    JSON.stringify(obj, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  );
}

/**
 * Looks up the human-readable service name for a Square service variation ID.
 * Square stores services as Item → ItemVariation, so we fetch the variation
 * to get the parent item ID, then fetch the parent for the name.
 *
 * The SDK v44 models CatalogObject as a discriminated union, so we use
 * type assertions for property access (safe because we're doing optional chaining).
 */
export async function lookupServiceName(
  client: SquareClient,
  serviceVariationId: string,
  fallback = 'Service'
): Promise<string> {
  try {
    const varResult = await client.catalog.object.get({ objectId: serviceVariationId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parentId = (varResult.object as any)?.itemVariationData?.itemId;
    if (parentId) {
      const parentResult = await client.catalog.object.get({ objectId: parentId });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (parentResult.object as any)?.itemData?.name ?? fallback;
    }
    return fallback;
  } catch {
    return fallback;
  }
}
