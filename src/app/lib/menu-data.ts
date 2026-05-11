import { expandChoiceItems } from "@/app/lib/expand-choice-items";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  spiceLevel?: 0 | 1 | 2 | 3;
  popular?: boolean;
  /** Customization: e.g. "Chicken or Pork" → { label: "Choice", options: ["Chicken", "Pork"] } */
  variants?: {
    label: string;
    options: Array<string | { label: string; price?: number }>;
  }[];
};

export const categories = [
  "Lunch Combo",
  "Dinner Combo",
  "Appetizers",
  "Soup",
  "Fried Rice",
  "Lo Mein",
  "Chow Mai Fun",
  "Egg Foo Young",
  "Roast Pork",
  "Chicken",
  "Beef",
  "Seafood",
  "Vegetarian",
  "Sweet & Sour",
  "Moo Shu",
  "Diet Delight",
  "Chef's Specials",
];

const img = (seed: string) => `https://picsum.photos/seed/${seed}/600/400`;

const rawMenuItems: MenuItem[] = [
  // Lunch Combo (L1–L31) — Mon–Sat 11am–3pm, includes Roast Pork Fried Rice + Can Soda
  { id: "L1", name: "Chow Mein (Chicken or Pork)", description: "Stir-fried vegetables in a light savory sauce, served with crispy noodles.", price: 8.75, category: "Lunch Combo", imageUrl: img("chowmein-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L2", name: "Chow Mein (Shrimp or Beef)", description: "Stir-fried vegetables in a light savory sauce, served with crispy noodles.", price: 8.75, category: "Lunch Combo", imageUrl: img("chowmein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L3", name: "Sweet & Sour (Chicken or Pork)", description: "Crispy battered pieces tossed in our tangy sweet & sour sauce with pineapple and bell peppers.", price: 8.75, category: "Lunch Combo", imageUrl: img("sweet-sour-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L4", name: "Lo Mein (Shrimp or Beef)", description: "Soft egg noodles stir-fried with vegetables in a savory house sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("lomein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L5", name: "Shrimp w. Lobster Sauce", description: "Tender shrimp in a classic Cantonese-style garlic-ginger sauce with egg and green onions.", price: 8.75, category: "Lunch Combo", imageUrl: img("shrimp-lobster") },
  { id: "L6", name: "Chicken or Pork w. Broccoli", description: "Broccoli and your choice of protein stir-fried in a rich brown sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("cp-broccoli"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L7", name: "Shrimp or Beef w. Broccoli", description: "Broccoli and your choice of protein stir-fried in a rich brown sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("sb-broccoli"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L8", name: "Boneless Spare Ribs", description: "Juicy boneless ribs glazed in a sweet-savory barbecue-style sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("spare-ribs") },
  { id: "L9", name: "Pepper Steak w. Onions", description: "Sliced beef stir-fried with onions and bell peppers in a savory brown sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("pepper-steak") },
  { id: "L10", name: "Lo Mein (Roast Pork or Chicken)", description: "Soft egg noodles stir-fried with vegetables in a savory house sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("lomein-rpc"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }] },
  { id: "L11", name: "Diced Chicken & Shrimp", description: "Chicken and shrimp stir-fried with mixed vegetables in a savory house sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("chicken-shrimp") },
  { id: "L12", name: "Chinese Vegetable", description: "A colorful mix of fresh vegetables stir-fried in a light garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("chinese-veg") },
  { id: "L13", name: "Beef, Chicken or Fish", description: "Your choice of protein stir-fried with mixed vegetables in a savory brown sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("bcf"), variants: [{ label: "Choice", options: ["Beef", "Chicken", "Fish"] }] },
  { id: "L14", name: "Moo Goo Gai Pan", description: "Sliced chicken stir-fried with mushrooms and vegetables in a light white sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("moo-goo") },
  { id: "L15", name: "Sauteed Vegetable w. Tofu", description: "Fresh mixed vegetables stir-fried with tofu in a light savory sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("veg-tofu") },
  { id: "L16", name: "Broccoli w. Garlic Sauce", description: "Crisp broccoli stir-fried in our bold garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("broccoli-garlic") },
  { id: "L17", name: "Mixed Vegetable w. Garlic Sauce", description: "Mixed vegetables stir-fried in our bold garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("mixed-veg-garlic") },
  { id: "L18", name: "Chicken or Pork w. Garlic Sauce", description: "Your choice of protein and vegetables stir-fried in our bold garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("cp-garlic"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L19", name: "Beef or Shrimp w. Garlic Sauce", description: "Your choice of protein and vegetables stir-fried in our bold garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("bs-garlic"), variants: [{ label: "Choice", options: ["Beef", "Shrimp"] }] },
  { id: "L20", name: "Broccoli Tofu in Brown Sauce", description: "Tofu and broccoli stir-fried in a rich brown sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("broccoli-tofu") },
  { id: "L21", name: "Shrimp or Beef Egg Foo Young", description: "Fluffy pan-fried egg patties with vegetables, topped with savory gravy.", price: 8.75, category: "Lunch Combo", imageUrl: img("efy-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L22", name: "Chicken or Pork Egg Foo Young", description: "Fluffy pan-fried egg patties with vegetables, topped with savory gravy.", price: 8.75, category: "Lunch Combo", imageUrl: img("efy-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L23", name: "Kung Po Chicken", description: "Stir-fried chicken with peanuts and vegetables in a spicy-sweet Kung Po sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("kungpo-chicken"), spiceLevel: 2 },
  { id: "L24", name: "Crispy Chicken", description: "Lightly breaded chicken fried until crispy, tossed in a savory house sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("crispy-chicken") },
  { id: "L25", name: "General Tso's Chicken", description: "Crispy chicken tossed in a sweet, tangy, and spicy General Tso’s sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "L26", name: "Sesame Chicken", description: "Crispy chicken coated in a sweet sesame glaze and toasted sesame seeds.", price: 8.75, category: "Lunch Combo", imageUrl: img("sesame-chicken"), popular: true },
  { id: "L27", name: "Crabmeat & Shrimp w. Garlic Sauce", description: "Shrimp and crabmeat stir-fried with vegetables in our bold garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("crab-shrimp-garlic") },
  { id: "L28", name: "Hunan Style (Chicken or Pork)", description: "Your choice of protein stir-fried with vegetables in a spicy Hunan sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-cp"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L29", name: "Hunan Style (Shrimp or Beef)", description: "Your choice of protein stir-fried with vegetables in a spicy Hunan sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-sb"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L30", name: "Hunan Beef", description: "Sliced beef stir-fried with vegetables in a spicy Hunan sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-beef"), spiceLevel: 2 },
  { id: "L31", name: "Double Sauteed Pork", description: "Sliced pork stir-fried with cabbage and onions in a spicy garlic sauce.", price: 8.75, category: "Lunch Combo", imageUrl: img("double-pork"), spiceLevel: 2 },

  // Dinner Combo (D1–D31) — includes Roast Pork Fried Rice + Can Soda
  { id: "D1", name: "Chow Mein (Chicken or Pork)", description: "Stir-fried vegetables in a light savory sauce, served with crispy noodles.", price: 10.75, category: "Dinner Combo", imageUrl: img("chowmein-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D2", name: "Chow Mein (Shrimp or Beef)", description: "Stir-fried vegetables in a light savory sauce, served with crispy noodles.", price: 10.75, category: "Dinner Combo", imageUrl: img("chowmein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D3", name: "Sweet & Sour (Chicken or Pork)", description: "Crispy battered pieces tossed in our tangy sweet & sour sauce with pineapple and bell peppers.", price: 10.75, category: "Dinner Combo", imageUrl: img("sweet-sour-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D4", name: "Lo Mein (Shrimp or Beef)", description: "Soft egg noodles stir-fried with vegetables in a savory house sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("lomein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D5", name: "Shrimp w. Lobster Sauce", description: "Tender shrimp in a classic Cantonese-style garlic-ginger sauce with egg and green onions.", price: 10.75, category: "Dinner Combo", imageUrl: img("shrimp-lobster") },
  { id: "D6", name: "Chicken or Pork w. Broccoli", description: "Broccoli and your choice of protein stir-fried in a rich brown sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("cp-broccoli"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D7", name: "Shrimp or Beef w. Broccoli", description: "Broccoli and your choice of protein stir-fried in a rich brown sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("sb-broccoli"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D8", name: "Boneless Spare Ribs", description: "Juicy boneless ribs glazed in a sweet-savory barbecue-style sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("spare-ribs") },
  { id: "D9", name: "Pepper Steak w. Onions", description: "Sliced beef stir-fried with onions and bell peppers in a savory brown sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("pepper-steak") },
  { id: "D10", name: "Lo Mein (Roast Pork or Chicken)", description: "Soft egg noodles stir-fried with vegetables in a savory house sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("lomein-rpc"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }] },
  { id: "D11", name: "Diced Chicken & Shrimp", description: "Chicken and shrimp stir-fried with mixed vegetables in a savory house sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("chicken-shrimp") },
  { id: "D12", name: "Chinese Vegetable", description: "A colorful mix of fresh vegetables stir-fried in a light garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("chinese-veg") },
  { id: "D13", name: "Beef, Chicken or Fish", description: "Your choice of protein stir-fried with mixed vegetables in a savory brown sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("bcf"), variants: [{ label: "Choice", options: ["Beef", "Chicken", "Fish"] }] },
  { id: "D14", name: "Moo Goo Gai Pan", description: "Sliced chicken stir-fried with mushrooms and vegetables in a light white sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("moo-goo") },
  { id: "D15", name: "Sauteed Vegetable w. Tofu", description: "Fresh mixed vegetables stir-fried with tofu in a light savory sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("veg-tofu") },
  { id: "D16", name: "Broccoli w. Garlic Sauce", description: "Crisp broccoli stir-fried in our bold garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("broccoli-garlic") },
  { id: "D17", name: "Mixed Vegetable w. Garlic Sauce", description: "Mixed vegetables stir-fried in our bold garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("mixed-veg-garlic") },
  { id: "D18", name: "Chicken or Pork w. Garlic Sauce", description: "Your choice of protein and vegetables stir-fried in our bold garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("cp-garlic"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D19", name: "Beef or Shrimp w. Garlic Sauce", description: "Your choice of protein and vegetables stir-fried in our bold garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("bs-garlic"), variants: [{ label: "Choice", options: ["Beef", "Shrimp"] }] },
  { id: "D20", name: "Broccoli Tofu in Brown Sauce", description: "Tofu and broccoli stir-fried in a rich brown sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("broccoli-tofu") },
  { id: "D21", name: "Shrimp or Beef Egg Foo Young", description: "Fluffy pan-fried egg patties with vegetables, topped with savory gravy.", price: 10.75, category: "Dinner Combo", imageUrl: img("efy-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D22", name: "Chicken or Pork Egg Foo Young", description: "Fluffy pan-fried egg patties with vegetables, topped with savory gravy.", price: 10.75, category: "Dinner Combo", imageUrl: img("efy-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D23", name: "Kung Po Chicken", description: "Stir-fried chicken with peanuts and vegetables in a spicy-sweet Kung Po sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("kungpo-chicken"), spiceLevel: 2 },
  { id: "D24", name: "Crispy Chicken", description: "Lightly breaded chicken fried until crispy, tossed in a savory house sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("crispy-chicken") },
  { id: "D25", name: "General Tso's Chicken", description: "Crispy chicken tossed in a sweet, tangy, and spicy General Tso’s sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "D26", name: "Sesame Chicken", description: "Crispy chicken coated in a sweet sesame glaze and toasted sesame seeds.", price: 10.75, category: "Dinner Combo", imageUrl: img("sesame-chicken"), popular: true },
  { id: "D27", name: "Crabmeat & Shrimp w. Garlic Sauce", description: "Shrimp and crabmeat stir-fried with vegetables in our bold garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("crab-shrimp-garlic") },
  { id: "D28", name: "Hunan Style (Chicken or Pork)", description: "Your choice of protein stir-fried with vegetables in a spicy Hunan sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-cp"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D29", name: "Hunan Style (Shrimp or Beef)", description: "Your choice of protein stir-fried with vegetables in a spicy Hunan sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-sb"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D30", name: "Hunan Beef", description: "Sliced beef stir-fried with vegetables in a spicy Hunan sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-beef"), spiceLevel: 2 },
  { id: "D31", name: "Double Sauteed Pork", description: "Sliced pork stir-fried with cabbage and onions in a spicy garlic sauce.", price: 10.75, category: "Dinner Combo", imageUrl: img("double-pork"), spiceLevel: 2 },

  // Appetizers
  { id: "A1", name: "Fried Chicken Wings (4)", description: "Four crispy fried wings, seasoned and cooked until golden.", price: 7.75, category: "Appetizers", imageUrl: img("wings") },
  { id: "A2", name: "Fried Scallop (10)", description: "Lightly battered scallops fried crisp and served hot.", price: 8.25, category: "Appetizers", imageUrl: img("scallop") },
  { id: "A3", name: "Fried Baby Shrimp (15)", description: "Bite-size shrimp lightly battered and fried until crispy.", price: 7.25, category: "Appetizers", imageUrl: img("baby-shrimp") },
  { id: "A4", name: "Roast Pork Egg Roll (1)", description: "A crunchy egg roll stuffed with roast pork and vegetables.", price: 1.9, category: "Appetizers", imageUrl: img("egg-roll") },
  { id: "A5", name: "Shrimp Roll", description: "A crispy roll filled with shrimp and vegetables.", price: 2.25, category: "Appetizers", imageUrl: img("shrimp-roll") },
  { id: "A6", name: "Fried or Steamed Meat Dumplings (8)", description: "Pork dumplings filled with seasoned meat and vegetables, fried or steamed.", price: 8.5, category: "Appetizers", imageUrl: img("meat-dumplings"), variants: [{ label: "Style", options: ["Fried", "Steamed"] }] },
  { id: "A7", name: "Fried or Steamed Chicken Dumplings (8)", description: "Chicken dumplings with a savory filling, fried or steamed.", price: 8.5, category: "Appetizers", imageUrl: img("chicken-dumplings"), variants: [{ label: "Style", options: ["Fried", "Steamed"] }] },
  { id: "A8", name: "Pu Pu Platter", description: "A shareable sampler of our favorite appetizers, served family-style.", price: 13.45, category: "Appetizers", imageUrl: img("pupu"), popular: true },
  { id: "A9", name: "Fried Wonton (10)", description: "Crispy fried wontons filled with seasoned pork.", price: 7.45, category: "Appetizers", imageUrl: img("fried-mei") },
  { id: "A10", name: "Teriyaki Chicken (4 sticks)", description: "Chicken skewers brushed with teriyaki glaze and lightly charred.", price: 6.99, category: "Appetizers", imageUrl: img("teriyaki") },
  { id: "A11", name: "Crab Rangoon (8)", description: "Crispy wontons filled with creamy crab and cream cheese.", price: 6.99, category: "Appetizers", imageUrl: img("crab-rangoon") },
  { id: "A12", name: "Fried Chicken Nuggets (10)", description: "Tender chicken bites fried until golden and crunchy.", price: 5.55, category: "Appetizers", imageUrl: img("nuggets") },
  { id: "A13", name: "Spring Ribs (Small)", description: "Tender ribs glazed in a sweet-savory sauce and served hot.", price: 9.25, category: "Appetizers", imageUrl: img("spring-ribs-sm") },
  { id: "A14", name: "Spring Ribs (Large)", description: "A larger portion of tender ribs glazed in a sweet-savory sauce.", price: 13.95, category: "Appetizers", imageUrl: img("spring-ribs-lg") },
  { id: "A15", name: "Shrimp Toast (4)", description: "Toasted bread topped with a savory shrimp spread and fried crisp.", price: 6.25, category: "Appetizers", imageUrl: img("shrimp-toast") },
  { id: "A16", name: "Chinese Donuts (10)", description: "Warm, lightly sweet fried dough—great dipped in soup or honey.", price: 5.99, category: "Appetizers", imageUrl: img("donuts") },
  { id: "A17", name: "French Fries", description: "Crispy, salted fries served hot.", price: 4.25, category: "Appetizers", imageUrl: img("fries") },
  { id: "A18", name: "Special Wonton (Lemon Pepper/Bar-B-Q/Honey/Buffalo/Garlic)", description: "Crispy wontons tossed in your choice of seasoned sauce.", price: 8.99, category: "Appetizers", imageUrl: img("special-wonton"), variants: [{ label: "Sauce", options: ["Lemon Pepper", "Bar-B-Q", "Honey", "Buffalo", "Garlic"] }] },

  // Soup
  { id: "S14", name: "Wonton Soup", description: "Delicate pork wontons in a clear, savory broth with green onion.", price: 6.15, category: "Soup", imageUrl: img("wonton-soup"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.15 }, { label: "Large", price: 6.15 }] }] },
  { id: "S15", name: "Wonton & Egg Drop Mixed", description: "A comforting combo soup with pork wontons and silky egg ribbons.", price: 6.5, category: "Soup", imageUrl: img("wonton-egg"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.5 }, { label: "Large", price: 6.5 }] }] },
  { id: "S16", name: "Vegetable w. Bean Curd Soup", description: "Mixed vegetables and tofu simmered in a light, savory broth.", price: 6.5, category: "Soup", imageUrl: img("veg-tofu-soup"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.45 }, { label: "Large", price: 6.5 }] }] },
  { id: "S17", name: "Egg Drop Soup", description: "Classic soup with fluffy egg ribbons in a seasoned chicken broth.", price: 5.5, category: "Soup", imageUrl: img("egg-drop"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.0 }, { label: "Large", price: 5.5 }] }] },
  { id: "S18", name: "Wonton Soup (w. Fried Noodles)", description: "Wonton soup served with crispy fried noodles for dipping.", price: 5.5, category: "Soup", imageUrl: img("wonton-noodles"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.15 }, { label: "Large", price: 5.5 }] }] },
  { id: "S19", name: "Hot & Sour Soup / Rice Soup", description: "A bold, tangy, and spicy soup with tofu, vegetables, and savory seasonings.", price: 6.25, category: "Soup", imageUrl: img("hot-sour"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 4.4 }, { label: "Large", price: 6.25 }] }] },
  { id: "S20", name: "Seafood Soup", description: "A hearty soup with seafood and vegetables in a rich, savory broth.", price: 8.49, category: "Soup", imageUrl: img("seafood-soup") },

  // Fried Rice
  { id: "FR1", name: "Vegetable Fried Rice", description: "Wok-fried rice tossed with mixed vegetables and savory seasoning.", price: 7.25, category: "Fried Rice", imageUrl: img("veg-fried-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.0 }, { label: "Large", price: 7.25 }] }] },
  { id: "FR2", name: "White Rice", description: "Steamed white rice—simple, fluffy, and perfect with any entrée.", price: 7.75, category: "Fried Rice", imageUrl: img("white-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 5.1 }, { label: "Large", price: 7.75 }] }] },
  { id: "FR3", name: "Plain Fried Rice", description: "Classic wok-fried rice with egg and savory house seasoning.", price: 8.25, category: "Fried Rice", imageUrl: img("plain-fried-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 5.55 }, { label: "Large", price: 8.25 }] }] },
  { id: "FR4", name: "Roast Pork or Chicken Fried Rice", description: "Wok-fried rice with egg, onions, and your choice of roast pork or chicken.", price: 10.25, category: "Fried Rice", imageUrl: img("rp-chicken-fr"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 6.5 }, { label: "Large", price: 10.25 }] }] },
  { id: "FR5", name: "Shrimp or Beef Fried Rice", description: "Wok-fried rice with egg, onions, and your choice of shrimp or beef.", price: 10.25, category: "Fried Rice", imageUrl: img("shrimp-beef-fr"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 6.95 }, { label: "Large", price: 10.25 }] }] },
  { id: "FR6", name: "House Special Fried Rice (Shrimp, Chicken, Pork)", description: "Our signature fried rice loaded with shrimp, chicken, roast pork, egg, and vegetables.", price: 11.45, category: "Fried Rice", imageUrl: img("house-special-fr"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.55 }, { label: "Large", price: 11.45 }] }] },
  { id: "FR7", name: "House Special w. White Rice & Fried Noodles", description: "A hearty house special entrée served with steamed white rice and crispy fried noodles.", price: 11.5, category: "Fried Rice", imageUrl: img("house-special-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.75 }, { label: "Large", price: 11.5 }] }] },

  // Lo Mein
  { id: "LM1", name: "Shrimp or Beef (Lo Mein)", description: "Soft egg noodles stir-fried with vegetables and your choice of shrimp or beef.", price: 10.5, category: "Lo Mein", imageUrl: img("lm-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 7.2 }, { label: "Large", price: 10.5 }] }] },
  { id: "LM2", name: "House Special Lo Mein (Shrimp, Chicken, Pork)", description: "Lo mein noodles stir-fried with shrimp, chicken, roast pork, and mixed vegetables.", price: 11, category: "Lo Mein", imageUrl: img("lm-house"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.3 }, { label: "Large", price: 11.0 }] }] },
  { id: "LM3", name: "Vegetable Lo Mein", description: "Soft egg noodles stir-fried with a colorful mix of fresh vegetables.", price: 9.75, category: "Lo Mein", imageUrl: img("lm-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 6.75 }, { label: "Large", price: 9.75 }] }] },
  { id: "LM4", name: "Roast Pork or Chicken Lo Mein", description: "Soft egg noodles stir-fried with vegetables and your choice of roast pork or chicken.", price: 10.5, category: "Lo Mein", imageUrl: img("lm-rp-chicken"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.25 }, { label: "Large", price: 10.5 }] }] },
  { id: "LM5", name: "Shrimp or Beef Lo Mein", description: "Soft egg noodles stir-fried with vegetables and your choice of shrimp or beef.", price: 11.5, category: "Lo Mein", imageUrl: img("lm-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 7.75 }, { label: "Large", price: 11.5 }] }] },
  { id: "LM6", name: "House Special Lo Mein w. Rice & Noodles", description: "Our house lo mein loaded with shrimp, chicken, and pork, served with rice and crispy noodles.", price: 11.55, category: "Lo Mein", imageUrl: img("lm-house-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.25 }, { label: "Large", price: 11.55 }] }] },

  // Chow Mai Fun
  { id: "CMF1", name: "Pork or Chicken Chow Mai Fun (w. White Rice)", description: "Rice vermicelli stir-fried with vegetables and your choice of pork or chicken.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-pork-chicken"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 9.5 }] }] },
  { id: "CMF2", name: "Shrimp or Beef Chow Mai Fun (w. White Rice)", description: "Rice vermicelli stir-fried with vegetables and your choice of shrimp or beef.", price: 10.5, category: "Chow Mai Fun", imageUrl: img("cmf-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 8.75 }, { label: "Large", price: 10.5 }] }] },
  { id: "CMF3", name: "Pork or Chicken Chow Mai Fun (Fried Rice)", description: "Rice vermicelli stir-fried with vegetables and your choice of pork or chicken.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-pc-fr"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 9.5 }] }] },
  { id: "CMF4", name: "Shrimp or Beef Chow Mai Fun (Fried Rice)", description: "Rice vermicelli stir-fried with vegetables and your choice of shrimp or beef.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-sb-fr"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 8.75 }, { label: "Large", price: 9.5 }] }] },

  // Egg Foo Young (with white rice)
  { id: "EFY1", name: "Vegetable Egg Foo Young", description: "Fluffy pan-fried egg patties with vegetables, topped with savory brown gravy.", price: 8.5, category: "Egg Foo Young", imageUrl: img("efy-veg") },
  { id: "EFY2", name: "Pork or Chicken Egg Foo Young", description: "Pan-fried egg patties with your choice of protein and vegetables, topped with savory gravy.", price: 9.5, category: "Egg Foo Young", imageUrl: img("efy-pork-chicken"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }] },
  { id: "EFY3", name: "Shrimp or Beef Egg Foo Young", description: "Pan-fried egg patties with your choice of shrimp or beef, topped with savory gravy.", price: 9.95, category: "Egg Foo Young", imageUrl: img("efy-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "EFY4", name: "House Special Egg Foo Young (Shrimp, Chicken, Pork)", description: "Our house egg foo young with shrimp, chicken, and pork, finished with savory brown gravy.", price: 11.7, category: "Egg Foo Young", imageUrl: img("efy-house"), variants: [{ label: "Size", options: [{ label: "Small", price: 10.9 }, { label: "Large", price: 11.7 }] }] },

  // Roast Pork (with white rice)
  { id: "RP1", name: "Roast Pork w. Chinese Vegetable", description: "Roast pork stir-fried with mixed vegetables in a savory brown sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-chinese-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP2", name: "Roast Pork w. Snow Peas", description: "Roast pork stir-fried with snow peas and vegetables in a light savory sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP3", name: "Roast Pork w. Mixed Vegetable", description: "Roast pork stir-fried with a colorful mix of vegetables in a savory sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP4", name: "Roast Pork w. Mushrooms", description: "Roast pork stir-fried with mushrooms and vegetables in a savory brown sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-mushrooms"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP5", name: "Hunan Pork", description: "Roast pork and vegetables stir-fried in a spicy Hunan-style sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("hunan-pork"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP6", name: "Szechuan Pork", description: "Roast pork and vegetables stir-fried in a spicy Szechuan-style sauce.", price: 11.15, category: "Roast Pork", imageUrl: img("szechuan-pork"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },

  // Chicken (with white rice)
  { id: "C57", name: "Moo Goo Gai Pan", description: "Sliced chicken stir-fried with mushrooms and vegetables in a light white sauce.", price: 11.1, category: "Chicken", imageUrl: img("moo-goo-gai"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C58", name: "Chicken w. Snow Peas", description: "Tender chicken stir-fried with snow peas and vegetables in a light savory sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C59", name: "Chicken w. Black Bean Sauce", description: "Chicken and vegetables stir-fried in a bold black bean garlic sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-black-bean"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C60", name: "Curry Chicken", description: "Chicken and vegetables stir-fried in a fragrant yellow curry sauce.", price: 11.1, category: "Chicken", imageUrl: img("curry-chicken"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C61", name: "Chicken w. Mixed Vegetables", description: "Chicken stir-fried with mixed vegetables in a savory brown sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C62", name: "Diced Chicken & Shrimp Combo", description: "Chicken and shrimp stir-fried with mixed vegetables in a savory house sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-shrimp-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C63", name: "Chicken w. Garlic Sauce", description: "Chicken and vegetables stir-fried in our bold garlic sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-garlic"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C64", name: "Kung Po Chicken", description: "Stir-fried chicken with peanuts and vegetables in a spicy-sweet Kung Po sauce.", price: 11.1, category: "Chicken", imageUrl: img("kungpo-chicken"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C65", name: "Chicken w. Cashew Nuts", description: "Chicken stir-fried with cashews and vegetables in a savory house sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-cashew"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C66", name: "Chicken w. Garlic Sauce (alt)", description: "Chicken and vegetables stir-fried in our bold garlic sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-garlic2"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C67", name: "Chicken w. Mushrooms", description: "Chicken stir-fried with mushrooms and vegetables in a savory brown sauce.", price: 11.1, category: "Chicken", imageUrl: img("chicken-mushrooms"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C68", name: "Hunan Chicken", description: "Chicken and vegetables stir-fried in a spicy Hunan-style sauce.", price: 11.1, category: "Chicken", imageUrl: img("hunan-chicken"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },

  // Beef (with white rice)
  { id: "B70", name: "Pepper Steak w. Onion", description: "Sliced beef stir-fried with onions and peppers in a savory brown sauce.", price: 12.2, category: "Beef", imageUrl: img("pepper-steak"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B71", name: "Beef w. Broccoli", description: "Tender beef and crisp broccoli stir-fried in a rich brown sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-broccoli"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B72", name: "Beef w. Snow Peas", description: "Beef stir-fried with snow peas and vegetables in a light savory sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B73", name: "Beef w. Mixed Vegetables", description: "Beef stir-fried with mixed vegetables in a savory brown sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B74", name: "Beef w. Baby Corn Vegetables", description: "Beef stir-fried with baby corn and mixed vegetables in a savory sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-baby-corn"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B75", name: "Szechuan Beef", description: "Beef and vegetables stir-fried in a spicy Szechuan-style sauce.", price: 12.2, category: "Beef", imageUrl: img("szechuan-beef"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B76", name: "Beef w. Garlic Sauce", description: "Beef and vegetables stir-fried in our bold garlic sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-garlic"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B77", name: "Beef w. Mixed Onion", description: "Beef stir-fried with onions and vegetables in a savory house sauce.", price: 12.2, category: "Beef", imageUrl: img("beef-onion"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B78", name: "Hunan Beef", description: "Sliced beef and vegetables stir-fried in a spicy Hunan-style sauce.", price: 12.2, category: "Beef", imageUrl: img("hunan-beef"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 8.8 }, { label: "Large", price: 12.2 }] }] },
  { id: "B79", name: "Szechuan Beef (alt)", description: "Beef and vegetables stir-fried in a spicy Szechuan-style sauce.", price: 12.2, category: "Beef", imageUrl: img("szechuan-beef2"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 8.8 }, { label: "Large", price: 12.2 }] }] },

  // Seafood (with white rice)
  { id: "SF80", name: "Shrimp w. Lobster Sauce", description: "Tender shrimp in a classic Cantonese-style garlic-ginger sauce with egg and green onions.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-lobster"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.65 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF81", name: "Shrimp w. Broccoli", description: "Shrimp and broccoli stir-fried in a rich brown sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-broccoli"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.65 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF82", name: "Shrimp w. Snow Peas", description: "Shrimp stir-fried with snow peas and vegetables in a light savory sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF83", name: "Shrimp w. Black Bean Sauce", description: "Shrimp and vegetables stir-fried in a bold black bean garlic sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-black-bean"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF84", name: "Shrimp w. Mixed Vegetables", description: "Shrimp stir-fried with mixed vegetables in a savory sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF85", name: "Shrimp w. Curry Sauce", description: "Shrimp and vegetables stir-fried in a fragrant yellow curry sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-curry"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF86", name: "Shrimp w. Garlic Sauce", description: "Shrimp and vegetables stir-fried in our bold garlic sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-garlic"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF87", name: "Shrimp w. Cashew Nuts", description: "Shrimp stir-fried with cashews and vegetables in a savory house sauce.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-cashew"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF88", name: "Kung Po Shrimp", description: "Shrimp stir-fried with peanuts and vegetables in a spicy-sweet Kung Po sauce.", price: 13.3, category: "Seafood", imageUrl: img("kungpo-shrimp"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF89", name: "Hunan Shrimp", description: "Shrimp and vegetables stir-fried in a spicy Hunan-style sauce.", price: 13.3, category: "Seafood", imageUrl: img("hunan-shrimp"), spiceLevel: 2 },
  { id: "SF90", name: "Szechuan Shrimp", description: "Shrimp and vegetables stir-fried in a spicy Szechuan-style sauce.", price: 13.3, category: "Seafood", imageUrl: img("szechuan-shrimp"), spiceLevel: 2, popular: true },
  { id: "SF91", name: "Szechuan Shrimp (alt)", description: "Shrimp and vegetables stir-fried in a spicy Szechuan-style sauce.", price: 13.3, category: "Seafood", imageUrl: img("szechuan-shrimp2"), spiceLevel: 2 },

  // Vegetarian
  { id: "V92", name: "Sauteed Vegetable", description: "Fresh mixed vegetables stir-fried in a light savory sauce.", price: 10.15, category: "Vegetarian", imageUrl: img("sauteed-veg") },
  { id: "V93", name: "Buddhist Delight (Soft/Crispy Tofu)", description: "A wholesome mix of vegetables and tofu in a light ginger-garlic sauce.", price: 10.15, category: "Vegetarian", imageUrl: img("buddhist"), variants: [{ label: "Tofu", options: ["Soft Tofu", "Crispy Tofu"] }] },
  { id: "V94", name: "Mixed Vegetable w. Garlic Sauce", description: "Mixed vegetables stir-fried in our bold garlic sauce.", price: 10.15, category: "Vegetarian", imageUrl: img("mixed-veg-garlic"), popular: true },
  { id: "V95", name: "Broccoli w. Garlic Sauce", description: "Crisp broccoli stir-fried in our bold garlic sauce.", price: 10.15, category: "Vegetarian", imageUrl: img("broccoli-garlic"), popular: true },
  { id: "V96", name: "Mixed Vegetable w. Garlic Sauce (alt)", description: "Mixed vegetables stir-fried in our bold garlic sauce.", price: 13.3, category: "Vegetarian", imageUrl: img("mixed-veg-garlic2"), variants: [{ label: "Size", options: [{ label: "Small", price: 10.15 }, { label: "Large", price: 13.3 }] }] },
  { id: "V97", name: "Ma Po Tofu", description: "Tofu simmered in a spicy, savory sauce with aromatics and chili heat.", price: 10.15, category: "Vegetarian", imageUrl: img("mapo-tofu"), spiceLevel: 2, popular: true },
  { id: "V98", name: "Hunan Bean Curd", description: "Tofu and vegetables stir-fried in a spicy Hunan-style sauce.", price: 10.15, category: "Vegetarian", imageUrl: img("hunan-tofu"), spiceLevel: 2, popular: true },

  // Sweet & Sour (with white rice)
  { id: "SS98", name: "Sweet & Sour Pork", description: "Crispy pork tossed in our tangy sweet & sour sauce with pineapple and peppers.", price: 10.65, category: "Sweet & Sour", imageUrl: img("ss-pork"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.7 }, { label: "Large", price: 10.65 }] }] },
  { id: "SS99", name: "Sweet & Sour Shrimp", description: "Crispy shrimp tossed in our tangy sweet & sour sauce with pineapple and peppers.", price: 10.65, category: "Sweet & Sour", imageUrl: img("ss-shrimp"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.7 }, { label: "Large", price: 10.65 }] }] },
  { id: "SS100", name: "Sweet & Sour Shrimp (alt)", description: "Crispy shrimp tossed in our tangy sweet & sour sauce with pineapple and peppers.", price: 12.35, category: "Sweet & Sour", imageUrl: img("ss-shrimp2"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.4 }, { label: "Large", price: 12.35 }] }] },
  { id: "SS101", name: "Sweet & Sour Delight (Chicken, Pork & Shrimp)", description: "A sweet & sour combo with chicken, pork, and shrimp in our tangy pineapple sauce.", price: 12.65, category: "Sweet & Sour", imageUrl: img("ss-delight") },

  // Moo Shu
  { id: "MS1", name: "Moo Shu Beef", description: "Shredded beef stir-fried with cabbage, egg, and vegetables in moo shu sauce.", price: 11.15, category: "Moo Shu", imageUrl: img("moo-shu-beef") },
  { id: "MS2", name: "Moo Shu Chicken", description: "Shredded chicken stir-fried with cabbage, egg, and vegetables in moo shu sauce.", price: 11.45, category: "Moo Shu", imageUrl: img("moo-shu-chicken") },
  { id: "MS3", name: "Moo Shu Beef (alt)", description: "Shredded beef stir-fried with cabbage, egg, and vegetables in moo shu sauce.", price: 12.15, category: "Moo Shu", imageUrl: img("moo-shu-beef2") },
  { id: "MS4", name: "Moo Shu Shrimp", description: "Shrimp stir-fried with cabbage, egg, and vegetables in moo shu sauce.", price: 12.15, category: "Moo Shu", imageUrl: img("moo-shu-shrimp") },
  { id: "MS5", name: "Moo Shu Vegetable", description: "Cabbage, egg, and mixed vegetables stir-fried in moo shu sauce.", price: 10.7, category: "Moo Shu", imageUrl: img("moo-shu-veg") },

  // Diet Delight (steamed, with white rice & sauce)
  { id: "DD1", name: "Steamed Chicken w. Broccoli", description: "Steamed chicken and broccoli served with a light sauce on the side.", price: 10.6, category: "Diet Delight", imageUrl: img("steamed-chicken-broc") },
  { id: "DD2", name: "Steamed Chicken w. Mixed Vegetables", description: "Steamed chicken with mixed vegetables, served with sauce on the side.", price: 11.95, category: "Diet Delight", imageUrl: img("steamed-chicken-veg") },
  { id: "DD3", name: "Steamed Shrimp w. Broccoli", description: "Steamed shrimp and broccoli served with a light sauce on the side.", price: 10.6, category: "Diet Delight", imageUrl: img("steamed-shrimp-broc") },
  { id: "DD4", name: "Steamed Shrimp w. Mixed Vegetables", description: "Steamed shrimp with mixed vegetables, served with sauce on the side.", price: 11.95, category: "Diet Delight", imageUrl: img("steamed-shrimp-veg") },
  { id: "DD5", name: "Steamed Broccoli", description: "Steamed broccoli served with a light sauce on the side.", price: 9.35, category: "Diet Delight", imageUrl: img("steamed-broc") },
  { id: "DD6", name: "Steamed Mixed Vegetables", description: "Steamed mixed vegetables served with a light sauce on the side.", price: 9.35, category: "Diet Delight", imageUrl: img("steamed-mixed-veg") },

  // Emperor's Creations / Chef's Specials (S1–S24)
  { id: "EC1", name: "Seafood Delight", description: "A generous mix of seafood and vegetables stir-fried in a savory house sauce.", price: 16.75, category: "Chef's Specials", imageUrl: img("seafood-delight"), popular: true },
  { id: "EC2", name: "Happy Family", description: "A classic combo of chicken, beef, shrimp, and vegetables in a rich brown sauce.", price: 15.75, category: "Chef's Specials", imageUrl: img("happy-family"), popular: true },
  { id: "EC3", name: "Jalapeño Chicken", description: "Chicken stir-fried with jalapeños, onions, and peppers in a spicy savory sauce.", price: 13, category: "Chef's Specials", imageUrl: img("jalapeno-chicken"), spiceLevel: 2, popular: true },
  { id: "EC4", name: "Lemon Chicken", description: "Crispy chicken drizzled with a bright, tangy lemon sauce.", price: 13, category: "Chef's Specials", imageUrl: img("lemon-chicken") },
  { id: "EC5", name: "Sesame Chicken", description: "Crispy chicken coated in a sweet sesame glaze and toasted sesame seeds.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-chicken"), popular: true },
  { id: "EC6", name: "General Tso's Chicken", description: "Crispy chicken tossed in a sweet, tangy, and spicy General Tso’s sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "EC7", name: "Chicken w. Orange Flavor", description: "Crispy chicken glazed in a sweet citrus-orange sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("orange-chicken") },
  { id: "EC8", name: "Sesame Beef", description: "Tender beef tossed in a sweet sesame glaze with a hint of garlic.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-beef"), popular: true },
  { id: "EC9", name: "Hunan New Style", description: "A spicy Hunan-style stir-fry with vegetables in a bold chili-garlic sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("hunan-new"), spiceLevel: 2 },
  { id: "EC10", name: "Hunan Bean Curd", description: "Tofu and vegetables stir-fried in a spicy Hunan-style sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("hunan-bean-curd"), spiceLevel: 2, popular: true },
  { id: "EC11", name: "Sesame Shrimp", description: "Crispy shrimp tossed in a sweet sesame glaze with toasted sesame seeds.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-shrimp") },
  { id: "EC12", name: "Shrimp & Scallop w. Hot Pepper Sauce", description: "Shrimp and scallops stir-fried with vegetables in a spicy hot pepper sauce.", price: 13.7, category: "Chef's Specials", imageUrl: img("shrimp-scallop-hot"), spiceLevel: 2, popular: true },
  { id: "EC13", name: "Shrimp & Scallop w. Hot", description: "Shrimp and scallops stir-fried with vegetables in a savory house sauce.", price: 13.7, category: "Chef's Specials", imageUrl: img("shrimp-scallop") },
  { id: "EC14", name: "Beef & Scallops", description: "Beef and scallops stir-fried with vegetables in a savory house sauce.", price: 13.7, category: "Chef's Specials", imageUrl: img("beef-scallops") },
  { id: "EC15", name: "Triple Delight", description: "Chicken, beef, and shrimp stir-fried with vegetables in a savory house sauce.", price: 13.7, category: "Chef's Specials", imageUrl: img("triple-delight") },
  { id: "EC16", name: "Four Seasons", description: "A colorful mix of meats and vegetables stir-fried in a light, savory sauce.", price: 13.2, category: "Chef's Specials", imageUrl: img("four-seasons"), popular: true },
  { id: "EC17", name: "Crispy Chicken", description: "Crispy fried chicken tossed in a savory house sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("crispy-chicken"), popular: true },
  { id: "EC18", name: "Four Seasons (alt)", description: "A colorful mix of meats and vegetables stir-fried in a light, savory sauce.", price: 13.2, category: "Chef's Specials", imageUrl: img("four-seasons2") },
  { id: "EC19", name: "Lake Tung Ting Shrimp", description: "Shrimp stir-fried with vegetables in a flavorful, slightly sweet house sauce.", price: 13.2, category: "Chef's Specials", imageUrl: img("tung-ting-shrimp") },
  { id: "EC20", name: "Dragon & Phoenix", description: "A combo of chicken and shrimp with vegetables in a savory house sauce.", price: 13.2, category: "Chef's Specials", imageUrl: img("dragon-phoenix") },
  { id: "EC21", name: "General Tso's Chicken (Chef's)", description: "Crispy chicken tossed in a sweet, tangy, and spicy General Tso’s sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("general-tso-chef"), spiceLevel: 2, popular: true },
  { id: "EC22", name: "Cantonese Chicken", description: "Chicken stir-fried with vegetables in a light Cantonese-style sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("cantonese-chicken"), popular: true },
  { id: "EC23", name: "Mongolian Beef", description: "Tender beef stir-fried with scallions and onions in a sweet-savory soy glaze.", price: 13.2, category: "Chef's Specials", imageUrl: img("mongolian-beef") },
  { id: "EC24", name: "Black Pepper Chicken", description: "Chicken stir-fried with onions and peppers in a bold black pepper sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("black-pepper-chicken"), popular: true },
];

export const menuItems: MenuItem[] = expandChoiceItems(rawMenuItems);
