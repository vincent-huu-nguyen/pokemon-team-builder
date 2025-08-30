import React, { useState } from 'react';
import './App.css';
import TrainerCard from './components/TrainerCard';
import PokemonSelector from './components/PokemonSelector';
import { Pokemon } from './types/Pokemon';
import trainerVincent from './assets/Trainer_Vincent.png';
import trainerTroy from './assets/Trainer_Troy.png';
import trainerAria from './assets/Trainer_Aria.png';
import trainerBlake from './assets/Trainer_Blake.png';
import trainerLeah from './assets/Trainer_Leah.png';
import trainerCassie from './assets/Trainer_Cassie.png';
import trainerMaeve from './assets/Trainer_Maeve.png';
import trainerLuna from './assets/Trainer_Luna.png';
import trainerDestiny from './assets/Trainer_Destiny.png';
import trainerPierce from './assets/Trainer_Pierce.png';
import trainerKaz from './assets/Trainer_Kaz.png';
import trainerNoah from './assets/Trainer_Noah.png';
import trainerArnold from './assets/Trainer_Arnold.png';
import trainerVivian from './assets/Trainer_Vivian.png';
import trainerAlphonse from './assets/Trainer_Alphonse.png';
import trainerAxel from './assets/Trainer_Axel.png';
import pokeball from './assets/pokeball.png';

function App() {
  const [trainerName, setTrainerName] = useState('Trainer');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon[]>([]);
  const [trainerSprite, setTrainerSprite] = useState(trainerVincent);
  
  // Available trainer sprites
  const availableSprites = [
    { name: 'Vincent', src: trainerVincent },
    { name: 'Arnold', src: trainerArnold },
    { name: 'Luna', src: trainerLuna },
    { name: 'Alphonse', src: trainerAlphonse },
    { name: 'Troy', src: trainerTroy },
    { name: 'Aria', src: trainerAria },
    { name: 'Blake', src: trainerBlake },
    { name: 'Leah', src: trainerLeah },
    { name: 'Cassie', src: trainerCassie },
    { name: 'Maeve', src: trainerMaeve },
    { name: 'Destiny', src: trainerDestiny },
    { name: 'Pierce', src: trainerPierce },
    { name: 'Noah', src: trainerNoah },
    { name: 'Vivian', src: trainerVivian },
    { name: 'Axel', src: trainerAxel },
    { name: 'Kaz', src: trainerKaz },
  ];

  const addPokemon = (pokemon: Pokemon) => {
    if (selectedPokemon.length < 6) {
      setSelectedPokemon([...selectedPokemon, pokemon]);
    }
  };

  const removePokemon = (index: number) => {
    setSelectedPokemon(selectedPokemon.filter((_, i) => i !== index));
  };

  const handleTrainerSpriteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTrainerSprite(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokemon Team Builder</h1>
      </header>
      <main className="App-main">
        <div className="left-panel">
          <TrainerCard
            trainerName={trainerName}
            setTrainerName={setTrainerName}
            selectedPokemon={selectedPokemon}
            onRemovePokemon={removePokemon}
            trainerSprite={trainerSprite}
            onTrainerSpriteChange={handleTrainerSpriteChange}
            availableSprites={availableSprites}
            onSpriteSelect={setTrainerSprite}
            pokeballImage={pokeball}
          />
        </div>
        <div className="right-panel">
          <PokemonSelector onPokemonSelect={addPokemon} />
        </div>
      </main>
    </div>
  );
}

export default App;
