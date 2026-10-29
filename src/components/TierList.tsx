import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { Pokemon } from '../types/Pokemon';
import { formatPokemonListLabel, parsePokemonListEntries, parsePokemonNamesFromText, sortPokemonForList } from '../utils/pokemonPokeApi';
import {
  buildPokemonLookup,
  findPokemonInLookup,
  formatPokemonLabel,
  pokemonIdentity,
  pokemonSpriteSrc,
  searchPokemon,
  subscribePokemonCatalog,
  PokemonCatalogSnapshot,
} from '../utils/pokemonCatalog';
import { registerSelectedTierAdder } from '../utils/tierSelection';
import './TierList.css';

interface TierRow {
  id: string;
  name: string;
  color: string;
  pokemon: Pokemon[];
}

interface TierListProps {
  artStyle: 'pixel' | 'official';
  surfaceStyle: React.CSSProperties;
  showBubbles: boolean;
}

const STORAGE_KEY = 'ptb-tier-list';
const SIZE_KEY = 'ptb-tier-list-size';
const MIN_CARD_WIDTH = 360;
const MIN_CARD_HEIGHT = 220;

const DEFAULT_TIER_DEFS: { name: string; color: string }[] = [
  { name: 'S Tier', color: '#e74c3c' },
  { name: 'A Tier', color: '#e67e22' },
  { name: 'B Tier', color: '#f1c40f' },
  { name: 'C Tier', color: '#27ae60' },
  { name: 'D Tier', color: '#3498db' },
];

const COLOR_CHOICES = [
  '#e74c3c',
  '#e67e22',
  '#f1c40f',
  '#27ae60',
  '#3498db',
  '#8e44ad',
  '#e84393',
  '#16a085',
  '#636e72',
  '#2c3e50',
];

const NEXT_TIER_LETTERS = 'EFGHIJKLMNOPQRSTUVWXYZ'.split('');

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tier-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultTiers(): TierRow[] {
  return DEFAULT_TIER_DEFS.map((tier) => ({
    id: createId(),
    name: tier.name,
    color: tier.color,
    pokemon: [],
  }));
}

function isStoredPokemon(value: unknown): value is Pokemon {
  if (!value || typeof value !== 'object') return false;
  const pokemon = value as Pokemon;
  return typeof pokemon.id === 'number' && typeof pokemon.name === 'string' && typeof pokemon.image === 'string';
}

function loadTiers(): TierRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultTiers();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return createDefaultTiers();
    const tiers: TierRow[] = [];
    parsed.forEach((row) => {
      if (!row || typeof row !== 'object') return;
      const candidate = row as Partial<TierRow>;
      if (typeof candidate.id !== 'string' || typeof candidate.name !== 'string' || typeof candidate.color !== 'string') {
        return;
      }
      tiers.push({
        id: candidate.id,
        name: candidate.name,
        color: candidate.color,
        pokemon: Array.isArray(candidate.pokemon) ? candidate.pokemon.filter(isStoredPokemon) : [],
      });
    });
    return tiers.length > 0 ? tiers : createDefaultTiers();
  } catch {
    return createDefaultTiers();
  }
}

function labelTextColor(hex: string): string {
  const normalized = hex.replace('#', '');
  const full = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return '#ffffff';
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? '#1a202c' : '#ffffff';
}

function nextTierName(tiers: TierRow[]): string {
  const used = new Set(tiers.map((tier) => tier.name.trim().toLowerCase()));
  const letter = NEXT_TIER_LETTERS.find((entry) => !used.has(`${entry.toLowerCase()} tier`));
  if (letter) return `${letter} Tier`;
  return `Tier ${tiers.length + 1}`;
}

function nextTierColor(tiers: TierRow[]): string {
  const used = new Set(tiers.map((tier) => tier.color.toLowerCase()));
  return COLOR_CHOICES.find((color) => !used.has(color)) ?? COLOR_CHOICES[tiers.length % COLOR_CHOICES.length];
}

function withListCount(pokemon: Pokemon, count: number | null, countLabel: string | null): Pokemon {
  if (count == null || !countLabel) return pokemon;
  return { ...pokemon, listCount: count, listCountLabel: countLabel };
}

type CardSize = { width: number | null; height: number | null };
type ResizeAxis = 'x' | 'y' | 'both';

