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
    description: 'Ogni invitato o gruppo deve imitare una posa iconica, un\'espressione facciale buffa o una caratteristica distintiva degli sposi. Possono essere ispirati da foto evocative, aneddoti raccontati, o semplicemente dalla loro personalità.',
    icon: '🎭',
    difficulty: 'Media',
    tags: ['Imitazione', 'Divertimento', 'Creatività']
  },
  {
    id: 6,
    title: 'La Bussola Perduta',
    description: (
      <div className="space-y-3">
        <p>In montagna è facile perdere l'orientamento! Scattate una foto di gruppo mentre indicate tutti direzioni diverse con pose esilaranti, come se steste cercando di trovare il sentiero giusto. Chi punta a nord? Chi a sud? Il caos dell'orientamento montano!</p>
        <div className="flex justify-center">
          <img 
            src="/images/indicazioni.jpeg" 
            alt="Esempio di indicazioni montane" 
            className="max-w-full h-auto rounded-lg border-2 border-amber-300 shadow-md max-h-48 object-contain"
          />
        </div>
      </div>
    ),
    icon: '🧭',
    difficulty: 'Facile',
    tags: ['Orientamento', 'Divertimento', 'Gruppo']
  },
  {
    id: 7,
    title: 'Il Freddo Improvviso',
    description: 'In montagna il tempo può cambiare all\'improvviso! Individuate il membro più preparato e attrezzato del vostro tavolo e immortalatelo mentre mostra la sua attrezzatura da montagna (giacca, sciarpa, cappello, o qualsiasi cosa abbia portato per il freddo).',
    icon: '🌨️',
    difficulty: 'Facile',
    tags: ['Attrezzatura', 'Preparazione', 'Freddo']
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