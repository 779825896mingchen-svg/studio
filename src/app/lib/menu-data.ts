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
  "Chow Mein",  
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

export const menuItems: MenuItem[] = [
  // Lunch Combo (L1–L31) — Mon–Sat 11am–3pm, includes Roast Pork Fried Rice + Can Soda
  { id: "L1", name: "Chow Mein (Chicken or Pork)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("chowmein-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L2", name: "Chow Mein (Shrimp or Beef)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("chowmein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L3", name: "Sweet & Sour (Chicken or Pork)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("sweet-sour-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L4", name: "Lo Mein (Shrimp or Beef)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("lomein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L5", name: "Shrimp w. Lobster Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("shrimp-lobster") },
  { id: "L6", name: "Chicken or Pork w. Broccoli", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("cp-broccoli"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L7", name: "Shrimp or Beef w. Broccoli", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("sb-broccoli"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L8", name: "Boneless Spare Ribs", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("spare-ribs") },
  { id: "L9", name: "Pepper Steak w. Onions", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("pepper-steak") },
  { id: "L10", name: "Lo Mein (Roast Pork or Chicken)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("lomein-rpc"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }] },
  { id: "L11", name: "Diced Chicken & Shrimp", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("chicken-shrimp") },
  { id: "L12", name: "Chinese Vegetable", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("chinese-veg") },
  { id: "L13", name: "Beef, Chicken or Fish", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("bcf"), variants: [{ label: "Choice", options: ["Beef", "Chicken", "Fish"] }] },
  { id: "L14", name: "Moo Goo Gai Pan", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("moo-goo") },
  { id: "L15", name: "Sauteed Vegetable w. Tofu", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("veg-tofu") },
  { id: "L16", name: "Broccoli w. Garlic Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("broccoli-garlic") },
  { id: "L17", name: "Mixed Vegetable w. Garlic Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("mixed-veg-garlic") },
  { id: "L18", name: "Chicken or Pork w. Garlic Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("cp-garlic"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L19", name: "Beef or Shrimp w. Garlic Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("bs-garlic"), variants: [{ label: "Choice", options: ["Beef", "Shrimp"] }] },
  { id: "L20", name: "Broccoli Tofu in Brown Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("broccoli-tofu") },
  { id: "L21", name: "Shrimp or Beef Egg Foo Young", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("efy-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L22", name: "Chicken or Pork Egg Foo Young", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("efy-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L23", name: "Kung Po Chicken", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda. Spicy.", price: 8.75, category: "Lunch Combo", imageUrl: img("kungpo-chicken"), spiceLevel: 2 },
  { id: "L24", name: "Crispy Chicken", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("crispy-chicken") },
  { id: "L25", name: "General Tso's Chicken", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda. Spicy.", price: 8.75, category: "Lunch Combo", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "L26", name: "Sesame Chicken", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("sesame-chicken"), popular: true },
  { id: "L27", name: "Crabmeat & Shrimp w. Garlic Sauce", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("crab-shrimp-garlic") },
  { id: "L28", name: "Hunan Style (Chicken or Pork)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda. Spicy.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-cp"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "L29", name: "Hunan Style (Shrimp or Beef)", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda. Spicy.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-sb"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "L30", name: "Hunan Beef", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda. Spicy.", price: 8.75, category: "Lunch Combo", imageUrl: img("hunan-beef"), spiceLevel: 2 },
  { id: "L31", name: "Double Sauteed Pork", description: "Mon–Sat 11am–3pm. Includes roast pork fried rice + can soda.", price: 8.75, category: "Lunch Combo", imageUrl: img("double-pork") },

  // Dinner Combo (D1–D31) — includes Roast Pork Fried Rice + Can Soda
  { id: "D1", name: "Chow Mein (Chicken or Pork)", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("chowmein-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D2", name: "Chow Mein (Shrimp or Beef)", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("chowmein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D3", name: "Sweet & Sour (Chicken or Pork)", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("sweet-sour-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D4", name: "Lo Mein (Shrimp or Beef)", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("lomein-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D5", name: "Shrimp w. Lobster Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("shrimp-lobster") },
  { id: "D6", name: "Chicken or Pork w. Broccoli", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("cp-broccoli"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D7", name: "Shrimp or Beef w. Broccoli", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("sb-broccoli"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D8", name: "Boneless Spare Ribs", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("spare-ribs") },
  { id: "D9", name: "Pepper Steak w. Onions", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("pepper-steak") },
  { id: "D10", name: "Lo Mein (Roast Pork or Chicken)", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("lomein-rpc"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }] },
  { id: "D11", name: "Diced Chicken & Shrimp", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("chicken-shrimp") },
  { id: "D12", name: "Chinese Vegetable", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("chinese-veg") },
  { id: "D13", name: "Beef, Chicken or Fish", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("bcf"), variants: [{ label: "Choice", options: ["Beef", "Chicken", "Fish"] }] },
  { id: "D14", name: "Moo Goo Gai Pan", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("moo-goo") },
  { id: "D15", name: "Sauteed Vegetable w. Tofu", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("veg-tofu") },
  { id: "D16", name: "Broccoli w. Garlic Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("broccoli-garlic") },
  { id: "D17", name: "Mixed Vegetable w. Garlic Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("mixed-veg-garlic") },
  { id: "D18", name: "Chicken or Pork w. Garlic Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("cp-garlic"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D19", name: "Beef or Shrimp w. Garlic Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("bs-garlic"), variants: [{ label: "Choice", options: ["Beef", "Shrimp"] }] },
  { id: "D20", name: "Broccoli Tofu in Brown Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("broccoli-tofu") },
  { id: "D21", name: "Shrimp or Beef Egg Foo Young", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("efy-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D22", name: "Chicken or Pork Egg Foo Young", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("efy-cp"), variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D23", name: "Kung Po Chicken", description: "Dinner combo. Includes roast pork fried rice + can soda. Spicy.", price: 10.75, category: "Dinner Combo", imageUrl: img("kungpo-chicken"), spiceLevel: 2 },
  { id: "D24", name: "Crispy Chicken", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("crispy-chicken") },
  { id: "D25", name: "General Tso's Chicken", description: "Dinner combo. Includes roast pork fried rice + can soda. Spicy.", price: 10.75, category: "Dinner Combo", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "D26", name: "Sesame Chicken", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("sesame-chicken"), popular: true },
  { id: "D27", name: "Crabmeat & Shrimp w. Garlic Sauce", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("crab-shrimp-garlic") },
  { id: "D28", name: "Hunan Style (Chicken or Pork)", description: "Dinner combo. Includes roast pork fried rice + can soda. Spicy.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-cp"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Chicken", "Pork"] }] },
  { id: "D29", name: "Hunan Style (Shrimp or Beef)", description: "Dinner combo. Includes roast pork fried rice + can soda. Spicy.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-sb"), spiceLevel: 2, variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "D30", name: "Hunan Beef", description: "Dinner combo. Includes roast pork fried rice + can soda. Spicy.", price: 10.75, category: "Dinner Combo", imageUrl: img("hunan-beef"), spiceLevel: 2 },
  { id: "D31", name: "Double Sauteed Pork", description: "Dinner combo. Includes roast pork fried rice + can soda.", price: 10.75, category: "Dinner Combo", imageUrl: img("double-pork") },

  // Appetizers
  { id: "A1", name: "Fried Chicken Wings (4)", description: "Crispy fried Whole wings.", price: 7.75, category: "Appetizers", imageUrl: img("wings") },
  { id: "A2", name: "Fried Scallop (10)", description: "Ten golden fried scallops.", price: 8.25, category: "Appetizers", imageUrl: img("scallop") },
  { id: "A3", name: "Fried Baby Shrimp (15)", description: "Fifteen crispy baby shrimp.", price: 7.25, category: "Appetizers", imageUrl: img("baby-shrimp") },
  { id: "A4", name: "Roast Pork Egg Roll (1)", description: "One egg roll with roast pork.", price: 1.9, category: "Appetizers", imageUrl: img("egg-roll") },
  { id: "A5", name: "Shrimp Roll", description: "Crispy shrimp roll.", price: 2.25, category: "Appetizers", imageUrl: img("shrimp-roll") },
  { id: "A6", name: "Fried or Steamed Meat Dumplings (8)", description: "Eight dumplings, your choice of fried or steamed.", price: 8.5, category: "Appetizers", imageUrl: img("meat-dumplings"), variants: [{ label: "Style", options: ["Fried", "Steamed"] }] },
  { id: "A7", name: "Fried or Steamed Chicken Dumplings (8)", description: "Eight chicken dumplings, fried or steamed.", price: 8.5, category: "Appetizers", imageUrl: img("chicken-dumplings"), variants: [{ label: "Style", options: ["Fried", "Steamed"] }] },
  { id: "A8", name: "Pu Pu Platter", description: "Assorted appetizer platter for sharing.", price: 13.45, category: "Appetizers", imageUrl: img("pupu"), popular: true },
  { id: "A9", name: "Fried Wonton (10)", description: "Deep Fried Pork Wonton.", price: 7.45, category: "Appetizers", imageUrl: img("fried-mei") },
  { id: "A10", name: "Teriyaki Chicken (4 sticks)", description: "Four teriyaki chicken skewers.", price: 6.99, category: "Appetizers", imageUrl: img("teriyaki") },
  { id: "A11", name: "Crab Rangoon (8)", description: "Eight cream cheese and crab wontons.", price: 6.99, category: "Appetizers", imageUrl: img("crab-rangoon") },
  { id: "A12", name: "Fried Chicken Nuggets (10)", description: "Ten pieces of fried chicken nuggets.", price: 5.55, category: "Appetizers", imageUrl: img("nuggets") },
  { id: "A13", name: "Spring Ribs (Small)", description: "Small portion of spring ribs.", price: 9.25, category: "Appetizers", imageUrl: img("spring-ribs-sm") },
  { id: "A14", name: "Spring Ribs (Large)", description: "Large portion of spring ribs.", price: 13.95, category: "Appetizers", imageUrl: img("spring-ribs-lg") },
  { id: "A15", name: "Shrimp Toast (4)", description: "Four pieces of shrimp toast.", price: 6.25, category: "Appetizers", imageUrl: img("shrimp-toast") },
  { id: "A16", name: "Chinese Donuts (10)", description: "Ten Chinese donuts.", price: 5.99, category: "Appetizers", imageUrl: img("donuts") },
  { id: "A17", name: "French Fries", description: "Crispy french fries.", price: 4.25, category: "Appetizers", imageUrl: img("fries") },
  { id: "A18", name: "Special Wonton (Lemon Pepper/Bar-B-Q/Honey/Buffalo/Garlic)", description: "Wontons with your choice of sauce.", price: 8.99, category: "Appetizers", imageUrl: img("special-wonton"), variants: [{ label: "Sauce", options: ["Lemon Pepper", "Bar-B-Q", "Honey", "Buffalo", "Garlic"] }] },

  // Soup
  { id: "S14", name: "Wonton Soup", description: "Small $4.15 / Large $6.15.", price: 6.15, category: "Soup", imageUrl: img("wonton-soup"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.15 }, { label: "Large", price: 6.15 }] }] },
  { id: "S15", name: "Wonton & Egg Drop Mixed", description: "Small $4.50 / Large $6.50.", price: 6.5, category: "Soup", imageUrl: img("wonton-egg"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.5 }, { label: "Large", price: 6.5 }] }] },
  { id: "S16", name: "Vegetable w. Bean Curd Soup", description: "Small $4.45 / Large $6.50.", price: 6.5, category: "Soup", imageUrl: img("veg-tofu-soup"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.45 }, { label: "Large", price: 6.5 }] }] },
  { id: "S17", name: "Egg Drop Soup", description: "Small $4.00 / Large $5.50.", price: 5.5, category: "Soup", imageUrl: img("egg-drop"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.0 }, { label: "Large", price: 5.5 }] }] },
  { id: "S18", name: "Wonton Soup (w. Fried Noodles)", description: "Small $4.15 / Large $5.50.", price: 5.5, category: "Soup", imageUrl: img("wonton-noodles"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.15 }, { label: "Large", price: 5.5 }] }] },
  { id: "S19", name: "Hot & Sour Soup / Rice Soup", description: "Small $4.40 / Large $6.25. Spicy.", price: 6.25, category: "Soup", imageUrl: img("hot-sour"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 4.4 }, { label: "Large", price: 6.25 }] }] },
  { id: "S20", name: "Seafood Soup", description: "Rich seafood soup.", price: 8.49, category: "Soup", imageUrl: img("seafood-soup") },

  // Fried Rice
  { id: "FR1", name: "Vegetable Fried Rice", description: "Small $4.00 / Large $7.25. Served with white rice.", price: 7.25, category: "Fried Rice", imageUrl: img("veg-fried-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 4.0 }, { label: "Large", price: 7.25 }] }] },
  { id: "FR2", name: "White Rice", description: "Small $5.10 / Large $7.75.", price: 7.75, category: "Fried Rice", imageUrl: img("white-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 5.1 }, { label: "Large", price: 7.75 }] }] },
  { id: "FR3", name: "Plain Fried Rice", description: "Small $5.55 / Large $8.25.", price: 8.25, category: "Fried Rice", imageUrl: img("plain-fried-rice"), variants: [{ label: "Size", options: [{ label: "Small", price: 5.55 }, { label: "Large", price: 8.25 }] }] },
  { id: "FR4", name: "Roast Pork or Chicken Fried Rice", description: "Small $6.50 / Large $10.25.", price: 10.25, category: "Fried Rice", imageUrl: img("rp-chicken-fr"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 6.5 }, { label: "Large", price: 10.25 }] }] },
  { id: "FR5", name: "Shrimp or Beef Fried Rice", description: "Small $6.95 / Large $10.25.", price: 10.25, category: "Fried Rice", imageUrl: img("shrimp-beef-fr"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 6.95 }, { label: "Large", price: 10.25 }] }] },
  { id: "FR6", name: "House Special Fried Rice (Shrimp, Chicken, Pork)", description: "Small $7.55 / Large $11.45.", price: 11.45, category: "Fried Rice", imageUrl: img("house-special-fr"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.55 }, { label: "Large", price: 11.45 }] }] },
  { id: "FR7", name: "House Special w. White Rice & Fried Noodles", description: "Small $7.75 / Large $11.50.", price: 11.5, category: "Fried Rice", imageUrl: img("house-special-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.75 }, { label: "Large", price: 11.5 }] }] },

  // Lo Mein
  { id: "LM1", name: "Shrimp or Beef (Lo Mein)", description: "Small $7.20 / Large $10.50. With white rice & fried noodles.", price: 10.5, category: "Lo Mein", imageUrl: img("lm-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 7.2 }, { label: "Large", price: 10.5 }] }] },
  { id: "LM2", name: "House Special Lo Mein (Shrimp, Chicken, Pork)", description: "Small $7.30 / Large $11.00.", price: 11, category: "Lo Mein", imageUrl: img("lm-house"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.3 }, { label: "Large", price: 11.0 }] }] },
  { id: "LM3", name: "Vegetable Lo Mein", description: "Small $6.75 / Large $9.75.", price: 9.75, category: "Lo Mein", imageUrl: img("lm-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 6.75 }, { label: "Large", price: 9.75 }] }] },
  { id: "LM4", name: "Roast Pork or Chicken Lo Mein", description: "Small $7.25 / Large $10.50.", price: 10.5, category: "Lo Mein", imageUrl: img("lm-rp-chicken"), variants: [{ label: "Choice", options: ["Roast Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.25 }, { label: "Large", price: 10.5 }] }] },
  { id: "LM5", name: "Shrimp or Beef Lo Mein", description: "Small $7.75 / Large $11.50.", price: 11.5, category: "Lo Mein", imageUrl: img("lm-sb"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 7.75 }, { label: "Large", price: 11.5 }] }] },
  { id: "LM6", name: "House Special Lo Mein w. Rice & Noodles", description: "Small $8.25 / Large $11.55.", price: 11.55, category: "Lo Mein", imageUrl: img("lm-house-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.25 }, { label: "Large", price: 11.55 }] }] },

  // Chow Mai Fun
  { id: "CMF1", name: "Pork or Chicken Chow Mai Fun ", description: "Rice vermicelli. Small $7.95 / Large $9.50.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-pork-chicken"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 9.5 }] }] },
  { id: "CMF2", name: "Shrimp or Beef Chow Mai Fun ", description: "Small $8.75 / Large $10.50.", price: 10.5, category: "Chow Mai Fun", imageUrl: img("cmf-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 8.75 }, { label: "Large", price: 10.5 }] }] },
  { id: "CMF3", name: "Pork or Chicken Chow Mai Fun ", description: "Small $7.95 / Large $9.50.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-pc-fr"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }, { label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 9.5 }] }] },
  { id: "CMF4", name: "Shrimp or Beef Chow Mai Fun ", description: "Small $8.75 / Large $9.50.", price: 9.5, category: "Chow Mai Fun", imageUrl: img("cmf-sb-fr"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }, { label: "Size", options: [{ label: "Small", price: 8.75 }, { label: "Large", price: 9.5 }] }] },

  // Egg Foo Young (with white rice)
  { id: "EFY1", name: "Vegetable Egg Foo Young", description: "Small $8.50. With white rice.", price: 8.5, category: "Egg Foo Young", imageUrl: img("efy-veg") },
  { id: "EFY2", name: "Pork or Chicken Egg Foo Young", description: "Small $9.50. With white rice.", price: 9.5, category: "Egg Foo Young", imageUrl: img("efy-pork-chicken"), variants: [{ label: "Choice", options: ["Pork", "Chicken"] }] },
  { id: "EFY3", name: "Shrimp or Beef Egg Foo Young", description: "Small $9.95. With white rice.", price: 9.95, category: "Egg Foo Young", imageUrl: img("efy-shrimp-beef"), variants: [{ label: "Choice", options: ["Shrimp", "Beef"] }] },
  { id: "EFY4", name: "House Special Egg Foo Young (Shrimp, Chicken, Pork)", description: "Small $10.90 / Large $11.70. With white rice.", price: 11.7, category: "Egg Foo Young", imageUrl: img("efy-house"), variants: [{ label: "Size", options: [{ label: "Small", price: 10.9 }, { label: "Large", price: 11.7 }] }] },

  // Roast Pork (with white rice)
  { id: "RP1", name: "Roast Pork w. Chinese Vegetable", description: "Small $7.95 / Large $11.15. With white rice.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-chinese-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP2", name: "Roast Pork w. Snow Peas", description: "Small $7.95 / Large $11.15.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP3", name: "Roast Pork w. Mixed Vegetable", description: "Small $7.95 / Large $11.15.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP4", name: "Roast Pork w. Mushrooms", description: "Small $7.95 / Large $11.15.", price: 11.15, category: "Roast Pork", imageUrl: img("rp-mushrooms"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP5", name: "Hunan Pork", description: "Small $7.95 / Large $11.15. Spicy.", price: 11.15, category: "Roast Pork", imageUrl: img("hunan-pork"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },
  { id: "RP6", name: "Szechuan Pork", description: "Small $7.95 / Large $11.15. Spicy.", price: 11.15, category: "Roast Pork", imageUrl: img("szechuan-pork"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.95 }, { label: "Large", price: 11.15 }] }] },

  // Chicken (with white rice)
  { id: "C57", name: "Moo Goo Gai Pan", description: "Small $7.90 / Large $11.10. With white rice.", price: 11.1, category: "Chicken", imageUrl: img("moo-goo-gai"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C58", name: "Chicken w. Snow Peas", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C59", name: "Chicken w. Black Bean Sauce", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-black-bean"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C60", name: "Curry Chicken", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("curry-chicken"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C61", name: "Chicken w. Mixed Vegetables", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C62", name: "Diced Chicken & Shrimp Combo", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-shrimp-combo"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C63", name: "Chicken w. Garlic Sauce", description: "Small $7.90 / Large $11.10. Chef's special.", price: 11.1, category: "Chicken", imageUrl: img("chicken-garlic"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C64", name: "Kung Po Chicken", description: "Small $7.90 / Large $11.10. Spicy. Chef's special.", price: 11.1, category: "Chicken", imageUrl: img("kungpo-chicken"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C65", name: "Chicken w. Cashew Nuts", description: "Small $7.90 / Large $11.10. Chef's special.", price: 11.1, category: "Chicken", imageUrl: img("chicken-cashew"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C66", name: "Chicken w. Garlic Sauce (alt)", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-garlic2"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C67", name: "Chicken w. Mushrooms", description: "Small $7.90 / Large $11.10.", price: 11.1, category: "Chicken", imageUrl: img("chicken-mushrooms"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },
  { id: "C68", name: "Hunan Chicken", description: "Small $7.90 / Large $11.10. Spicy.", price: 11.1, category: "Chicken", imageUrl: img("hunan-chicken"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 7.9 }, { label: "Large", price: 11.1 }] }] },

  // Beef (with white rice)
  { id: "B70", name: "Pepper Steak w. Onion", description: "Small $8.50 / Large $12.20. With white rice.", price: 12.2, category: "Beef", imageUrl: img("pepper-steak"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B71", name: "Beef w. Broccoli", description: "Small $8.50 / Large $12.20.", price: 12.2, category: "Beef", imageUrl: img("beef-broccoli"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B72", name: "Beef w. Snow Peas", description: "Small $8.50 / Large $12.20.", price: 12.2, category: "Beef", imageUrl: img("beef-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B73", name: "Beef w. Mixed Vegetables", description: "Small $8.50 / Large $12.20.", price: 12.2, category: "Beef", imageUrl: img("beef-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B74", name: "Beef w. Baby Corn Vegetables", description: "Small $8.50 / Large $12.20.", price: 12.2, category: "Beef", imageUrl: img("beef-baby-corn"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B75", name: "Szechuan Beef", description: "Small $8.50 / Large $12.20. Spicy. Chef's special.", price: 12.2, category: "Beef", imageUrl: img("szechuan-beef"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B76", name: "Beef w. Garlic Sauce", description: "Small $8.50 / Large $12.20.", price: 12.2, category: "Beef", imageUrl: img("beef-garlic"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B77", name: "Beef w. Mixed Onion", description: "Small $8.50 / Large $12.20. Chef's special.", price: 12.2, category: "Beef", imageUrl: img("beef-onion"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.5 }, { label: "Large", price: 12.2 }] }] },
  { id: "B78", name: "Hunan Beef", description: "Small $8.80 / Large $12.20. Spicy.", price: 12.2, category: "Beef", imageUrl: img("hunan-beef"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 8.8 }, { label: "Large", price: 12.2 }] }] },
  { id: "B79", name: "Szechuan Beef (alt)", description: "Small $8.80 / Large $12.20. Spicy.", price: 12.2, category: "Beef", imageUrl: img("szechuan-beef2"), spiceLevel: 2, variants: [{ label: "Size", options: [{ label: "Small", price: 8.8 }, { label: "Large", price: 12.2 }] }] },

  // Seafood (with white rice)
  { id: "SF80", name: "Shrimp w. Lobster Sauce", description: "Small $8.65 / Large $13.30. With white rice.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-lobster"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.65 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF81", name: "Shrimp w. Broccoli", description: "Small $8.65 / Large $13.30.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-broccoli"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.65 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF82", name: "Shrimp w. Snow Peas", description: "Small $8.55 / Large $13.30.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-snow-peas"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF83", name: "Shrimp w. Black Bean Sauce", description: "Small $8.55 / Large $13.30.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-black-bean"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF84", name: "Shrimp w. Mixed Vegetables", description: "Small $8.55 / Large $13.30.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-mixed-veg"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF85", name: "Shrimp w. Curry Sauce", description: "Small $8.55 / Large $13.30.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-curry"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF86", name: "Shrimp w. Garlic Sauce", description: "Small $8.55 / Large $13.30. Chef's special.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-garlic"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF87", name: "Shrimp w. Cashew Nuts", description: "Small $8.55 / Large $13.30. Chef's special.", price: 13.3, category: "Seafood", imageUrl: img("shrimp-cashew"), popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF88", name: "Kung Po Shrimp", description: "Small $8.55 / Large $13.30. Spicy. Chef's special.", price: 13.3, category: "Seafood", imageUrl: img("kungpo-shrimp"), spiceLevel: 2, popular: true, variants: [{ label: "Size", options: [{ label: "Small", price: 8.55 }, { label: "Large", price: 13.3 }] }] },
  { id: "SF89", name: "Hunan Shrimp", description: "Large $13.30. Spicy.", price: 13.3, category: "Seafood", imageUrl: img("hunan-shrimp"), spiceLevel: 2 },
  { id: "SF90", name: "Szechuan Shrimp", description: "Large $13.30. Spicy. Chef's special.", price: 13.3, category: "Seafood", imageUrl: img("szechuan-shrimp"), spiceLevel: 2, popular: true },
  { id: "SF91", name: "Szechuan Shrimp (alt)", description: "Large $13.30. Spicy.", price: 13.3, category: "Seafood", imageUrl: img("szechuan-shrimp2"), spiceLevel: 2 },

  // Vegetarian
  { id: "V92", name: "Sauteed Vegetable", description: "Small $10.15. With white rice.", price: 10.15, category: "Vegetarian", imageUrl: img("sauteed-veg") },
  { id: "V93", name: "Buddhist Delight (Soft/Crispy Tofu)", description: "Vegetarian delight with tofu.", price: 10.15, category: "Vegetarian", imageUrl: img("buddhist"), variants: [{ label: "Tofu", options: ["Soft Tofu", "Crispy Tofu"] }] },
  { id: "V94", name: "Mixed Vegetable w. Garlic Sauce", description: "Chef's special.", price: 10.15, category: "Vegetarian", imageUrl: img("mixed-veg-garlic"), popular: true },
  { id: "V95", name: "Broccoli w. Garlic Sauce", description: "Chef's special.", price: 10.15, category: "Vegetarian", imageUrl: img("broccoli-garlic"), popular: true },
  { id: "V96", name: "Mixed Vegetable w. Garlic Sauce (alt)", description: "Small $10.15 / Large $13.30.", price: 13.3, category: "Vegetarian", imageUrl: img("mixed-veg-garlic2"), variants: [{ label: "Size", options: [{ label: "Small", price: 10.15 }, { label: "Large", price: 13.3 }] }] },
  { id: "V97", name: "Ma Po Tofu", description: "Spicy tofu. Chef's special.", price: 10.15, category: "Vegetarian", imageUrl: img("mapo-tofu"), spiceLevel: 2, popular: true },
  { id: "V98", name: "Hunan Bean Curd", description: "Chef's special. Spicy.", price: 10.15, category: "Vegetarian", imageUrl: img("hunan-tofu"), spiceLevel: 2, popular: true },

  // Sweet & Sour (with white rice)
  { id: "SS98", name: "Sweet & Sour Pork", description: "Small $7.70 / Large $10.65. With white rice.", price: 10.65, category: "Sweet & Sour", imageUrl: img("ss-pork"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.7 }, { label: "Large", price: 10.65 }] }] },
  { id: "SS99", name: "Sweet & Sour Shrimp", description: "Small $7.70 / Large $10.65.", price: 10.65, category: "Sweet & Sour", imageUrl: img("ss-shrimp"), variants: [{ label: "Size", options: [{ label: "Small", price: 7.7 }, { label: "Large", price: 10.65 }] }] },
  { id: "SS100", name: "Sweet & Sour Shrimp (alt)", description: "Small $8.40 / Large $12.35.", price: 12.35, category: "Sweet & Sour", imageUrl: img("ss-shrimp2"), variants: [{ label: "Size", options: [{ label: "Small", price: 8.4 }, { label: "Large", price: 12.35 }] }] },
  { id: "SS101", name: "Sweet & Sour Delight (Chicken, Pork & Shrimp)", description: "Large $12.65.", price: 12.65, category: "Sweet & Sour", imageUrl: img("ss-delight") },

  // Moo Shu
  { id: "MS1", name: "Moo Shu Beef", description: "Qt $11.15.", price: 11.15, category: "Moo Shu", imageUrl: img("moo-shu-beef") },
  { id: "MS2", name: "Moo Shu Chicken", description: "Qt $11.45.", price: 11.45, category: "Moo Shu", imageUrl: img("moo-shu-chicken") },
  { id: "MS3", name: "Moo Shu Beef (alt)", description: "Qt $12.15.", price: 12.15, category: "Moo Shu", imageUrl: img("moo-shu-beef2") },
  { id: "MS4", name: "Moo Shu Shrimp", description: "Qt $12.15.", price: 12.15, category: "Moo Shu", imageUrl: img("moo-shu-shrimp") },
  { id: "MS5", name: "Moo Shu Vegetable", description: "Qt $10.70.", price: 10.7, category: "Moo Shu", imageUrl: img("moo-shu-veg") },

  // Diet Delight (steamed, with white rice & sauce)
  { id: "DD1", name: "Steamed Chicken w. Broccoli", description: "Steamed healthy option. With white rice & sauce.", price: 10.6, category: "Diet Delight", imageUrl: img("steamed-chicken-broc") },
  { id: "DD2", name: "Steamed Chicken w. Mixed Vegetables", description: "Qt $11.95.", price: 11.95, category: "Diet Delight", imageUrl: img("steamed-chicken-veg") },
  { id: "DD3", name: "Steamed Shrimp w. Broccoli", description: "Qt $10.60.", price: 10.6, category: "Diet Delight", imageUrl: img("steamed-shrimp-broc") },
  { id: "DD4", name: "Steamed Shrimp w. Mixed Vegetables", description: "Qt $11.95.", price: 11.95, category: "Diet Delight", imageUrl: img("steamed-shrimp-veg") },
  { id: "DD5", name: "Steamed Broccoli", description: "Qt $9.35.", price: 9.35, category: "Diet Delight", imageUrl: img("steamed-broc") },
  { id: "DD6", name: "Steamed Mixed Vegetables", description: "Qt $9.35.", price: 9.35, category: "Diet Delight", imageUrl: img("steamed-mixed-veg") },

  // Emperor's Creations / Chef's Specials (S1–S24)
  { id: "EC1", name: "Seafood Delight", description: "Emperor's specialty. Assorted seafood.", price: 16.75, category: "Chef's Specials", imageUrl: img("seafood-delight"), popular: true },
  { id: "EC2", name: "Happy Family", description: "Emperor's specialty. Combination dish.", price: 15.75, category: "Chef's Specials", imageUrl: img("happy-family"), popular: true },
  { id: "EC3", name: "Jalapeño Chicken", description: "Spicy jalapeño chicken. Chef's special.", price: 13, category: "Chef's Specials", imageUrl: img("jalapeno-chicken"), spiceLevel: 2, popular: true },
  { id: "EC4", name: "Lemon Chicken", description: "Crispy lemon chicken.", price: 13, category: "Chef's Specials", imageUrl: img("lemon-chicken") },
  { id: "EC5", name: "Sesame Chicken", description: "Chef's special. Crispy chicken with sesame.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-chicken"), popular: true },
  { id: "EC6", name: "General Tso's Chicken", description: "Chef's special. Sweet and spicy.", price: 12.7, category: "Chef's Specials", imageUrl: img("general-tso"), spiceLevel: 2, popular: true },
  { id: "EC7", name: "Chicken w. Orange Flavor", description: "Orange-glazed chicken.", price: 12.7, category: "Chef's Specials", imageUrl: img("orange-chicken") },
  { id: "EC8", name: "Sesame Beef", description: "Chef's special.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-beef"), popular: true },
  { id: "EC9", name: "Hunan New Style", description: "Spicy Hunan style.", price: 12.7, category: "Chef's Specials", imageUrl: img("hunan-new"), spiceLevel: 2 },
  { id: "EC10", name: "Hunan Bean Curd", description: "Chef's special. Spicy tofu.", price: 12.7, category: "Chef's Specials", imageUrl: img("hunan-bean-curd"), spiceLevel: 2, popular: true },
  { id: "EC11", name: "Sesame Shrimp", description: "Crispy shrimp with sesame.", price: 12.7, category: "Chef's Specials", imageUrl: img("sesame-shrimp") },
  { id: "EC12", name: "Shrimp & Scallop w. Hot Pepper Sauce", description: "Chef's special. Spicy.", price: 13.7, category: "Chef's Specials", imageUrl: img("shrimp-scallop-hot"), spiceLevel: 2, popular: true },
  { id: "EC13", name: "Shrimp & Scallop w. Hot", description: "Chef's special.", price: 13.7, category: "Chef's Specials", imageUrl: img("shrimp-scallop") },
  { id: "EC14", name: "Beef & Scallops", description: "Beef and scallop combination.", price: 13.7, category: "Chef's Specials", imageUrl: img("beef-scallops") },
  { id: "EC15", name: "Triple Delight", description: "Three-protein specialty.", price: 13.7, category: "Chef's Specials", imageUrl: img("triple-delight") },
  { id: "EC16", name: "Four Seasons", description: "Chef's special. Seasonal combination.", price: 13.2, category: "Chef's Specials", imageUrl: img("four-seasons"), popular: true },
  { id: "EC17", name: "Crispy Chicken", description: "Chef's special. Crispy fried chicken.", price: 12.7, category: "Chef's Specials", imageUrl: img("crispy-chicken"), popular: true },
  { id: "EC18", name: "Four Seasons (alt)", description: "Qt variation.", price: 13.2, category: "Chef's Specials", imageUrl: img("four-seasons2") },
  { id: "EC19", name: "Lake Tung Ting Shrimp", description: "Specialty shrimp dish.", price: 13.2, category: "Chef's Specials", imageUrl: img("tung-ting-shrimp") },
  { id: "EC20", name: "Dragon & Phoenix", description: "Chicken and shrimp combination.", price: 13.2, category: "Chef's Specials", imageUrl: img("dragon-phoenix") },
  { id: "EC21", name: "General Tso's Chicken (Chef's)", description: "Chef's special. Sweet and spicy.", price: 12.7, category: "Chef's Specials", imageUrl: img("general-tso-chef"), spiceLevel: 2, popular: true },
  { id: "EC22", name: "Cantonese Chicken", description: "Chef's special. Cantonese style.", price: 12.7, category: "Chef's Specials", imageUrl: img("cantonese-chicken"), popular: true },
  { id: "EC23", name: "Mongolian Beef", description: "Savory Mongolian-style beef.", price: 13.2, category: "Chef's Specials", imageUrl: img("mongolian-beef") },
  { id: "EC24", name: "Black Pepper Chicken", description: "Chef's special. Black pepper sauce.", price: 12.7, category: "Chef's Specials", imageUrl: img("black-pepper-chicken"), popular: true },
];
