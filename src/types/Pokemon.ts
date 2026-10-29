export interface Pokemon {
  id: number;
  name: string;
  image: string;
  officialArtwork?: string;
  generation: number;
  // Used for sorting by Pokédex number (base species number for forms).
  // When omitted, code can fall back to `id`.
  dexNumber?: number;
  types?: string[];
  // Optional count from a pasted list entry such as "Pikachu (40)".
  listCount?: number | null;
  listCountLabel?: string | null;
}
