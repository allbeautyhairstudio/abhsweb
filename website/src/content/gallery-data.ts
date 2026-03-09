export interface GalleryItem {
  id: string;
  title: string;
  category: 'tools' | 'workspace' | 'craft';
  description: string;
  altText: string;
  imageSrc: string;
}

export const galleryItems: GalleryItem[] = [
  // Placeholder photos — replace with Karli's actual work photos
  {
    id: 'tools-1',
    title: 'The Essentials',
    category: 'tools',
    description: 'Scissors and comb — the tools behind every intentional cut.',
    altText: 'Professional hair scissors alongside a green styling comb',
    imageSrc: 'https://images.unsplash.com/photo-1625038032200-648fbcd800d0?w=600&q=80',
  },
  {
    id: 'tools-2',
    title: 'Precision Shears',
    category: 'tools',
    description: 'Sharp, precise, and always ready.',
    altText: 'Stainless steel hair scissors and comb on a clean surface',
    imageSrc: 'https://images.unsplash.com/photo-1596362601603-b74f6ef166e4?w=600&q=80',
  },
  {
    id: 'tools-3',
    title: 'Paired Up',
    category: 'tools',
    description: 'Two pairs of professional shears — one for cutting, one for texturizing.',
    altText: 'Two black and gray professional hairdressing scissors',
    imageSrc: 'https://images.unsplash.com/photo-1567034899073-2232ce224d02?w=600&q=80',
  },
  {
    id: 'tools-4',
    title: 'Steel & Craft',
    category: 'tools',
    description: 'Quality tools are the foundation of quality work.',
    altText: 'Close-up of gray steel hairdressing scissors',
    imageSrc: 'https://images.unsplash.com/photo-1503792501406-2c40da09e1e2?w=600&q=80',
  },
  {
    id: 'craft-1',
    title: 'Ready to Work',
    category: 'craft',
    description: 'Everything in its place before the first client of the day.',
    altText: 'Hair brush and scissors arranged on a styling table',
    imageSrc: 'https://images.unsplash.com/photo-1678356163587-6bb3afb89679?w=600&q=80',
  },
  {
    id: 'craft-2',
    title: 'Tools of the Trade',
    category: 'craft',
    description: 'A collection of scissors and combs ready for the day.',
    altText: 'A group of professional scissors and combs',
    imageSrc: 'https://images.unsplash.com/photo-1656921350183-7935040cf7fb?w=600&q=80',
  },
  {
    id: 'craft-3',
    title: 'Natural Combs',
    category: 'craft',
    description: 'Wooden combs for gentle, intentional styling.',
    altText: 'Collection of wooden combs on a white surface',
    imageSrc: 'https://images.unsplash.com/photo-1634082983637-c1382c567945?w=600&q=80',
  },
  {
    id: 'craft-4',
    title: 'Pop of Color',
    category: 'craft',
    description: 'A bold pair of shears on a bright surface.',
    altText: 'Scissors sitting on a yellow surface',
    imageSrc: 'https://images.unsplash.com/photo-1677086714325-8e108ca6352c?w=600&q=80',
  },
  {
    id: 'workspace-1',
    title: 'The Chair',
    category: 'workspace',
    description: 'Where every transformation begins.',
    altText: 'Vintage barber shop interior with styling chairs',
    imageSrc: 'https://images.unsplash.com/photo-1758812818698-6ecd792a87da?w=600&q=80',
  },
  {
    id: 'workspace-2',
    title: 'Station Ready',
    category: 'workspace',
    description: 'Hairdressing tools and products on a styling trolley.',
    altText: 'Hairdressing tools and spray bottle on a salon trolley',
    imageSrc: 'https://images.unsplash.com/photo-1758887260983-c171388cf56f?w=600&q=80',
  },
  {
    id: 'workspace-3',
    title: 'Salon Vibes',
    category: 'workspace',
    description: 'The space where hair magic happens.',
    altText: 'Hair salon interior with chairs and warm lighting',
    imageSrc: 'https://images.unsplash.com/photo-1637777277337-f114350fb088?w=600&q=80',
  },
];

export const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'tools', label: 'Tools' },
  { id: 'craft', label: 'Craft' },
  { id: 'workspace', label: 'Workspace' },
] as const;
