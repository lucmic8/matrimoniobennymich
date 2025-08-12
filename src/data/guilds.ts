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
    id: 'puez',
    name: 'Puez',
    subtitle: 'Cima dei Custodi del Silenzio',
    description: 'Protettori della pace eterna delle alte cime',
    fullDescription: 'Il gruppo del Puez-Odle, con le sue vette che superano i 3.000 metri, rappresenta la solennità e il rispetto per la natura selvaggia. Queste montagne, caratterizzate da un paesaggio lunare e da un silenzio quasi sacro, sono il rifugio perfetto per chi cerca la pace interiore. I membri di questa gilda sono i guardiani della tranquillità e della meditazione, capaci di trovare forza nel silenzio e saggezza nella solitudine.',
    image: '/images/Puez.png',
    color: 'from-gray-500 to-slate-600'
  },
  {
    id: 'tre-cime',
    name: 'Tre Cime di Lavaredo',
    subtitle: 'Cima dei Tre Picchi',
    description: 'Valorosi difensori delle tre torri di pietra',
    fullDescription: 'Le Tre Cime di Lavaredo, con la Cima Grande che raggiunge i 2.999 metri, sono il simbolo più iconico delle Dolomiti. Queste tre torri di roccia, che si ergono come sentinelle contro il cielo, rappresentano la forza, il coraggio e l\'unità. I membri di questa gilda sono guerrieri valorosi che sanno che insieme possono superare qualsiasi sfida, proprio come le tre cime che da millenni resistono alle intemperie unite nella loro maestosità.',
    image: '/images/TreCimeLavaredo.png',
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
    image: '/images/PizBoe.png',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'monte-sole',
    name: 'Monte Sole',
    subtitle: 'Cima dei Guardiani del Sole',
    description: 'Portatori di luce e calore alle terre montane',
    fullDescription: 'Il Monte Sole, con i suoi 2.348 metri, è una montagna che vive di luce. Esposta al sole per la maggior parte della giornata, questa vetta è il simbolo dell\'energia positiva e della vitalità. Le sue pendici sono ricche di vita e i suoi panorami offrono sempre una prospettiva luminosa. I membri di questa gilda sono portatori di gioia e ottimismo, capaci di illuminare anche i giorni più bui con la loro energia contagiosa.',
    image: '/images/MonteSole.png',
    color: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'catinaccio',
    name: 'Catinaccio',
    subtitle: 'Cima delle Vette Rosate',
    description: 'Nobili cavalieri delle montagne infuocate',
    fullDescription: 'Il Catinaccio, con la sua vetta principale di 3.004 metri, è famoso in tutto il mondo per il fenomeno dell\'enrosadira, quando le sue pareti si tingono di un rosa intenso al tramonto. Secondo la leggenda, questo colore deriva dalle rose del giardino del Re Laurino. I membri di questa gilda sono nobili d\'animo, romantici e appassionati, capaci di vedere la bellezza in ogni momento e di trasformare la realtà in poesia.',
    image: '/images/Catinaccio.png',
    color: 'from-red-500 to-pink-600'
  },
  {
    id: 'sella',
    name: 'Sella',
    subtitle: 'Cima delle Rocce Erranti',
    description: 'Esploratori instancabili dei passi di montagna',
    fullDescription: 'Il gruppo del Sella, con le sue vette che superano i 3.000 metri, è caratterizzato da un altopiano roccioso unico al mondo. Attraversato da numerosi passi e sentieri, questo massiccio è il crocevia delle Dolomiti. I membri di questa gilda sono esploratori nati, sempre in movimento, curiosi di scoprire nuovi percorsi e di collegare mondi diversi. Sono i mediatori naturali, capaci di trovare sempre una via di comunicazione.',
    image: '/images/Sella.png',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'pejo',
    name: 'Pejo 3000',
    subtitle: 'Cima delle Nevi Eterne',
    description: 'Custodi delle nevi perenni e dei ghiacciai sacri',
    fullDescription: 'Il comprensorio del Pejo 3000, con vette che raggiungono i 3.000 metri nel gruppo dell\'Ortles-Cevedale, è il regno delle nevi eterne e dei ghiacciai. Questo ambiente estremo e puro rappresenta la resistenza e la perseveranza. I membri di questa gilda sono custodi delle tradizioni più antiche, resistenti alle difficoltà e capaci di mantenere la loro purezza d\'intenti anche nelle condizioni più avverse.',
    image: '/images/Pejo3000.png',
    color: 'from-blue-500 to-cyan-600'
  }
];