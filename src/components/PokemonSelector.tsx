import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Pokemon } from '../types/Pokemon';
import './PokemonSelector.css';

interface PokemonSelectorProps {
  onPokemonSelect: (pokemon: Pokemon) => void;
}

const PokemonSelector: React.FC<PokemonSelectorProps> = ({ onPokemonSelect }) => {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all');
  const [expandedGenerations, setExpandedGenerations] = useState<Set<number>>(new Set([1]));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllPokemon();
  }, []);

  useEffect(() => {
    filterPokemon();
  }, [pokemonList, searchTerm, selectedGeneration]);

  const fetchAllPokemon = async () => {
    try {
      setLoading(true);
      const allPokemon: Pokemon[] = [];
      
             // Fetch regular Pokemon in batches for better performance
       const batchSize = 50;
       const totalPokemon = 1025; // Updated to include all Pokemon up to Gen 9
       
       console.log(`Batch size: ${batchSize}, Total Pokemon: ${totalPokemon}`);
       console.log(`Number of batches: ${Math.ceil(totalPokemon / batchSize)}`);
       
              console.log(`Starting to fetch ${totalPokemon} Pokemon...`);
       
       // Test the loop logic
       let batchCount = 0;
       for (let batchStart = 1; batchStart <= totalPokemon; batchStart += batchSize) {
         batchCount++;
         const batchEnd = Math.min(batchStart + batchSize - 1, totalPokemon);
         console.log(`Batch ${batchCount}: Pokemon ${batchStart} to ${batchEnd}`);
       }
       console.log(`Total batches to process: ${batchCount}`);
       
       // Fetch Pokemon in batches
       for (let batchStart = 1; batchStart <= totalPokemon; batchStart += batchSize) {
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
           console.log(`Loaded ${allPokemon.length} Pokemon so far...`);
           
           // Check if this is the last batch
           if (batchEnd >= totalPokemon) {
             console.log(`Final batch completed. Expected ${totalPokemon} Pokemon, got ${allPokemon.length}`);
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
      // List of regional forms with correct PokeAPI names
      const regionalForms = [
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

    // Filter by generation
    if (selectedGeneration !== 'all') {
      filtered = filtered.filter(pokemon => pokemon.generation === selectedGeneration);
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
          <div className="loading-spinner"></div>
          <p>Loading Pokemon...</p>
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
        <div className="generation-filter">
          <select
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="generation-select"
          >
            <option value="all">All Generations</option>
            {generations.map(gen => (
              <option key={gen} value={gen}>Generation {gen}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="pokemon-list">
        {selectedGeneration === 'all' ? (
          generations.map(generation => {
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
                          src={pokemon.image}
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
          })
        ) : (
          <div className="generation-pokemon">
            {filteredPokemon.map(pokemon => (
              <div
                key={pokemon.id}
                className="pokemon-option"
                onClick={() => onPokemonSelect(pokemon)}
              >
                <img
                  src={pokemon.image}
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
    </div>
  );
};

export default PokemonSelector;