function readStoredSize(value: unknown, min: number): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min) return null;
  return value;
}

function loadCardSize(): CardSize {
  try {
    const raw = localStorage.getItem(SIZE_KEY);
    if (!raw) return { width: null, height: null };
    const parsed = JSON.parse(raw) as Partial<CardSize>;
    return {
      width: readStoredSize(parsed.width, MIN_CARD_WIDTH),
      height: readStoredSize(parsed.height, MIN_CARD_HEIGHT),
    };
  } catch {
    return { width: null, height: null };
  }
}

function maxCardWidth(left = 0): number {
  if (typeof window === 'undefined') return 1400;
  return Math.max(MIN_CARD_WIDTH, window.innerWidth - left - 16);
}

function maxCardHeight(): number {
  if (typeof window === 'undefined') return 900;
  return Math.max(MIN_CARD_HEIGHT, Math.round(window.innerHeight * 1.5));
}

function clampSize(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type DragOrigin = { tierId: string; index: number };

const TierList: React.FC<TierListProps> = ({ artStyle, surfaceStyle, showBubbles }) => {
  const [tiers, setTiers] = useState<TierRow[]>(() => loadTiers());
  const [catalog, setCatalog] = useState<PokemonCatalogSnapshot>({ pokemon: [], ready: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draft, setDraft] = useState('');
  const [notice, setNotice] = useState('');
  const [targetTierId, setTargetTierId] = useState(() => loadTiers()[0]?.id ?? '');
  const [dragOverTierId, setDragOverTierId] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<{ tierId: string; index: number } | null>(null);
  const [dragging, setDragging] = useState<DragOrigin | null>(null);
  const dragRef = useRef<DragOrigin | null>(null);
  const dropRef = useRef<{ tierId: string; index: number } | null>(null);
  const dragGeneration = useRef(0);
  const addPokemonToTierRef = useRef<(tierId: string, incoming: Pokemon[]) => { added: number; moved: number }>(() => ({ added: 0, moved: 0 }));
  const tiersRef = useRef(tiers);
  tiersRef.current = tiers;
  const cardRef = useRef<HTMLElement>(null);
  const [cardSize, setCardSize] = useState<CardSize>(loadCardSize);
  const [resizing, setResizing] = useState(false);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => subscribePokemonCatalog(setCatalog), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tiers));
  }, [tiers]);

  useEffect(() => {
    localStorage.setItem(SIZE_KEY, JSON.stringify(cardSize));
  }, [cardSize]);

  useEffect(() => () => resizeCleanupRef.current?.(), []);

  const nudgeCard = (axis: ResizeAxis, deltaX: number, deltaY: number) => {
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    setCardSize((current) => {
      const next = { ...current };
      if (axis === 'x' || axis === 'both') {
        const base = current.width ?? bounds.width;
        next.width = clampSize(base + deltaX, MIN_CARD_WIDTH, Math.max(maxCardWidth(bounds.left), base));
      }
      if (axis === 'y' || axis === 'both') {
        const base = Math.max(current.height ?? 0, bounds.height);
        next.height = clampSize(base + deltaY, MIN_CARD_HEIGHT, Math.max(maxCardHeight(), base));
      }
      return next;
    });
  };

  const startResize = (axis: ResizeAxis) => (event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = bounds.width;
    const startHeight = bounds.height;
    const widthLimit = Math.max(maxCardWidth(bounds.left), startWidth);
    const heightLimit = Math.max(maxCardHeight(), startHeight);
    resizeCleanupRef.current?.();
    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.cursor = axis === 'x' ? 'ew-resize' : axis === 'y' ? 'ns-resize' : 'nwse-resize';
    document.body.style.userSelect = 'none';
    setResizing(true);

    const onMove = (moveEvent: PointerEvent) => {
      const next: Partial<CardSize> = {};
      if (axis === 'x' || axis === 'both') {
        next.width = clampSize(startWidth + moveEvent.clientX - startX, MIN_CARD_WIDTH, widthLimit);
      }
      if (axis === 'y' || axis === 'both') {
        next.height = clampSize(startHeight + moveEvent.clientY - startY, MIN_CARD_HEIGHT, heightLimit);
      }
      setCardSize((current) => ({ ...current, ...next }));
    };
    const onUp = () => {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      setResizing(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      resizeCleanupRef.current = null;
    };
    resizeCleanupRef.current = onUp;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const resetCardAxis = (axis: ResizeAxis) => {
    setCardSize((current) => ({
      width: axis === 'y' ? current.width : null,
      height: axis === 'x' ? current.height : null,
    }));
  };

  useEffect(() => {
    if (!targetTierId) return;
    if (tiers.some((tier) => tier.id === targetTierId)) return;
    setTargetTierId('');
  }, [tiers, targetTierId]);

  const lookup = useMemo(() => buildPokemonLookup(catalog.pokemon), [catalog.pokemon]);

  const relocatePokemon = (fromTierId: string, fromIndex: number, toTierId: string, toIndex: number) => {
    setTiers((prev) => {
      if (fromTierId === toTierId && (fromIndex === toIndex || fromIndex + 1 === toIndex)) return prev;
      const next = prev.map((tier) => ({ ...tier, pokemon: [...tier.pokemon] }));
      const source = next.find((tier) => tier.id === fromTierId);
      const target = next.find((tier) => tier.id === toTierId);
      if (!source || !target || fromIndex < 0 || fromIndex >= source.pokemon.length) return prev;
      const [item] = source.pokemon.splice(fromIndex, 1);
      let insertAt = toIndex;
      if (source.id === target.id && fromIndex < insertAt) insertAt -= 1;
      insertAt = Math.max(0, Math.min(insertAt, target.pokemon.length));
      target.pokemon.splice(insertAt, 0, item);
      return next;
    });
  };

  const addPokemonToTier = (tierId: string, incoming: Pokemon[], options?: { sortByCount?: boolean }) => {
    const target = tiers.find((tier) => tier.id === tierId);
    if (!target || incoming.length === 0) return { added: 0, moved: 0, updated: 0 };

    const alreadyHere = new Map(target.pokemon.map((pokemon) => [pokemonIdentity(pokemon), pokemon]));
    const accepted: Pokemon[] = [];
    const acceptedIds = new Set<string>();
    const countUpdates = new Map<string, Pokemon>();
    incoming.forEach((pokemon) => {
      const id = pokemonIdentity(pokemon);
      if (acceptedIds.has(id)) return;
      const existing = alreadyHere.get(id);
      if (existing) {
        if (
          pokemon.listCount != null
          && (existing.listCount !== pokemon.listCount || existing.listCountLabel !== pokemon.listCountLabel)
        ) {
          countUpdates.set(id, pokemon);
        }
        return;
      }
      acceptedIds.add(id);
      accepted.push(pokemon);
    });

    const sortByCount = Boolean(options?.sortByCount);
    if (accepted.length === 0 && countUpdates.size === 0 && !sortByCount) {
      return { added: 0, moved: 0, updated: 0 };
    }

    const movedIds = new Set<string>();
    tiers.forEach((tier) => {
      if (tier.id === tierId) return;
      tier.pokemon.forEach((pokemon) => {
        const id = pokemonIdentity(pokemon);
        if (acceptedIds.has(id)) movedIds.add(id);
      });
    });

    setTiers((prev) => prev.map((tier) => {
      if (tier.id === tierId) {
        const updated = tier.pokemon.map((pokemon) => {
          const replacement = countUpdates.get(pokemonIdentity(pokemon));
          if (!replacement || replacement.listCount == null || !replacement.listCountLabel) return pokemon;
          return { ...pokemon, listCount: replacement.listCount, listCountLabel: replacement.listCountLabel };
        });
        const pokemon = [...updated, ...accepted];
        return { ...tier, pokemon: sortByCount ? sortPokemonForList(pokemon, 'number') : pokemon };
      }
      if (acceptedIds.size === 0) return tier;
      return {
        ...tier,
        pokemon: tier.pokemon.filter((pokemon) => !acceptedIds.has(pokemonIdentity(pokemon))),
      };
    }));

    return { added: accepted.length, moved: movedIds.size, updated: countUpdates.size };
  };

  addPokemonToTierRef.current = addPokemonToTier;

  useEffect(() => {
    if (!targetTierId) return;
    return registerSelectedTierAdder((pokemon) => {
      const { added, moved } = addPokemonToTierRef.current(targetTierId, [pokemon]);
      const tierName = tiersRef.current.find((tier) => tier.id === targetTierId)?.name ?? 'this tier';
      const label = formatPokemonLabel(pokemon.name);
      setNotice(added === 0
        ? `${label} is already in ${tierName}.`
        : moved > 0
          ? `Moved ${label} to ${tierName}.`
          : `Added ${label} to ${tierName}.`);
    });
  }, [targetTierId]);

  const commitDraft = () => {
    const tierId = tiers.find((tier) => tier.id === targetTierId)?.id;
    if (!tierId) {
      setNotice(tiers.length === 0
        ? 'Add a tier before adding Pokémon.'
        : 'Select a tier before adding Pokémon.');
      return;
    }
    if (!catalog.ready) {
      setNotice('The Pokémon database is still loading. Your list is saved here — try again in a moment.');
      return;
    }

    const entries = parsePokemonListEntries(draft);
    const recognized: Pokemon[] = [];
    const unrecognized: string[] = [];
    const seen = new Map<string, number>();

    entries.forEach((entry) => {
      const match = findPokemonInLookup(lookup, entry.name);
      if (!match) {
        unrecognized.push(entry.raw);
        return;
      }
      const pokemon = withListCount(match, entry.count, entry.countLabel);
      const id = pokemonIdentity(match);
      const previousIndex = seen.get(id);
      if (previousIndex == null) {
        seen.set(id, recognized.length);
        recognized.push(pokemon);
        return;
      }
      if (entry.count != null) recognized[previousIndex] = pokemon;
    });

    if (recognized.length === 0) {
      setNotice(unrecognized.length
        ? `Could not recognize: ${unrecognized.join(', ')}`
        : 'Enter at least one Pokémon name.');
      return;
    }

    const sortByCount = recognized.some((pokemon) => pokemon.listCount != null);
    const { added, moved, updated } = addPokemonToTier(tierId, recognized, { sortByCount });
    const stayed = recognized.length - added;
    const tierName = tiers.find((tier) => tier.id === tierId)?.name ?? 'this tier';
    const parts: string[] = [];
    if (added > 0) {
      parts.push(moved > 0
        ? `Added ${added} Pokémon to ${tierName} (${moved} moved from another tier).`
        : `Added ${added} Pokémon to ${tierName}.`);
    } else if (updated > 0) {
      parts.push(`Updated the numbers in ${tierName}.`);
    } else if (stayed > 0) {
      parts.push(`Those Pokémon are already in ${tierName}.`);
    }
    if (unrecognized.length > 0) {
      parts.push(`Could not recognize: ${unrecognized.join(', ')}`);
    }
    setNotice(parts.join(' '));
    setDraft(unrecognized.join('\n'));
  };

  const selectSuggestion = (pokemon: Pokemon) => {
    const tierId = tiers.find((tier) => tier.id === targetTierId)?.id;
    if (!tierId) return;
    const entries = parsePokemonListEntries(draft);
    const entry = entries.length === 1 ? entries[0] : null;
    const picked = entry ? withListCount(pokemon, entry.count, entry.countLabel) : pokemon;
    const { added, moved } = addPokemonToTier(tierId, [picked], { sortByCount: picked.listCount != null });
    const label = formatPokemonListLabel(picked);
    const tierName = tiers.find((tier) => tier.id === tierId)?.name ?? 'this tier';
    const message = added === 0
      ? `${label} is already in ${tierName}.`
      : moved > 0
        ? `Moved ${label} to ${tierName}.`
        : `Added ${label} to ${tierName}.`;
    setNotice(message);
    if (parsePokemonNamesFromText(draft).length <= 1) {
      setDraft('');
    }
  };

  const removePokemon = (tierId: string, index: number) => {
    setTiers((prev) => prev.map((tier) => (
      tier.id === tierId
        ? { ...tier, pokemon: tier.pokemon.filter((_, pokemonIndex) => pokemonIndex !== index) }
        : tier
    )));
  };

  const updateTier = (tierId: string, patch: Partial<Pick<TierRow, 'name' | 'color'>>) => {
    setTiers((prev) => prev.map((tier) => (tier.id === tierId ? { ...tier, ...patch } : tier)));
  };

  const moveTier = (index: number, direction: -1 | 1) => {
    setTiers((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  };

  const deleteTier = (tier: TierRow) => {
    if (tier.pokemon.length > 0) {
      const confirmed = window.confirm(
        `Delete "${tier.name}"? The ${tier.pokemon.length} Pokémon in this tier will be removed from the tier list.`
      );
      if (!confirmed) return;
    }
    setTiers((prev) => prev.filter((row) => row.id !== tier.id));
  };

  const addTier = () => {
    setTiers((prev) => [
      ...prev,
      { id: createId(), name: nextTierName(prev), color: nextTierColor(prev), pokemon: [] },
    ]);
  };

  const finishRename = (tier: TierRow) => {
    const trimmed = editingName.trim();
    updateTier(tier.id, { name: trimmed || tier.name });
    setEditingId(null);
  };

  const rememberDrop = (tierId: string, index: number) => {
    dropRef.current = { tierId, index };
    setDropIndex((current) => (
      current?.tierId === tierId && current.index === index ? current : { tierId, index }
    ));
    setDragOverTierId((current) => (current === tierId ? current : tierId));
  };

  const clearDrag = () => {
    dragGeneration.current += 1;
    dragRef.current = null;
    dropRef.current = null;
    setDragging(null);
    setDragOverTierId(null);
    setDropIndex(null);
  };

  const targetTier = tiers.find((tier) => tier.id === targetTierId);
  const draftEntries = parsePokemonListEntries(draft);
  const singleQuery = draftEntries.length <= 1 ? (draftEntries[0]?.name ?? '').trim() : '';
  const suggestions = catalog.ready && singleQuery ? searchPokemon(catalog.pokemon, singleQuery) : [];
  const previewSeen = new Map<string, number>();
  const previewRecognized: Pokemon[] = [];
  const previewUnknown: string[] = [];
  if (catalog.ready) {
    draftEntries.forEach((entry) => {
      const match = findPokemonInLookup(lookup, entry.name);
      if (!match) {
        previewUnknown.push(entry.raw);
        return;
      }
      const pokemon = withListCount(match, entry.count, entry.countLabel);
      const id = pokemonIdentity(match);
      const previousIndex = previewSeen.get(id);
      if (previousIndex == null) {
        previewSeen.set(id, previewRecognized.length);
        previewRecognized.push(pokemon);
        return;
      }
      if (entry.count != null) previewRecognized[previousIndex] = pokemon;
    });
  }
  const previewDisplay = previewRecognized.some((pokemon) => pokemon.listCount != null)
    ? sortPokemonForList(previewRecognized, 'number')
    : previewRecognized;

  return (
    <div
      className="tier-list-layout"
      style={cardSize.width != null ? { width: cardSize.width, alignSelf: 'flex-start', maxWidth: 'none' } : undefined}
    >
    <section
      ref={cardRef}
      className={`tier-list ${showBubbles ? 'show-bubbles' : 'no-bubbles'} ${resizing ? 'is-resizing' : ''}`}
      style={{
        ...surfaceStyle,
        ...(cardSize.height != null ? { minHeight: cardSize.height } : null),
      }}
      aria-label="Tier list"
    >
      <header className="tier-list-header">
        <h2>Tier List</h2>
        <p>Drag Pokémon to reorder them or move them between tiers. Drag the card edge to resize it.</p>
      </header>

      {tiers.map((tier, tierIndex) => {
        const textColor = labelTextColor(tier.color);

        return (
          <div
            key={tier.id}
            className={`tier-row ${dragOverTierId === tier.id ? 'drop-active' : ''} ${
              targetTier?.id === tier.id ? 'is-selected' : ''
            }`}
            onDragOver={(event) => {
              if (!dragRef.current) return;
              event.preventDefault();
              const target = event.target as HTMLElement;
              if (!target.closest('.tier-tile')) {
                rememberDrop(tier.id, tier.pokemon.length);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              const origin = dragRef.current;
              const landing = dropRef.current;
              if (!origin) return;
              const index = landing && landing.tierId === tier.id ? landing.index : tier.pokemon.length;
              relocatePokemon(origin.tierId, origin.index, tier.id, index);
              clearDrag();
            }}
          >
            <div
              className="tier-label"
              style={{ background: tier.color, color: textColor }}
              onClick={() => setTargetTierId((current) => (current === tier.id ? '' : tier.id))}
            >
              {editingId === tier.id ? (
                <input
                  className="tier-name-input"
                  value={editingName}
                  autoFocus
                  aria-label="Tier name"
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => setEditingName(event.target.value)}
                  onBlur={() => finishRename(tier)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <button
                  type="button"
                  className="tier-name-btn"
                  style={{ color: textColor }}
                  onClick={(event) => {
                    if (targetTier?.id === tier.id) {
                      event.stopPropagation();
                      setTargetTierId('');
                      return;
                    }
                    setEditingId(tier.id);
                    setEditingName(tier.name);
                  }}
                >
                  {tier.name}
                </button>
              )}
              <div className="tier-row-actions">
                  <button
                    type="button"
                    className="tier-icon-btn"
                    style={{ color: textColor }}
                    aria-label={`Move ${tier.name} up`}
                    disabled={tierIndex === 0}
                    onClick={(event) => {
                      event.stopPropagation();
                      moveTier(tierIndex, -1);
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    type="button"
                    className="tier-icon-btn"
                    style={{ color: textColor }}
                    aria-label={`Move ${tier.name} down`}
                    disabled={tierIndex === tiers.length - 1}
                    onClick={(event) => {
                      event.stopPropagation();
                      moveTier(tierIndex, 1);
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    className="tier-icon-btn"
                    style={{ color: textColor }}
                    aria-label={`Delete ${tier.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteTier(tier);
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
            </div>

            <div className="tier-body">
              <div className="tier-pokemon">
                {tier.pokemon.length === 0 ? (
                  <p className="tier-empty">No Pokémon in this tier yet.</p>
                ) : null}
                {tier.pokemon.map((pokemon, index) => (
                  <div
                    key={`${tier.id}-${pokemonIdentity(pokemon)}-${index}`}
                    className={`tier-tile ${dropIndex?.tierId === tier.id && dropIndex.index === index ? 'drop-before' : ''} ${
                      dragging?.tierId === tier.id && dragging.index === index ? 'is-dragging' : ''
                    }`}
                    draggable
                    onDragStart={(event) => {
                      if ((event.target as HTMLElement).closest('button')) {
                        event.preventDefault();
                        return;
                      }
                      const origin = { tierId: tier.id, index };
                      dragRef.current = origin;
                      const generation = dragGeneration.current;
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', pokemonIdentity(pokemon));
                      window.requestAnimationFrame(() => {
                        if (dragGeneration.current === generation) setDragging(origin);
                      });
                    }}
                    onDragEnd={clearDrag}
                    onDragOver={(event) => {
                      if (!dragRef.current) return;
                      event.preventDefault();
                      event.stopPropagation();
                      const rect = event.currentTarget.getBoundingClientRect();
                      const after = event.clientX > rect.left + rect.width / 2;
                      rememberDrop(tier.id, after ? index + 1 : index);
                    }}
                  >
                    <button
                      type="button"
                      className="tier-tile-remove"
                      aria-label={`Remove ${formatPokemonListLabel(pokemon)}`}
                      onClick={() => removePokemon(tier.id, index)}
                    >
                      <X size={12} />
                    </button>
                    <img
                      src={pokemonSpriteSrc(pokemon, artStyle)}
                      alt=""
                      className={`tier-tile-sprite ${artStyle === 'official' ? 'official-art' : 'pixel-art'}`}
                      draggable={false}
                    />
                    <span className="tier-tile-name">{formatPokemonListLabel(pokemon)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      <button type="button" className="tier-add-row" onClick={addTier}>
        <Plus size={16} />
        Add Tier
      </button>
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Drag to resize the tier list width. Double-click to reset."
        tabIndex={0}
        className="tier-resize-handle tier-resize-handle-right"
        onPointerDown={startResize('x')}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          resetCardAxis('x');
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 48 : 16;
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          nudgeCard('x', event.key === 'ArrowRight' ? step : -step, 0);
        }}
      />
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Drag to resize the tier list height. Double-click to reset."
        tabIndex={0}
        className="tier-resize-handle tier-resize-handle-bottom"
        onPointerDown={startResize('y')}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          resetCardAxis('y');
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 48 : 16;
          if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
          event.preventDefault();
          nudgeCard('y', 0, event.key === 'ArrowDown' ? step : -step);
        }}
      />
      <div
        role="separator"
        aria-label="Drag to resize the tier list. Double-click to reset."
        tabIndex={0}
        className="tier-resize-handle tier-resize-handle-corner"
        onPointerDown={startResize('both')}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          resetCardAxis('both');
        }}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 48 : 16;
          if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            nudgeCard('x', event.key === 'ArrowRight' ? step : -step, 0);
          } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            nudgeCard('y', 0, event.key === 'ArrowDown' ? step : -step);
          }
        }}
      />
    </section>

    <div className="tier-add-panel">
      <label className="tier-add-label" htmlFor="tier-add-target">Tier</label>
      <select
        id="tier-add-target"
        className="tier-add-target"
        value={targetTier?.id ?? ''}
        onChange={(event) => setTargetTierId(event.target.value)}
        disabled={tiers.length === 0}
      >
        <option value="" disabled>
          Select a tier
        </option>
        {tiers.map((tier) => (
          <option key={tier.id} value={tier.id}>{tier.name}</option>
        ))}
      </select>
      {targetTier ? (
        <div className="tier-color-controls">
          <label className="tier-color-picker" htmlFor="tier-color-input">
            Color
            <input
              id="tier-color-input"
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(targetTier.color) ? targetTier.color : '#667eea'}
              aria-label={`Color for ${targetTier.name}`}
              onChange={(event) => updateTier(targetTier.id, { color: event.target.value })}
            />
          </label>
          <div className="tier-color-swatches">
            {COLOR_CHOICES.map((color) => (
              <button
                key={color}
                type="button"
                className={`tier-swatch ${targetTier.color.toLowerCase() === color ? 'selected' : ''}`}
                style={{ background: color }}
                aria-label={`Set ${targetTier.name} to ${color}`}
                onClick={() => updateTier(targetTier.id, { color })}
              />
            ))}
          </div>
        </div>
      ) : null}
      <label className="tier-add-label" htmlFor="tier-add-text">
        Paste or type Pokémon names with an optional number in parentheses, such as Pikachu (40). Separate with commas, new lines, or semicolons.
      </label>
      <div className="tier-add-input-wrap">
        <textarea
          id="tier-add-text"
          className="tier-add-text"
          rows={4}
          value={draft}
          placeholder={'Pikachu (40)\nCharizard (12)'}
          onChange={(event) => {
            setDraft(event.target.value);
            setNotice('');
          }}
          disabled={!targetTier}
        />
        {suggestions.length > 0 ? (
          <ul className="tier-suggestions">
            {suggestions.map((pokemon) => (
              <li key={pokemonIdentity(pokemon)}>
                <button
                  type="button"
                  className="tier-suggestion"
                  onClick={() => selectSuggestion(pokemon)}
                >
                  <img
                    src={pokemonSpriteSrc(pokemon, artStyle)}
                    alt=""
                    className={artStyle === 'official' ? 'official-art' : 'pixel-art'}
                  />
                  <span>{formatPokemonLabel(pokemon.name)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {catalog.ready && previewRecognized.length > 0 ? (
        <div className="tier-add-preview" aria-label="Recognized Pokémon">
          {previewDisplay.map((pokemon) => (
            <span key={pokemonIdentity(pokemon)} className="tier-add-chip">
              <img
                src={pokemonSpriteSrc(pokemon, artStyle)}
                alt=""
                className={artStyle === 'official' ? 'official-art' : 'pixel-art'}
              />
              {formatPokemonListLabel(pokemon)}
            </span>
          ))}
        </div>
      ) : null}
      {catalog.ready && previewUnknown.length > 0 ? (
        <p className="tier-add-unknown">Not recognized: {previewUnknown.join(', ')}</p>
      ) : null}
      {!catalog.ready ? (
        <p className="tier-add-waiting">Pokémon data is still loading. You can prepare a list and add it once loading finishes.</p>
      ) : null}
      <button
        type="button"
        className="tier-add-confirm"
        onClick={commitDraft}
        disabled={!catalog.ready || !targetTier || previewRecognized.length === 0}
      >
        Add Pokémon
      </button>
      {notice ? <p className="tier-add-notice">{notice}</p> : null}
    </div>
    </div>
  );
};

export default TierList;
