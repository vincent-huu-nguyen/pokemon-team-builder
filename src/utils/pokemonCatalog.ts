import { Pokemon } from '../types/Pokemon';
import { getRegionalFormCandidates, normalizePokeapiSlug } from './pokemonPokeApi';

export type PokemonCatalogSnapshot = {
  pokemon: Pokemon[];
  ready: boolean;
};

type CatalogListener = (snapshot: PokemonCatalogSnapshot) => void;

let snapshot: PokemonCatalogSnapshot = { pokemon: [], ready: false };
const listeners = new Set<CatalogListener>();

/** Shares the selector's loaded Pokémon list so other modes can match names without new requests. */
export function publishPokemonCatalog(pokemon: Pokemon[], ready: boolean) {
  snapshot = { pokemon, ready };
  listeners.forEach((listener) => listener(snapshot));
}

export function subscribePokemonCatalog(listener: CatalogListener) {
  listeners.add(listener);
  listener(snapshot);
  return () => {
    listeners.delete(listener);
  };
}

/** Stable identity. Form entries can share a species id, so the name is part of the key. */
export function pokemonIdentity(pokemon: Pokemon): string {
  return `${pokemon.id}::${pokemonLookupKey(pokemon.name)}`;
}

export function pokemonLookupKey(raw: string): string {
  return normalizePokeapiSlug(raw.replace(/[()[\]]/g, ' ').replace(/:/g, ' '));
}

export function formatPokemonLabel(name: string): string {
  if (name !== name.toLowerCase()) return name;
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function pokemonSpriteSrc(pokemon: Pokemon, artStyle: 'pixel' | 'official'): string {
  if (artStyle === 'official') return pokemon.officialArtwork || pokemon.image;
  return pokemon.image;
}

function megaAliases(slug: string): string[] {
  const aliases: string[] = [];
  const displayMega = slug.match(/^mega-(.+)$/);
  if (displayMega) {
    const rest = displayMega[1];
    const parts = rest.split('-');
    const last = parts[parts.length - 1];
    if (parts.length > 1 && (last === 'x' || last === 'y' || last === 'z')) {
      aliases.push(`${parts.slice(0, -1).join('-')}-mega-${last}`);
    } else {
      aliases.push(`${rest}-mega`);
    }
  }

  const apiMega = slug.match(/^(.+)-mega(?:-(.+))?$/);
  if (apiMega) {
    aliases.push(apiMega[2] ? `mega-${apiMega[1]}-${apiMega[2]}` : `mega-${apiMega[1]}`);
  }
  return aliases;
}

function aliasKeys(slug: string): string[] {
  return [...getRegionalFormCandidates(slug), ...megaAliases(slug)];
}

export function buildPokemonLookup(pokemon: Pokemon[]): Map<string, Pokemon> {
  const map = new Map<string, Pokemon>();
  const claim = (key: string, entry: Pokemon) => {
    if (!key || map.has(key)) return;
    map.set(key, entry);
  };

  const primaries = pokemon.map((entry) => ({
    entry,
    key: pokemonLookupKey(entry.name),
  }));

  primaries.forEach(({ entry, key }) => claim(key, entry));
  primaries.forEach(({ entry, key }) => {
    aliasKeys(key).forEach((alias) => claim(alias, entry));
  });

  return map;
}

export function findPokemonInLookup(lookup: Map<string, Pokemon>, raw: string): Pokemon | undefined {
  const key = pokemonLookupKey(raw);
  if (!key) return undefined;
  const direct = lookup.get(key);
  if (direct) return direct;
  for (const alias of aliasKeys(key)) {
    const match = lookup.get(alias);
    if (match) return match;
  }
  return undefined;
}

export function searchPokemon(pokemon: Pokemon[], query: string, limit = 8): Pokemon[] {
  const key = pokemonLookupKey(query);
  if (!key) return [];

  const ranked = pokemon
    .map((entry) => {
      const nameKey = pokemonLookupKey(entry.name);
      const prefix = nameKey.startsWith(key) || entry.name.toLowerCase().startsWith(query.trim().toLowerCase());
      const includes = nameKey.includes(key) || entry.name.toLowerCase().includes(query.trim().toLowerCase());
      if (!prefix && !includes) return null;
      return { entry, prefix };
    })
    .filter((item): item is { entry: Pokemon; prefix: boolean } => item !== null);

  ranked.sort((a, b) => {
    if (a.prefix !== b.prefix) return a.prefix ? -1 : 1;
    const dexA = a.entry.dexNumber ?? a.entry.id;
    const dexB = b.entry.dexNumber ?? b.entry.id;
    if (dexA !== dexB) return dexA - dexB;
    return a.entry.name.localeCompare(b.entry.name);
  });

  const seen = new Set<string>();
  const results: Pokemon[] = [];
  for (const item of ranked) {
    const id = pokemonIdentity(item.entry);
    if (seen.has(id)) continue;
    seen.add(id);
    results.push(item.entry);
    if (results.length >= limit) break;
  }
  return results;
}
