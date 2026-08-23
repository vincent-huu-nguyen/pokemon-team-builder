declare const require: {
  context: (
    directory: string,
    useSubdirectories: boolean,
    regExp: RegExp
  ) => {
    keys: () => string[];
    (key: string): { default?: string } | string;
  };
};

function formatOfficialSpriteName(filename: string): string {
  let name = filename.replace(/\.(png|webp|jpg|jpeg)$/i, '');

  if (name.startsWith('Prof')) {
    return `Professor ${name.slice(4)}`;
  }
  if (name.startsWith('ZA_')) {
    name = name.slice(3);
  } else if (name.startsWith('XY_')) {
    name = name.slice(3);
  } else if (name.startsWith('Sun_Moon_')) {
    name = name.slice(9);
  } else if (name.startsWith('Sword_Shield_')) {
    name = name.slice(13);
  } else if (name.toLowerCase().startsWith('pogo-')) {
    name = name.slice(5);
  }

  return name
    .replace(/[-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Reorder this list to change how official trainer sprites appear in the popup.
 * Each entry must match a filename in src/assets/PKMOfficials.
 * Any files not listed here are appended at the end in alphabetical order.
 */
export const officialTrainerSpriteOrder = [
  // Player characters & professors (custom order)
  'red.png',
  'leaf.png',
  'blue.png',
  'gold.png',
  'lyra.png',
  'silver.png',
  'brendan.png',
  'may.png',
  'Lucas.png',
  'Dawn.png',
  'Barry.png',
  'Rei.png',
  'Akari.png',
  'hilbert.png',
  'hilda.png',
  'Nate.png',
  'Rosa.png',
  'N.png',
  'hugh.png',
  'calem.png',
  'Serena.png',
  'elio.png',
  'selene.png',
  'hau.png',
  'Lillie.png',
  'Gladion.png',
  'Victor.png',
  'Gloria.png',
  'Hop.png',
  'Bede.png',
  'Marnie.png',
  'Florian.png',
  'Juliana.png',
  'Nemona.png',
  'Arven.png',
  'kieran.png',
  'carmine.png',
  'ZA_Paxton.png',
  'ZA_Harmony.png',
  'ZA_Urbain.png',
  'ZA_Taunie.png',
  'lida.png',
  'naveen.png',
  'pogo-male.png',
  'pogo-female.png',
  'pogo-spark.png',
  'pogo-blanche.png',
  'pogo-candela.png',
  'ProfWillow.png',
  'ProfElm.png',
  'ProfBirch.png',
  'ProfRowan.png',
  'ProfJuniper.png',
  'ProfSycamore.png',
  'ProfKukui.png',
  'ProfSada.png',
  'ProfTuro.png',
  // Everyone else
  'Adaman.png',
  'Allister.png',
  'Amarys.png',
  'archie.png',
  'Arezu.png',
  'atticus.png',
  'Bea.png',
  'brawly.png',
  'briar.png',
  'buck.png',
  'Caitlin.png',
  'cilan.png',
  'corbeau.png',
  'cynthia.png',
  'Diantha.png',
  'Drayden.png',
  'Drayton.png',
  'Elesa.png',
  'Emma.png',
  'Fennel.png',
  'Geeta.png',
  'Glacia.png',
  'Gordie.png',
  'Grant.png',
  'Grimsley.png',
  'Grusha.png',
  'Guzma.png',
  'Gwynn.webp',
  'Hassel.png',
  'Ingo.png',
  'Iono.png',
  'Irida.png',
  'Iris.png',
  'Iscan.png',
  'Jasmine.png',
  'Kabu.png',
  'Kamado.png',
  'Kiawe.png',
  'kieran-2.png',
  'Klara.png',
  'Lacey.png',
  'Lana.png',
  'Larry.png',
  'Leon.png',
  'Lian.png',
  'Lillie-2.png',
  'Lisia.png',
  'Lusamine.png',
  'Lysandre.png',
  'Mable.png',
  'Mai.png',
  'Mallow.png',
  'Marlon.png',
  'Mars.png',
  'Marshall.png',
  'Maxie.png',
  'Mela.png',
  'Melony.png',
  'Milo.png',
  'Mina.png',
  'Morty.png',
  'Nanu.png',
  'Nessa.png',
  'Norman.png',
  'Olivia.png',
  'Opal.png',
  'Ortega.png',
  'Perrin.png',
  'Phoebe.png',
  'Piers.png',
  'Proton.png',
  'Raihan.png',
  'ranger-m.png',
  'Rika.png',
  'Rose.png',
  'Roxanne.png',
  'Roxie.png',
  'Ryme.png',
  'Sabi.png',
  'Shauna.png',
  'Shelly.png',
  'Sidney.png',
  'Siebold.png',
  'Sonia.png',
  'Sun_Moon_Plumeria.png',
  'Sun_Moon_Sophocles.png',
  'Sword_Shield_Oleana.png',
  'Tulip.png',
  'Valerie.png',
  'Volkner.png',
  'Volo.png',
  'Wallace.png',
  'Wicke.png',
  'XY_Dana.png',
  'XY_Drasna.png',
  'XY_Evelyn.png',
  'XY_Korrina.png',
  'XY_Nita.png',
  'XY_Olympia.png',
  'XY_Tierno.png',
  'XY_Trevor.png',
  'ZA_Canari.png',
  'ZA_Jacinthe.png',
  'ZA_Philippe.png',
  'ZA_Vinnie.png',
  'Zinnia.png',
];

const officialSpriteContext = require.context(
  '../assets/PKMOfficials',
  false,
  /\.(png|webp|jpg|jpeg)$/i
);

const officialSpriteSrcByFilename = officialSpriteContext.keys().reduce<
  Record<string, string>
>((acc, key) => {
  const filename = key.replace(/^\.\//, '');
  const mod = officialSpriteContext(key);
  acc[filename] = (typeof mod === 'object' && mod?.default ? mod.default : mod) as string;
  return acc;
}, {});

const allOfficialFilenames = Object.keys(officialSpriteSrcByFilename).sort((a, b) =>
  a.localeCompare(b)
);

const orderedFilenames = [
  ...officialTrainerSpriteOrder.filter((filename) => officialSpriteSrcByFilename[filename]),
  ...allOfficialFilenames.filter((filename) => !officialTrainerSpriteOrder.includes(filename)),
];

export const officialTrainerSprites: { name: string; src: string }[] = orderedFilenames.map(
  (filename) => ({
    name: formatOfficialSpriteName(filename),
    src: officialSpriteSrcByFilename[filename],
  })
);
