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
import trainerAkari from './assets/Trainer_Akari.png';
import trainerBlue from './assets/Trainer_Blue.png';
import trainerBlueGen7 from './assets/Trainer_BlueGen7.png';
import trainerBlueMasters from './assets/Trainer_BlueMasters.png';
import trainerBrendan from './assets/Trainer_Brendan.png';
import trainerBrendanRS from './assets/Trainer_BrendanRS.png';
import trainerCalem from './assets/Trainer_Calem.png';
import trainerDawn from './assets/Trainer_Dawn.png';
import trainerDawnPT from './assets/Trainer_DawnPT.png';
import trainerElio from './assets/Trainer_Elio.png';
import trainerElioUSUM from './assets/Trainer_ElioUSUM.png';
import trainerEthan from './assets/Trainer_Ethan.png';
import trainerFlorian from './assets/Trainer_Florian.png';
import trainerGloria from './assets/Trainer_Gloria.png';
import trainerHarmony from './assets/Trainer_Harmony.png';
import trainerHilbert from './assets/Trainer_Hilbert.png';
import trainerHilda from './assets/Trainer_Hilda.png';
import trainerJuliana from './assets/Trainer_Juliana.png';
import trainerKris from './assets/Trainer_Kris.png';
import trainerLeaf from './assets/Trainer_Leaf.png';
import trainerLeafMasters from './assets/Trainer_LeafMasters.png';
import trainerLucas from './assets/Trainer_Lucas.png';
import trainerLucasPT from './assets/Trainer_LucasPT.png';
import trainerLyra from './assets/Trainer_Lyra.png';
import trainerMay from './assets/Trainer_May.png';
import trainerMayRS from './assets/Trainer_MayRS.png';
import trainerNate from './assets/Trainer_Nate.png';
import trainerPaxton from './assets/Trainer_Paxton.png';
import trainerRed from './assets/Trainer_Red.png';
import trainerRedGen7 from './assets/Trainer_RedGen7.png';
import trainerRedMasters from './assets/Trainer_RedMasters.png';
import trainerRei from './assets/Trainer_Rei.png';
import trainerRosa from './assets/Trainer_Rosa.png';
import trainerSelene from './assets/Trainer_Selene.png';
import trainerSeleneUSUM from './assets/Trainer_SeleneUSUM.png';
import trainerSerena from './assets/Trainer_Serena.png';
import trainerSilver from './assets/Trainer_Silver.png';
import trainerVictor from './assets/Trainer_Victor.png';
import trainerAceF from './assets/Trainer_AceF.png';
import trainerAceM from './assets/Trainer_AceM.png';
import trainerArven from './assets/Trainer_Arven.png';
import trainerBarry from './assets/Trainer_Barry.png';
import trainerBede from './assets/Trainer_Bede.png';
import trainerBianca from './assets/Trainer_Bianca.png';
import trainerBreederF from './assets/Trainer_BreederF.png';
import trainerBreederM from './assets/Trainer_BreederM.png';
import trainerBurglar from './assets/Trainer_Burglar.png';
import trainerCarmine from './assets/Trainer_Carmine.png';
import trainerCheren from './assets/Trainer_Cheren.png';
import trainerDoctor from './assets/Trainer_Doctor.png';
import trainerHiker from './assets/Trainer_Hiker.png';
import trainerHop from './assets/Trainer_Hop.png';
import trainerHugh from './assets/Trainer_Hugh.png';
import trainerKieran from './assets/Trainer_Kieran.png';
import trainerKieran2 from './assets/Trainer_Kieran2.png';
import trainerLady from './assets/Trainer_Lady.png';
import trainerLass from './assets/Trainer_Lass.png';
import trainerLillie from './assets/Trainer_Lillie.png';
import trainerLillie2 from './assets/Trainer_Lillie2.png';
import trainerMarnie from './assets/Trainer_Marnie.png';
import trainerN from './assets/Trainer_N.png';
import trainerNemona from './assets/Trainer_Nemona.png';
import trainerOfficeWorkerF from './assets/Trainer_OfficeWorkerF.png';
import trainerOfficeWorkerM from './assets/Trainer_OfficeWorkerM.png';
import trainerPokeFanF from './assets/Trainer_PokeFanF.png';
import trainerPokeFanM from './assets/Trainer_PokeFanM.png';
import trainerPsychicF from './assets/Trainer_PsychicF.png';
import trainerPsychicM from './assets/Trainer_PsychicM.png';
import trainerRancher from './assets/Trainer_Rancher.png';
import trainerRangerF from './assets/Trainer_RangerF.png';
import trainerRangerM from './assets/Trainer_RangerM.png';
import trainerRocketF from './assets/Trainer_RocketF.png';
import trainerRocketM from './assets/Trainer_RocketM.png';
import trainerRoughNeck from './assets/Trainer_RoughNeck.png';
import trainerScientist from './assets/Trainer_Scientist.png';
import trainerShadowTriad from './assets/Trainer_ShadowTriad.png';
import trainerSightseer from './assets/Trainer_Sightseer.png';
import trainerSkullGruntF from './assets/Trainer_SkullGruntF.png';
import trainerSkullGruntM from './assets/Trainer_SkullGruntM.png';
import trainerTaunie from './assets/Trainer_Taunie.png';
import trainerUrbain from './assets/Trainer_Urbain.png';
import trainerVeteranF from './assets/Trainer_VeteranF.png';
import trainerVeteranM from './assets/Trainer_VeteranM.png';
import trainerWally from './assets/Trainer_Wally.png';
import trainerYellow from './assets/Trainer_Yellow.png';
import trainerYoungster from './assets/Trainer_Youngster.png';
import pokeball from './assets/pokeball.png';
import pancham from './assets/Pancham.png';

