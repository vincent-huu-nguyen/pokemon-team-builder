import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { Pokemon } from '../types/Pokemon';
import './PokemonSelector.css';

interface PokemonSelectorProps {
  onPokemonSelect: (pokemon: Pokemon) => void;
  artStyle: 'pixel' | 'official';
  onArtStyleChange: (style: 'pixel' | 'official') => void;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onPokemonSelect, artStyle, onArtStyleChange }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalPokemon, setTotalPokemon] = useState(1025);

  useEffect(() => {
    fetchAllPokemon();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemonList, searchTerm]);

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
               generation: getGenerationFromId(data.id)
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
        { name: 'garchomp-mega', displayName: 'Mega Garchomp', baseId: 445 },
        { name: 'lucario-mega', displayName: 'Mega Lucario', baseId: 448 },
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
                 { name: 'basculin-white-striped', displayName: 'Hisuian Basculin', baseId: 550 },
                 { name: 'basculegion-male', displayName: 'Basculegion', baseId: 550 },
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
        { name: 'tauros-paldea-combat', displayName: 'Paldean Tauros (Combat)', baseId: 128 },
        { name: 'tauros-paldea-blaze', displayName: 'Paldean Tauros (Blaze)', baseId: 128 },
        { name: 'tauros-paldea-aqua', displayName: 'Paldean Tauros (Aqua)', baseId: 128 },
        
        // Special forms and variants
        { name: 'ursaluna-bloodmoon', displayName: 'Ursaluna Blood Moon', baseId: 901 },
        { name: 'ogerpon-wellspring', displayName: 'Ogerpon (Wellspring)', baseId: 1017 },
        { name: 'ogerpon-hearthflame', displayName: 'Ogerpon (Hearthflame)', baseId: 1017 },
        { name: 'ogerpon-cornerstone', displayName: 'Ogerpon (Cornerstone)', baseId: 1017 },
        { name: 'ogerpon-teal', displayName: 'Ogerpon (Teal)', baseId: 1017 },
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
            image: data.sprites.front_default,
            officialArtwork: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
            generation: getGenerationFromId(form.baseId)
          };
          console.log(`Successfully fetched ${form.displayName}`);
          return pokemon;
        } catch (error) {
          console.error(`Error fetching ${form.name}:`, error);
          return null;
        }
      });

      const regionalResults = await Promise.all(regionalPromises);
      const validRegionalForms = regionalResults.filter(pokemon => pokemon !== null) as Pokemon[];
      
             console.log(`Successfully loaded ${validRegionalForms.length} regional forms`);
       
       const updatedPokemonList = [...basePokemon, ...validRegionalForms];
       console.log(`Total Pokemon loaded: ${updatedPokemonList.length} (${basePokemon.length} base + ${validRegionalForms.length} regional)`);
       
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
       
       setPokemonList(updatedPokemonList);
       setFilteredPokemon(updatedPokemonList);
      
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

  const filterPokemon = () => {
    let filtered = pokemonList;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPokemon(filtered);
  };

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

  return (
    <div className="pokemon-selector">
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
