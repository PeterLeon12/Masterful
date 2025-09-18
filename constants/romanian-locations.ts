// Romanian counties list
export const romanianCounties = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
  'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
  'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
  'Vaslui', 'Vâlcea', 'Vrancea'
];

// Romanian cities with population data
// Source: Official Romanian census data
export const romanianCities: Record<string, string[]> = {
  'Alba': [
    'Alba Iulia', 'Sebeș', 'Aiud', 'Cugir', 'Blaj', 'Ocna Mureș', 'Zlatna', 'Câmpeni', 'Teiuș',
    'Ighiu', 'Meteș', 'Poiana Vadului', 'Râmeț', 'Sălciua', 'Vințu de Jos', 'Arieșeni', 'Avram Iancu',
    'Berghin', 'Blandiana', 'Bucerdea Grânoasă', 'Câlnic', 'Cenade', 'Cergău', 'Ciugud', 'Crăciunelu de Jos',
    'Daia Română', 'Doștat', 'Galda de Jos', 'Gârbova', 'Gârbovița', 'Hopârta', 'Horea', 'Ighiel',
    'Lancrăm', 'Lopadea Nouă', 'Lunca Mureșului', 'Lupșa', 'Mihalț', 'Mirăslău', 'Mogoș', 'Noșlac',
    'Ocoliș', 'Pâclișa', 'Poșaga', 'Rădești', 'Rimetea', 'Roșia de Secaș', 'Roșia Montană', 'Săliștea',
    'Săliștea de Sus', 'Sâncel', 'Sântimbru', 'Săsciori', 'Scărișoara', 'Șibot', 'Sohodol', 'Șona',
    'Stremț', 'Șugag', 'Unirea', 'Vadu Moților', 'Valea Lungă', 'Vurpăr'
  ],
  'Arad': [
    'Arad', 'Pecica', 'Sântana', 'Vladimirescu', 'Lipova', 'Ineu', 'Șiria', 'Chișineu-Criș', 'Curtici',
    'Nădlac', 'Pâncota', 'Vinga', 'Sebiș', 'Târnova', 'Macea', 'Secusigiu', 'Zimandu Nou', 'Șicula',
    'Zăbrani', 'Covăsinț', 'Bârzava', 'Buteni', 'Conop', 'Felnac', 'Hălmagiu', 'Almaș', 'Apateu',
    'Archiș', 'Bata', 'Beliu', 'Birchiș', 'Bocsig', 'Brazii', 'Cărand', 'Cermei', 'Chisindia',
    'Craiva', 'Dezna', 'Dieci', 'Dorobanți', 'Fiscu', 'Frumușeni', 'Ghioroc', 'Grăniceri', 'Gurahonț',
    'Hălmăgel', 'Hășmaș', 'Ignești', 'Iratoșu', 'Livada', 'Măderat', 'Mănăștur', 'Misca', 'Moneasa',
    'Olari', 'Păuliș', 'Peregu Mare', 'Petriș', 'Pilu', 'Pleșcuța', 'Săvârșin', 'Seleuș', 'Semlac',
    'Sintea Mare', 'Socodor', 'Șagu', 'Șeitin', 'Șepreuș', 'Șimand', 'Șiștarovăț', 'Șofronea', 'Tauț',
    'Ususău', 'Vărădia de Mureș', 'Zădăreni', 'Zerind'
  ],
  'Argeș': [
    'Pitești', 'Mioveni', 'Câmpulung', 'Curtea de Argeș', 'Ștefănești', 'Călinești', 'Costești', 'Topoloveni',
    'Bascov', 'Valea Mare-Podgoria', 'Rociu', 'Albeștii de Argeș', 'Arefu', 'Băbana', 'Băiculești', 'Bălilești',
    'Bărbuleți', 'Bezdead', 'Bilciurești', 'Bogați', 'Boteni', 'Brăduleț', 'Budeasa', 'Bughea de Jos',
    'Bughea de Sus', 'Buzoești', 'Căldăraru', 'Căteasca', 'Cepari', 'Cicănești', 'Ciofrângeni', 'Ciomăgești',
    'Cocu', 'Corbeni', 'Corbi', 'Coșești', 'Cotmeana', 'Cuca', 'Dâmbovicioara', 'Dârleni', 'Davidești',
    'Dobrești', 'Domnești', 'Drăganu', 'Dragoslavele', 'Godeni', 'Hârsești', 'Hârtiești', 'Izvoru',
    'Leordeni', 'Lerești', 'Lunca Corbului', 'Mălureni', 'Mărăcineni', 'Merișani', 'Micești', 'Mihăești',
    'Mioarele', 'Miroslăvești', 'Morărești', 'Moșoaia', 'Mozăceni', 'Mușătești', 'Negrași', 'Nucșoara',
    'Oarja', 'Pietroșani', 'Poiana Lacului', 'Poienarii de Argeș', 'Poienarii de Muscel', 'Poienarii Vechi',
    'Popești', 'Priboieni', 'Rociu', 'Rucăr', 'Sălciua', 'Săliștea', 'Săliștea de Sus', 'Sâncel',
    'Sântimbru', 'Săsciori', 'Scărișoara', 'Sebeș', 'Șibot', 'Sohodol', 'Șona', 'Stremț', 'Șugag',
    'Teiuș', 'Unirea', 'Vadu Moților', 'Valea Lungă', 'Vințu de Jos', 'Vurpăr', 'Bradu', 'Poiana Lacului',
    'Leordeni', 'Buzoești', 'Mihăești', 'Băiculești', 'Rucăr', 'Pietroșani', 'Moșoaia', 'Albeștii de Argeș',
    'Corbeni', 'Coșești', 'Mărăcineni', 'Bârla', 'Țițești', 'Stâlpeni', 'Schitu Golești', 'Bascov',
    'Bogați', 'Lerești', 'Slobozia', 'Merișani', 'Micești', 'Stoenești', 'Valea Mare-Podgoria', 'Bălilești'
  ],
  'Bacău': [
    'Bacău', 'Onești', 'Moinești', 'Comănești', 'Buhuși', 'Dărmănești', 'Târgu Ocna', 'Dofteana', 'Sascut',
    'Oituz', 'Mărgineni', 'Răcăciuni', 'Balcani', 'Nicolae Bălcescu', 'Blăgești', 'Poduri', 'Cleja', 'Asău',
    'Helegiu', 'Gârleni', 'Agăș', 'Letea Veche', 'Pârjol', 'Berești-Tazlău', 'Căiuți', 'Ghimeș-Făget',
    'Răchitoasa', 'Livezi', 'Târgu Trotuș', 'Corbasca', 'Săucești', 'Hemeiuș', 'Ștefan cel Mare', 'Mănăstirea Cașin',
    'Gura Văii', 'Berzunți', 'Podu Turcului', 'Horgești', 'Bârsănești', 'Stănișești', 'Pârgărești', 'Zemeș',
    'Filipești', 'Slănic-Moldova', 'Măgura', 'Buhoci', 'Berești-Bistrița', 'Berești-Tazlău', 'Ardeoani'
  ],
  'Bihor': [
    'Oradea', 'Salonta', 'Marghita', 'Săcueni', 'Beiuș', 'Aleșd', 'Valea lui Mihai', 'Sânmartin', 'Tinca',
    'Popești', 'Ștei', 'Tileagd', 'Diosig', 'Oșorhei', 'Dobrești', 'Nojorid', 'Bratca', 'Batăr', 'Sântandrei',
    'Ineu', 'Suplacu de Barcău', 'Sălard', 'Ciumeghiu', 'Buntești', 'Biharia', 'Tăuteu', 'Vadu Crișului',
    'Abram', 'Abrămuț', 'Aștileu', 'Aușeu', 'Avram Iancu', 'Balc', 'Boianu Mare', 'Borod', 'Borș', 'Brusturi',
    'Budureasa', 'Buduslău', 'Bulz', 'Căbești', 'Căpâlna', 'Cărpinet', 'Cefa', 'Ceica', 'Cetariu', 'Cherechiu',
    'Chișlaz', 'Ciuhoi', 'Criștioru de Jos', 'Curățele', 'Curtuișeni', 'Derna', 'Dobresti', 'Drăgănești',
    'Drăgești', 'Finiș', 'Gepiu', 'Girișu de Criș', 'Hidișelu de Sus', 'Holod', 'Husasău de Tinca', 'Lazuri de Beius',
    'Lăzăreni', 'Lugașu de Jos', 'Lunca', 'Mădăras', 'Măgești', 'Olcea', 'Paleu', 'Pietroasa', 'Pocola',
    'Pomezeu', 'Răbăgani', 'Remetea', 'Rieni', 'Roșia', 'Roșiori', 'Săcădat', 'Săvârșin', 'Sâmbăta',
    'Sânmartin', 'Sânnicolau Român', 'Sântion', 'Sârbi', 'Spinuș', 'Suplacu de Barcău', 'Tămășeu', 'Tărcaia',
    'Tarcea', 'Tașad', 'Telechiu', 'Uileacu de Beius', 'Vârciorog', 'Vașcău', 'Viișoara', 'Voivozi'
  ],
  'Bistrița-Năsăud': [
    'Bistrița', 'Beclean', 'Sângeorz-Băi', 'Năsăud', 'Feldru', 'Maieru', 'Telciu', 'Rodna', 'Tiha Bârgăului',
    'Lechința', 'Prundu Bârgăului', 'Teaca', 'Nimigea', 'Josenii Bârgăului', 'Dumitra', 'Rebrișoara', 'Livezile',
    'Sărmașu', 'Mărișelu', 'Unguraș'
  ],
  'Botoșani': [
    'Botoșani', 'Dorohoi', 'Flămânzi', 'Darabani', 'Vorona', 'Săveni', 'Mihai Eminescu', 'Ungureni', 'Corni',
    'Albești', 'Hudești', 'Frumușica', 'Ștefănești', 'Trușești', 'Tudora', 'Suharău', 'Bălușeni', 'Coțușca',
    'Curtești', 'Havârna', 'Vlădeni', 'Cristești', 'Răchiți', 'Lunca', 'Bucecea', 'Copălău', 'Vorniceni'
  ],
  'Brașov': [
    'Brașov', 'Săcele', 'Făgăraș', 'Zărnești', 'Codlea', 'Râșnov', 'Prejmer', 'Tărlungeni', 'Victoria',
    'Feldioara', 'Hărman', 'Rupea', 'Bran', 'Hoghiz', 'Moieciu', 'Sânpetru', 'Predeal', 'Ghimbav',
    'Dumbrăvița', 'Vulcan', 'Cristian', 'Hălchiu', 'Teliu', 'Budila'
  ],
  'Brăila': [
    'Brăila', 'Ianca', 'Însurăței', 'Viziru', 'Chiscani', 'Tufești', 'Șuțești', 'Vădeni', 'Movila Miresii'
  ],
  'București': [
    'Sectorul 1', 'Sectorul 2', 'Sectorul 3', 'Sectorul 4', 'Sectorul 5', 'Sectorul 6', 'Otopeni', 'Băneasa',
    'Voluntari', 'Măgurele', 'Buftea', 'Chitila', 'Bragadiru', 'Pantelimon', 'Popești-Leordeni', '1 Decembrie',
    'Cernica', 'Ciolpani', 'Clinceni', 'Corbeanca'
  ],
  'Buzău': [
    'Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Vadu Pașii', 'Vernești', 'Berca', 'Mărăcineni', 'Pătârlagele',
    'Pogoanele', 'Merei', 'Smeeni', 'Poșta Câlnău', 'Pârscov', 'Zărnești', 'Valea Râmnicului', 'Grebănu',
    'Cochirleanca', 'Săgeata', 'Costești', 'Râmnicelu', 'Tisău', 'Cislău', 'Calvini', 'Țintești',
    'Glodeanu Sărat', 'Beceni', 'Ziduri', 'Lopătari', 'Puiești', 'Gălbinași', 'Padina', 'Topliceni'
  ],
  'Caraș-Severin': [
    'Reșița', 'Caransebeș', 'Bocșa', 'Moldova Nouă', 'Oravița', 'Oțelu Roșu', 'Anina', 'Băile Herculane',
    'Mehadia'
  ],
  'Călărași': [
    'Călărași', 'Oltenița', 'Modelu', 'Dragalina', 'Borcea', 'Budești', 'Chirnogi', 'Fundulea', 'Dor Mărunt',
    'Lehliu Gară', 'Roseți', 'Frumușani', 'Curcani', 'Fundeni', 'Mânăstirea', 'Perișoru', 'Ulmeni', 'Grădiștea',
    'Spanțov', 'Radovanu', 'Vasilați', 'Mitreni', 'Ciocănești', 'Jegălia', 'Plătărești', 'Cuza Vodă'
  ],
  'Cluj': [
    'Cluj-Napoca', 'Turda', 'Dej', 'Florești', 'Câmpia Turzii', 'Gherla', 'Gilău', 'Apahida', 'Baciu',
    'Huedin', 'Aghireșu', 'Viișoara', 'Mihai Viteazu', 'Bonțida', 'Poieni', 'Cășeiu', 'Săvădisla', 'Jucu',
    'Luna', 'Iclod', 'Frata', 'Tritenii de Jos', 'Cojocna', 'Feleacu'
  ],
  'Constanța': [
    'Constanța', 'Medgidia', 'Mangalia', 'Năvodari', 'Cernavodă', 'Ovidiu', 'Valu lui Traian', 'Cumpăna',
    'Murfatlar', 'Mihail Kogălniceanu', 'Hârșova', 'Eforie', 'Lumina', 'Cobadin', 'Techirghiol', 'Agigea',
    'Tuzla', 'Limanu', 'Corbu', 'Castelu', 'Topraisar', '23 August', 'Băneasa', 'Poarta Albă', 'Negru Vodă',
    'Ostrov', 'Cogealac', 'Mircea Vodă', 'Nicolae Bălcescu', 'Eforie Nord', 'Eforie Sud'
  ],
  'Covasna': [
    'Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului', 'Zagon', 'Ghelința',
    'Brăduț', 'Zăbala', 'Sita Buzăului', 'Sânzieni', 'Vâlcele', 'Ozun', 'Bățani', 'Turia'
  ],
  'Dâmbovița': [
    'Târgoviște', 'Moreni', 'Pucioasa', 'Găești', 'Titu', 'Potlogi', 'Dragomirești', 'Răzvad', 'Băleni',
    'Corbii Mari', 'Cojasca', 'Crevedia', 'I.L. Caragiale', 'Fieni', 'Gura Ocniței', 'Voinești', 'Șotânga',
    'Cornești', 'Bucșani', 'Dragodana', 'Aninoasa', 'Tărtășești', 'Petrești', 'Lungulețu', 'Ciocănești',
    'Gura Șuții', 'Mătăsaru', 'Comișani', 'Văcărești', 'Moroeni', 'Tătărani', 'Odobești', 'Ludești',
    'Vulcana-Pandele', 'Mănești', 'Conțești', 'Niculești', 'Dărmănești', 'Valea Lungă', 'Bezdead',
    'Buciumeni', 'Doicești', 'Mogoșani', 'Uliești', 'Braniștea', 'Ulmi', 'Runcu', 'Ocnița', 'Glodeni',
    'Finta', 'Românești', 'Vișina', 'Sălcioara', 'Nucet', 'Iedera'
  ],
  'Dolj': [
    'Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni', 'Poiana Mare', 'Sadova', 'Segarcea', 'Moțăței',
    'Podari', 'Daneți', 'Călărași', 'Valea Stanciului', 'Amărăștii de Jos', 'Cetate', 'Ciupercenii Noi',
    'Ostroveni', 'Maglavit', 'Leu', 'Mârșani', 'Desa', 'Plenița', 'Șimnicu de Sus', 'Celaru', 'Brădești',
    'Argetoaia', 'Bistreț', 'Galicea Mare', 'Cerăt', 'Bucovăț'
  ],
  'Galați': [
    'Galați', 'Tecuci', 'Toflea', 'Matca', 'Pechea', 'Liești', 'Brăhășești', 'Ivești', 'Corod', 'Tulucești',
    'Munteni', 'Umbrărești', 'Cudalbi', 'Târgu Bujor', 'Ghidigeni', 'Cosmești', 'Fârțănești', 'Barcea',
    'Drăgușeni', 'Tudor Vladimirescu', 'Vânători', 'Smârdan', 'Frumușița', 'Piscu', 'Măstăcani', 'Independența',
    'Slobozia Conachi'
  ],
  'Giurgiu': [
    'Giurgiu', 'Bolintin-Vale', 'Florești-Stoenești', 'Roata de Jos', 'Mihăilești', 'Ulmi', 'Comana',
    'Adunații-Copăceni', 'Vărăști', 'Călugăreni', 'Ghimpați', 'Bolintin-Deal', 'Găiseni', 'Frătești',
    'Băneasa', 'Crevedia Mare', 'Vânătorii Mici', 'Ogrezeni', 'Mârșa', 'Prundu', 'Buturugeni'
  ],
  'Gorj': [
    'Târgu Jiu', 'Motru', 'Rovinari', 'Bumbești-Jiu', 'Târgu Cărbunești', 'Bălești', 'Turceni', 'Bâlteni',
    'Tismana', 'Plopșoru', 'Novaci', 'Runcu', 'Țânțăreni', 'Crasna', 'Mătăsari', 'Drăguțești', 'Scoarța',
    'Padeș', 'Țicleni', 'Turburea'
  ],
  'Harghita': [
    'Miercurea Ciuc', 'Odorheiu Secuiesc', 'Gheorgheni', 'Toplița', 'Cristuru Secuiesc', 'Vlăhița', 'Praid',
    'Remetea', 'Corund', 'Bălan', 'Sândominic', 'Zetea', 'Joseni', 'Ditrău', 'Lunca de Jos', 'Suseni',
    'Ciucsângeorgiu', 'Lupeni', 'Ciumani'
  ],
  'Hunedoara': [
    'Deva', 'Hunedoara', 'Petroșani', 'Vulcan', 'Lupeni', 'Petrila', 'Orăștie', 'Brad', 'Simeria', 'Călan',
    'Hațeg', 'Uricani', 'Geoagiu', 'Aninoasa', 'Pui'
  ],
  'Ialomița': [
    'Slobozia', 'Fetești', 'Urziceni', 'Țăndărei', 'Amara', 'Bărbulești', 'Făcăeni', 'Fierbinți-Târg',
    'Bordușani', 'Coșereni', 'Manasia', 'Gârbovi'
  ],
  'Iași': [
    'Iași', 'Pașcani', 'Holboca', 'Miroslava', 'Ciurea', 'Tomești', 'Hârlău', 'Belcești', 'Târgu Frumos',
    'Deleni', 'Podu Iloaiei', 'Scobinți', 'Popricani', 'Țibana', 'Cotnari', 'Răducăneni', 'Țibănești',
    'Voinești', 'Lețcani', 'Dancu', 'Lunca Cetățuii', 'Ruginoasa', 'Lungani', 'Bârnova', 'Hălăucești',
    'Valea Seacă', 'Erbiceni', 'Ion Neculce', 'Tătăruși', 'Șipote', 'Lespezi', 'Stolniceni-Prăjescu',
    'Mogoșești', 'Todirești', 'Valea Lupului', 'Bălțați', 'Moțca', 'Comarna', 'Dagâța', 'Rediu', 'Dumești',
    'Miroslovești', 'Mironeasa', 'Schitu Duca', 'Scânteia', 'Victoria', 'Costuleni', 'Bivolari', 'Andrieșeni',
    'Ungheni', 'Sinești', 'Sirețel', 'Popești', 'Țigănași'
  ],
  'Ilfov': [
    'Voluntari', 'Pantelimon', 'Buftea', 'Popești-Leordeni', 'Bragadiru', 'Chiajna', 'Chitila', 'Otopeni',
    'Jilava', 'Măgurele', 'Brănești', 'Vidra', 'Dobroești', 'Domnești', 'Glina', 'Balotești', 'Afumați',
    '1 Decembrie', 'Mogoșoaia', 'Periș', 'Gruiu', 'Corbeanca', 'Clinceni', 'Cornetu', 'Moara Vlăsiei',
    'Ciorogârla', 'Berceni', 'Ștefăneștii de Jos', 'Tunari', 'Găneasa', 'Ciolpani', 'Fundeni'
  ],
  'Maramureș': [
    'Baia Mare', 'Sighetu Marmației', 'Borșa', 'Baia Sprie', 'Vișeu de Sus', 'Târgu Lăpuș', 'Poienile de sub Munte',
    'Moisei', 'Seini', 'Șomcuta Mare', 'Ulmeni', 'Tăuții-Măgherăuș', 'Recea', 'Satulung', 'Copalnic-Mănăștur',
    'Ruscova', 'Șișești', 'Cavnic', 'Vișeu de Jos', 'Săliștea de Sus', 'Mireșu Mare', 'Repedea', 'Bârsana',
    'Dumbrăvița', 'Ieud', 'Bistra', 'Fărcașa'
  ],
  'Mehedinți': [
    'Drobeta-Turnu Severin', 'Strehaia', 'Orșova', 'Șimian', 'Corcova', 'Baia de Aramă', 'Vânju Mare', 'Jiana',
    'Bala'
  ],
  'Mureș': [
    'Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduș', 'Sovata', 'Sângeorgiu de Mureș', 'Iernut',
    'Sâncraiu de Mureș', 'Ungheni', 'Sărmașu', 'Band', 'Gurghiu', 'Pănet', 'Ceuașu de Câmpie', 'Ernei',
    'Cristești', 'Sântana de Mureș', 'Gornești', 'Miercurea Nirajului', 'Albești', 'Sângeorgiu de Pădure',
    'Adămuș', 'Hodac', 'Bălăușeri', 'Daneș', 'Acățari', 'Fântânele', 'Mica', 'Crăciunești', 'Ibănești',
    'Sânpaul', 'Deda'
  ],
  'Neamț': [
    'Piatra Neamț', 'Roman', 'Târgu Neamț', 'Săbăoani', 'Bicaz', 'Roznov', 'Pipirig', 'Răucești',
    'Vânători-Neamț', 'Doljești', 'Borlești', 'Dumbrava Roșie', 'Tămășeni', 'Cordun', 'Săvinești', 'Borca',
    'Horia', 'Piatra Șoimului', 'Petricani', 'Grumăzești', 'Ion Creangă', 'Botești', 'Zănești', 'Alexandru cel Bun',
    'Gherăești', 'Pângărați', 'Girov', 'Trifești', 'Bodești', 'Poiana Teiului', 'Gârcina', 'Rediu', 'Podoleni',
    'Bălțătești', 'Bicaz-Chei', 'Bicazu Ardelean'
  ],
  'Olt': [
    'Slatina', 'Caracal', 'Balș', 'Corabia', 'Scornicești', 'Drăgănești-Olt', 'Piatra-Olt', 'Potcoava',
    'Osica de Sus', 'Brastavățu', 'Izbiceni', 'Fărcașele', 'Tia Mare', 'Rusănești', 'Curtișoara', 'Mărunței',
    'Iancu Jianu', 'Fălcoiu'
  ],
  'Prahova': [
    'Ploiești', 'Câmpina', 'Băicoi', 'Breaza', 'Mizil', 'Comarnic', 'Vălenii de Munte', 'Boldești-Scăeni',
    'Valea Călugărească', 'Urlați', 'Sinaia', 'Bucov', 'Filipeștii de Pădure', 'Măneciu', 'Bărcănești',
    'Târgșoru Vechi', 'Bușteni', 'Puchenii Mari', 'Ariceștii Rahtivani', 'Blejoi', 'Brazi', 'Plopeni',
    'Filipeștii de Târg', 'Brebu', 'Florești', 'Ciorani', 'Vărbilău', 'Izvoarele', 'Berceni', 'Valea Doftanei',
    'Strejnicu', 'Slănic', 'Gura Vitioarei', 'Păulești', 'Măgureni', 'Albești-Paleologu', 'Scorțeni', 'Telega',
    'Sângeru', 'Lipănești', 'Râfov', 'Bănești', 'Gorgota', 'Drajna', 'Poienarii Burchii', 'Iordăcheanu',
    'Colceag', 'Drăgănești', 'Șirna', 'Podenii Noi', 'Măgurele', 'Poiana Câmpina', 'Ceptura', 'Cerașu',
    'Cornu', 'Dumbrava', 'Tomșani', 'Cioranii de Jos', 'Azuga'
  ],
  'Satu Mare': [
    'Satu Mare', 'Carei', 'Negrești-Oaș', 'Tășnad', 'Livada', 'Medieșu Aurit', 'Bixad', 'Ardud', 'Certeze',
    'Turț', 'Lazuri', 'Halmeu', 'Odoreu', 'Păulești', 'Călinești-Oaș', 'Vetiș', 'Moftin', 'Supur'
  ],
  'Sălaj': [
    'Zalău', 'Șimleu Silvaniei', 'Jibou', 'Cehu Silvaniei', 'Crasna', 'Sărmășag'
  ],
  'Sibiu': [
    'Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita', 'Dumbrăveni', 'Șelimbăr', 'Tălmaciu', 'Săliște',
    'Rășinari', 'Copșa Mică', 'Roșia', 'Șeica Mare', 'Miercurea Sibiului'
  ],
  'Suceava': [
    'Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului', 'Vicovu de Sus',
    'Dolhasca', 'Liteni', 'Șcheia', 'Salcea', 'Marginea', 'Siret', 'Udești', 'Dumbrăveni', 'Cajvana',
    'Preutești', 'Arbore', 'Bosanci', 'Cornu Luncii', 'Baia', 'Mălini', 'Verești', 'Zvoriștea', 'Vicovu de Jos',
    'Stulpicani', 'Frasin', 'Frătăuții Noi', 'Ipotești', 'Broșteni', 'Vama', 'Todirești', 'Dărmănești',
    'Horodnic de Sus', 'Straja', 'Râșca', 'Milișăuți', 'Moldovița', 'Volovăț', 'Păltinoasa', 'Fântânele',
    'Slatina', 'Boroaia', 'Pătrăuți', 'Forăști', 'Grănicești', 'Mitocu Dragomirnei', 'Frătăuții Vechi',
    'Voitinel', 'Moara', 'Vatra Moldoviței', 'Adâncata'
  ],
  'Teleorman': [
    'Alexandria', 'Roșiorii de Vede', 'Turnu Măgurele', 'Zimnicea', 'Videle', 'Orbeasca', 'Peretu', 'Plosca',
    'Botoroaga', 'Islaz', 'Dobrotești', 'Țigănești', 'Drăgănești-Vlașca', 'Poroschia', 'Măldăeni'
  ],
  'Timiș': [
    'Timișoara', 'Lugoj', 'Jimbolia', 'Sânnicolau Mare', 'Giroc', 'Recaș', 'Dumbrăvița', 'Săcălaz', 'Buziaș',
    'Făget', 'Giarmata', 'Deta', 'Moșnița Nouă', 'Ghiroda', 'Sânmihaiu Român', 'Gătaia', 'Sânandrei', 'Variaș',
    'Lenauheim', 'Peciu Nou', 'Satchinez', 'Comloșu Mare', 'Periam', 'Cărpiniș', 'Cenad', 'Dudeștii Vechi',
    'Orțișoara', 'Teremia Mare'
  ],
  'Tulcea': [
    'Tulcea', 'Babadag', 'Măcin', 'Sarichioi', 'Jijila', 'Greci', 'Isaccea', 'Baia', 'Topolog', 'Somova',
    'Niculițel', 'Luncavița', 'Jurilovca'
  ],
  'Vaslui': [
    'Bârlad', 'Vaslui', 'Huși', 'Zorleni', 'Negrești', 'Murgeni', 'Banca', 'Stănilești', 'Fălciu',
    'Dragomirești', 'Berezeni', 'Puiești', 'Ivănești', 'Duda-Epureni', 'Codăești', 'Băcești', 'Pădureni',
    'Vinderei', 'Văleni'
  ],
  'Vâlcea': [
    'Râmnicu Vâlcea', 'Drăgășani', 'Băbeni', 'Călimănești', 'Mihăești', 'Horezu', 'Brezoi', 'Budești',
    'Frâncești', 'Bălcești', 'Berbești', 'Bujoreni', 'Ionești', 'Alunu', 'Păușești-Măglași'
  ],
  'Vrancea': [
    'Focșani', 'Adjud', 'Mărășești', 'Odobești', 'Panciu', 'Slobozia Bradului', 'Homocea', 'Vidra', 'Vulturu',
    'Gugești', 'Păunești', 'Țifești', 'Vânători', 'Sihlea', 'Cotești', 'Măicănești', 'Dumitrești', 'Suraia',
    'Dumbrăveni', 'Bolotești', 'Jariștea', 'Nereju', 'Golești', 'Garoafa', 'Tătăranu'
  ]
};

// Helper function to search locations
export const searchLocations = (query: string, county?: string): Array<{county: string, city: string}> => {
  const results: Array<{county: string, city: string}> = [];
  const searchQuery = query.toLowerCase().trim();
  
  if (!searchQuery) return results;
  
  const countiesToSearch = county ? [county] : romanianCounties;
  
  countiesToSearch.forEach(countyName => {
    const cities = romanianCities[countyName] || [];
    cities.forEach(city => {
      if (city.toLowerCase().includes(searchQuery)) {
        results.push({ county: countyName, city });
      }
    });
  });
  
  return results;
};

// Helper function to get all locations for a county
export const getLocationsForCounty = (county: string): string[] => {
  return romanianCities[county] || [];
};

// Helper function to get all locations with county info
export const getAllLocations = (): Array<{county: string, city: string}> => {
  const allLocations: Array<{county: string, city: string}> = [];
  
  romanianCounties.forEach(county => {
    const cities = romanianCities[county] || [];
    cities.forEach(city => {
      allLocations.push({ county, city });
    });
  });
  
  return allLocations;
};
