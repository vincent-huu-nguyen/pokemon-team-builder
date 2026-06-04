import React, { useState } from 'react';
import './App.css';
import TrainerCard from './components/TrainerCard';
import PokemonSelector from './components/PokemonSelector';
import { Pokemon } from './types/Pokemon';
import trainerVincent from './assets/PKMSprites/Trainer_Vincent.png';
import trainerTroy from './assets/PKMSprites/Trainer_Troy.png';
import trainerAria from './assets/PKMSprites/Trainer_Aria.png';
import trainerBlake from './assets/PKMSprites/Trainer_Blake.png';
import trainerLeah from './assets/PKMSprites/Trainer_Leah.png';
import trainerCassie from './assets/PKMSprites/Trainer_Cassie.png';
import trainerMaeve from './assets/PKMSprites/Trainer_Maeve.png';
import trainerLuna from './assets/PKMSprites/Trainer_Luna.png';
import trainerDestiny from './assets/PKMSprites/Trainer_Destiny.png';
import trainerPierce from './assets/PKMSprites/Trainer_Pierce.png';
import trainerKaz from './assets/PKMSprites/Trainer_Kaz.png';
import trainerNoah from './assets/PKMSprites/Trainer_Noah.png';
import trainerArnold from './assets/PKMSprites/Trainer_Arnold.png';
import trainerVivian from './assets/PKMSprites/Trainer_Vivian.png';
import trainerAlphonse from './assets/PKMSprites/Trainer_Alphonse.png';
import trainerAxel from './assets/PKMSprites/Trainer_Axel.png';
import trainerAkari from './assets/PKMSprites/Trainer_Akari.png';
import trainerBlue from './assets/PKMSprites/Trainer_Blue.png';
import trainerBlueGen7 from './assets/PKMSprites/Trainer_BlueGen7.png';
import trainerBlueMasters from './assets/PKMSprites/Trainer_BlueMasters.png';
import trainerBrendan from './assets/PKMSprites/Trainer_Brendan.png';
import trainerBrendanRS from './assets/PKMSprites/Trainer_BrendanRS.png';
import trainerCalem from './assets/PKMSprites/Trainer_Calem.png';
import trainerDawn from './assets/PKMSprites/Trainer_Dawn.png';
import trainerDawnPT from './assets/PKMSprites/Trainer_DawnPT.png';
import trainerElio from './assets/PKMSprites/Trainer_Elio.png';
import trainerElioUSUM from './assets/PKMSprites/Trainer_ElioUSUM.png';
import trainerEthan from './assets/PKMSprites/Trainer_Ethan.png';
import trainerFlorian from './assets/PKMSprites/Trainer_Florian.png';
import trainerGloria from './assets/PKMSprites/Trainer_Gloria.png';
import trainerHarmony from './assets/PKMSprites/Trainer_Harmony.png';
import trainerHilbert from './assets/PKMSprites/Trainer_Hilbert.png';
import trainerHilda from './assets/PKMSprites/Trainer_Hilda.png';
import trainerJuliana from './assets/PKMSprites/Trainer_Juliana.png';
import trainerKris from './assets/PKMSprites/Trainer_Kris.png';
import trainerLeaf from './assets/PKMSprites/Trainer_Leaf.png';
import trainerLeafMasters from './assets/PKMSprites/Trainer_LeafMasters.png';
import trainerLucas from './assets/PKMSprites/Trainer_Lucas.png';
import trainerLucasPT from './assets/PKMSprites/Trainer_LucasPT.png';
import trainerLyra from './assets/PKMSprites/Trainer_Lyra.png';
import trainerMay from './assets/PKMSprites/Trainer_May.png';
import trainerMayRS from './assets/PKMSprites/Trainer_MayRS.png';
import trainerNate from './assets/PKMSprites/Trainer_Nate.png';
import trainerPaxton from './assets/PKMSprites/Trainer_Paxton.png';
import trainerRed from './assets/PKMSprites/Trainer_Red.png';
import trainerRedGen7 from './assets/PKMSprites/Trainer_RedGen7.png';
import trainerRedMasters from './assets/PKMSprites/Trainer_RedMasters.png';
import trainerRei from './assets/PKMSprites/Trainer_Rei.png';
import trainerRosa from './assets/PKMSprites/Trainer_Rosa.png';
import trainerSelene from './assets/PKMSprites/Trainer_Selene.png';
import trainerSeleneUSUM from './assets/PKMSprites/Trainer_SeleneUSUM.png';
import trainerSerena from './assets/PKMSprites/Trainer_Serena.png';
import trainerSilver from './assets/PKMSprites/Trainer_Silver.png';
import trainerVictor from './assets/PKMSprites/Trainer_Victor.png';
import trainerAceF from './assets/PKMSprites/Trainer_AceF.png';
import trainerAceM from './assets/PKMSprites/Trainer_AceM.png';
import trainerArven from './assets/PKMSprites/Trainer_Arven.png';
import trainerBarry from './assets/PKMSprites/Trainer_Barry.png';
import trainerBede from './assets/PKMSprites/Trainer_Bede.png';
import trainerBianca from './assets/PKMSprites/Trainer_Bianca.png';
import trainerBreederF from './assets/PKMSprites/Trainer_BreederF.png';
import trainerBreederM from './assets/PKMSprites/Trainer_BreederM.png';
import trainerBurglar from './assets/PKMSprites/Trainer_Burglar.png';
import trainerCarmine from './assets/PKMSprites/Trainer_Carmine.png';
import trainerCheren from './assets/PKMSprites/Trainer_Cheren.png';
import trainerDoctor from './assets/PKMSprites/Trainer_Doctor.png';
import trainerFisher from './assets/PKMSprites/Trainer_Fisher.png';
import trainerHiker from './assets/PKMSprites/Trainer_Hiker.png';
import trainerHop from './assets/PKMSprites/Trainer_Hop.png';
import trainerHugh from './assets/PKMSprites/Trainer_Hugh.png';
import trainerKieran from './assets/PKMSprites/Trainer_Kieran.png';
import trainerKieran2 from './assets/PKMSprites/Trainer_Kieran2.png';
import trainerLady from './assets/PKMSprites/Trainer_Lady.png';
import trainerLass from './assets/PKMSprites/Trainer_Lass.png';
import trainerLillie from './assets/PKMSprites/Trainer_Lillie.png';
import trainerLillie2 from './assets/PKMSprites/Trainer_Lillie2.png';
import trainerMarnie from './assets/PKMSprites/Trainer_Marnie.png';
import trainerN from './assets/PKMSprites/Trainer_N.png';
import trainerNemona from './assets/PKMSprites/Trainer_Nemona.png';
import trainerOfficeWorkerF from './assets/PKMSprites/Trainer_OfficeWorkerF.png';
import trainerOfficeWorkerM from './assets/PKMSprites/Trainer_OfficeWorkerM.png';
import trainerPokeFanF from './assets/PKMSprites/Trainer_PokeFanF.png';
import trainerPokeFanM from './assets/PKMSprites/Trainer_PokeFanM.png';
import trainerPsychicF from './assets/PKMSprites/Trainer_PsychicF.png';
import trainerPsychicM from './assets/PKMSprites/Trainer_PsychicM.png';
import trainerRancher from './assets/PKMSprites/Trainer_Rancher.png';
import trainerRangerF from './assets/PKMSprites/Trainer_RangerF.png';
import trainerRangerM from './assets/PKMSprites/Trainer_RangerM.png';
import trainerRocketF from './assets/PKMSprites/Trainer_RocketF.png';
import trainerRocketM from './assets/PKMSprites/Trainer_RocketM.png';
import trainerRoughNeck from './assets/PKMSprites/Trainer_RoughNeck.png';
import trainerScientist from './assets/PKMSprites/Trainer_Scientist.png';
import trainerShadowTriad from './assets/PKMSprites/Trainer_ShadowTriad.png';
import trainerSightseer from './assets/PKMSprites/Trainer_Sightseer.png';
import trainerSkullGruntF from './assets/PKMSprites/Trainer_SkullGruntF.png';
import trainerSkullGruntM from './assets/PKMSprites/Trainer_SkullGruntM.png';
import trainerTaunie from './assets/PKMSprites/Trainer_Taunie.png';
import trainerUrbain from './assets/PKMSprites/Trainer_Urbain.png';
import trainerVeteranF from './assets/PKMSprites/Trainer_VeteranF.png';
import trainerVeteranM from './assets/PKMSprites/Trainer_VeteranM.png';
import trainerWally from './assets/PKMSprites/Trainer_Wally.png';
import trainerYellow from './assets/PKMSprites/Trainer_Yellow.png';
import trainerYoungster from './assets/PKMSprites/Trainer_Youngster.png';
import pokeball from './assets/PKMSprites/pokeball.png';
import pancham from './assets/PKMSprites/Pancham.png';

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
    //{ name: 'Vincent', src: trainerVincent },
    //{ name: 'Arnold', src: trainerArnold },
    //{ name: 'Luna', src: trainerLuna },
    //{ name: 'Alphonse', src: trainerAlphonse },
    //{ name: 'Troy', src: trainerTroy },
    //{ name: 'Aria', src: trainerAria },
    //{ name: 'Blake', src: trainerBlake },
    //{ name: 'Leah', src: trainerLeah },
    //{ name: 'Cassie', src: trainerCassie },
    //{ name: 'Maeve', src: trainerMaeve },
    //{ name: 'Destiny', src: trainerDestiny },
    //{ name: 'Noah', src: trainerNoah },
    //{ name: 'Vivian', src: trainerVivian },
    //{ name: 'Pierce', src: trainerPierce },
    //{ name: 'Axel', src: trainerAxel },
    //{ name: 'Kaz', src: trainerKaz },
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
    { name: 'Fisher', src: trainerFisher },
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
