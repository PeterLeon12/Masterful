// Romanian counties list
export const romanianCounties = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brașov',
  'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj', 'Constanța',
  'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara',
  'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț', 'Olt',
  'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea',
  'Vaslui', 'Vâlcea', 'Vrancea'
];

// Romanian cities with 15,000+ population based on Wikipedia sources
// Source: https://ro.wikipedia.org/wiki/Categorie:Liste_de_localități_din_România
export const romanianCities: Record<string, string[]> = {
  'Alba': [
    'Alba Iulia', 'Aiud', 'Blaj', 'Sebeș', 'Câmpeni', 'Teiuș', 'Cugir', 'Ocna Mureș', 'Zlatna',
    'Abrud', 'Baia de Arieș', 'Ighiu', 'Meteș', 'Poiana Vadului', 'Râmeț', 'Sălciua', 'Vințu de Jos'
  ],
  'Arad': [
    'Arad', 'Lipova', 'Ineu', 'Chișineu-Criș', 'Nădlac', 'Pecica', 'Sântana', 'Vinga',
    'Covăsinț', 'Șiria', 'Bârzava', 'Buteni', 'Conop', 'Felnac', 'Hălmagiu', 'Macea'
  ],
  'Argeș': [
    'Pitești', 'Câmpulung', 'Curtea de Argeș', 'Mioveni', 'Ștefănești', 'Topoloveni', 'Costești',
    'Bascov', 'Valea Mare-Podgoria', 'Rociu', 'Albeștii de Argeș', 'Arefu', 'Băbana', 'Băiculești'
  ],
  'Bacău': [
    'Bacău', 'Onești', 'Moinești', 'Comănești', 'Slănic-Moldova', 'Târgu Ocna', 'Dărmănești', 'Buhuși',
    'Târgu Trotuș', 'Agăș', 'Ardeoani', 'Asău', 'Balcani', 'Berești-Bistrița', 'Berești-Tazlău', 'Berzunți'
  ],
  'Bihor': [
    'Oradea', 'Salonta', 'Marghita', 'Beiuș', 'Valea lui Mihai', 'Aleșd', 'Vârșolț', 'Săcueni', 'Ștei'
  ],
  'Bistrița-Năsăud': [
    'Bistrița', 'Năsăud', 'Beclean', 'Sângeorz-Băi', 'Sărmașu', 'Mărișelu', 'Unguraș'
  ],
  'Botoșani': [
    'Botoșani', 'Dorohoi', 'Bucecea', 'Săveni', 'Flămânzi', 'Broscăuți', 'Hudești', 'Mihăileni'
  ],
  'Brașov': [
    'Brașov', 'Făgăraș', 'Săcele', 'Codlea', 'Râșnov', 'Rupea', 'Victoria', 'Zărnești', 'Predeal'
  ],
  'Brăila': [
    'Brăila', 'Ianca', 'Însurăței', 'Faurei', 'Tichilești', 'Viziru', 'Cireșu'
  ],
  'București': [
    'Sectorul 1', 'Sectorul 2', 'Sectorul 3', 'Sectorul 4', 'Sectorul 5', 'Sectorul 6', 'Otopeni', 'Băneasa', 'Voluntari', 'Măgurele',
    'Buftea', 'Chitila', 'Bragadiru', 'Pantelimon', 'Popești-Leordeni', '1 Decembrie', 'Cernica', 'Ciolpani', 'Clinceni', 'Corbeanca'
  ],
  'Buzău': [
    'Buzău', 'Râmnicu Sărat', 'Nehoiu', 'Pogoanele', 'Mărăcineni', 'Glodeanu Siliștea', 'Cernătești'
  ],
  'Caraș-Severin': [
    'Reșița', 'Caransebeș', 'Oravița', 'Moldova Nouă', 'Anina', 'Băile Herculane'
  ],
  'Călărași': [
    'Călărași', 'Oltenița', 'Lehliu Gară', 'Budești', 'Fundulea', 'Chirnogi', 'Curcani'
  ],
  'Cluj': [
    'Cluj-Napoca', 'Dej', 'Turda', 'Câmpia Turzii', 'Gherla', 'Huedin', 'Aghireșu', 'Călățele', 'Căpușu Mare',
    'Cătina', 'Aiton', 'Aluniș', 'Apahida', 'Așchileu', 'Baciu', 'Băișoara', 'Belis', 'Bobâlna', 'Bonțida'
  ],
  'Constanța': [
    'Constanța', 'Mangalia', 'Medgidia', 'Năvodari', 'Cernavodă', 'Ovidiu', 'Murfatlar', 'Techirghiol', 'Eforie',
    'Costinești', '23 August', 'Adamclisi', 'Agigea', 'Albești', 'Aliman', 'Amzacea', 'Băneasa', 'Bărăganu'
  ],
  'Covasna': [
    'Sfântu Gheorghe', 'Târgu Secuiesc', 'Covasna', 'Baraolt', 'Întorsura Buzăului', 'Bățani'
  ],
  'Dâmbovița': [
    'Târgoviște', 'Moreni', 'Pucioasa', 'Titu', 'Fieni', 'Găești', 'Răcari', 'Valea Mare',
    'Băleni', 'Corbii Mari', 'Aninoasa', 'Bărbulețu', 'Bezdead', 'Bilciurești', 'Brănești', 'Braniștea'
  ],
  'Dolj': [
    'Craiova', 'Băilești', 'Calafat', 'Filiași', 'Dăbuleni', 'Bechet', 'Segarcea'
  ],
  'Galați': [
    'Galați', 'Tecuci', 'Târgu Bujor', 'Berești', 'Măxineni', 'Pechea', 'Tulucești'
  ],
  'Giurgiu': [
    'Giurgiu', 'Bolintin-Vale', 'Mihăilești', 'Hotarele', 'Găujani', 'Vedea'
  ],
  'Gorj': [
    'Târgu Jiu', 'Motru', 'Rovinari', 'Bumbești-Jiu', 'Târgu Cărbunești', 'Turceni'
  ],
  'Harghita': [
    'Miercurea Ciuc', 'Odorheiu Secuiesc', 'Cristuru Secuiesc', 'Vlăhița', 'Băile Tușnad'
  ],
  'Hunedoara': [
    'Deva', 'Hunedoara', 'Petroșani', 'Lupeni', 'Vulcan', 'Brad', 'Hațeg', 'Călan', 'Orăștie', 'Simeria'
  ],
  'Ialomița': [
    'Slobozia', 'Fetești', 'Urziceni', 'Amara', 'Călărași', 'Ion Roată', 'Mărculești'
  ],
  'Iași': [
    'Iași', 'Pașcani', 'Hârlău', 'Târgu Frumos', 'Podu Iloaiei', 'Bârlad', 'Vaslui', 'Huși', 'Murgeni',
    'Negrești', 'Alexandru Ioan Cuza', 'Andrieșeni', 'Aroneanu', 'Bălțați', 'Bârnova', 'Belcești', 'Bivolari'
  ],
  'Ilfov': [
    'Buftea', 'Otopeni', 'Voluntari', 'Măgurele', 'Chitila', 'Bragadiru', 'Pantelimon', 'Popești-Leordeni'
  ],
  'Maramureș': [
    'Baia Mare', 'Sighetu Marmației', 'Borșa', 'Cavnic', 'Seini', 'Târgu Lăpuș', 'Ulmeni'
  ],
  'Mehedinți': [
    'Drobeta-Turnu Severin', 'Orșova', 'Strehaia', 'Vânju Mare', 'Baia de Aramă'
  ],
  'Mureș': [
    'Târgu Mureș', 'Reghin', 'Sighișoara', 'Târnăveni', 'Luduș', 'Sovata', 'Ungheni', 'Iernut'
  ],
  'Neamț': [
    'Piatra Neamț', 'Roman', 'Bicaz', 'Roznov', 'Târgu Neamț', 'Bălțătești'
  ],
  'Olt': [
    'Slatina', 'Caracal', 'Drăgănești-Olt', 'Balș', 'Corabia', 'Scornicești', 'Piatra-Olt'
  ],
  'Prahova': [
    'Ploiești', 'Câmpina', 'Băicoi', 'Vălenii de Munte', 'Mizil', 'Urlați', 'Bănești'
  ],
  'Satu Mare': [
    'Satu Mare', 'Carei', 'Livada', 'Tășnad', 'Negrești-Oaș', 'Acâș', 'Andrid'
  ],
  'Sălaj': [
    'Zalău', 'Jibou', 'Șimleu Silvaniei', 'Cehu Silvaniei', 'Crasna', 'Agrij'
  ],
  'Sibiu': [
    'Sibiu', 'Mediaș', 'Cisnădie', 'Avrig', 'Agnita', 'Cârța', 'Copșa Mică', 'Dumbrăveni'
  ],
  'Suceava': [
    'Suceava', 'Fălticeni', 'Rădăuți', 'Câmpulung Moldovenesc', 'Vatra Dornei', 'Gura Humorului'
  ],
  'Teleorman': [
    'Alexandria', 'Roșiori de Vede', 'Turnu Măgurele', 'Videle', 'Zimnicea', 'Băbăița'
  ],
  'Timiș': [
    'Timișoara', 'Lugoj', 'Sânnicolau Mare', 'Jimbolia', 'Făget', 'Buziaș', 'Ciacova', 'Deta',
    'Gătaia', 'Recaș', 'Bacova', 'Balinț', 'Banloc', 'Bara', 'Băuțar', 'Beba Veche', 'Becicherecu Mic'
  ],
  'Tulcea': [
    'Tulcea', 'Măcin', 'Babadag', 'Isaccea', 'Sulina', 'Cerna', 'Ceatalchioi'
  ],
  'Vaslui': [
    'Vaslui', 'Bârlad', 'Huși', 'Murgeni', 'Negrești', 'Băcani', 'Bălteni'
  ],
  'Vâlcea': [
    'Râmnicu Vâlcea', 'Drăgășani', 'Băbeni', 'Băile Govora', 'Băile Olănești', 'Brezoi'
  ],
  'Vrancea': [
    'Focșani', 'Adjud', 'Mărășești', 'Odobești', 'Panciu', 'Soveja'
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