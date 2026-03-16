
export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  popular?: boolean;
};

export const categories = [
  "Appetizers",
  "Chef's Specials",
  "Poultry",
  "Beef & Lamb",
  "Seafood",
  "Vegetables",
  "Rice & Noodles"
];

export const menuItems: MenuItem[] = [
  {
    id: "1",
    name: "General Tso Chicken",
    description: "Tender chunks of chicken thigh, deep-fried to crisp perfection and tossed in our secret sweet and spicy imperial sauce.",
    price: 16.95,
    category: "Chef's Specials",
    imageUrl: "https://picsum.photos/seed/chicken/600/400",
    spiceLevel: 2,
    popular: true
  },
  {
    id: "2",
    name: "Crispy Spring Rolls",
    description: "Two golden-brown pastry rolls filled with shredded cabbage, carrots, and mushrooms. Served with sweet chili sauce.",
    price: 5.50,
    category: "Appetizers",
    imageUrl: "https://picsum.photos/seed/springrolls/600/400",
    spiceLevel: 0
  },
  {
    id: "3",
    name: "Imperial Dim Sum Platter",
    description: "A royal selection of crystal shrimp dumplings, pork siu mai, and vegetable buns.",
    price: 12.95,
    category: "Appetizers",
    imageUrl: "https://picsum.photos/seed/dimsum/600/400",
    spiceLevel: 0,
    popular: true
  },
  {
    id: "4",
    name: "Kung Pao Shrimp",
    description: "Jumbo shrimp sautéed with roasted peanuts, red chili peppers, and scallions in a tangy brown sauce.",
    price: 19.50,
    category: "Seafood",
    imageUrl: "https://picsum.photos/seed/kungpao/600/400",
    spiceLevel: 3
  },
  {
    id: "5",
    name: "Yangzhou Fried Rice",
    description: "Authentic wok-fried jasmine rice with BBQ pork, shrimp, egg, and fresh green peas.",
    price: 14.95,
    category: "Rice & Noodles",
    imageUrl: "https://picsum.photos/seed/friedrice/600/400",
    spiceLevel: 0,
    popular: true
  }
];
