export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
  color: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'assembly',
    name: 'Asamblare',
    icon: '🔧',
    description: 'Asamblare mobilă, electrocasnice și alte produse',
    subcategories: ['Mobilă IKEA', 'Electrocasnice', 'Jucării', 'Echipamente fitness', 'Altele'],
    color: '#3b82f6',
  },
  {
    id: 'mounting',
    name: 'Montare',
    icon: '📱',
    description: 'Montare TV, sisteme audio și echipamente electronice',
    subcategories: ['TV pe perete', 'Sisteme audio', 'Camere de supraveghere', 'Suporturi', 'Altele'],
    color: '#10b981',
  },
  {
    id: 'moving',
    name: 'Mutare',
    icon: '📦',
    description: 'Servicii de mutare și transport',
    subcategories: ['Mutare apartament', 'Mutare casă', 'Mutare birou', 'Transport mobilă', 'Altele'],
    color: '#f59e0b',
  },
  {
    id: 'cleaning',
    name: 'Curățenie',
    icon: '🧹',
    description: 'Servicii profesionale de curățenie',
    subcategories: ['Curățenie generală', 'După renovare', 'După mutare', 'Curățenie birouri', 'Altele'],
    color: '#8b5cf6',
  },
  {
    id: 'outdoor',
    name: 'Ajutor Exterior',
    icon: '🌳',
    description: 'Lucrări de grădinărit și întreținere exterioară',
    subcategories: ['Grădinărit', 'Tuns gazon', 'Curățare teren', 'Reparații învelitori', 'Altele'],
    color: '#06b6d4',
  },
  {
    id: 'repairs',
    name: 'Reparații Casă',
    icon: '🏠',
    description: 'Reparații și întreținere locuință',
    subcategories: ['Electricitate', 'Instalații sanitare', 'Tâmplărie', 'Zidărie', 'Altele'],
    color: '#ef4444',
  },
  {
    id: 'painting',
    name: 'Vopsire',
    icon: '🎨',
    description: 'Servicii de vopsire și finisaje',
    subcategories: ['Vopsire interior', 'Vopsire exterior', 'Vopsire mobilă', 'Finisaje decorative', 'Altele'],
    color: '#f97316',
  },
  {
    id: 'trending',
    name: 'Trending',
    icon: '🔥',
    description: 'Servicii populare și noi tendințe',
    subcategories: ['Renovări moderne', 'Smart Home', 'Soluții eco', 'Design interior', 'Altele'],
    color: '#ec4899',
  },
];

export const getServiceCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id);
};

export const getServiceCategoriesByIds = (ids: string[]): ServiceCategory[] => {
  return serviceCategories.filter(category => ids.includes(category.id));
};