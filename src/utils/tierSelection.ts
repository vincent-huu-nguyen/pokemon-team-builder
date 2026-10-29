import { Pokemon } from '../types/Pokemon';

type SelectedTierAdder = (pokemon: Pokemon) => void;

let selectedTierAdder: SelectedTierAdder | null = null;

/** Active only while Tier List mode has a tier selected. */
export function registerSelectedTierAdder(adder: SelectedTierAdder) {
  selectedTierAdder = adder;
  return () => {
    if (selectedTierAdder === adder) selectedTierAdder = null;
  };
}

/** Returns true when the Pokémon was sent to the selected tier instead of the team. */
export function addPokemonToSelectedTier(pokemon: Pokemon): boolean {
  if (!selectedTierAdder) return false;
  selectedTierAdder(pokemon);
  return true;
}
