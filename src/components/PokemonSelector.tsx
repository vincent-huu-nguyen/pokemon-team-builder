import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Pokemon } from '../types/Pokemon';
import megaGreninjaUpsideDownPixel from '../assets/Mega_Greninja_UpsideDown.png';
import megaTatsugiriPixel from '../assets/Mega_Tatsugiri.png';
import './PokemonSelector.css';

declare const require: any;

// Map `regionalForms[].name` (PokeAPI slugs) -> local mega pixel sprite file URL.
// Example: `clefable-mega` -> `src/assets/Mega_Clefable.png`
const megaPixelOverrides: Record<string, string> = (() => {
  // Webpack module keys from CRA typically look like: "./Mega_AbsolZ.png"
  const ctx = require.context('../assets', false, /^\.\/Mega_.*\.png$/);
  const map: Record<string, string> = {};

  ctx.keys().forEach((key: string) => {
    // key example: "./Mega_Clefable.png"
    const filename = key.replace(/^\.\//, '');
    const mod = ctx(key);
    const url = mod?.default ?? mod;

    const fileBase = filename.replace(/^Mega_/, '').replace(/\.png$/i, '');
    const parts = fileBase.split('_');

    // These sprites are custom “extra” variants in your assets that do not have
    // a corresponding PokeAPI slug in `/pokemon/<name>`, so never override
    // existing selector entries with them.
    if (fileBase.toLowerCase().includes('upsidedown')) {
      return;
    }

    let slug: string | null = null;
    if (parts.length > 1) {
      // Examples:
      // - Eternal_Flower_Floette -> floette-mega
      // - Magearna_Original -> magearna-original-mega
      const last = parts[parts.length - 1];
      if (parts.length === 2 && last === 'Original') {
        slug = `${parts[0].toLowerCase()}-original-mega`;
      } else {
        slug = `${last.toLowerCase()}-mega`;
      }
    } else {
      // Examples:
      // - AbsolZ -> absol-mega-z
      // - LucarioZ -> lucario-mega-z
      // - RaichuX -> raichu-mega-x
      // - RaichuY -> raichu-mega-y
      const base = parts[0];
      if (base.endsWith('X')) {
        slug = `${base.slice(0, -1).toLowerCase()}-mega-x`;
      } else if (base.endsWith('Y')) {
        slug = `${base.slice(0, -1).toLowerCase()}-mega-y`;
      } else if (base.endsWith('Z')) {
        slug = `${base.slice(0, -1).toLowerCase()}-mega-z`;
      } else {
        slug = `${base.toLowerCase()}-mega`;
      }
    }

    if (slug) map[slug] = url;
  });

  return map;
})();

interface PokemonSelectorProps {
  onPokemonSelect: (pokemon: Pokemon) => void;
  artStyle: 'pixel' | 'official';
  onArtStyleChange: (style: 'pixel' | 'official') => void;
  cardColor?: string;
  gradientColor?: string;
  isGradient?: boolean;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onPokemonSelect, artStyle, onArtStyleChange, cardColor = '#667eea', gradientColor = '#764ba2', isGradient = true }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPokemon, setTotalPokemon] = useState(1025);

  // Used when a particular form doesn't have a `sprites.front_default` sprite.
  // This prevents pixel-art mode from accidentally showing `official-artwork`.
  const TRANSPARENT_PLACEHOLDER =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  useEffect(() => {
    fetchAllPokemon();
    // We intentionally only run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllPokemon = async () => {
    try {
      setLoading(true);
      setLoadingProgress(0);
      const allPokemon: Pokemon[] = [];
      
      // Fetch regular Pokemon in batches for better performance
      const batchSize = 50;
      const totalPokemonCount = 1025; // Updated to include all Pokemon up to Gen 9
      setTotalPokemon(totalPokemonCount);
      
      console.log(`Batch size: ${batchSize}, Total Pokemon: ${totalPokemonCount}`);
      console.log(`Number of batches: ${Math.ceil(totalPokemonCount / batchSize)}`);
      
      console.log(`Starting to fetch ${totalPokemonCount} Pokemon...`);
      
      // Test the loop logic
      let batchCount = 0;
      for (let batchStart = 1; batchStart <= totalPokemonCount; batchStart += batchSize) {
        batchCount++;
        const batchEnd = Math.min(batchStart + batchSize - 1, totalPokemonCount);
        console.log(`Batch ${batchCount}: Pokemon ${batchStart} to ${batchEnd}`);
      }
      console.log(`Total batches to process: ${batchCount}`);
      
      // Fetch Pokemon in batches
      for (let batchStart = 1; batchStart <= totalPokemonCount; batchStart += batchSize) {
         let retryCount = 0;
         const maxRetries = 3;
         
         while (retryCount < maxRetries) {
         const batchEnd = Math.min(batchStart + batchSize - 1, totalPokemon);
         console.log(`Fetching batch: Pokemon ${batchStart} to ${batchEnd}`);
         
         const batch = [];
         for (let id = batchStart; id <= batchEnd; id++) {
           batch.push(fetch(`https://pokeapi.co/api/v2/pokemon/${id}`));
         }
        
                 try {
           const responses = await Promise.all(batch);
           
           // Check each response for errors
           const validResponses = responses.filter(response => {
             if (!response.ok) {
               console.error(`HTTP error: ${response.status} for batch starting at ${batchStart}`);
               return false;
             }
             return true;
           });
           
           if (validResponses.length === 0) {
             console.error(`All requests failed for batch starting at ${batchStart}, retry ${retryCount + 1}/${maxRetries}`);
             retryCount++;
             if (retryCount < maxRetries) {
               await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
               continue;
             } else {
               console.error(`Failed to fetch batch starting at ${batchStart} after ${maxRetries} retries`);
               break;
             }
           }
           
           const dataPromises = validResponses.map(async (response, index) => {
             try {
               const text = await response.text();
               if (text === 'OK' || text === '') {
                 console.error(`Invalid response for Pokemon ${batchStart + index}: "${text}"`);
                 return null;
               }
               return JSON.parse(text);
             } catch (error) {
               console.error(`JSON parse error for Pokemon ${batchStart + index}:`, error);
               return null;
             }
           });
           
           const dataArray = await Promise.all(dataPromises);
           const validData = dataArray.filter(data => data !== null);
          
                     validData.forEach(data => {
             const pokemon: Pokemon = {
               id: data.id,
               name: data.name,
               image: data.sprites.front_default,
               officialArtwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
              generation: getGenerationFromId(data.id),
              // Base Pokémon: Pokédex number == API id
              dexNumber: data.id,
             };
             allPokemon.push(pokemon);
             
             // Debug: Check for specific Pokemon
             if (data.name === 'snivy' || data.name === 'tepig' || data.name === 'oshawott') {
               console.log(`Found ${data.name} (ID: ${data.id}, Gen: ${getGenerationFromId(data.id)})`);
             }
             
             // Debug: Check for specific IDs that should be Snivy and Tepig
             if (data.id === 495 || data.id === 498) {
               console.log(`Found Pokemon with ID ${data.id}: ${data.name}`);
             }
             
             // Debug: Check for the range where Snivy and Tepig should be
             if (data.id >= 495 && data.id <= 503) {
               console.log(`Found Pokemon in Snivy/Tepig range: ID ${data.id} - ${data.name}`);
             }
           });
          
                     // Update the list as we fetch to show progress
           setPokemonList([...allPokemon]);
           setFilteredPokemon([...allPokemon]);
           
           // Update progress
           const progress = Math.min((allPokemon.length / totalPokemonCount) * 100, 100);
           setLoadingProgress(progress);
           
           console.log(`Loaded ${allPokemon.length} Pokemon so far... (${progress.toFixed(1)}%)`);
           
           // Check if this is the last batch
           if (batchEnd >= totalPokemonCount) {
             console.log(`Final batch completed. Expected ${totalPokemonCount} Pokemon, got ${allPokemon.length}`);
           }
                 } catch (error) {
           console.error(`Error fetching batch starting at ${batchStart}, retry ${retryCount + 1}/${maxRetries}:`, error);
           retryCount++;
           if (retryCount < maxRetries) {
             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
             continue;
           } else {
             console.error(`Failed to fetch batch starting at ${batchStart} after ${maxRetries} retries`);
             break;
           }
         }
         
         // If we get here, the batch was successful
         break;
       }
      }

             console.log(`Finished loading ${allPokemon.length} base Pokemon`);
       // Fetch regional forms
       await fetchRegionalForms(allPokemon);
      
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegionalForms = async (basePokemon: Pokemon[]) => {
    try {
      // List of regional forms, mega evolutions, and gigantamax forms with correct PokeAPI names
      const regionalForms = [
        // Mega Evolutions
        { name: 'venusaur-mega', displayName: 'Mega Venusaur', baseId: 3 },
        { name: 'charizard-mega-x', displayName: 'Mega Charizard X', baseId: 6 },
        { name: 'charizard-mega-y', displayName: 'Mega Charizard Y', baseId: 6 },
        { name: 'blastoise-mega', displayName: 'Mega Blastoise', baseId: 9 },
        { name: 'alakazam-mega', displayName: 'Mega Alakazam', baseId: 65 },
        { name: 'gengar-mega', displayName: 'Mega Gengar', baseId: 94 },
        { name: 'kangaskhan-mega', displayName: 'Mega Kangaskhan', baseId: 115 },
        { name: 'pinsir-mega', displayName: 'Mega Pinsir', baseId: 127 },
        { name: 'gyarados-mega', displayName: 'Mega Gyarados', baseId: 130 },
        { name: 'aerodactyl-mega', displayName: 'Mega Aerodactyl', baseId: 142 },
        { name: 'mewtwo-mega-x', displayName: 'Mega Mewtwo X', baseId: 150 },
        { name: 'mewtwo-mega-y', displayName: 'Mega Mewtwo Y', baseId: 150 },
        { name: 'ampharos-mega', displayName: 'Mega Ampharos', baseId: 181 },
        { name: 'scizor-mega', displayName: 'Mega Scizor', baseId: 212 },
        { name: 'heracross-mega', displayName: 'Mega Heracross', baseId: 214 },
        { name: 'houndoom-mega', displayName: 'Mega Houndoom', baseId: 229 },
        { name: 'tyranitar-mega', displayName: 'Mega Tyranitar', baseId: 248 },
        { name: 'blaziken-mega', displayName: 'Mega Blaziken', baseId: 257 },
        { name: 'gardevoir-mega', displayName: 'Mega Gardevoir', baseId: 282 },
        { name: 'mawile-mega', displayName: 'Mega Mawile', baseId: 303 },
        { name: 'aggron-mega', displayName: 'Mega Aggron', baseId: 306 },
        { name: 'medicham-mega', displayName: 'Mega Medicham', baseId: 308 },
        { name: 'manectric-mega', displayName: 'Mega Manectric', baseId: 310 },
        { name: 'banette-mega', displayName: 'Mega Banette', baseId: 354 },
        { name: 'absol-mega', displayName: 'Mega Absol', baseId: 359 },
        { name: 'absol-mega-z', displayName: 'Mega Absol Z', baseId: 359 },
        { name: 'garchomp-mega', displayName: 'Mega Garchomp', baseId: 445 },
        { name: 'garchomp-mega-z', displayName: 'Mega Garchomp Z', baseId: 445 },
        { name: 'lucario-mega', displayName: 'Mega Lucario', baseId: 448 },
        { name: 'lucario-mega-z', displayName: 'Mega Lucario Z', baseId: 448 },
        { name: 'abomasnow-mega', displayName: 'Mega Abomasnow', baseId: 460 },
        { name: 'floette-eternal', displayName: 'Eternal Floette', baseId: 670 },
        { name: 'latias-mega', displayName: 'Mega Latias', baseId: 380 },
        { name: 'latios-mega', displayName: 'Mega Latios', baseId: 381 },
        { name: 'rayquaza-mega', displayName: 'Mega Rayquaza', baseId: 384 },
        { name: 'lopunny-mega', displayName: 'Mega Lopunny', baseId: 428 },
        { name: 'gallade-mega', displayName: 'Mega Gallade', baseId: 475 },
        { name: 'audino-mega', displayName: 'Mega Audino', baseId: 531 },
        { name: 'diancie-mega', displayName: 'Mega Diancie', baseId: 719 },
        { name: 'metagross-mega', displayName: 'Mega Metagross', baseId: 376 },
        { name: 'kyogre-primal', displayName: 'Primal Kyogre', baseId: 382 },
        { name: 'groudon-primal', displayName: 'Primal Groudon', baseId: 383 },
        { name: 'salamence-mega', displayName: 'Mega Salamence', baseId: 373 },
        { name: 'sharpedo-mega', displayName: 'Mega Sharpedo', baseId: 319 },
        { name: 'camerupt-mega', displayName: 'Mega Camerupt', baseId: 323 },
        { name: 'altaria-mega', displayName: 'Mega Altaria', baseId: 334 },
        { name: 'glalie-mega', displayName: 'Mega Glalie', baseId: 362 },
        { name: 'sceptile-mega', displayName: 'Mega Sceptile', baseId: 254 },
        { name: 'swampert-mega', displayName: 'Mega Swampert', baseId: 260 },
        { name: 'sableye-mega', displayName: 'Mega Sableye', baseId: 302 },
        { name: 'slowbro-mega', displayName: 'Mega Slowbro', baseId: 80 },
        { name: 'steelix-mega', displayName: 'Mega Steelix', baseId: 208 },
        { name: 'pidgeot-mega', displayName: 'Mega Pidgeot', baseId: 18 },
        { name: 'beedrill-mega', displayName: 'Mega Beedrill', baseId: 15 },
        // New Mega Evolutions (Pokémon Legends: Z-A)
        { name: 'clefable-mega', displayName: 'Mega Clefable', baseId: 36 },
        { name: 'starmie-mega', displayName: 'Mega Starmie', baseId: 121 },
        { name: 'victreebel-mega', displayName: 'Mega Victreebel', baseId: 71 },
        { name: 'dragonite-mega', displayName: 'Mega Dragonite', baseId: 149 },
        { name: 'meganium-mega', displayName: 'Mega Meganium', baseId: 154 },
        { name: 'feraligatr-mega', displayName: 'Mega Feraligatr', baseId: 160 },
        { name: 'skarmory-mega', displayName: 'Mega Skarmory', baseId: 227 },
        { name: 'froslass-mega', displayName: 'Mega Froslass', baseId: 478 },
        { name: 'emboar-mega', displayName: 'Mega Emboar', baseId: 500 },
        { name: 'scolipede-mega', displayName: 'Mega Scolipede', baseId: 545 },
        { name: 'excadrill-mega', displayName: 'Mega Excadrill', baseId: 530 },
        { name: 'eelektross-mega', displayName: 'Mega Eelektross', baseId: 604 },
        { name: 'scrafty-mega', displayName: 'Mega Scrafty', baseId: 560 },
        { name: 'chandelure-mega', displayName: 'Mega Chandelure', baseId: 609 },
        { name: 'chesnaught-mega', displayName: 'Mega Chesnaught', baseId: 652 },
        { name: 'delphox-mega', displayName: 'Mega Delphox', baseId: 655 },
        { name: 'greninja-mega', displayName: 'Mega Greninja (but better)', baseId: 658.5 },
        { name: 'crabominable-mega', displayName: 'Mega Crabominable', baseId: 740 },
        { name: 'golisopod-mega', displayName: 'Mega Golisopod', baseId: 768 },
        { name: 'golurk-mega', displayName: 'Mega Golurk', baseId: 623 },
        { name: 'pyroar-mega', displayName: 'Mega Pyroar', baseId: 668 },
        { name: 'malamar-mega', displayName: 'Mega Malamar', baseId: 687 },
        { name: 'barbaracle-mega', displayName: 'Mega Barbaracle', baseId: 689 },
        { name: 'dragalge-mega', displayName: 'Mega Dragalge', baseId: 691 },
        { name: 'hawlucha-mega', displayName: 'Mega Hawlucha', baseId: 701 },
        { name: 'floette-mega', displayName: 'Mega Eternal Flower Floette', baseId: 670 },
        { name: 'zygarde-mega', displayName: 'Mega Zygarde', baseId: 718 },
        // Additional new Mega Evolutions (from local `src/assets/Mega_*.png`)
        { name: 'baxcalibur-mega', displayName: 'Mega Baxcalibur', baseId: 998 },
        { name: 'chimecho-mega', displayName: 'Mega Chimecho', baseId: 358 },
        { name: 'darkrai-mega', displayName: 'Mega Darkrai', baseId: 491 },
        { name: 'glimmora-mega', displayName: 'Mega Glimmora', baseId: 970 },
        { name: 'heatran-mega', displayName: 'Mega Heatran', baseId: 485 },
        { name: 'meowstic-mega', displayName: 'Mega Meowstic', baseId: 678 },
        { name: 'raichu-mega-x', displayName: 'Mega Raichu X', baseId: 26 },
        { name: 'raichu-mega-y', displayName: 'Mega Raichu Y', baseId: 26 },
        { name: 'scovillain-mega', displayName: 'Mega Scovillain', baseId: 952 },
        { name: 'staraptor-mega', displayName: 'Mega Staraptor', baseId: 398 },
        { name: 'zeraora-mega', displayName: 'Mega Zeraora', baseId: 807 },

        // Missing forms (non-mega)
        { name: 'aegislash-blade', displayName: 'Aegislash (Blade Forme)', baseId: 681 },
        { name: 'hoopa-unbound', displayName: 'Hoopa (Unbound)', baseId: 720 },
        { name: 'zygarde-10', displayName: 'Zygarde (10%)', baseId: 718 },
        { name: 'zygarde-complete', displayName: 'Zygarde (Complete)', baseId: 718 },

        // Oricorio forms
        { name: 'oricorio-baile', displayName: 'Oricorio (Baile Style)', baseId: 741 },
        { name: 'oricorio-pom-pom', displayName: 'Oricorio (Pom-Pom Style)', baseId: 741 },
        { name: 'oricorio-pau', displayName: 'Oricorio (Pa\'u Style)', baseId: 741 },
        { name: 'oricorio-sensu', displayName: 'Oricorio (Sensu Style)', baseId: 741 },

        // Lycanroc forms
        { name: 'lycanroc-midday', displayName: 'Lycanroc (Midday Forme)', baseId: 745 },
        { name: 'lycanroc-dusk', displayName: 'Lycanroc (Dusk Forme)', baseId: 745 },
        { name: 'lycanroc-midnight', displayName: 'Lycanroc (Midnight Forme)', baseId: 745 },

        // Wishiwashi forms
        { name: 'wishiwashi-solo', displayName: 'Wishiwashi (Solo Forme)', baseId: 746 },
        { name: 'wishiwashi-school', displayName: 'Wishiwashi (School Forme)', baseId: 746 },

        // Necrozma forms
        { name: 'necrozma', displayName: 'Necrozma', baseId: 800 },
        { name: 'necrozma-dusk', displayName: 'Necrozma (Dusk Mane Forme)', baseId: 800 },
        { name: 'necrozma-dawn', displayName: 'Necrozma (Dawn Wings Forme)', baseId: 800 },
        { name: 'necrozma-ultra', displayName: 'Necrozma (Ultra Forme)', baseId: 800 },

        // Magearna forms
        { name: 'magearna', displayName: 'Magearna', baseId: 801 },
        { name: 'magearna-original', displayName: 'Magearna (Original Color)', baseId: 801 },
        { name: 'magearna-mega', displayName: 'Magearna (Mega Forme)', baseId: 801 },
        { name: 'magearna-original-mega', displayName: 'Magearna (Original Color Mega Forme)', baseId: 801 },

        // Eternatus / Calyrex / Maushold / Squawkabilly / Palafin / Tatsugiri / Dudunsparce / Gimmighoul forms
        { name: 'eternatus', displayName: 'Eternatus', baseId: 890 },
        { name: 'eternatus-eternamax', displayName: 'Eternatus (Eternamax Form)', baseId: 890 },

        { name: 'calyrex', displayName: 'Calyrex', baseId: 898 },
        { name: 'calyrex-ice', displayName: 'Calyrex (Ice Rider Forme)', baseId: 898 },
        { name: 'calyrex-shadow', displayName: 'Calyrex (Shadow Rider Forme)', baseId: 898 },

        // Maushold forms
        { name: 'maushold-family-of-four', displayName: 'Maushold (Family of Four)', baseId: 925 },
        { name: 'maushold-family-of-three', displayName: 'Maushold (Family of Three)', baseId: 925 },

        // Squawkabilly forms
        { name: 'squawkabilly-green-plumage', displayName: 'Squawkabilly (Green Plumage)', baseId: 931 },
        { name: 'squawkabilly-blue-plumage', displayName: 'Squawkabilly (Blue Plumage)', baseId: 931 },
        { name: 'squawkabilly-yellow-plumage', displayName: 'Squawkabilly (Yellow Plumage)', baseId: 931 },
        { name: 'squawkabilly-white-plumage', displayName: 'Squawkabilly (White Plumage)', baseId: 931 },

        // Palafin forms
        { name: 'palafin-zero', displayName: 'Palafin (Zero Forme)', baseId: 964 },
        { name: 'palafin-hero', displayName: 'Palafin (Hero Forme)', baseId: 964 },

        // Tatsugiri forms
        { name: 'tatsugiri-curly', displayName: 'Tatsugiri (Curly Forme)', baseId: 978 },
        { name: 'tatsugiri-droopy', displayName: 'Tatsugiri (Droopy Forme)', baseId: 978 },
        { name: 'tatsugiri-stretchy', displayName: 'Tatsugiri (Stretchy Forme)', baseId: 978 },
        { name: 'tatsugiri-stretchy-mega', displayName: 'Mega Tatsugiri', baseId: 978 },

        // Dudunsparce forms
        { name: 'dudunsparce-two-segment', displayName: 'Dudunsparce (Two Segment Forme)', baseId: 982 },
        { name: 'dudunsparce-three-segment', displayName: 'Dudunsparce (Three Segment Forme)', baseId: 982 },

        // Gimmighoul forms
        { name: 'gimmighoul', displayName: 'Gimmighoul (Chest)', baseId: 999 },
        { name: 'gimmighoul-roaming', displayName: 'Gimmighoul (Roaming Forme)', baseId: 999 },

        // Eiscue / Morpeko / Zacian / Zamazenta (missing non-default forms)
        { name: 'eiscue-noice', displayName: 'Eiscue (Noice Face)', baseId: 875 },
        { name: 'morpeko-hangry', displayName: 'Morpeko (Hangry)', baseId: 877 },
        { name: 'zacian-crowned', displayName: 'Zacian (Crowned Sword)', baseId: 888 },
        { name: 'zamazenta-crowned', displayName: 'Zamazenta (Crowned Shield)', baseId: 889 },

        { name: 'drampa-mega', displayName: 'Mega Drampa', baseId: 780 },
        { name: 'falinks-mega', displayName: 'Mega Falinks', baseId: 870 },
        
        // Alolan forms (using correct API names)
        { name: 'meowth-alola', displayName: 'Alolan Meowth', baseId: 52 },
        { name: 'persian-alola', displayName: 'Alolan Persian', baseId: 53 },
        { name: 'rattata-alola', displayName: 'Alolan Rattata', baseId: 19 },
        { name: 'raticate-alola', displayName: 'Alolan Raticate', baseId: 20 },
        { name: 'raichu-alola', displayName: 'Alolan Raichu', baseId: 26 },
        { name: 'sandshrew-alola', displayName: 'Alolan Sandshrew', baseId: 27 },
        { name: 'sandslash-alola', displayName: 'Alolan Sandslash', baseId: 28 },
        { name: 'vulpix-alola', displayName: 'Alolan Vulpix', baseId: 37 },
        { name: 'ninetales-alola', displayName: 'Alolan Ninetales', baseId: 38 },
        { name: 'diglett-alola', displayName: 'Alolan Diglett', baseId: 50 },
        { name: 'dugtrio-alola', displayName: 'Alolan Dugtrio', baseId: 51 },
        { name: 'geodude-alola', displayName: 'Alolan Geodude', baseId: 74 },
        { name: 'graveler-alola', displayName: 'Alolan Graveler', baseId: 75 },
        { name: 'golem-alola', displayName: 'Alolan Golem', baseId: 76 },
        { name: 'grimer-alola', displayName: 'Alolan Grimer', baseId: 88 },
        { name: 'muk-alola', displayName: 'Alolan Muk', baseId: 89 },
        { name: 'exeggutor-alola', displayName: 'Alolan Exeggutor', baseId: 103 },
        { name: 'marowak-alola', displayName: 'Alolan Marowak', baseId: 105 },
        
        // Galarian forms
        { name: 'meowth-galar', displayName: 'Galarian Meowth', baseId: 52 },
        { name: 'perrserker', displayName: 'Perrserker', baseId: 52 },
        { name: 'ponyta-galar', displayName: 'Galarian Ponyta', baseId: 77 },
        { name: 'rapidash-galar', displayName: 'Galarian Rapidash', baseId: 78 },
        { name: 'slowpoke-galar', displayName: 'Galarian Slowpoke', baseId: 79 },
        { name: 'slowbro-galar', displayName: 'Galarian Slowbro', baseId: 80 },
        { name: 'slowking-galar', displayName: 'Galarian Slowking', baseId: 199 },
        { name: 'farfetchd-galar', displayName: 'Galarian Farfetch\'d', baseId: 83 },
        { name: 'sirfetchd', displayName: 'Sirfetch\'d', baseId: 83 },
        { name: 'weezing-galar', displayName: 'Galarian Weezing', baseId: 110 },
        { name: 'mr-mime-galar', displayName: 'Galarian Mr. Mime', baseId: 122 },
        { name: 'mr-rime', displayName: 'Mr. Rime', baseId: 122 },
        { name: 'articuno-galar', displayName: 'Galarian Articuno', baseId: 144 },
        { name: 'zapdos-galar', displayName: 'Galarian Zapdos', baseId: 145 },
        { name: 'moltres-galar', displayName: 'Galarian Moltres', baseId: 146 },
        { name: 'corsola-galar', displayName: 'Galarian Corsola', baseId: 222 },
        { name: 'cursola', displayName: 'Cursola', baseId: 222 },
        { name: 'zigzagoon-galar', displayName: 'Galarian Zigzagoon', baseId: 263 },
        { name: 'linoone-galar', displayName: 'Galarian Linoone', baseId: 264 },
        { name: 'obstagoon', displayName: 'Obstagoon', baseId: 264 },
        { name: 'darumaka-galar', displayName: 'Galarian Darumaka', baseId: 554 },
                 { name: 'darmanitan-galar-standard', displayName: 'Galarian Darmanitan', baseId: 555 },
        { name: 'darmanitan-standard', displayName: 'Darmanitan (Standard Mode)', baseId: 555 },
        { name: 'darmanitan-zen', displayName: 'Darmanitan (Zen Mode)', baseId: 555 },
        { name: 'darmanitan-galar-zen', displayName: 'Galarian Darmanitan (Zen Mode)', baseId: 555 },
        { name: 'yamask-galar', displayName: 'Galarian Yamask', baseId: 562 },
        { name: 'runerigus', displayName: 'Runerigus', baseId: 562 },
        { name: 'stunfisk-galar', displayName: 'Galarian Stunfisk', baseId: 618 },
        
        // Hisuian forms
        { name: 'growlithe-hisui', displayName: 'Hisuian Growlithe', baseId: 58 },
        { name: 'arcanine-hisui', displayName: 'Hisuian Arcanine', baseId: 59 },
        { name: 'voltorb-hisui', displayName: 'Hisuian Voltorb', baseId: 100 },
        { name: 'electrode-hisui', displayName: 'Hisuian Electrode', baseId: 101 },
        { name: 'typhlosion-hisui', displayName: 'Hisuian Typhlosion', baseId: 157 },
        { name: 'qwilfish-hisui', displayName: 'Hisuian Qwilfish', baseId: 211 },
        { name: 'overqwil', displayName: 'Overqwil', baseId: 211 },
        { name: 'sneasel-hisui', displayName: 'Hisuian Sneasel', baseId: 215 },
        { name: 'sneasler', displayName: 'Sneasler', baseId: 215 },
        { name: 'samurott-hisui', displayName: 'Hisuian Samurott', baseId: 503 },
        { name: 'lilligant-hisui', displayName: 'Hisuian Lilligant', baseId: 549 },
        { name: 'basculin-red-striped', displayName: 'Basculin (Red-Striped)', baseId: 550 },
        { name: 'basculin-blue-striped', displayName: 'Basculin (Blue-Striped)', baseId: 550 },
        { name: 'basculin-white-striped', displayName: 'Basculin (White-Striped)', baseId: 550 },
        // Force ordering inside the Basculin (dexNumber 550) group: red, blue, white, male, female.
        { name: 'basculegion-male', displayName: 'Basculegion (Male)', baseId: 550, dexNumber: 550.1 },
        { name: 'basculegion-female', displayName: 'Basculegion (Female)', baseId: 550, dexNumber: 550.2 },
        // Frillish, Jellicent, Pyroar: female forms 404 on PokeAPI - fetched separately by base ID with gender sprites
        { name: 'meowstic-male', displayName: 'Meowstic (Male)', baseId: 678 },
        { name: 'meowstic-female', displayName: 'Meowstic (Female)', baseId: 678 },
        { name: 'indeedee-male', displayName: 'Indeedee (Male)', baseId: 876 },
        { name: 'indeedee-female', displayName: 'Indeedee (Female)', baseId: 876 },
        { name: 'oinkologne-male', displayName: 'Oinkologne (Male)', baseId: 916 },
        { name: 'oinkologne-female', displayName: 'Oinkologne (Female)', baseId: 916 },
        { name: 'zorua-hisui', displayName: 'Hisuian Zorua', baseId: 570 },
        { name: 'zoroark-hisui', displayName: 'Hisuian Zoroark', baseId: 571 },
        { name: 'braviary-hisui', displayName: 'Hisuian Braviary', baseId: 628 },
        { name: 'sliggoo-hisui', displayName: 'Hisuian Sliggoo', baseId: 705 },
        { name: 'goodra-hisui', displayName: 'Hisuian Goodra', baseId: 706 },
        { name: 'avalugg-hisui', displayName: 'Hisuian Avalugg', baseId: 713 },
        { name: 'decidueye-hisui', displayName: 'Hisuian Decidueye', baseId: 724 },
        
        // Paldean forms
        { name: 'wooper-paldea', displayName: 'Paldean Wooper', baseId: 194 },
        { name: 'clodsire', displayName: 'Clodsire', baseId: 194 },
        { name: 'tauros-paldea-combat-breed', displayName: 'Paldean Tauros (Combat)', baseId: 128 },
        { name: 'tauros-paldea-blaze-breed', displayName: 'Paldean Tauros (Blaze)', baseId: 128 },
        { name: 'tauros-paldea-aqua-breed', displayName: 'Paldean Tauros (Aqua)', baseId: 128 },
        
        // Castform Forms
        { name: 'castform-sunny', displayName: 'Castform (Sunny Day)', baseId: 351 },
        { name: 'castform-rainy', displayName: 'Castform (Rainy)', baseId: 351 },
        { name: 'castform-snowy', displayName: 'Castform (Snowy)', baseId: 351 },

        // Deerling / Sawsbuck seasonal forms are loaded via pokemon-form/<id>
        // (PokeAPI returns 404 for these at /pokemon/<slug>).
        
        // Deoxys Forms
        { name: 'deoxys-attack', displayName: 'Deoxys (Attack)', baseId: 386 },
        { name: 'deoxys-defense', displayName: 'Deoxys (Defense)', baseId: 386 },
        { name: 'deoxys-speed', displayName: 'Deoxys (Speed)', baseId: 386 },

        // Legendary forms
        { name: 'dialga-origin', displayName: 'Dialga (Origin)', baseId: 483 },
        { name: 'palkia-origin', displayName: 'Palkia (Origin)', baseId: 484 },
        { name: 'giratina-origin', displayName: 'Giratina (Origin)', baseId: 487 },
        { name: 'shaymin-sky', displayName: 'Shaymin (Sky)', baseId: 492 },
        
        // Tornadus / Thundurus / Landorus / Enamorus
        { name: 'tornadus-incarnate', displayName: 'Tornadus (Incarnate Forme)', baseId: 641 },
        { name: 'tornadus-therian', displayName: 'Tornadus (Therian Forme)', baseId: 641 },
        { name: 'thundurus-incarnate', displayName: 'Thundurus (Incarnate Forme)', baseId: 642 },
        { name: 'thundurus-therian', displayName: 'Thundurus (Therian Forme)', baseId: 642 },
        { name: 'landorus-incarnate', displayName: 'Landorus (Incarnate Forme)', baseId: 645 },
        { name: 'landorus-therian', displayName: 'Landorus (Therian Forme)', baseId: 645 },
        { name: 'enamorus-incarnate', displayName: 'Enamorus (Incarnate Forme)', baseId: 905 },
        { name: 'enamorus-therian', displayName: 'Enamorus (Therian Forme)', baseId: 905 },

        // Kyurem / Keldeo / Meloetta
        { name: 'kyurem', displayName: 'Kyurem', baseId: 646 },
        { name: 'kyurem-black', displayName: 'Kyurem (Black)', baseId: 646 },
        { name: 'kyurem-white', displayName: 'Kyurem (White)', baseId: 646 },
        { name: 'keldeo-ordinary', displayName: 'Keldeo (Ordinary Forme)', baseId: 647 },
        { name: 'keldeo-resolute', displayName: 'Keldeo (Resolute Forme)', baseId: 647 },
        { name: 'meloetta-aria', displayName: 'Meloetta (Aria Forme)', baseId: 648 },
        { name: 'meloetta-pirouette', displayName: 'Meloetta (Pirouette Forme)', baseId: 648 },

        // Rotom Forms
        { name: 'rotom-heat', displayName: 'Rotom (Heat)', baseId: 479 },
        { name: 'rotom-wash', displayName: 'Rotom (Wash)', baseId: 479 },
        { name: 'rotom-frost', displayName: 'Rotom (Frost)', baseId: 479 },
        { name: 'rotom-fan', displayName: 'Rotom (Fan)', baseId: 479 },
        { name: 'rotom-mow', displayName: 'Rotom (Mow)', baseId: 479 },

        // Burmy / Wormadam forms (Wormadam supports normal /pokemon/{name} fetch)
        { name: 'wormadam-plant', displayName: 'Wormadam (Plant)', baseId: 413 },
        { name: 'wormadam-sandy', displayName: 'Wormadam (Sandy)', baseId: 413 },
        { name: 'wormadam-trash', displayName: 'Wormadam (Trash)', baseId: 413 },
        
        // Special forms and variants
        { name: 'ursaluna-bloodmoon', displayName: 'Ursaluna Blood Moon', baseId: 901 },
        { name: 'ogerpon', displayName: 'Ogerpon', baseId: 1017 },
        { name: 'ogerpon-wellspring-mask', displayName: 'Ogerpon (Wellspring Mask)', baseId: 1017 },
        { name: 'ogerpon-hearthflame-mask', displayName: 'Ogerpon (Hearthflame Mask)', baseId: 1017 },
        { name: 'ogerpon-cornerstone-mask', displayName: 'Ogerpon (Cornerstone Mask)', baseId: 1017 },
        { name: 'terapagos-terastal', displayName: 'Terapagos (Terastal)', baseId: 1024 },
        { name: 'terapagos-stellar', displayName: 'Terapagos (Stellar)', baseId: 1024 },
        
        // Additional special forms
        { name: 'mimikyu-busted', displayName: 'Mimikyu (Busted)', baseId: 778 },
        { name: 'minior-orange', displayName: 'Minior (Orange)', baseId: 774 },
        { name: 'minior-yellow', displayName: 'Minior (Yellow)', baseId: 774 },
        { name: 'minior-green', displayName: 'Minior (Green)', baseId: 774 },
        { name: 'minior-blue', displayName: 'Minior (Blue)', baseId: 774 },
        { name: 'minior-indigo', displayName: 'Minior (Indigo)', baseId: 774 },
        { name: 'minior-violet', displayName: 'Minior (Violet)', baseId: 774 },
        { name: 'minior-red', displayName: 'Minior (Red)', baseId: 774 },
        
        // Additional form variants
        { name: 'toxtricity-low-key', displayName: 'Toxtricity (Low Key)', baseId: 849 },
        { name: 'urshifu-rapid-strike', displayName: 'Urshifu (Rapid Strike)', baseId: 892 },
        
        // Complete Gigantamax forms
        { name: 'venusaur-gmax', displayName: 'Gigantamax Venusaur', baseId: 3 },
        { name: 'charizard-gmax', displayName: 'Gigantamax Charizard', baseId: 6 },
        { name: 'blastoise-gmax', displayName: 'Gigantamax Blastoise', baseId: 9 },
        { name: 'butterfree-gmax', displayName: 'Gigantamax Butterfree', baseId: 12 },
        { name: 'pikachu-gmax', displayName: 'Gigantamax Pikachu', baseId: 25 },
        { name: 'meowth-gmax', displayName: 'Gigantamax Meowth', baseId: 52 },
        { name: 'machamp-gmax', displayName: 'Gigantamax Machamp', baseId: 68 },
        { name: 'gengar-gmax', displayName: 'Gigantamax Gengar', baseId: 94 },
        { name: 'kingler-gmax', displayName: 'Gigantamax Kingler', baseId: 99 },
        { name: 'lapras-gmax', displayName: 'Gigantamax Lapras', baseId: 131 },
        { name: 'eevee-gmax', displayName: 'Gigantamax Eevee', baseId: 133 },
        { name: 'snorlax-gmax', displayName: 'Gigantamax Snorlax', baseId: 143 },
        { name: 'garbodor-gmax', displayName: 'Gigantamax Garbodor', baseId: 569 },
        { name: 'melmetal-gmax', displayName: 'Gigantamax Melmetal', baseId: 809 },
        { name: 'rillaboom-gmax', displayName: 'Gigantamax Rillaboom', baseId: 812 },
        { name: 'cinderace-gmax', displayName: 'Gigantamax Cinderace', baseId: 815 },
        { name: 'inteleon-gmax', displayName: 'Gigantamax Inteleon', baseId: 818 },
        { name: 'corviknight-gmax', displayName: 'Gigantamax Corviknight', baseId: 823 },
        { name: 'orbeetle-gmax', displayName: 'Gigantamax Orbeetle', baseId: 826 },
        { name: 'drednaw-gmax', displayName: 'Gigantamax Drednaw', baseId: 834 },
        { name: 'coalossal-gmax', displayName: 'Gigantamax Coalossal', baseId: 839 },
        { name: 'flapple-gmax', displayName: 'Gigantamax Flapple', baseId: 841 },
        { name: 'appletun-gmax', displayName: 'Gigantamax Appletun', baseId: 842 },
        { name: 'sandaconda-gmax', displayName: 'Gigantamax Sandaconda', baseId: 843 },
        { name: 'toxtricity-amped-gmax', displayName: 'Gigantamax Toxtricity (Amped)', baseId: 849 },
        { name: 'toxtricity-low-key-gmax', displayName: 'Gigantamax Toxtricity (Low Key)', baseId: 849 },
        { name: 'centiskorch-gmax', displayName: 'Gigantamax Centiskorch', baseId: 851 },
        { name: 'hatterene-gmax', displayName: 'Gigantamax Hatterene', baseId: 858 },
        { name: 'grimmsnarl-gmax', displayName: 'Gigantamax Grimmsnarl', baseId: 861 },
        { name: 'alcremie-gmax', displayName: 'Gigantamax Alcremie', baseId: 869 },
        { name: 'copperajah-gmax', displayName: 'Gigantamax Copperajah', baseId: 879 },
        { name: 'duraludon-gmax', displayName: 'Gigantamax Duraludon', baseId: 884 },
        { name: 'urshifu-single-strike-gmax', displayName: 'Gigantamax Urshifu (Single Strike)', baseId: 892 },
        { name: 'urshifu-rapid-strike-gmax', displayName: 'Gigantamax Urshifu (Rapid Strike)', baseId: 892 },
      ];

      console.log('Fetching regional forms...');
      const regionalPromises = regionalForms.map(async (form) => {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${form.name}`);
          if (!response.ok) {
            console.error(`Failed to fetch ${form.name}: ${response.status}`);
            return null;
          }
          const data = await response.json();
          
          const pokemon: Pokemon = {
            id: data.id,
            name: form.displayName,
            // Some Mega/odd forms can have missing `sprites.front_default`.
            // Pixel art mode should never fall back to `official-artwork`,
            // so use a placeholder when `front_default` is missing.
            image:
              (form.name === 'tatsugiri-stretchy-mega' ? megaTatsugiriPixel : null) ||
              megaPixelOverrides[form.name] ||
              data.sprites.front_default ||
              TRANSPARENT_PLACEHOLDER,
            officialArtwork:
              data.sprites.other?.['official-artwork']?.front_default ||
              data.sprites.front_default ||
              TRANSPARENT_PLACEHOLDER,
            generation: getGenerationFromId(form.baseId),
            // For forms (mega/gmax/etc), sort by the base species' Pokédex number
            dexNumber: (form as { dexNumber?: number }).dexNumber ?? form.baseId,
          };
          console.log(`Successfully fetched ${form.displayName}`);
          return pokemon;
        } catch (error) {
          console.error(`Error fetching ${form.name}:`, error);
          return null;
        }
      });

      const regionalResults = await Promise.all(regionalPromises);
      let validRegionalForms = regionalResults.filter(pokemon => pokemon !== null) as Pokemon[];

      // Frillish, Jellicent, Pyroar: PokeAPI returns 404 for -female; fetch by base ID and use gender sprites
      const genderFormSpecies = [
        { baseId: 592, maleName: 'Frillish (Male)', femaleName: 'Frillish (Female)' },
        { baseId: 593, maleName: 'Jellicent (Male)', femaleName: 'Jellicent (Female)' },
        { baseId: 668, maleName: 'Pyroar (Male)', femaleName: 'Pyroar (Female)' },
        { baseId: 449, maleName: 'Hippopotas (Male)', femaleName: 'Hippopotas (Female)' },
        { baseId: 450, maleName: 'Hippowdon (Male)', femaleName: 'Hippowdon (Female)' },
        { baseId: 521, maleName: 'Unfezant (Male)', femaleName: 'Unfezant (Female)' },
      ];
      for (const species of genderFormSpecies) {
        try {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${species.baseId}`);
          if (!response.ok) continue;
          const data = await response.json();
          const art = data.sprites.other?.['official-artwork'];
          validRegionalForms.push({
            id: data.id,
            name: species.maleName,
            image: data.sprites.front_default,
            officialArtwork: art?.front_default || data.sprites.front_default,
            generation: getGenerationFromId(species.baseId),
            dexNumber: species.baseId,
          });
          const femaleImg = data.sprites.front_female ?? data.sprites.front_default;
          const femaleArt = art?.front_female ?? art?.front_default ?? data.sprites.front_default;
          validRegionalForms.push({
            id: data.id,
            name: species.femaleName,
            image: femaleImg,
            officialArtwork: femaleArt,
            generation: getGenerationFromId(species.baseId),
            dexNumber: species.baseId,
          });
        } catch {
          // skip if fetch fails
        }
      }

      // Unown forms: PokeAPI requires pokemon-form endpoints (unown-a, etc return 404 on /pokemon)
      const unownForms = [
        { id: 201, displayName: 'Unown A' },
        { id: 10001, displayName: 'Unown B' },
        { id: 10002, displayName: 'Unown C' },
        { id: 10003, displayName: 'Unown D' },
        { id: 10004, displayName: 'Unown E' },
        { id: 10005, displayName: 'Unown F' },
        { id: 10006, displayName: 'Unown G' },
        { id: 10007, displayName: 'Unown H' },
        { id: 10008, displayName: 'Unown I' },
        { id: 10009, displayName: 'Unown J' },
        { id: 10010, displayName: 'Unown K' },
        { id: 10011, displayName: 'Unown L' },
        { id: 10012, displayName: 'Unown M' },
        { id: 10013, displayName: 'Unown N' },
        { id: 10014, displayName: 'Unown O' },
        { id: 10015, displayName: 'Unown P' },
        { id: 10016, displayName: 'Unown Q' },
        { id: 10017, displayName: 'Unown R' },
        { id: 10018, displayName: 'Unown S' },
        { id: 10019, displayName: 'Unown T' },
        { id: 10020, displayName: 'Unown U' },
        { id: 10021, displayName: 'Unown V' },
        { id: 10022, displayName: 'Unown W' },
        { id: 10023, displayName: 'Unown X' },
        { id: 10024, displayName: 'Unown Y' },
        { id: 10025, displayName: 'Unown Z' },
        { id: 10026, displayName: 'Unown !' },
        { id: 10027, displayName: 'Unown ?' },
      ];

      try {
        const unownResults = await Promise.all(
          unownForms.map(async (form) => {
            try {
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${form.id}`);
              if (!response.ok) return null;
              const data = await response.json();
              const pokemon: Pokemon = {
                id: data.id,
                name: form.displayName,
                image: data.sprites.front_default,
                generation: getGenerationFromId(201),
                dexNumber: 201,
              };
              return pokemon;
            } catch {
              return null;
            }
          })
        );

        validRegionalForms = validRegionalForms.concat(
          unownResults.filter((p): p is Pokemon => p !== null)
        );
      } catch {
        // ignore if Unown fails to load
      }

      // Burmy forms: PokeAPI requires pokemon-form/{id} endpoints for proper sprites
      const burmyForms = [
        { id: 412, displayName: 'Burmy (Plant)', baseId: 412 },
        { id: 10034, displayName: 'Burmy (Sandy)', baseId: 412 },
        { id: 10035, displayName: 'Burmy (Trash)', baseId: 412 },
      ];
      try {
        const burmyResults = await Promise.all(
          burmyForms.map(async (form) => {
            try {
              const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${form.id}`);
              if (!response.ok) return null;
              const data = await response.json();
              const pokemon: Pokemon = {
                id: data.id,
                name: form.displayName,
                image: data.sprites.front_default,
                officialArtwork: data.sprites.front_default,
                generation: getGenerationFromId(form.baseId),
                dexNumber: form.baseId,
              };
              return pokemon;
            } catch {
              return null;
            }
          })
        );

        validRegionalForms = validRegionalForms.concat(
          burmyResults.filter((p): p is Pokemon => p !== null)
        );
      } catch {
        // ignore if Burmy fails to load
      }

      // Cherrim / Shellos / Gastrodon forms: /pokemon/<form-slug> 404s, use pokemon-form/{id}
      const cloakFormSpecies = [
        {
          baseId: 421,
          forms: [
            { id: 421, displayName: 'Cherrim (Overcast)' },
            { id: 10038, displayName: 'Cherrim (Sunshine)' },
          ],
        },
        {
          baseId: 422,
          forms: [
            { id: 422, displayName: 'Shellos (West)' },
            { id: 10039, displayName: 'Shellos (East)' },
          ],
        },
        {
          baseId: 423,
          forms: [
            { id: 423, displayName: 'Gastrodon (West)' },
            { id: 10040, displayName: 'Gastrodon (East)' },
          ],
        },
      ];

      for (const species of cloakFormSpecies) {
        try {
          const formResults = await Promise.all(
            species.forms.map(async (form) => {
              try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon-form/${form.id}`);
                if (!response.ok) return null;
                const data = await response.json();
                const pokemon: Pokemon = {
                  id: data.id,
                  name: form.displayName,
                  image: data.sprites.front_default,
                  officialArtwork: data.sprites.front_default,
                  generation: getGenerationFromId(species.baseId),
                  dexNumber: species.baseId,
                };
                return pokemon;
              } catch {
                return null;
              }
            })
          );

          validRegionalForms = validRegionalForms.concat(
            formResults.filter((p): p is Pokemon => p !== null)
          );
        } catch {
          // ignore if these forms fail to load
        }
      }

      // Deerling / Sawsbuck seasonal forms: use pokemon-form endpoints.
      const seasonalFormSpecies = [
        {
          baseId: 585,
          forms: [
            { id: 585, displayName: 'Deerling (Spring)' },
            { id: 10068, displayName: 'Deerling (Summer)' },
            { id: 10069, displayName: 'Deerling (Autumn)' },
            { id: 10070, displayName: 'Deerling (Winter)' },
          ],
        },
        {
          baseId: 586,
          forms: [
            { id: 586, displayName: 'Sawsbuck (Spring)' },
            { id: 10071, displayName: 'Sawsbuck (Summer)' },
            { id: 10072, displayName: 'Sawsbuck (Autumn)' },
            { id: 10073, displayName: 'Sawsbuck (Winter)' },
          ],
        },
      ];

      for (const species of seasonalFormSpecies) {
        try {
          const formResults = await Promise.all(
            species.forms.map(async (form) => {
              try {
                const response = await fetch(
                  `https://pokeapi.co/api/v2/pokemon-form/${form.id}`
                );
                if (!response.ok) return null;
                const data = await response.json();

                const art = data.sprites.other?.['official-artwork'];

                const pokemon: Pokemon = {
                  id: data.id,
                  name: form.displayName,
                  image: data.sprites.front_default,
                  officialArtwork: art?.front_default || data.sprites.front_default,
                  generation: getGenerationFromId(species.baseId),
                  dexNumber: species.baseId,
                };
                return pokemon;
              } catch {
                return null;
              }
            })
          );

          validRegionalForms = validRegionalForms.concat(
            formResults.filter((p): p is Pokemon => p !== null)
          );
        } catch {
          // ignore if these forms fail to load
        }
      }

      // Vivillon patterns: use pokemon-form endpoints because /pokemon/<slug> can 404
      const vivillonPatternSpecies = [
        {
          baseId: 666,
          forms: [
            { id: 666, displayName: 'Vivillon (Meadow)' },
            { id: 10086, displayName: 'Vivillon (Icy Snow)' },
            { id: 10087, displayName: 'Vivillon (Polar)' },
            { id: 10088, displayName: 'Vivillon (Tundra)' },
            { id: 10089, displayName: 'Vivillon (Continental)' },
            { id: 10090, displayName: 'Vivillon (Garden)' },
            { id: 10091, displayName: 'Vivillon (Elegant)' },
            { id: 10092, displayName: 'Vivillon (Modern)' },
            { id: 10093, displayName: 'Vivillon (Marine)' },
            { id: 10094, displayName: 'Vivillon (Archipelago)' },
            { id: 10095, displayName: 'Vivillon (High Plains)' },
            { id: 10096, displayName: 'Vivillon (Sandstorm)' },
            { id: 10097, displayName: 'Vivillon (River)' },
            { id: 10098, displayName: 'Vivillon (Monsoon)' },
            { id: 10099, displayName: 'Vivillon (Savanna)' },
            { id: 10100, displayName: 'Vivillon (Sun)' },
            { id: 10101, displayName: 'Vivillon (Ocean)' },
            { id: 10102, displayName: 'Vivillon (Jungle)' },
            { id: 10161, displayName: 'Vivillon (Fancy)' },
            { id: 10162, displayName: 'Vivillon (Pokeball)' },
          ],
        },
      ];

      for (const species of vivillonPatternSpecies) {
        try {
          const formResults = await Promise.all(
            species.forms.map(async (form) => {
              try {
                const response = await fetch(
                  `https://pokeapi.co/api/v2/pokemon-form/${form.id}`
                );
                if (!response.ok) return null;
                const data = await response.json();

                const art = data.sprites.other?.['official-artwork'];

                const pokemon: Pokemon = {
                  id: data.id,
                  name: form.displayName,
                  image: data.sprites.front_default,
                  officialArtwork: art?.front_default || data.sprites.front_default,
                  generation: getGenerationFromId(species.baseId),
                  dexNumber: species.baseId,
                };
                return pokemon;
              } catch {
                return null;
              }
            })
          );

          validRegionalForms = validRegionalForms.concat(
            formResults.filter((p): p is Pokemon => p !== null)
          );
        } catch {
          // ignore if these forms fail to load
        }
      }

      // Flabebe / Floette / Florges color forms: use pokemon-form endpoints because /pokemon/<slug> can 404
      const flabebeFloetteFlorgesSpecies = [
        {
          baseId: 669,
          forms: [
            { id: 669, displayName: 'Flabebe (Red)' },
            { id: 10103, displayName: 'Flabebe (Yellow)' },
            { id: 10104, displayName: 'Flabebe (Orange)' },
            { id: 10105, displayName: 'Flabebe (Blue)' },
            { id: 10106, displayName: 'Flabebe (White)' },
          ],
        },
        {
          baseId: 670,
          forms: [
            { id: 670, displayName: 'Floette (Red)' },
            { id: 10107, displayName: 'Floette (Yellow)' },
            { id: 10108, displayName: 'Floette (Orange)' },
            { id: 10109, displayName: 'Floette (Blue)' },
            { id: 10110, displayName: 'Floette (White)' },
          ],
        },
        {
          baseId: 671,
          forms: [
            { id: 671, displayName: 'Florges (Red)' },
            { id: 10111, displayName: 'Florges (Yellow)' },
            { id: 10112, displayName: 'Florges (Orange)' },
            { id: 10113, displayName: 'Florges (Blue)' },
            { id: 10114, displayName: 'Florges (White)' },
          ],
        },
      ];

      for (const species of flabebeFloetteFlorgesSpecies) {
        try {
          const formResults = await Promise.all(
            species.forms.map(async (form) => {
              try {
                const response = await fetch(
                  `https://pokeapi.co/api/v2/pokemon-form/${form.id}`
                );
                if (!response.ok) return null;
                const data = await response.json();

                const art = data.sprites.other?.['official-artwork'];

                const pokemon: Pokemon = {
                  id: data.id,
                  name: form.displayName,
                  image: data.sprites.front_default,
                  officialArtwork: art?.front_default || data.sprites.front_default,
                  generation: getGenerationFromId(species.baseId),
                  dexNumber: species.baseId,
                };
                return pokemon;
              } catch {
                return null;
              }
            })
          );

          validRegionalForms = validRegionalForms.concat(
            formResults.filter((p): p is Pokemon => p !== null)
          );
        } catch {
          // ignore if these forms fail to load
        }
      }

      // Mega Greninja (Upside Down) is a local-only sprite variant.
      // PokeAPI doesn't expose a matching slug for it, so create it manually.
      validRegionalForms.push({
        id: 10295,
        name: 'Mega Greninja',
        image: megaGreninjaUpsideDownPixel,
        officialArtwork: megaGreninjaUpsideDownPixel,
        generation: getGenerationFromId(658),
        dexNumber: 658,
      });

      // Mega Tatsugiri sometimes fails to load via PokeAPI.
      // Keep it always available via your local sprite.
      const megaTatsugiriApiId = 10324;
      if (!validRegionalForms.some(p => p.id === megaTatsugiriApiId)) {
        validRegionalForms.push({
          id: megaTatsugiriApiId,
          name: 'Mega Tatsugiri',
          image: megaTatsugiriPixel,
          officialArtwork: megaTatsugiriPixel,
          generation: getGenerationFromId(978),
          dexNumber: 978,
        });
      }

      // Base IDs that have explicit form entries - exclude from base list to avoid duplicates
      const baseIdsWithGenderForms = new Set([
        201, // Unown
        421, 422, 423, // Cherrim / Shellos / Gastrodon
        412, 413, // Burmy / Wormadam
        550, // Basculin
        555, // Darmanitan
        585, 586, // Deerling / Sawsbuck
        666, // Vivillon
        669, 670, 671, // Flabebe / Floette / Florges
        449, 450, 521, // Hippopotas, Hippowdon, Unfezant
        592, 593, // Frillish, Jellicent
        668, 678, // Pyroar, Meowstic
        876, // Indeedee
        916, // Oinkologne
        641, 642, 645, 905, // Tornadus / Thundurus / Landorus / Enamorus
        646, 647, 648, // Kyurem / Keldeo / Meloetta
        741, // Oricorio
        745, // Lycanroc
        746, // Wishiwashi
        800, // Necrozma
        801, // Magearna
        890, // Eternatus
        898, // Calyrex
        925, // Maushold
        931, // Squawkabilly
        964, // Palafin
        978, // Tatsugiri
        982, // Dudunsparce
        999, // Gimmighoul
        1017, // Ogerpon
      ]);
      const basePokemonFiltered = basePokemon.filter(p => !baseIdsWithGenderForms.has(p.id));
      
             console.log(`Successfully loaded ${validRegionalForms.length} regional forms`);
       
       const updatedPokemonList = [...basePokemonFiltered, ...validRegionalForms];
       console.log(`Total Pokemon loaded: ${updatedPokemonList.length} (${basePokemonFiltered.length} base + ${validRegionalForms.length} regional)`);
       
       // Check for specific Pokemon in final list
       const snivy = updatedPokemonList.find(p => p.name === 'snivy');
       const tepig = updatedPokemonList.find(p => p.name === 'tepig');
       const oshawott = updatedPokemonList.find(p => p.name === 'oshawott');
       
       if (snivy) console.log(`✅ Snivy found in final list: ${snivy.name} (ID: ${snivy.id})`);
       else console.log(`❌ Snivy NOT found in final list`);
       
       if (tepig) console.log(`✅ Tepig found in final list: ${tepig.name} (ID: ${tepig.id})`);
       else console.log(`❌ Tepig NOT found in final list`);
       
       if (oshawott) console.log(`✅ Oshawott found in final list: ${oshawott.name} (ID: ${oshawott.id})`);
       else console.log(`❌ Oshawott NOT found in final list`);
       
      // Sort by Pokédex number (base species id for forms; id for base Pokémon)
      const sortedPokemonList = [...updatedPokemonList].sort(
        (a, b) => (a.dexNumber ?? a.id) - (b.dexNumber ?? b.id) || a.id - b.id
      );

      setPokemonList(sortedPokemonList);
      setFilteredPokemon(sortedPokemonList);
      
    } catch (error) {
      console.error('Error fetching regional forms:', error);
    }
  };

  const getGenerationFromId = (id: number): number => {
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
  };

  useEffect(() => {
    let filtered = pokemonList;

    if (searchTerm) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPokemon(filtered);
  }, [pokemonList, searchTerm]);

  const toggleGeneration = (generation: number) => {
    const newExpanded = new Set(expandedGenerations);
    if (newExpanded.has(generation)) {
      newExpanded.delete(generation);
    } else {
      newExpanded.add(generation);
    }
    setExpandedGenerations(newExpanded);
  };

  const getPokemonByGeneration = (generation: number) => {
    return filteredPokemon.filter(pokemon => pokemon.generation === generation);
  };

  const generations = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  if (loading) {
    return (
      <div className="pokemon-selector">
        <div className="loading">
          <p>Loading Pokemon...</p>
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="progress-text">{Math.round(loadingProgress)}% ({Math.round((loadingProgress / 100) * totalPokemon)} / {totalPokemon})</p>
          </div>
        </div>
      </div>
    );
  }

  const cardBg = isGradient ? `linear-gradient(135deg, ${cardColor} 0%, ${gradientColor} 100%)` : cardColor;

  return (
    <div
      className="pokemon-selector"
      style={
        {
          '--card-color': cardColor,
          '--gradient-color': gradientColor,
          '--card-bg': cardBg,
        } as React.CSSProperties
      }
    >
      <div className="selector-header">
        <h2>Pokemon Selector</h2>
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="art-style-toggle">
          <div className="art-style-buttons">
            <button
              className={`art-style-btn ${artStyle === 'pixel' ? 'active' : ''}`}
              onClick={() => onArtStyleChange('pixel')}
            >
              Pixel Art
            </button>
            <button
              className={`art-style-btn ${artStyle === 'official' ? 'active' : ''}`}
              onClick={() => onArtStyleChange('official')}
            >
              Official Art
            </button>
          </div>
        </div>
      </div>

      <div className="pokemon-list">
        {generations.map(generation => {
          const generationPokemon = getPokemonByGeneration(generation);
          if (generationPokemon.length === 0) return null;

          return (
            <div key={generation} className="generation-section">
              <button
                className="generation-header"
                onClick={() => toggleGeneration(generation)}
              >
                <span>Generation {generation} ({generationPokemon.length})</span>
                {expandedGenerations.has(generation) ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
              {expandedGenerations.has(generation) && (
                <div className="generation-pokemon">
                  {generationPokemon.map(pokemon => (
                    <div
                      key={pokemon.id}
                      className="pokemon-option"
                      onClick={() => onPokemonSelect(pokemon)}
                    >
                      <img
                        src={artStyle === 'official' ? (pokemon.officialArtwork || pokemon.image) : pokemon.image}
                        alt={pokemon.name}
                        className="pokemon-option-sprite"
                      />
                      <span className="pokemon-option-name">
                        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PokemonSelector;
