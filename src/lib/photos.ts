/** A specific free-licence Unsplash photo, by its id, at a given width. */
export function unsplash(id: string, width: number) {
  return `https://unsplash.com/photos/${id}/download?w=${width}`;
}
