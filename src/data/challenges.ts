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
    title: 'La Danza del Drago',
    description: 'Create una catena umana attorno al tavolo che rappresenti un drago in movimento con movimenti coordinati degni di invitati con i fiocchi.',
    icon: '🐉',
    difficulty: 'Media',
    tags: ['Ballo', 'Coordinazione', 'Creatività']
  },
  {
    id: 3,
    title: 'Il Ritratto del Montanaro',
    description: 'Scattate un ritratto in stile montanaro di un membro della vostra Cima. Usate pose solenni e sguardi fieri tipici di un vero scalatore di montagna.',
    icon: '👑',
    difficulty: 'Media',
    tags: ['Ritratto', 'Stile', 'Montanaro']
  },
  {
    id: 4,
    title: 'La Conquista del Banchetto',
    description: 'Documentate la vostra "conquista" del banchetto con una foto di gruppo mentre brandite forchette e cucchiai come armi da conquista. Mostrate la vostra determinazione culinaria!',
    icon: '🍽️',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Gruppo']
  },
  {
    id: 5,
    title: 'Il Selfie Impossibile',
    description: 'Scattate un selfie di gruppo dove TUTTI i membri della Cima sono visibili e sorridenti. Nessuno può essere tagliato fuori dall\'inquadratura. La sfida è nella coordinazione!',
    icon: '🤳',
    difficulty: 'Difficile',
    tags: ['Selfie', 'Coordinazione', 'Gruppo']
  },
  {
    id: 6,
    title: 'La Montagna Umana',
    description: 'Ricreate una montagna umana con il corpo. La sicurezza è fondamentale, ma la gloria è eterna! Dimostrate che la vostra Cima può raggiungere qualsiasi vetta.',
    icon: '🏔️',
    difficulty: 'Difficile',
    tags: ['Acrobazie', 'Teamwork', 'Sfida']
  },
  {
    id: 7,
    title: 'Il Montanaro Esperto',
    description: 'In ogni Cima c\'è un montanaro o una montanara più esperto/a, immortalatelo/a mentre dimostra la sua esperienza montana!',
    icon: '🧗',
    difficulty: 'Media',
    tags: ['Esperienza', 'Montagna', 'Individuale']
  },
  {
    id: 8,
    title: 'Il Momento Romantico',
    description: 'Catturate un momento di pura tenerezza tra gli sposi o tra una coppia della vostra cima. L\'obiettivo è immortalare l\'amore in tutta la sua bellezza naturale, come le Dolomiti al tramonto.',
    icon: '💕',
    difficulty: 'Media',
    tags: ['Romance', 'Emozioni', 'Coppia']
  },
  {
    id: 9,
    title: 'La Battaglia delle Risate',
    description: 'Fotografate il momento in cui tutta la vostra Cima scoppia a ridere contemporaneamente. Bonus se riuscite a catturare anche le lacrime di gioia!',
    icon: '😂',
    difficulty: 'Media',
    tags: ['Risate', 'Spontaneità', 'Gioia']
  },
  {
    id: 10,
    title: 'Il Salto della Vittoria',
    description: 'Tutti i membri della Cima devono saltare contemporaneamente mentre qualcuno scatta la foto. Sincronizzazione perfetta richiesta per questa prova di coordinazione suprema!',
    icon: '🦘',
    difficulty: 'Difficile',
    tags: ['Salto', 'Sincronizzazione', 'Energia']
  },
  {
    id: 11,
    title: 'La Vetta è Vicina!',
    description: 'Forza e coraggio, ormai manca solo la torta e avete concluso il banchetto! Immortalate colui/colei che era pieno già dopo la prima portata, in un momento di sazietà.',
    icon: '🍰',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Sazietà']
  },
  {
    id: 12,
    title: 'L\'Eredità Eterna',
    description: 'Create una foto finale che rappresenti lo spirito della vostra Cima e che possa essere ricordata per sempre. Usate tutta la vostra creatività per lasciare un segno indelebile nella storia del matrimonio!',
    icon: '✨',
    difficulty: 'Media',
    tags: ['Creatività', 'Memoria', 'Finale']
  },
  {
    id: 13,
    title: 'L\'Imitazione dello Sposo/Sposa',
    description: 'Ogni invitato o gruppo deve imitare una posa iconica, un\'espressione facciale buffa o una caratteristica distintiva degli sposi. Possono essere ispirati da foto proiettate, aneddoti raccontati, o semplicemente dalla loro personalità.',
    icon: '🎭',
    difficulty: 'Media',
    tags: ['Imitazione', 'Divertimento', 'Creatività']
  },
  {
    id: 14,
    title: 'La Reazione al Discorso "Noioso"',
    description: 'Gli invitati devono scattare una foto di gruppo mentre mimano reazioni esagerate e divertenti a un discorso "noioso": sguardi assonnati, sbadigli plateali, occhi al cielo, o qualcuno che cerca di fuggire furtivamente.',
    icon: '😴',
    difficulty: 'Facile',
    tags: ['Recitazione', 'Divertimento', 'Gruppo']
  }
];