function App() {
  const [trainerName, setTrainerName] = useState('Trainer');
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon[]>([]);
  const [trainerSprite, setTrainerSprite] = useState(trainerRed);
  const [artStyle, setArtStyle] = useState<'pixel' | 'official'>('pixel');
  const [cardColor, setCardColor] = useState('#242424');
  const [gradientColor, setGradientColor] = useState('#050505');
  const [isGradient, setIsGradient] = useState(true);
  
  // Available trainer sprites (new/canonical first, then variants, then original)
  const availableSprites = [
    // New sprites (requested order)
    { name: 'Red', src: trainerRed },
    { name: 'Leaf', src: trainerLeaf },
    { name: 'Blue', src: trainerBlue },
    { name: 'Ethan', src: trainerEthan },
    { name: 'Silver', src: trainerSilver },
    { name: 'Kris', src: trainerKris },
    { name: 'Lyra', src: trainerLyra },
    { name: 'Brendan', src: trainerBrendan },
    { name: 'May', src: trainerMay },
    { name: 'Lucas', src: trainerLucas },
    { name: 'Rei', src: trainerRei },
    { name: 'Dawn', src: trainerDawn },
    { name: 'Akari', src: trainerAkari },
    { name: 'Hilbert', src: trainerHilbert },
    { name: 'Hilda', src: trainerHilda },
    { name: 'Nate', src: trainerNate },
    { name: 'Rosa', src: trainerRosa },
    { name: 'Calem', src: trainerCalem },
    { name: 'Serena', src: trainerSerena },
    { name: 'Elio', src: trainerElio },
    { name: 'Selene', src: trainerSelene },
    { name: 'Victor', src: trainerVictor },
    { name: 'Gloria', src: trainerGloria },
    { name: 'Florian', src: trainerFlorian },
    { name: 'Juliana', src: trainerJuliana },
    { name: 'Paxton', src: trainerPaxton },
    { name: 'Harmony', src: trainerHarmony },
    // New sprite variants
    { name: 'Red Gen 7', src: trainerRedGen7 },
    { name: 'Red Masters', src: trainerRedMasters },
    { name: 'Leaf Masters', src: trainerLeafMasters },
    { name: 'Blue Gen 7', src: trainerBlueGen7 },
    { name: 'Blue Masters', src: trainerBlueMasters },
    { name: 'Brendan RS', src: trainerBrendanRS },
    { name: 'May RS', src: trainerMayRS },
    { name: 'Dawn PT', src: trainerDawnPT },
    { name: 'Lucas PT', src: trainerLucasPT },
    { name: 'Elio USUM', src: trainerElioUSUM },
    { name: 'Selene USUM', src: trainerSeleneUSUM },
    // Original sprites
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
    { name: 'Noah', src: trainerNoah },
    { name: 'Vivian', src: trainerVivian },
    { name: 'Pierce', src: trainerPierce },
    { name: 'Axel', src: trainerAxel },
    { name: 'Kaz', src: trainerKaz },
    // NPC / Trainer class sprites
    { name: 'Ace (F)', src: trainerAceF },
    { name: 'Ace (M)', src: trainerAceM },
    { name: 'Arven', src: trainerArven },
    { name: 'Barry', src: trainerBarry },
    { name: 'Bede', src: trainerBede },
    { name: 'Bianca', src: trainerBianca },
    { name: 'Breeder (F)', src: trainerBreederF },
    { name: 'Breeder (M)', src: trainerBreederM },
    { name: 'Burglar', src: trainerBurglar },
    { name: 'Carmine', src: trainerCarmine },
    { name: 'Cheren', src: trainerCheren },
    { name: 'Doctor', src: trainerDoctor },
    { name: 'Hiker', src: trainerHiker },
    { name: 'Hop', src: trainerHop },
    { name: 'Hugh', src: trainerHugh },
    { name: 'Kieran', src: trainerKieran },
    { name: 'Kieran (Unbound)', src: trainerKieran2 },
    { name: 'Lady', src: trainerLady },
    { name: 'Lass', src: trainerLass },
    { name: 'Lillie', src: trainerLillie },
    { name: 'Lillie (Hatless)', src: trainerLillie2 },
    { name: 'Marnie', src: trainerMarnie },
    { name: 'N', src: trainerN },
    { name: 'Nemona', src: trainerNemona },
    { name: 'Office Worker (F)', src: trainerOfficeWorkerF },
    { name: 'Office Worker (M)', src: trainerOfficeWorkerM },
    { name: 'Poké Fan (F)', src: trainerPokeFanF },
    { name: 'Poké Fan (M)', src: trainerPokeFanM },
    { name: 'Psychic (F)', src: trainerPsychicF },
    { name: 'Psychic (M)', src: trainerPsychicM },
    { name: 'Rancher', src: trainerRancher },
    { name: 'Ranger (F)', src: trainerRangerF },
    { name: 'Ranger (M)', src: trainerRangerM },
    { name: 'Team Rocket (F)', src: trainerRocketF },
    { name: 'Team Rocket (M)', src: trainerRocketM },
    { name: 'Roughneck', src: trainerRoughNeck },
    { name: 'Scientist', src: trainerScientist },
    { name: 'Shadow Triad', src: trainerShadowTriad },
    { name: 'Sightseer', src: trainerSightseer },
    { name: 'Skull Grunt (F)', src: trainerSkullGruntF },
    { name: 'Skull Grunt (M)', src: trainerSkullGruntM },
    { name: 'Taunie', src: trainerTaunie },
    { name: 'Urbain', src: trainerUrbain },
    { name: 'Veteran (F)', src: trainerVeteranF },
    { name: 'Veteran (M)', src: trainerVeteranM },
    { name: 'Wally', src: trainerWally },
    { name: 'Yellow', src: trainerYellow },
    { name: 'Youngster', src: trainerYoungster },
  ];

  const addPokemon = (pokemon: Pokemon) => {
    setSelectedPokemon((prev) => [...prev, pokemon]);
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
        <h1><img src={pancham} alt="Pancham" className="title-pancham title-pancham-left" /> Pokemon Team Builder <img src={pancham} alt="Pancham" className="title-pancham" /></h1>
        <p className="credit">Created by Vincent Nguyen</p>
        <p className="sprite-attribution">
          Pokémon and trainer sprites used in this project are not owned by me; all rights belong to
          their respective owners.
        </p>
        <p className="screenshot-hint">📸 Screenshot your masterpiece and share your card with friends!</p>
      </header>
      <main className="App-main">
        <div className="left-panel">
          <TrainerCard
            trainerName={trainerName}
            setTrainerName={setTrainerName}
            selectedPokemon={selectedPokemon}
            replaceSelectedPokemon={setSelectedPokemon}
            onRemovePokemon={removePokemon}
            trainerSprite={trainerSprite}
            onTrainerSpriteChange={handleTrainerSpriteChange}
            availableSprites={availableSprites}
            onSpriteSelect={setTrainerSprite}
            pokeballImage={pokeball}
            artStyle={artStyle}
            cardColor={cardColor}
            setCardColor={setCardColor}
            gradientColor={gradientColor}
            setGradientColor={setGradientColor}
            isGradient={isGradient}
            setIsGradient={setIsGradient}
          />
        </div>
        <div className="right-panel">
          <PokemonSelector 
            onPokemonSelect={addPokemon} 
            artStyle={artStyle}
            onArtStyleChange={setArtStyle}
            cardColor={cardColor}
            gradientColor={gradientColor}
            isGradient={isGradient}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
