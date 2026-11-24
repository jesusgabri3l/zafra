export interface Flavor {
  id: string;
  name: string;
  liquid: string; // color del líquido en la botella
  cap: string; // fondo de la chapa
  capInk: string; // letras de la chapa
  capEdge: string; // borde dentado de la chapa
  note: string; // anotación a mano en C
}

export const FLAVORS: readonly Flavor[] = [
  { id: 'maracuya', name: 'Maracuyá', liquid: '#f2a21b', cap: '#ffc21a', capInk: '#2b0a1f', capEdge: '#c98f00', note: 'tierra caliente' },
  { id: 'mora', name: 'Mora', liquid: '#6e1030', cap: '#6e1030', capInk: '#fff3de', capEdge: '#e6b4c4', note: 'de clima frío' },
  { id: 'lulo', name: 'Lulo', liquid: '#b5c43a', cap: '#a9d13f', capInk: '#2b0a1f', capEdge: '#6f8f1c', note: 'de ladera' },
];

// Orden de la pista de C (MARACUYÁ -> MORA -> LULO): la botella del hero y de B es la primera, de maracuyá.
export const DEFAULT_ORDER_FLAVOR = FLAVORS.findIndex(({ id }) => id === 'maracuya'); // botella de D mientras nadie elige

export const BOTTLE_PRICE = 6500;
export const SIX_PACK_SIZE = 6;

export const formatPrice = (value: number) => `$${value.toLocaleString('es-CO')}`;
