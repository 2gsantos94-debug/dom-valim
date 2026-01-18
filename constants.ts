import { Service, ServiceType, Promotion } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Social',
    description: 'Corte clássico na tesoura ou máquina.',
    price: 35.00,
    durationMinutes: 45,
    type: ServiceType.HAIRCUT
  },
  {
    id: '2',
    name: 'Corte Degradê',
    description: 'Corte com disfarce navalhado ou na zero.',
    price: 45.00,
    durationMinutes: 45,
    type: ServiceType.HAIRCUT
  },
  {
    id: '3',
    name: 'Barba Modelada',
    description: 'Barba com toalha quente e alinhamento.',
    price: 30.00,
    durationMinutes: 30,
    type: ServiceType.BEARD
  },
  {
    id: '4',
    name: 'Combo Dom Vailm',
    description: 'Corte (qualquer estilo) + Barba completa.',
    price: 65.00,
    durationMinutes: 60,
    type: ServiceType.COMBO
  },
  {
    id: '5',
    name: 'Pezinho / Sobrancelha',
    description: 'Acabamento e limpeza.',
    price: 15.00,
    durationMinutes: 15,
    type: ServiceType.FINISHING
  }
];

export const BUSINESS_HOURS = {
  start: 9, // 09:00
  end: 19,  // 19:00
  intervalMinutes: 45 // Fixed slots for simplicity
};

export const PROMOTIONS: Promotion[] = [
  {
    id: 'p1',
    title: 'Terça do Barbeiro',
    description: 'Toda terça-feira, o corte social sai por apenas R$ 25,00.',
    validUntil: '2024-12-31',
    type: 'PROMO'
  },
  {
    id: 'n1',
    title: 'Nova Cerveja Artesanal',
    description: 'Chegou a nova IPA da casa. Venha degustar enquanto aguarda seu horário!',
    type: 'NEWS'
  },
  {
    id: 'p2',
    title: 'Indique um Amigo',
    description: 'Traga um amigo e ganhe 50% de desconto na barba.',
    validUntil: '2024-10-30',
    type: 'PROMO'
  }
];