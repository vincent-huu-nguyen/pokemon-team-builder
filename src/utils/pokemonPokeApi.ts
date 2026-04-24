import { Pokemon } from '../types/Pokemon';

/** 2 columns × 15 rows per list card */
export const POKEMON_LIST_PAGE_SIZE = 30;

export function getGenerationFromId(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 898) return 8;
  if (id <= 1025) return 9;
  return 1;
}

function mapPokeApiPokemon(
  data: {
    id: number;
    name: string;
    sprites?: {
      front_default: string | null;
      other?: { 'official-artwork'?: { front_default: string | null } };
    };
  },
  /** National Pokédex number (from species) — used for forms that share a species (e.g. Deoxys). */
  nationalDexOverride?: number
): Pokemon {
  const img = data.sprites?.front_default ?? '';
  const dex = nationalDexOverride ?? data.id;
  return {
    id: data.id,
    name: data.name,
    image: img,
    officialArtwork: data.sprites?.other?.['official-artwork']?.front_default || img,
    generation: getGenerationFromId(dex),
    dexNumber: dex,
  };
}

type SpeciesJson = {
  pokedex_number: number;
  varieties: { is_default: boolean; pokemon: { name: string; url: string } }[];
};

/**
 * PokeAPI slugs use ASCII only: "sirfetchd", "farfetchd" — no apostrophes. Also strips
 * periods so "Mr. Mime" → mr-mime.
 */
export function normalizePokeapiSlug(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\./g, '')
    // ASCII apostrophe, U+2019, modifier apostrophe, backtick (rare user paste)
    .replace(/[\u0027\u2019\u02BC`ʼ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * PokéAPI regional slugs use a suffix: `corsola-galar`, `sandshrew-alola`, not `galarian-corsola`.
 * Produces alternate slugs to try when the user types "Galarian Corsola", "Alolan Sandshrew", etc.
 */
export function getRegionalFormCandidates(slug: string): string[] {
  const out: string[] = [];
  const tryMap: [RegExp, (m: RegExpMatchArray) => string][] = [
    [/^galarian-(.+)$/, (m) => `${m[1]}-galar`],
    [/^(.+)-galarian$/, (m) => `${m[1]}-galar`],
    [/^galar-(.+)$/, (m) => `${m[1]}-galar`],
    [/^alolan-(.+)$/, (m) => `${m[1]}-alola`],
    [/^(.+)-alolan$/, (m) => `${m[1]}-alola`],
    [/^alola-(.+)$/, (m) => `${m[1]}-alola`],
    [/^hisuian-(.+)$/, (m) => `${m[1]}-hisui`],
    [/^(.+)-hisuian$/, (m) => `${m[1]}-hisui`],
    [/^hisui-(.+)$/, (m) => `${m[1]}-hisui`],
    [/^paldean-(.+)$/, (m) => `${m[1]}-paldea`],
    [/^(.+)-paldean$/, (m) => `${m[1]}-paldea`],
    [/^paldea-(.+)$/, (m) => `${m[1]}-paldea`],
  ];
  for (const [re, build] of tryMap) {
    const m = slug.match(re);
    if (m) {
      const s = build(m);
      if (s && s !== slug) out.push(s);
    }
  }
  return out;
}

/**
 * PokéAPI has no `tauros-paldea` — only the three Paldea breeds. Map “Paldean Tauros” / `tauros-paldea` to
 * these so bulk lookup can resolve; first successful hit wins (combat is tried first as a neutral default).
 */
const PALDEA_TAUROS_BREED_SLUGS = [
  'tauros-paldea-combat-breed',
  'tauros-paldea-blaze-breed',
  'tauros-paldea-aqua-breed',
] as const;

function getPaldeanTaurosBreedSlugs(
  normalized: string,
  regionalOut: string[]
): string[] {
  if (
    normalized === 'tauros-paldea' ||
    normalized === 'paldean-tauros' ||
    regionalOut.includes('tauros-paldea')
  ) {
    return [...PALDEA_TAUROS_BREED_SLUGS];
  }
  return [];
}

function uniqueSlugsInOrder(candidates: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of candidates) {
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

/**
 * Resolves a user-typed name to a Pokémon. Tries the `/pokemon/{name}` endpoint first, then
 * `/pokemon-species/{name}` and the default (or first) variety so base names work for multi-form
 * species (e.g. "Deoxys" → deoxys-normal), then optional "-normal" for edge cases.
 */
export async function fetchPokemonByNameForList(raw: string): Promise<Pokemon> {
  const normalized = normalizePokeapiSlug(raw);
  if (!normalized) {
    throw new Error('empty');
  }

  const regional = getRegionalFormCandidates(normalized);
  const slugsToTry = uniqueSlugsInOrder([
    normalized,
    ...regional,
    ...getPaldeanTaurosBreedSlugs(normalized, regional),
  ]);

  for (const slug of slugsToTry) {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(slug)}`
    );
    if (res.ok) {
      const data = await res.json();
      return mapPokeApiPokemon(data);
    }
  }

  for (const slug of slugsToTry) {
    const speciesRes = await fetch(
      `https://pokeapi.co/api/v2/pokemon-species/${encodeURIComponent(slug)}`
    );
    if (speciesRes.ok) {
      const species: SpeciesJson = await speciesRes.json();
      const varieties = species.varieties;
      if (varieties?.length) {
        const chosen = varieties.find((v) => v.is_default) ?? varieties[0];
        const pRes = await fetch(chosen.pokemon.url);
        if (pRes.ok) {
          const data = await pRes.json();
          return mapPokeApiPokemon(data, species.pokedex_number);
        }
      }
    }
  }

  if (!normalized.includes('-')) {
    const tryNormal = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(`${normalized}-normal`)}`
    );
    if (tryNormal.ok) {
      return mapPokeApiPokemon(await tryNormal.json());
    }
  }

  throw new Error('not found');
}

export function parsePokemonNamesFromText(text: string): string[] {
  return text
    .split(/[\n,;|]+/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
