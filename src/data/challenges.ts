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
    description: 'Immortalate il momento del brindisi più spettacolare della serata! Tutti i membri della gilda devono essere nella foto con i calici alzati al cielo, come veri guerrieri che celebrano una vittoria.',
    icon: '🥂',
    difficulty: 'Facile',
    tags: ['Gruppo', 'Celebrazione', 'Brindisi']
  },
  {
    id: 2,
    title: 'La Danza del Drago',
    description: 'Create una catena umana sulla pista da ballo che rappresenti un drago in movimento. Almeno 5 persone devono partecipare, con movimenti coordinati degni di una leggenda.',
    icon: '🐉',
    difficulty: 'Media',
    tags: ['Ballo', 'Coordinazione', 'Creatività']
  },
  {
    id: 3,
    title: 'Il Ritratto del Nobile',
    description: 'Scattate un ritratto in stile medievale di un membro della vostra gilda. Usate pose solenni, sguardi fieri e, se possibile, oggetti che ricordino l\'epoca cavalleresca.',
    icon: '👑',
    difficulty: 'Media',
    tags: ['Ritratto', 'Stile', 'Medievale']
  },
  {
    id: 4,
    title: 'La Conquista del Buffet',
    description: 'Documentate la vostra "conquista" del buffet con una foto di gruppo mentre brandite forchette e cucchiai come armi da battaglia. Mostrate la vostra determinazione culinaria!',
    icon: '🍽️',
    difficulty: 'Facile',
    tags: ['Cibo', 'Divertimento', 'Gruppo']
  },
  {
    id: 5,
    title: 'Il Selfie Impossibile',
    description: 'Scattate un selfie di gruppo dove TUTTI i membri della gilda sono visibili e sorridenti. Nessuno può essere tagliato fuori dall\'inquadratura. La sfida è nella coordinazione!',
    icon: '🤳',
    difficulty: 'Difficile',
    tags: ['Selfie', 'Coordinazione', 'Gruppo']
  },
  {
    id: 6,
    title: 'La Piramide Umana',
    description: 'Costruite una piramide umana con almeno 4 persone. La sicurezza è fondamentale, ma la gloria è eterna! Dimostrate che la vostra gilda può raggiungere qualsiasi vetta.',
    icon: '🏔️',
    difficulty: 'Difficile',
    tags: ['Acrobazie', 'Teamwork', 'Sfida']
  },
  {
    id: 7,
    title: 'Il Momento Romantico',
    description: 'Catturate un momento di pura tenerezza tra gli sposi o tra una coppia della vostra gilda. L\'obiettivo è immortalare l\'amore in tutta la sua bellezza naturale.',
    icon: '💕',
    difficulty: 'Media',
    tags: ['Romance', 'Emozioni', 'Coppia']
  },
  {
    id: 8,
    title: 'La Battaglia delle Risate',
    description: 'Fotografate il momento in cui tutta la vostra gilda scoppia a ridere contemporaneamente. Bonus se riuscite a catturare anche le lacrime di gioia!',
    icon: '😂',
    difficulty: 'Media',
    tags: ['Risate', 'Spontaneità', 'Gioia']
  },
  {
    id: 9,
    title: 'Il Salto della Vittoria',
    description: 'Tutti i membri della gilda devono saltare contemporaneamente mentre qualcuno scatta la foto. Sincronizzazione perfetta richiesta per questa prova di coordinazione suprema!',
    icon: '🦘',
    difficulty: 'Difficile',
    tags: ['Salto', 'Sincronizzazione', 'Energia']
  },
  {
    id: 10,
    title: 'L\'Eredità Eterna',
    description: 'Create una foto finale che rappresenti lo spirito della vostra gilda e che possa essere ricordata per sempre. Usate tutta la vostra creatività per lasciare un segno indelebile nella storia del matrimonio!',
    icon: '✨',
    difficulty: 'Media',
    tags: ['Creatività', 'Memoria', 'Finale']
  }
];