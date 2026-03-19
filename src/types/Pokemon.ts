export interface Pokemon {
  id: number;
  name: string;
  image: string;
  officialArtwork?: string;
  generation: number;
  // Used for sorting by Pokédex number (base species number for forms).
  // When omitted, code can fall back to `id`.
  dexNumber?: number;
}
