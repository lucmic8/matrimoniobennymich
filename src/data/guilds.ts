export interface Guild {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  fullDescription: string;
  image: string;
  color: string;
}

export const guilds: Guild[] = [
  {
    id: 'sorapis',
    name: 'Sorapis',
    subtitle: 'Cima del Lago di Cristallo',
    description: 'Custodi delle acque cristalline e dei riflessi eterni',
    fullDescription: 'Il Monte Sorapis, con i suoi 3.205 metri di altezza, domina maestoso le Dolomiti orientali. Famoso per il suo lago dalle acque turchesi che riflettono le pareti rocciose come uno specchio magico, questa montagna è il simbolo della purezza e della contemplazione. I membri di questa gilda sono noti per la loro saggezza e la capacità di vedere oltre le apparenze, proprio come le acque cristalline del lago rivelano i segreti del fondale.',
    image: '/images/Sorapis.png',
    color: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'antermoia',
    name: 'Antermoia',
    subtitle: 'Cima delle Nebbie Rosate',
    description: 'Guardiani delle albe dorate tra le vette alpine',
    fullDescription: 'Il Piz Antermoia, con i suoi 3.264 metri, è una delle vette più spettacolari del gruppo del Catinaccio. Conosciuto per le sue pareti che si tingono di rosa e oro durante l\'alba e il tramonto, questo monte incarna la magia dell\'enrosadira. I guerrieri di questa gilda sono maestri nell\'arte della trasformazione e sanno trovare la bellezza anche nei momenti più difficili, proprio come la montagna trasforma la luce in spettacolo.',
    image: '/images/Antermoia.png',
    color: 'from-pink-500 to-rose-600'
  },
  {
    id: 'tre-cime',
    name: 'Tre Cime di Lavaredo',
    subtitle: 'Cima dei Tre Picchi',
    description: 'Valorosi difensori delle tre torri di pietra',
    fullDescription: 'Le Tre Cime di Lavaredo, con la Cima Grande che raggiunge i 2.999 metri, sono il simbolo più iconico delle Dolomiti. Queste tre torri di roccia, che si ergono come sentinelle contro il cielo, rappresentano la forza, il coraggio e l\'unità. I membri di questa gilda sono guerrieri valorosi che sanno che insieme possono superare qualsiasi sfida, proprio come le tre cime che da millenni resistono alle intemperie unite nella loro maestosità.',
    image: '/images/TreCime.jpeg',
    color: 'from-orange-500 to-red-600'
  },
  {
    id: 'sassolungo',
    name: 'Sassolungo',
    subtitle: 'Cima della Pietra Antica',
    description: 'Maestri delle rocce millenarie e dei segreti della terra',
    fullDescription: 'Il Sassolungo, con i suoi 3.181 metri, è una delle montagne più imponenti e riconoscibili delle Dolomiti. La sua forma allungata e le sue pareti verticali raccontano storie di ere geologiche passate. Questa montagna è il custode dei segreti più antichi della terra. I membri di questa gilda sono saggi conoscitori della storia e delle tradizioni, capaci di leggere nelle rocce i messaggi del passato e di tramandare la saggezza alle generazioni future.',
    image: '/images/Sassolungo.png',
    color: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'piz-boe',
    name: 'Piz Boè',
    subtitle: 'Cima del Picco del Tuono',
    description: 'Guerrieri delle tempeste e dominatori dei cieli',
    fullDescription: 'Il Piz Boè, con i suoi 3.152 metri, è la vetta più alta del gruppo del Sella. Spesso avvolto dalle nuvole e battuto dai venti, questo monte è il regno delle tempeste e dei fenomeni atmosferici più spettacolari. I guerrieri di questa gilda sono coraggiosi affrontatori delle avversità, capaci di trovare la loro forza nelle sfide più difficili e di trasformare ogni tempesta in un\'opportunità di crescita.',
    image: '/images/Piz Boè.png',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'marmolada',
    name: 'Marmolada',
    subtitle: 'Cima della Regina delle Dolomiti',
    description: 'Sovrani del ghiacciaio eterno e delle vette supreme',
    fullDescription: 'La Marmolada, con i suoi 3.343 metri, è la vetta più alta delle Dolomiti e viene chiamata la "Regina delle Dolomiti". Il suo ghiacciaio, uno degli ultimi delle Alpi orientali, rappresenta la maestosità e la regalità. Questa montagna domina tutto il paesaggio dolomitico con la sua presenza imponente. I membri di questa gilda sono leader naturali, nobili d\'animo e capaci di guidare gli altri verso grandi traguardi, proprio come la Marmolada guida lo sguardo di chi ammira le Dolomiti.',
    image: '/images/Marmolada.png',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'plan-de-corones',
    name: 'Plan de Corones',
    subtitle: 'Cima del Panorama Infinito',
    description: 'Guardiani degli orizzonti sconfinati e delle vedute mozzafiato',
    fullDescription: 'Il Plan de Corones, con i suoi 2.275 metri, è famoso per offrire uno dei panorami più spettacolari delle Alpi. Da questa vetta si possono ammirare oltre 400 cime alpine in un colpo d\'occhio, dalle Dolomiti alle Alpi Centrali. Questa montagna rappresenta la visione d\'insieme e la capacità di vedere il quadro completo. I membri di questa gilda sono visionari e strateghi, capaci di cogliere le connessioni tra le cose e di avere sempre una prospettiva ampia su ogni situazione.',
    image: '/images/Plan de Corones.png',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'croda-da-lago',
    name: 'Croda da Lago',
    subtitle: 'Cima dei Riflessi Dorati',
    description: 'Custodi dei laghi alpini e delle acque specchiate',
    fullDescription: 'La Croda da Lago, con i suoi 2.715 metri, domina il suggestivo Lago di Federa, creando uno dei paesaggi più romantici delle Dolomiti. Questa montagna è famosa per i suoi riflessi dorati che si specchiano nelle acque calme del lago sottostante, creando un\'atmosfera magica e contemplativa. I membri di questa gilda sono anime romantiche e riflessive, capaci di trovare bellezza nei dettagli e di creare momenti di pura poesia anche nelle situazioni più semplici.',
    image: '/images/Croda da Lago.png',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'cevedale',
    name: 'Cevedale',
    subtitle: 'Cima delle Nevi Eterne',
    description: 'Custodi delle nevi perenni e dei ghiacciai sacri',
    fullDescription: 'Il Monte Cevedale, con i suoi 3.769 metri, è una delle vette più alte del gruppo Ortles-Cevedale e rappresenta la purezza delle nevi eterne. Circondato da ghiacciai e caratterizzato da un ambiente alpino estremo, questo monte simboleggia la resistenza e la perseveranza. I membri di questa gilda sono custodi delle tradizioni più antiche, resistenti alle difficoltà e capaci di mantenere la loro purezza d\'intenti anche nelle condizioni più avverse, proprio come le nevi perenni che resistono al tempo.',
    image: '/images/Cevedale.png',
    color: 'from-blue-500 to-cyan-600'
  }
];