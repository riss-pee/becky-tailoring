
import { Product, User } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Silk Evening Gown',
    description: 'A luxurious floor-length silk gown with delicate hand-stitched detailing at the waist.',
    price: 450,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800',
    stock: 3,
    category: 'Dress'
  },
  {
    id: '2',
    name: 'Tailored Linen Blazer',
    description: 'Lightweight Italian linen blazer, perfectly structured for both formal and casual settings.',
    price: 280,
    image: 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&q=80&w=800',
    stock: 12,
    category: 'Suit'
  },
  {
    id: '3',
    name: 'Velvet Gala Suit',
    description: 'Deep midnight blue velvet suit with satin lapels and customized internal pocketing.',
    price: 600,
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    stock: 1,
    category: 'Suit'
  }
];

export const MOCK_ADMIN: User = {
  id: 'admin-1',
  email: 'admin@elegance.com',
  name: 'Seamstress Elena',
  phone: '+1 234 567 8900',
  role: 'admin'
};
