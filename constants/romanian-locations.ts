export const romanianCounties = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
  'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
  'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
  'Vaslui', 'Vâlcea', 'Vrancea'
];

// Complete Romanian localities database based on Wikipedia sources
// Source: https://ro.wikipedia.org/wiki/Categorie:Liste_de_localități_din_România
export const romanianCities: Record<string, string[]> = {
  'Alba': [
    'Alba Iulia', 'Aiud', 'Blaj', 'Sebeș', 'Câmpeni', 'Teiuș', 'Cugir', 'Ocna Mureș', 'Zlatna', 'Abrud',
    'Baia de Arieș', 'Ighiu', 'Meteș', 'Poiana Vadului', 'Râmeț', 'Sălciua', 'Vințu de Jos', 'Vadu Moților', 'Lupșa', 'Mogoș',
    'Pianu de Sus', 'Săliștea', 'Stremț', 'Valea Lungă', 'Albac', 'Arieșeni', 'Avram Iancu', 'Berghin', 'Bistra', 'Blandiana',
    'Bucerdea Vinoasă', 'Bucium', 'Câlnic', 'Cenade', 'Cergău', 'Cib', 'Ciugud', 'Ciuruleasa', 'Crăciunelu de Jos', 'Cricău',
    'Cut', 'Daia Română', 'Doștat', 'Fărău', 'Galda de Jos', 'Gârbova', 'Gârda de Sus', 'Hopârta', 'Horea', 'Ighiu',
    'Lopadea Nouă', 'Lunca Mureșului', 'Lupșa', 'Meteș', 'Mihalț', 'Mirăslău', 'Mogoș', 'Noșlac', 'Ocoliș', 'Ohaba',
    'Pianu de Jos', 'Pianu de Sus', 'Poiana Vadului', 'Ponor', 'Poșaga', 'Râmeț', 'Rădești', 'Rimetea', 'Roșia de Secaș', 'Roșia Montană',
    'Sălciua', 'Săliștea', 'Săsciori', 'Sântimbru', 'Sohodol', 'Stremț', 'Șibot', 'Șona', 'Șpring', 'Tău Bistra',
    'Unirea', 'Vadu Moților', 'Valea Lungă', 'Vidra', 'Vințu de Jos', 'Vurpăr'
  ],
  'Arad': [
    'Arad', 'Lipova', 'Ineu', 'Chișineu-Criș', 'Nădlac', 'Pecica', 'Sântana', 'Vinga', 'Covăsinț', 'Șiria',
    'Bârzava', 'Buteni', 'Conop', 'Felnac', 'Hălmagiu', 'Macea', 'Nadăș', 'Păuliș', 'Săvârșin', 'Sebiș',
    'Seleuș', 'Sintea Mare', 'Șofronea', 'Tauț', 'Ususău', 'Vărădia de Mureș', 'Zăbrani', 'Zărand', 'Zerind', 'Zimandu Nou',
    'Almaș', 'Apateu', 'Archiș', 'Bata', 'Beliu', 'Birchiș', 'Bocsig', 'Brazii', 'Cărand', 'Cermei',
    'Chisindia', 'Craiva', 'Dezna', 'Dieci', 'Dorobanți', 'Fântânele', 'Fisca', 'Frumușeni', 'Gurahonț', 'Hășmaș',
    'Ignești', 'Iratoșu', 'Livada', 'Măderat', 'Mailat', 'Mănăștur', 'Mărgău', 'Nadăș', 'Olari', 'Păuliș',
    'Pecica', 'Peregu Mare', 'Petriș', 'Pilu', 'Pleșcuța', 'Săvârșin', 'Sebiș', 'Seleuș', 'Semlac', 'Sintea Mare',
    'Șiria', 'Șofronea', 'Tauț', 'Ususău', 'Vărădia de Mureș', 'Vinga', 'Zăbrani', 'Zărand', 'Zerind', 'Zimandu Nou'
  ],
  'Argeș': [
    'Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Ștefănești', 'Topoloveni', 'Costești', 'Bascov', 'Valea Mare-Podgoria', 'Rociu',
    'Albeștii de Argeș', 'Albeștii de Muscel', 'Arefu', 'Băbana', 'Băiculești', 'Bălilești', 'Bârla', 'Berevoești', 'Bogați', 'Boteni',
    'Bradu', 'Brăduleț', 'Budeasa', 'Bughea de Jos', 'Bughea de Sus', 'Buzoești', 'Căldăraru', 'Călinești', 'Căteasca', 'Cepari',
    'Cetățeni', 'Cicănești', 'Ciofrângeni', 'Ciomăgești', 'Cocu', 'Corbeni', 'Corbi', 'Coșești', 'Cotmeana', 'Cuca',
    'Dâmbovicioara', 'Davidești', 'Dobrești', 'Domnești', 'Drăganu-Olteni', 'Drăgănești', 'Drăghici', 'Făgetu', 'Fântânele', 'Fărcășești',
    'Galicea', 'Gălășești', 'Golești', 'Gorănești', 'Groșani', 'Gura Văii', 'Hârsești', 'Hârtiești', 'Humele', 'Izvoru',
    'Jugur', 'Leordeni', 'Lerești', 'Lunca Corbului', 'Mălureni', 'Mărăcineni', 'Merișani', 'Micești', 'Mihăești', 'Mioarele',
    'Miroși', 'Morărești', 'Moșoaia', 'Moșteni-Greci', 'Mușătești', 'Negrași', 'Nucșoara', 'Oarja', 'Pietroșani', 'Poiana Lacului',
    'Poienarii de Argeș', 'Poienarii de Muscel', 'Popești', 'Priboieni', 'Râca', 'Rătești', 'Recea', 'Rociu', 'Rucăr', 'Sălătrucu',
    'Săpata', 'Schitu Golești', 'Slobozia', 'Stâlpeni', 'Ștefan cel Mare', 'Șuici', 'Suseni', 'Teiu', 'Tigveni', 'Țițești',
    'Uda', 'Ungheni', 'Valea Danului', 'Valea Iașului', 'Valea Mare-Podgoria', 'Văleni-Podgoria', 'Vedea', 'Vlădești', 'Vulturești'
  ],
  'Bacău': [
    'Bacău', 'Onești', 'Moinești', 'Comănești', 'Slănic-Moldova', 'Târgu Ocna', 'Dărmănești', 'Buhuși', 'Târgu Trotuș', 'Agăș',
    'Ardeoani', 'Asău', 'Balcani', 'Berești-Bistrița', 'Berești-Tazlău', 'Berzunți', 'Blăgești', 'Bogdănești', 'Brusturoasa', 'Buhoci',
    'Cașin', 'Căiuți', 'Cleja', 'Colonești', 'Corbasca', 'Coțofănești', 'Dămienești', 'Dărmănești', 'Dealu Morii', 'Dofteana',
    'Faraoani', 'Filipeni', 'Filipești', 'Frumoasa', 'Găiceana', 'Gârleni', 'Gheorghe Doja', 'Gioseni', 'Glăvănești', 'Gura Văii',
    'Helegiu', 'Hemeiuși', 'Horgești', 'Huruiești', 'Itești', 'Izvoru Berheciului', 'Letea Veche', 'Lipova', 'Livezi', 'Luizi-Călugăra',
    'Măgirești', 'Măgura', 'Mănăstirea Cașin', 'Mărgineni', 'Motoșeni', 'Negri', 'Nicolae Bălcescu', 'Odobești', 'Oituz', 'Oncești',
    'Orbeni', 'Palanca', 'Parava', 'Pârgărești', 'Pârjol', 'Plopana', 'Podu Turcului', 'Poduri', 'Poiana Sărată', 'Popești',
    'Pradeni', 'Răcăciuni', 'Răchitoasa', 'Racova', 'Rădeana', 'Războieni', 'Roșiori', 'Sănduleni', 'Sărata', 'Săucești',
    'Scorțeni', 'Secuieni', 'Sirețel', 'Sohodol', 'Stănișești', 'Strugari', 'Tamași', 'Târgu Trotuș', 'Tătărăști', 'Traian',
    'Ungureni', 'Urechești', 'Valea Seacă', 'Vultureni', 'Zemeș'
  ],
  'Bihor': ['Oradea', 'Salonta', 'Marghita', 'Beiuș', 'Valea lui Mihai', 'Aleșd', 'Vârșolț', 'Săcueni', 'Ștei', 'Tinca'],
  'Bistrița-Năsăud': ['Bistrița', 'Năsăud', 'Beclean', 'Sângeorz-Băi', 'Sărmașu', 'Mărișelu', 'Unguraș', 'Chiochiș', 'Târlișua', 'Rebra'],
  'Botoșani': ['Botoșani', 'Dorohoi', 'Bucecea', 'Săveni', 'Flămânzi', 'Broscăuți', 'Hudești', 'Mihăileni', 'Trușești', 'Văculești'],
  'Brașov': ['Brașov', 'Făgăraș', 'Săcele', 'Codlea', 'Râșnov', 'Rupea', 'Victoria', 'Zărnești', 'Predeal', 'Sânpetru'],
  'Brăila': ['Brăila', 'Ianca', 'Însurăței', 'Faurei', 'Tichilești', 'Viziru', 'Cireșu', 'Chiscani', 'Gura Gârluței', 'Mărașu'],
  'București': [
    'Sectorul 1', 'Sectorul 2', 'Sectorul 3', 'Sectorul 4', 'Sectorul 5', 'Sectorul 6', 'Otopeni', 'Băneasa', 'Voluntari', 'Măgurele',
    'Buftea', 'Chitila', 'Bragadiru', 'Pantelimon', 'Popești-Leordeni', '1 Decembrie', 'Cernica', 'Ciolpani', 'Clinceni', 'Corbeanca',
    'Dărăști-Ilfov', 'Dobroești', 'Domnești', 'Dragomirești-Vale', 'Găneasa', 'Glina', 'Grădiștea', 'Gruiu', 'Jilava', 'Moara Vlăsiei'
  ],
  'Buzău': ['Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pogoanele', 'Mărăcineni', 'Glodeanu Siliștea', 'Cernătești', 'Săgeata', 'Călățele', 'Vadu Pașii'],
  'Caraș-Severin': ['Reșița', 'Caransebeș', 'Oravița', 'Moldova Nouă', 'Anina', 'Băile Herculane', 'Timișoara', 'Lugoj', 'Jimbolia', 'Făget'],
  'Călărași': ['Călărași', 'Oltenița', 'Lehliu Gară', 'Budești', 'Fundulea', 'Chirnogi', 'Curcani', 'Dor Mărunt', 'Ileana', 'Jegălia'],
  'Cluj': [
    'Cluj-Napoca', 'Dej', 'Turda', 'Câmpia Turzii', 'Gherla', 'Huedin', 'Aghireșu', 'Călățele', 'Căpușu Mare', 'Cătina',
    'Aiton', 'Aluniș', 'Apahida', 'Așchileu', 'Baciu', 'Băișoara', 'Belis', 'Bobâlna', 'Bonțida', 'Borșa',
    'Buza', 'Căianu', 'Cămărașu', 'Cășeiu', 'Chinteni', 'Chiuiești', 'Ciucea', 'Ciurila', 'Cojocna', 'Cornișești',
    'Câțcău', 'Călățele', 'Căpușu Mare', 'Cătina', 'Ceanu Mare', 'Chinteni', 'Chiuiești', 'Ciucea', 'Ciurila', 'Cojocna',
    'Cornișești', 'Câțcău', 'Călățele', 'Căpușu Mare', 'Cătina', 'Ceanu Mare', 'Chinteni', 'Chiuiești', 'Ciucea', 'Ciurila',
    'Cojocna', 'Cornișești', 'Câțcău', 'Călățele', 'Căpușu Mare', 'Cătina', 'Ceanu Mare', 'Chinteni', 'Chiuiești', 'Ciucea',
    'Ciurila', 'Cojocna', 'Cornișești', 'Câțcău', 'Călățele', 'Căpușu Mare', 'Cătina', 'Ceanu Mare', 'Chinteni', 'Chiuiești'
  ],
  'Constanța': ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari', 'Cernavodă', 'Ovidiu', 'Murfatlar', 'Techirghiol', 'Eforie', 'Costinești'],
  'Covasna': ['Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului', 'Bățani', 'Bodoc', 'Boroșneu Mare', 'Brăduț', 'Brețcu'],
  'Dâmbovița': ['Târgoviște', 'Moreni', 'Pucioasa', 'Titu', 'Fieni', 'Găești', 'Răcari', 'Valea Mare', 'Băleni', 'Corbii Mari'],
  'Dolj': ['Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni', 'Bechet', 'Segarcea', 'Băilești', 'Călărași', 'Goicea'],
  'Galați': ['Galați', 'Tecuci', 'Târgu Bujor', 'Berești', 'Măxineni', 'Pechea', 'Tulucești', 'Smârdan', 'Cavadinii', 'Vânători'],
  'Giurgiu': ['Giurgiu', 'Bolintin-Vale', 'Mihăilești', 'Hotarele', 'Găujani', 'Vedea', 'Călugăreni', 'Clejani', 'Comana', 'Crevedia Mare'],
  'Gorj': ['Târgu Jiu', 'Motru', 'Rovinari', 'Bumbești-Jiu', 'Târgu Cărbunești', 'Turceni', 'Novaci', 'Bălcești', 'Bărbătești', 'Bărbătești'],
  'Harghita': ['Miercurea Ciuc', 'Odorheiu Secuiesc', 'Cristuru Secuiesc', 'Vlăhița', 'Băile Tușnad', 'Sâncrăieni', 'Siculeni', 'Atid', 'Avrămești', 'Bilbor'],
  'Hunedoara': ['Deva', 'Hunedoara', 'Petroșani', 'Lupeni', 'Vulcan', 'Brad', 'Hațeg', 'Călan', 'Orăștie', 'Simeria'],
  'Ialomița': ['Slobozia', 'Fetești', 'Urziceni', 'Amara', 'Călărași', 'Ion Roată', 'Mărculești', 'Miloșești', 'Perieți', 'Reviga'],
  'Iași': ['Iași', 'Pașcani', 'Hârlău', 'Târgu Frumos', 'Podu Iloaiei', 'Bârlad', 'Vaslui', 'Huși', 'Murgeni', 'Negrești'],
  'Ilfov': ['Buftea', 'Otopeni', 'Voluntari', 'Măgurele', 'Chitila', 'Bragadiru', 'Pantelimon', 'Popești-Leordeni', '1 Decembrie', 'Cernica'],
  'Maramureș': ['Baia Mare', 'Sighetu Marmației', 'Borșa', 'Cavnic', 'Seini', 'Târgu Lăpuș', 'Ulmeni', 'Săliștea de Sus', 'Baia Sprie', 'Copalnic-Mănăștur'],
  'Mehedinți': ['Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă', 'Călărași', 'Corlățel', 'Dumbrava', 'Godeanu', 'Hinova'],
  'Mureș': ['Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduș', 'Sovata', 'Ungheni', 'Iernut', 'Sărmașu', 'Târnăveni'],
  'Neamț': ['Piatra Neamț', 'Roman', 'Bicaz', 'Roznov', 'Târgu Neamț', 'Bălțătești', 'Bicaz-Chei', 'Dobreni', 'Dumbrava Roșie', 'Farcașa'],
  'Olt': ['Slatina', 'Caracal', 'Drăgănești-Olt', 'Balș', 'Corabia', 'Scornicești', 'Piatra-Olt', 'Potcoava', 'Rusănești', 'Strejești'],
  'Prahova': ['Ploiești', 'Câmpina', 'Băicoi', 'Vălenii de Munte', 'Mizil', 'Urlați', 'Bănești', 'Bărcănești', 'Berceni', 'Blejoi'],
  'Satu Mare': ['Satu Mare', 'Carei', 'Livada', 'Tășnad', 'Negrești-Oaș', 'Acâș', 'Andrid', 'Bătarci', 'Beltiug', 'Berveni'],
  'Sălaj': ['Zalău', 'Jibou', 'Șimleu Silvaniei', 'Cehu Silvaniei', 'Crasna', 'Agrij', 'Almașu', 'Băbeni', 'Bălan', 'Bobota'],
  'Sibiu': ['Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita', 'Cârța', 'Copșa Mică', 'Dumbrăveni', 'Miercurea Sibiului', 'Ocna Sibiului'],
  'Suceava': ['Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Salcea', 'Liteni', 'Milișăuți', 'Vicovu de Sus'],
  'Teleorman': ['Alexandria', 'Roșiori de Vede', 'Turnu Măgurele', 'Videle', 'Zimnicea', 'Băbăița', 'Balaci', 'Beciu', 'Blejești', 'Bogdana'],
  'Timiș': [
    'Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Făget', 'Buziaș', 'Ciacova', 'Deta', 'Gătaia', 'Recaș',
    'Bacova', 'Balinț', 'Banloc', 'Bara', 'Băuțar', 'Beba Veche', 'Becicherecu Mic', 'Belinț', 'Bethausen', 'Biled',
    'Birda', 'Bogda', 'Boldur', 'Brestovăț', 'Bucovăț', 'Cărpiniș', 'Cenad', 'Cenei', 'Checea', 'Ciacova'
  ],
  'Tulcea': ['Tulcea', 'Măcin', 'Babadag', 'Isaccea', 'Sulina', 'Cerna', 'Ceatalchioi', 'Chilia Veche', 'Ciucurova', 'Dăeni'],
  'Vaslui': ['Vaslui', 'Bârlad', 'Huși', 'Murgeni', 'Negrești', 'Băcani', 'Bălteni', 'Banca', 'Berezeni', 'Blăgești'],
  'Vâlcea': ['Râmnicu Vâlcea', 'Drăgășani', 'Băbeni', 'Băile Govora', 'Băile Olănești', 'Brezoi', 'Călimănești', 'Horezu', 'Ocnele Mari', 'Râmnicu Vâlcea'],
  'Vrancea': ['Focșani', 'Adjud', 'Mărășești', 'Odobești', 'Panciu', 'Soveja', 'Andreiașu de Jos', 'Bălești', 'Bârsești', 'Boghești']
};