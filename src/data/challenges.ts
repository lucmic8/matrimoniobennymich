export interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  difficulty: 'Facile' | 'Media' | 'Difficile';
  tags: string[];
}

export const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Il Brindisi Epico',
    description: 'Immortalate il momento del brindisi più spettacolare della serata! Tutti i membri della Cima devono essere nella foto con i calici alzati al cielo, come veri scalatori che celebrano una vittoria.',
    icon: '🥂',
    difficulty: 'Facile',
    tags: ['Gruppo', 'Celebrazione', 'Brindisi']
  },
  {
    id: 2,
    title: 'La Conquista del Banchetto',
    description: 'Documentate la vostra "conquista" del banchetto con una foto di gruppo mentre brandite forchette e cucchiai come armi da conquista. Mostrate la vostra determinazione culinaria!',
    icon: '🍽️',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Gruppo']
  },
  {
    id: 3,
    title: 'Il Selfie Impossibile',
    description: 'Scattate un selfie di gruppo dove TUTTI i membri della Cima sono visibili e sorridenti. Nessuno può essere tagliato fuori dall\'inquadratura. La sfida è nella coordinazione!',
    icon: '🤳',
    difficulty: 'Difficile',
    tags: ['Selfie', 'Coordinazione', 'Gruppo']
  },
  {
    id: 4,
    title: 'Il Momento Romantico',
    description: 'Catturate un momento di pura tenerezza tra gli sposi o tra una coppia della vostra cima. L\'obiettivo è immortalare l\'amore in tutta la sua bellezza naturale, come le Dolomiti al tramonto.',
    icon: '💕',
    difficulty: 'Media',
    tags: ['Romance', 'Emozioni', 'Coppia']
  },
  {
    id: 5,
    title: 'L\'Imitazione dello Sposo/Sposa',
    description: 'Ogni invitato o gruppo deve imitare una posa iconica, un\'espressione facciale buffa o una caratteristica distintiva degli sposi. Possono essere ispirati da foto proiettate, aneddoti raccontati, o semplicemente dalla loro personalità.',
    icon: '🎭',
    difficulty: 'Media',
    tags: ['Imitazione', 'Divertimento', 'Creatività']
  },
  {
    id: 6,
    title: 'La Reazione al Discorso "Noioso"',
    description: 'Gli invitati devono scattare una foto di gruppo mentre mimano reazioni esagerate e divertenti a un discorso "noioso": sguardi assonnati, sbadigli plateali, occhi al cielo, o qualcuno che cerca di fuggire furtivamente.',
    icon: '😴',
    difficulty: 'Facile',
    tags: ['Recitazione', 'Divertimento', 'Gruppo']
  },
  {
    id: 7,
    title: 'Il Momento Culinario',
    description: 'Immortalate il momento più divertente legato al cibo: qualcuno che assaggia un piatto particolare, una reazione buffa a un sapore, o il momento in cui qualcuno si accorge che il piatto è finito!',
    icon: '🍴',
    difficulty: 'Facile',
    tags: ['Cibo', 'Reazioni', 'Spontaneità']
  },
  {
    id: 8,
    title: 'Il Montanaro Esperto',
    description: 'In ogni Cima c\'è un montanaro o una montanara più esperto/a, immortalatelo/a mentre dimostra la sua esperienza montana!',
    icon: '🧗',
    difficulty: 'Media',
    tags: ['Esperienza', 'Montagna', 'Individuale']
  },
  {
    id: 9,
    title: 'La Vetta è Vicina!',
    description: 'Forza e coraggio, ormai manca solo la torta e avete concluso il banchetto! Immortalate colui/colei che era pieno già dopo la prima portata, in un momento di sazietà.',
    icon: '🍰',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Sazietà']
  },
  {
    id: 10,
    title: 'L\'Eredità Eterna',
    description: 'Create una foto finale che rappresenti lo spirito della vostra Cima e che possa essere ricordata per sempre. Usate tutta la vostra creatività per lasciare un segno indelebile nella storia del matrimonio!',
    icon: '✨',
    difficulty: 'Media',
    tags: ['Creatività', 'Memoria', 'Finale']
  }
];