import React, { useState } from 'react';
import './App.css';
import TrainerCard from './components/TrainerCard';
import PokemonSelector from './components/PokemonSelector';
import { Pokemon } from './types/Pokemon';
//import trainerVincent from './assets/PKMSprites/Trainer_Vincent.png';
//import trainerTroy from './assets/PKMSprites/Trainer_Troy.png';
//import trainerAria from './assets/PKMSprites/Trainer_Aria.png';
//import trainerBlake from './assets/PKMSprites/Trainer_Blake.png';
//import trainerLeah from './assets/PKMSprites/Trainer_Leah.png';
//import trainerCassie from './assets/PKMSprites/Trainer_Cassie.png';
//import trainerMaeve from './assets/PKMSprites/Trainer_Maeve.png';
//import trainerLuna from './assets/PKMSprites/Trainer_Luna.png';
//import trainerDestiny from './assets/PKMSprites/Trainer_Destiny.png';
//import trainerPierce from './assets/PKMSprites/Trainer_Pierce.png';
//import trainerKaz from './assets/PKMSprites/Trainer_Kaz.png';
//import trainerNoah from './assets/PKMSprites/Trainer_Noah.png';
//import trainerArnold from './assets/PKMSprites/Trainer_Arnold.png';
//import trainerVivian from './assets/PKMSprites/Trainer_Vivian.png';
//import trainerAlphonse from './assets/PKMSprites/Trainer_Alphonse.png';
//import trainerAxel from './assets/PKMSprites/Trainer_Axel.png';
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
import trainerAceF6 from './assets/PKMSprites/Trainer_AceF6.png';
import trainerAceF6xy from './assets/PKMSprites/Trainer_AceF6xy.png';
import trainerAceF7 from './assets/PKMSprites/Trainer_AceF7.png';
import trainerAceM6 from './assets/PKMSprites/Trainer_AceM6.png';
import trainerAceM6xy from './assets/PKMSprites/Trainer_AceM6xy.png';
import trainerAceM7 from './assets/PKMSprites/Trainer_AceM7.png';
import trainerAetherfoundation from './assets/PKMSprites/Trainer_Aetherfoundation.png';
import trainerAetherfoundationf from './assets/PKMSprites/Trainer_Aetherfoundationf.png';
import trainerAlder from './assets/PKMSprites/Trainer_Alder.png';
import trainerAllister from './assets/PKMSprites/Trainer_Allister.png';
import trainerAnabel from './assets/PKMSprites/Trainer_Anabel.png';
import trainerAquagruntRse from './assets/PKMSprites/Trainer_Aquagrunt-rse.png';
import trainerAquagrunt from './assets/PKMSprites/Trainer_Aquagrunt.png';
import trainerAquagruntfRse from './assets/PKMSprites/Trainer_Aquagruntf-rse.png';
import trainerAquagruntf from './assets/PKMSprites/Trainer_Aquagruntf.png';
import trainerArchie from './assets/PKMSprites/Trainer_Archie.png';
import trainerAz from './assets/PKMSprites/Trainer_Az.png';
import trainerBackpackerGen6 from './assets/PKMSprites/Trainer_Backpacker-gen6.png';
import trainerBackpackerGen8 from './assets/PKMSprites/Trainer_Backpacker-gen8.png';
import trainerBackpacker from './assets/PKMSprites/Trainer_Backpacker.png';
import trainerBackpackerf from './assets/PKMSprites/Trainer_Backpackerf.png';
import trainerBallguy from './assets/PKMSprites/Trainer_Ballguy.png';
import trainerBea from './assets/PKMSprites/Trainer_Bea.png';
import trainerBeautyGen6 from './assets/PKMSprites/Trainer_Beauty-gen6.png';
import trainerBeautyGen6xy from './assets/PKMSprites/Trainer_Beauty-gen6xy.png';
import trainerBeautyMasters from './assets/PKMSprites/Trainer_Beauty-masters.png';
import trainerBirch from './assets/PKMSprites/Trainer_Birch.png';
import trainerBlackbeltGen9 from './assets/PKMSprites/Trainer_Blackbelt-gen9.png';
import trainerBrock from './assets/PKMSprites/Trainer_Brock.png';
import trainerBruno from './assets/PKMSprites/Trainer_Bruno.png';
import trainerCaitlin from './assets/PKMSprites/Trainer_Caitlin.png';
import trainerCynthiaGen4 from './assets/PKMSprites/Trainer_Cynthia-gen4.png';
import trainerCynthia from './assets/PKMSprites/Trainer_Cynthia.png';
import trainerCyrus from './assets/PKMSprites/Trainer_Cyrus.png';
import trainerDancerGen7 from './assets/PKMSprites/Trainer_Dancer-gen7.png';
import trainerDancerGen8 from './assets/PKMSprites/Trainer_Dancer-gen8.png';
import trainerDelinquent from './assets/PKMSprites/Trainer_Delinquent.png';
import trainerDiantha from './assets/PKMSprites/Trainer_Diantha.png';
import trainerDrayton from './assets/PKMSprites/Trainer_Drayton.png';
import trainerElesaGen5bw2 from './assets/PKMSprites/Trainer_Elesa-gen5bw2.png';
import trainerElesa from './assets/PKMSprites/Trainer_Elesa.png';
import trainerElm from './assets/PKMSprites/Trainer_Elm.png';
import trainerEmma from './assets/PKMSprites/Trainer_Emma.png';
import trainerFairyGirl from './assets/PKMSprites/Trainer_FairyGirl.png';
import trainerFirefighter from './assets/PKMSprites/Trainer_Firefighter.png';
import trainerFlannery from './assets/PKMSprites/Trainer_Flannery.png';
import trainerFlareF from './assets/PKMSprites/Trainer_FlareF.png';
import trainerFlareM from './assets/PKMSprites/Trainer_FlareM.png';
import trainerGalacticgrunt from './assets/PKMSprites/Trainer_Galacticgrunt.png';
import trainerGalacticgruntf from './assets/PKMSprites/Trainer_Galacticgruntf.png';
import trainerGardenia from './assets/PKMSprites/Trainer_Gardenia.png';
import trainerGeeta from './assets/PKMSprites/Trainer_Geeta.png';
import trainerGentleman from './assets/PKMSprites/Trainer_Gentleman.png';
import trainerGhetsis from './assets/PKMSprites/Trainer_Ghetsis.png';
import trainerGhetsis2 from './assets/PKMSprites/Trainer_Ghetsis2.png';
import trainerGiovanni from './assets/PKMSprites/Trainer_Giovanni.png';
import trainerGiovanni2 from './assets/PKMSprites/Trainer_Giovanni2.png';
import trainerGladion from './assets/PKMSprites/Trainer_Gladion.png';
import trainerGrimsley from './assets/PKMSprites/Trainer_Grimsley.png';
import trainerGuitar from './assets/PKMSprites/Trainer_Guitar.png';
import trainerGuzma from './assets/PKMSprites/Trainer_Guzma.png';
import trainerGwynn from './assets/PKMSprites/Trainer_Gwynn.png';
import trainerHexManiac from './assets/PKMSprites/Trainer_HexManiac.png';
import trainerIono from './assets/PKMSprites/Trainer_Iono.png';
import trainerIrida from './assets/PKMSprites/Trainer_Irida.png';
import trainerIris from './assets/PKMSprites/Trainer_Iris.png';
import trainerJacinthe from './assets/PKMSprites/Trainer_Jacinthe.png';
import trainerJuniper from './assets/PKMSprites/Trainer_Juniper.png';
import trainerKamado from './assets/PKMSprites/Trainer_Kamado.png';
import trainerKaren from './assets/PKMSprites/Trainer_Karen.png';
import trainerKindler from './assets/PKMSprites/Trainer_Kindler.png';
import trainerKoga from './assets/PKMSprites/Trainer_Koga.png';
import trainerKoga2 from './assets/PKMSprites/Trainer_Koga2.png';
import trainerKukui from './assets/PKMSprites/Trainer_Kukui.png';
import trainerLacey from './assets/PKMSprites/Trainer_Lacey.png';
import trainerLance from './assets/PKMSprites/Trainer_Lance.png';
import trainerLarry from './assets/PKMSprites/Trainer_Larry.png';
import trainerLass2 from './assets/PKMSprites/Trainer_Lass2.png';
import trainerLass3 from './assets/PKMSprites/Trainer_Lass3.png';
import trainerLass4 from './assets/PKMSprites/Trainer_Lass4.png';
import trainerLaventon from './assets/PKMSprites/Trainer_Laventon.png';
import trainerLeaguestaff from './assets/PKMSprites/Trainer_Leaguestaff.png';
import trainerLeaguestaffF from './assets/PKMSprites/Trainer_LeaguestaffF.png';
import trainerLeon from './assets/PKMSprites/Trainer_Leon.png';
import trainerLeonTower from './assets/PKMSprites/Trainer_LeonTower.png';
import trainerLida from './assets/PKMSprites/Trainer_Lida.png';
import trainerLtsurge from './assets/PKMSprites/Trainer_Ltsurge.png';
import trainerLysandre from './assets/PKMSprites/Trainer_Lysandre.png';
import trainerMable from './assets/PKMSprites/Trainer_Mable.png';
import trainerMagma from './assets/PKMSprites/Trainer_Magma.png';
import trainerMagmaF from './assets/PKMSprites/Trainer_MagmaF.png';
import trainerMagmagruntRse from './assets/PKMSprites/Trainer_Magmagrunt-rse.png';
import trainerMagmagruntfRse from './assets/PKMSprites/Trainer_Magmagruntf-rse.png';
import trainerMarley from './assets/PKMSprites/Trainer_Marley.png';
import trainerMaxie from './assets/PKMSprites/Trainer_Maxie.png';
import trainerMela from './assets/PKMSprites/Trainer_Mela.png';
import trainerMelony from './assets/PKMSprites/Trainer_Melony.png';
import trainerMilo from './assets/PKMSprites/Trainer_Milo.png';
import trainerMisty from './assets/PKMSprites/Trainer_Misty.png';
import trainerMorty from './assets/PKMSprites/Trainer_Morty.png';
import trainerNaveen from './assets/PKMSprites/Trainer_Naveen.png';
import trainerNessa from './assets/PKMSprites/Trainer_Nessa.png';
import trainerNinjaboy from './assets/PKMSprites/Trainer_Ninjaboy.png';
import trainerOak from './assets/PKMSprites/Trainer_Oak.png';
import trainerOlympia from './assets/PKMSprites/Trainer_Olympia.png';
import trainerPlasmagrunt from './assets/PKMSprites/Trainer_Plasmagrunt.png';
import trainerPlasmagrunt2 from './assets/PKMSprites/Trainer_Plasmagrunt2.png';
import trainerPlasmagruntf from './assets/PKMSprites/Trainer_Plasmagruntf.png';
import trainerPlasmagruntf2 from './assets/PKMSprites/Trainer_Plasmagruntf2.png';
import trainerPokemonrangerGen6 from './assets/PKMSprites/Trainer_Pokemonranger-gen6.png';
import trainerPokemonrangerGen6xy from './assets/PKMSprites/Trainer_Pokemonranger-gen6xy.png';
import trainerPokemonrangerfGen6 from './assets/PKMSprites/Trainer_Pokemonrangerf-gen6.png';
import trainerPokemonrangerfGen6xy from './assets/PKMSprites/Trainer_Pokemonrangerf-gen6xy.png';
import trainerRaihan from './assets/PKMSprites/Trainer_Raihan.png';
import trainerRika from './assets/PKMSprites/Trainer_Rika.png';
import trainerRowan from './assets/PKMSprites/Trainer_Rowan.png';
import trainerSabrina from './assets/PKMSprites/Trainer_Sabrina.png';
import trainerSada from './assets/PKMSprites/Trainer_Sada.png';
import trainerSailor from './assets/PKMSprites/Trainer_Sailor.png';
import trainerSchoolkid from './assets/PKMSprites/Trainer_Schoolkid.png';
import trainerSchoolkidF from './assets/PKMSprites/Trainer_SchoolkidF.png';
import trainerSkytrainer from './assets/PKMSprites/Trainer_Skytrainer.png';
import trainerSkytrainerf from './assets/PKMSprites/Trainer_Skytrainerf.png';
import trainerSonia from './assets/PKMSprites/Trainer_Sonia.png';
import trainerStargruntS from './assets/PKMSprites/Trainer_Stargrunt-s.png';
import trainerStargruntV from './assets/PKMSprites/Trainer_Stargrunt-v.png';
import trainerStargruntfS from './assets/PKMSprites/Trainer_Stargruntf-s.png';
import trainerStargruntfV from './assets/PKMSprites/Trainer_Stargruntf-v.png';
import trainerSteven from './assets/PKMSprites/Trainer_Steven.png';
import trainerSwimmerGen6 from './assets/PKMSprites/Trainer_Swimmer-gen6.png';
import trainerSwimmerGen7 from './assets/PKMSprites/Trainer_Swimmer-gen7.png';
import trainerSwimmerfGen6 from './assets/PKMSprites/Trainer_Swimmerf-gen6.png';
import trainerSwimmerfGen7 from './assets/PKMSprites/Trainer_Swimmerf-gen7.png';
import trainerSycamore from './assets/PKMSprites/Trainer_Sycamore.png';
import trainerTourist from './assets/PKMSprites/Trainer_Tourist.png';
import trainerTouristf from './assets/PKMSprites/Trainer_Touristf.png';
import trainerTuro from './assets/PKMSprites/Trainer_Turo.png';
import trainerVeteranGen7 from './assets/PKMSprites/Trainer_Veteran-gen7.png';
import trainerVeteranfGen7 from './assets/PKMSprites/Trainer_Veteranf-gen7.png';
import trainerVolkner from './assets/PKMSprites/Trainer_Volkner.png';
import trainerVoloGinkgo from './assets/PKMSprites/Trainer_Volo-ginkgo.png';
import trainerVolo from './assets/PKMSprites/Trainer_Volo.png';
import trainerWaitress from './assets/PKMSprites/Trainer_Waitress.png';
import trainerWallace from './assets/PKMSprites/Trainer_Wallace.png';
import trainerWorker from './assets/PKMSprites/Trainer_Worker.png';
import trainerWorkerF from './assets/PKMSprites/Trainer_WorkerF.png';
import trainerZinnia from './assets/PKMSprites/Trainer_Zinnia.png';
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
    { name: 'Yellow', src: trainerYellow },
    { name: 'Ethan', src: trainerEthan },
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
    // Rival sprites
    { name: 'Silver', src: trainerSilver },
    { name: 'Wally', src: trainerWally },
    { name: 'Barry', src: trainerBarry },
    { name: 'Cheren', src: trainerCheren },
    { name: 'Bianca', src: trainerBianca },
    { name: 'N', src: trainerN },
    { name: 'Hugh', src: trainerHugh },
    { name: 'Gladion', src: trainerGladion },
    { name: 'Lillie', src: trainerLillie },
    { name: 'Lillie (Hatless)', src: trainerLillie2 },
    { name: 'Hop', src: trainerHop },
    { name: 'Bede', src: trainerBede },
    { name: 'Marnie', src: trainerMarnie },
    { name: 'Nemona', src: trainerNemona },
    { name: 'Arven', src: trainerArven },
    { name: 'Carmine', src: trainerCarmine },
    { name: 'Kieran', src: trainerKieran },
    { name: 'Kieran (Unbound)', src: trainerKieran2 },
    { name: 'Taunie', src: trainerTaunie },
    { name: 'Urbain', src: trainerUrbain },
    { name: 'Lida', src: trainerLida },
    { name: 'Naveen', src: trainerNaveen },
    // Professor sprites
    { name: 'Professor Oak', src: trainerOak },
    { name: 'Professor Elm', src: trainerElm },
    { name: 'Professor Birch', src: trainerBirch },
    { name: 'Professor Rowan', src: trainerRowan },
    { name: 'Professor Juniper', src: trainerJuniper },
    { name: 'Professor Sycamore', src: trainerSycamore },
    { name: 'Professor Kukui', src: trainerKukui },
    { name: 'Professor Sonia', src: trainerSonia },
    { name: 'Laventon', src: trainerLaventon },
    { name: 'Sada', src: trainerSada },
    { name: 'Turo', src: trainerTuro },
    { name: 'Mable', src: trainerMable },
    // Gym Leaders sprites
    { name: 'Brock', src: trainerBrock },
    { name: 'Misty', src: trainerMisty },
    { name: 'Lt. Surge', src: trainerLtsurge },
    { name: 'Sabrina', src: trainerSabrina },
    { name: 'Koga', src: trainerKoga },
    { name: 'Koga (2)', src: trainerKoga2 },
    { name: 'Morty', src: trainerMorty },
    { name: 'Karen', src: trainerKaren },
    { name: 'Bruno', src: trainerBruno },
    { name: 'Lance', src: trainerLance },
    { name: 'Flannery', src: trainerFlannery },
    { name: 'Steven', src: trainerSteven },
    { name: 'Wallace', src: trainerWallace },
    { name: 'Zinnia', src: trainerZinnia },
    { name: 'Gardenia', src: trainerGardenia },
    { name: 'Volkner', src: trainerVolkner },
    { name: 'Cynthia Gen 4', src: trainerCynthiaGen4 },
    { name: 'Cynthia', src: trainerCynthia },
    { name: 'Marley', src: trainerMarley },
    { name: 'Elesa BW2', src: trainerElesaGen5bw2 },
    { name: 'Elesa', src: trainerElesa },
    { name: 'Grimsley', src: trainerGrimsley },
    { name: 'Caitlin', src: trainerCaitlin },
    { name: 'Alder', src: trainerAlder },
    { name: 'Iris', src: trainerIris },
    { name: 'Olympia', src: trainerOlympia },
    { name: 'Diantha', src: trainerDiantha },
    { name: 'Az', src: trainerAz },
    { name: 'Anabel', src: trainerAnabel },
    { name: 'Milo', src: trainerMilo },
    { name: 'Melony', src: trainerMelony },
    { name: 'Nessa', src: trainerNessa },
    { name: 'Bea', src: trainerBea },
    { name: 'Allister', src: trainerAllister },
    { name: 'Raihan', src: trainerRaihan },
    { name: 'Leon', src: trainerLeon },
    { name: 'Leon (Tower)', src: trainerLeonTower },
    { name: 'Ballguy', src: trainerBallguy },
    { name: 'Kamado', src: trainerKamado },
    { name: 'Irida', src: trainerIrida },
    { name: 'Volo (Ginkgo)', src: trainerVoloGinkgo },
    { name: 'Volo', src: trainerVolo },
    { name: 'Iono', src: trainerIono },
    { name: 'Larry', src: trainerLarry },
    { name: 'Rika', src: trainerRika },
    { name: 'Geeta', src: trainerGeeta },
    { name: 'Mela', src: trainerMela },
    { name: 'Lacey', src: trainerLacey },
    { name: 'Drayton', src: trainerDrayton },
    { name: 'Gwynn', src: trainerGwynn },
    { name: 'Jacinthe', src: trainerJacinthe },
    { name: 'Emma', src: trainerEmma },
    // Villain sprites
    { name: 'Team Rocket (M)', src: trainerRocketM },
    { name: 'Team Rocket (F)', src: trainerRocketF },
    { name: 'Giovanni', src: trainerGiovanni },
    { name: 'Giovanni (2)', src: trainerGiovanni2 },
    { name: 'Magma Grunt', src: trainerMagma },
    { name: 'Magma Grunt (F)', src: trainerMagmaF },
    { name: 'Magma Grunt RSE', src: trainerMagmagruntRse },
    { name: 'Magma Grunt (F) RSE', src: trainerMagmagruntfRse },
    { name: 'Maxie', src: trainerMaxie },
    { name: 'Aqua Grunt RSE', src: trainerAquagruntRse },
    { name: 'Aqua Grunt', src: trainerAquagrunt },
    { name: 'Aqua Grunt (F) RSE', src: trainerAquagruntfRse },
    { name: 'Aqua Grunt (F)', src: trainerAquagruntf },
    { name: 'Archie', src: trainerArchie },
    { name: 'Galactic Grunt', src: trainerGalacticgrunt },
    { name: 'Galactic Grunt (F)', src: trainerGalacticgruntf },
    { name: 'Cyrus', src: trainerCyrus },
    { name: 'Plasma Grunt', src: trainerPlasmagrunt },
    { name: 'Plasma Grunt 2', src: trainerPlasmagrunt2 },
    { name: 'Plasma Grunt (F)', src: trainerPlasmagruntf },
    { name: 'Plasma Grunt (F) 2', src: trainerPlasmagruntf2 },
    { name: 'Shadow Triad', src: trainerShadowTriad },
    { name: 'Ghetsis', src: trainerGhetsis },
    { name: 'Ghetsis (2)', src: trainerGhetsis2 },
    { name: 'Flare Grunt (M)', src: trainerFlareM },
    { name: 'Flare Grunt (F)', src: trainerFlareF },
    { name: 'Lysandre', src: trainerLysandre },
    { name: 'Skull Grunt (M)', src: trainerSkullGruntM },
    { name: 'Skull Grunt (F)', src: trainerSkullGruntF },
    { name: 'Guzma', src: trainerGuzma },
    { name: 'Aether Foundation', src: trainerAetherfoundation },
    { name: 'Aether Foundation (F)', src: trainerAetherfoundationf },
    { name: 'League Staff', src: trainerLeaguestaff },
    { name: 'League Staff (F)', src: trainerLeaguestaffF },
    { name: 'Star Grunt (S)', src: trainerStargruntS },
    { name: 'Star Grunt (V)', src: trainerStargruntV },
    { name: 'Star Grunt (F) S', src: trainerStargruntfS },
    { name: 'Star Grunt (F) V', src: trainerStargruntfV },
    // NPC sprites (grouped by type; male / non-F before F)
    { name: 'Ace (M)', src: trainerAceM },
    { name: 'Ace (F)', src: trainerAceF },
    { name: 'Ace (M) Gen 6', src: trainerAceM6 },
    { name: 'Ace (F) Gen 6', src: trainerAceF6 },
    { name: 'Ace (M) Gen 6 XY', src: trainerAceM6xy },
    { name: 'Ace (F) Gen 6 XY', src: trainerAceF6xy },
    { name: 'Ace (M) Gen 7', src: trainerAceM7 },
    { name: 'Ace (F) Gen 7', src: trainerAceF7 },
    { name: 'Backpacker', src: trainerBackpacker },
    { name: 'Backpacker (F)', src: trainerBackpackerf },
    { name: 'Backpacker Gen 6', src: trainerBackpackerGen6 },
    { name: 'Backpacker Gen 8', src: trainerBackpackerGen8 },
    { name: 'Beauty Gen 6', src: trainerBeautyGen6 },
    { name: 'Beauty Gen 6 XY', src: trainerBeautyGen6xy },
    { name: 'Beauty Masters', src: trainerBeautyMasters },
    { name: 'Blackbelt Gen 9', src: trainerBlackbeltGen9 },
    { name: 'Breeder (M)', src: trainerBreederM },
    { name: 'Breeder (F)', src: trainerBreederF },
    { name: 'Dancer Gen 7', src: trainerDancerGen7 },
    { name: 'Dancer Gen 8', src: trainerDancerGen8 },
    { name: 'Roughneck', src: trainerRoughNeck },
    { name: 'Delinquent', src: trainerDelinquent },
    { name: 'Doctor', src: trainerDoctor },
    { name: 'Burglar', src: trainerBurglar },
    { name: 'Fairy Girl', src: trainerFairyGirl },
    { name: 'Firefighter', src: trainerFirefighter },
    { name: 'Fisher', src: trainerFisher },
    { name: 'Gentleman', src: trainerGentleman },
    { name: 'Guitar', src: trainerGuitar },
    { name: 'Hex Maniac', src: trainerHexManiac },
    { name: 'Hiker', src: trainerHiker },
    { name: 'Kindler', src: trainerKindler },
    { name: 'Lady', src: trainerLady },
    { name: 'Lass', src: trainerLass },
    { name: 'Lass 2', src: trainerLass2 },
    { name: 'Lass 3', src: trainerLass3 },
    { name: 'Lass 4', src: trainerLass4 },
    { name: 'Ninja Boy', src: trainerNinjaboy },
    { name: 'Office Worker (M)', src: trainerOfficeWorkerM },
    { name: 'Office Worker (F)', src: trainerOfficeWorkerF },
    { name: 'Poké Fan (M)', src: trainerPokeFanM },
    { name: 'Poké Fan (F)', src: trainerPokeFanF },
    { name: 'Pokémon Ranger Gen 6', src: trainerPokemonrangerGen6 },
    { name: 'Pokémon Ranger Gen 6 XY', src: trainerPokemonrangerGen6xy },
    { name: 'Pokémon Ranger (F) Gen 6', src: trainerPokemonrangerfGen6 },
    { name: 'Pokémon Ranger (F) Gen 6 XY', src: trainerPokemonrangerfGen6xy },
    { name: 'Psychic (M)', src: trainerPsychicM },
    { name: 'Psychic (F)', src: trainerPsychicF },
    { name: 'Rancher', src: trainerRancher },
    { name: 'Ranger (M)', src: trainerRangerM },
    { name: 'Ranger (F)', src: trainerRangerF },
    { name: 'Sailor', src: trainerSailor },
    { name: 'Schoolkid', src: trainerSchoolkid },
    { name: 'Schoolkid (F)', src: trainerSchoolkidF },
    { name: 'Scientist', src: trainerScientist },
    { name: 'Sightseer', src: trainerSightseer },
    { name: 'Sky Trainer', src: trainerSkytrainer },
    { name: 'Sky Trainer (F)', src: trainerSkytrainerf },
    { name: 'Swimmer Gen 6', src: trainerSwimmerGen6 },
    { name: 'Swimmer Gen 7', src: trainerSwimmerGen7 },
    { name: 'Swimmer (F) Gen 6', src: trainerSwimmerfGen6 },
    { name: 'Swimmer (F) Gen 7', src: trainerSwimmerfGen7 },
    { name: 'Tourist', src: trainerTourist },
    { name: 'Tourist (F)', src: trainerTouristf },
    { name: 'Veteran (M)', src: trainerVeteranM },
    { name: 'Veteran (F)', src: trainerVeteranF },
    { name: 'Veteran Gen 7', src: trainerVeteranGen7 },
    { name: 'Veteran (F) Gen 7', src: trainerVeteranfGen7 },
    { name: 'Waitress', src: trainerWaitress },
    { name: 'Worker', src: trainerWorker },
    { name: 'Worker (F)', src: trainerWorkerF },
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
        <p className="discord-link">
          <a
            href="https://discord.gg/mqrdZvBGw"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="discord-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Join the PokéCents Discord server!
          </a>
        </p>
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
