/**
 * Deterministic URL resolver for static dataset images.
 * Images are served directly from Next.js public/dataset/ folder
 * (e.g. public/dataset/1.jpg -> /dataset/1.jpg).
 */
export function getDatasetImageUrl(id: number | string): string {
  return `/dataset/${id}.jpg`;
}
