export interface Challenge {
  id: number;
  title: string;
  description: string;
  image?: string;
  icon: string;
  difficulty: 'Facile' | 'Media' | 'Difficile';
  tags: string[];
}

export const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Il Brindisi Epico',
    description: 'Immortalate il momento del brindisi più spettacolare della serata! Tutti i membri della Cima devono essere nella foto con i calici alzati al cielo, come veri scalatori che celebrano una vittoria.',
    image: '/images/brindisi.jpeg',
    icon: '🥂',
    difficulty: 'Facile',
    tags: ['Gruppo', 'Celebrazione', 'Brindisi']
  },
  {
    id: 2,
    title: 'La Conquista del Banchetto',
    description: 'Documentate la vostra "conquista" del banchetto con una foto di gruppo mentre brandite forchette e cucchiai come armi da conquista. Mostrate la vostra determinazione culinaria!',
    image: '/images/banchetto.jpeg',
    icon: '🍽️',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Gruppo']
  },
  {
    id: 3,
    title: 'L\'Imitazione dello Sposo/Sposa',
    description: 'Ogni invitato o gruppo deve imitare una posa iconica, un\'espressione facciale buffa o una caratteristica distintiva degli sposi. Possono essere ispirati da foto evocative, aneddoti raccontati, o semplicemente dalla loro personalità.',
    image: '/images/mangio_dormi.jpeg',
    icon: '🎭',
    difficulty: 'Media',
    tags: ['Imitazione', 'Divertimento', 'Creatività']
  },
  {
    id: 4,
    title: 'Il Momento Romantico',
    description: 'Catturate un momento di pura tenerezza tra gli sposi o tra una coppia della vostra cima. L\'obiettivo è immortalare l\'amore in tutta la sua bellezza naturale, come le Dolomiti al tramonto.',
    image: '/images/romantico.jpeg',
    icon: '💕',
    difficulty: 'Media',
    tags: ['Romance', 'Emozioni', 'Coppia']
  },
  {
    id: 5,
    title: 'La Bussola Perduta',
    description: 'In montagna è facile perdere l\'orientamento! Scattate una foto di gruppo mentre indicate tutti direzioni diverse con pose esilaranti, come se steste cercando di trovare il sentiero giusto. Chi punta a nord? Chi a sud? Il caos dell\'orientamento montano!',
    image: '/images/indicazioni.jpeg',
    icon: '🧭',
    difficulty: 'Facile',
    tags: ['Orientamento', 'Divertimento', 'Gruppo']
  },
  {
    id: 6,
    title: 'Il Freddo Improvviso',
    description: 'In montagna il tempo può cambiare all\'improvviso! Individuate il membro più preparato e attrezzato del vostro tavolo e immortalatelo mentre mostra la sua attrezzatura da montagna (giacca, sciarpa, cappello, o qualsiasi cosa abbia portato per il freddo).',
    image: '/images/freddo.jpeg',
    icon: '🧊',
    difficulty: 'Facile',
    tags: ['Attrezzatura', 'Preparazione', 'Freddo']
  },
  {
    id: 7,
    title: 'Il Relax',
    description: 'Dopo una lunga passeggiata in montagna, ogni scalatore ha bisogno di riposo! Immortalate il componente della vostra Cima che incarna meglio il relax, sorpreso in una posizione di totale tranquillità.',
    image: '/images/relax.jpeg',
    icon: '😴',
    difficulty: 'Facile',
    tags: ['Relax', 'Divertimento', 'Riposo']
  },
  {
    id: 8,
    title: 'Il Montanaro Esperto',
    description: 'In ogni Cima c\'è un montanaro o una montanara più esperto/a, immortalatelo/a mentre dimostra la sua esperienza montana!',
    image: '/images/montanaro.jpeg',
    icon: '🧗',
    difficulty: 'Media',
    tags: ['Esperienza', 'Montagna', 'Individuale']
  },
  {
    id: 9,
    title: 'La Vetta è Vicina!',
    description: 'Forza e coraggio, ormai manca solo la torta e avete concluso il banchetto! Immortalate colui/colei che era pieno già dopo la prima portata, in un momento di sazietà.',
    image: '/images/vettavicina.jpeg',
    icon: '🍰',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Sazietà']
  },
  {
    id: 10,
    title: 'L\'Eredità Eterna',
    description: 'Create una foto finale che rappresenti lo spirito della vostra Cima e che possa essere ricordata per sempre. Usate tutta la vostra creatività per lasciare un segno indelebile nella storia del matrimonio!',
    image: '/images/finale.jpeg',
    icon: '✨',
    difficulty: 'Media',
    tags: ['Creatività', 'Memoria', 'Finale']
  }
];
