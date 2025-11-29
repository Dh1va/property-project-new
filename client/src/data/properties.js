const properties = [
  {
    id: 1,
    title: "Modern Apartment in Downtown Dubai",
    type: "Apartment",
    price: 1250000,
    size: 120,
    zip: 8001,
    city: "Dubai",
    country: "UAE",
    rooms: 3,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1572120360610-d971b9b78825?w=800&q=80",
      "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800&q=80"
    ],
    amenities: ["Balcony", "Elevator", "Parking"],
    description: "A spacious modern apartment in the heart of Downtown Dubai with skyline views."
  },
  {
    id: 2,
    title: "Luxury Villa with Palm View",
    type: "Villa",
    price: 6200000,
    size: 400,
    zip: 9999,
    city: "Palm Jumeirah",
    country: "UAE",
    rooms: 5,
    bathrooms: 4,
    images: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"
    ],
    amenities: ["Pool", "Garage", "Lake view"],
    description: "A stunning villa on Palm Jumeirah, offering luxury living and breathtaking sea views."
  },
  {
    id: 3,
    title: "Cozy Studio Apartment",
    type: "Studio",
    price: 480000,
    size: 45,
    zip: 1000,
    city: "Business Bay",
    country: "UAE",
    rooms: 1,
    bathrooms: 1,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80"
    ],
    amenities: ["Public Transit", "Stores"],
    description: "A well-designed studio ideal for single professionals or investors."
  },
  {
    id: 4,
    title: "Elegant 3BR Townhouse",
    type: "Townhouse",
    price: 1800000,
    size: 200,
    zip: 3000,
    city: "Arabian Ranches",
    country: "UAE",
    rooms: 3,
    bathrooms: 3,
    images: [
      "https://images.unsplash.com/photo-1600607687220-efd5e9e0f20c?w=800&q=80",
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80"
    ],
    amenities: ["Garage", "Balcony", "Kindergarten"],
    description: "A family-friendly townhouse in a gated community, perfect for raising kids."
  },
  {
    id: 5,
    title: "High-Rise Penthouse with View",
    type: "Penthouse",
    price: 4500000,
    size: 350,
    zip: 2000,
    city: "Downtown Dubai",
    country: "UAE",
    rooms: 4,
    bathrooms: 4,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80",
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80"
    ],
    amenities: ["Balcony", "Parking", "Elevator"],
    description: "A premium penthouse in the heart of the city with panoramic views."
  },
  {
    id: 6,
    title: "Beachfront Villa in JBR",
    type: "Villa",
    price: 7800000,
    size: 500,
    zip: 1234,
    city: "Jumeirah Beach Residence",
    country: "UAE",
    rooms: 6,
    bathrooms: 5,
    images: [
      "https://images.unsplash.com/photo-1613977257360-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80"
    ],
    amenities: ["Pool", "Beach access", "Garage"],
    description: "Exclusive beachfront villa providing resort-style living."
  },
  {
    id: 7,
    title: "Smart Home Apartment",
    type: "Apartment",
    price: 950000,
    size: 100,
    zip: 5678,
    city: "Dubai Marina",
    country: "UAE",
    rooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1600585154207-5c1e6e4b9d81?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80"
    ],
    amenities: ["Balcony", "Public Transit", "Parking"],
    description: "A tech-enabled apartment in Marina, ideal for modern urban living."
  },
  {
    id: 8,
    title: "Family Villa with Garden",
    type: "Villa",
    price: 5600000,
    size: 450,
    zip: 4321,
    city: "Al Barari",
    country: "UAE",
    rooms: 5,
    bathrooms: 4,
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
    ],
    amenities: ["Garden", "Pool", "Parking"],
    description: "A serene villa with lush garden space and family-friendly design."
  },
  {
    id: 9,
    title: "Luxury Loft Apartment",
    type: "Loft",
    price: 1300000,
    size: 150,
    zip: 3456,
    city: "City Walk",
    country: "UAE",
    rooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1618221352000-1c9a6b1a5b1e?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80"
    ],
    amenities: ["Balcony", "Elevator", "Parking"],
    description: "A chic loft in City Walk, combining comfort and downtown convenience."
  },
  {
    id: 10,
    title: "Golf Course Townhouse",
    type: "Townhouse",
    price: 1700000,
    size: 210,
    zip: 6789,
    city: "DAMAC Hills",
    country: "UAE",
    rooms: 3,
    bathrooms: 3,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257360-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80"
    ],
    amenities: ["Golf View", "Garage", "Parking"],
    description: "Townhouse overlooking the golf course in an upscale community."
  },
  {
    id: 11,
    title: "Urban Apartment with Skyline View",
    type: "Apartment",
    price: 980000,
    size: 95,
    zip: 2468,
    city: "Downtown Dubai",
    country: "UAE",
    rooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
    ],
    amenities: ["Balcony", "Elevator", "Parking"],
    description: "Compact yet luxurious apartment with skyline views in the heart of the city."
  },
  {
    id: 12,
    title: "Luxury Duplex Penthouse",
    type: "Penthouse",
    price: 4200000,
    size: 320,
    zip: 1357,
    city: "Business Bay",
    country: "UAE",
    rooms: 4,
    bathrooms: 4,
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80"
    ],
    amenities: ["Terrace", "Parking", "Elevator"],
    description: "A duplex penthouse with modern finishes and panoramic water views."
  },
  {
    id: 13,
    title: "Spacious Villa with Private Pool",
    type: "Villa",
    price: 9200000,
    size: 600,
    zip: 8642,
    city: "Jumeirah Islands",
    country: "UAE",
    rooms: 6,
    bathrooms: 5,
    images: [
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1618221352000-1c9a6b1a5b1e?w=800&q=80"
    ],
    amenities: ["Pool", "Garden", "Garage"],
    description: "A premium villa featuring its own private pool and lush outdoor space."
  },
  {
    id: 14,
    title: "Minimalist Studio Apartment",
    type: "Studio",
    price: 510000,
    size: 50,
    zip: 9753,
    city: "Dubai Hills",
    country: "UAE",
    rooms: 1,
    bathrooms: 1,
    images: [
      "https://images.unsplash.com/photo-1599423300746-b62533397364?w=800&q=80",
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80",
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80"
    ],
    amenities: ["Public Transit", "Gym"],
    description: "A sleek and affordable studio in Dubai Hills designed for smart living."
  },
  {
    id: 15,
    title: "Contemporary Townhouse",
    type: "Townhouse",
    price: 1600000,
    size: 180,
    zip: 7531,
    city: "Arabian Ranches",
    country: "UAE",
    rooms: 3,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1575517111478-7f6afd0973db?w=800&q=80"
    ],
    amenities: ["Balcony", "Parking", "Garden"],
    description: "A modern townhouse in a quiet community, perfect for families."
  },
  {
    id: 16,
    title: "Executive Apartment in DIFC",
    type: "Apartment",
    price: 2000000,
    size: 140,
    zip: 4329,
    city: "DIFC",
    country: "UAE",
    rooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1600607687000-f9ff70c1d1d1?w=800&q=80",
      "https://images.unsplash.com/photo-1618221352000-1c9a6b1a5b1e?w=800&q=80",
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80"
    ],
    amenities: ["Gym", "Elevator", "Parking"],
    description: "High-end executive apartment in business district with premium amenities."
  },
  {
    id: 17,
    title: "Luxury Townhouse in The Springs",
    type: "Townhouse",
    price: 3500000,
    size: 500,
    zip: 9876,
    city: "The Springs",
    country: "UAE",
    rooms: 4,
    bathrooms: 5,
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80"
    ],
    amenities: ["Community Pool", "Garden", "Parking"],
    description: "Spacious townhouse in a peaceful community with water features."
  },
  {
    id: 18,
    title: "Urban Loft in City Walk",
    type: "Loft",
    price: 1300000,
    size: 160,
    zip: 6543,
    city: "City Walk",
    country: "UAE",
    rooms: 2,
    bathrooms: 2,
    images: [
      "https://images.unsplash.com/photo-1618221352000-1c9a6b1a5b1e?w=800&q=80",
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80"
    ],
    amenities: ["Balcony","Gym","Parking"],
    description: "Stylish loft apartment near shopping and dining in City Walk."
  },
  {
    id: 19,
    title: "Resort-Style Villa in Emirates Hills",
    type: "Villa",
    price: 11000000,
    size: 700,
    zip: 1111,
    city: "Emirates Hills",
    country: "UAE",
    rooms: 6,
    bathrooms: 6,
    images: [
      "https://images.unsplash.com/photo-1628744448505-982d7a2e4a17?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80"
    ],
    amenities: ["Lake view", "Golf view", "Garage"],
    description: "Ultra-luxury villa in Emirates Hills, ideal for top tier living."
  },
  {
    id: 20,
    title: "Studio Apartment in Discovery Gardens",
    type: "Studio",
    price: 550000,
    size: 50,
    zip: 2222,
    city: "Discovery Gardens",
    country: "UAE",
    rooms: 1,
    bathrooms: 1,
    images: [
      "https://images.unsplash.com/photo-1625736202321-eca2e3df1c6e?w=800&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80",
      "https://images.unsplash.com/photo-1617103908934-4bdfb01a2b71?w=800&q=80"
    ],
    amenities: ["Affordable", "Transit Access"],
    description: "Budget-friendly studio in a fast-growing community."
  },
   {
    id: 21,
    title: "Prime Land Plot in Al Barari",
    type: "Land",
    price: 1200000,
    size: 1800,
    zip: 5551,
    city: "Al Barari",
    country: "UAE",
    rooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Garden Area", "Security System", "Easy Access Road"],
    description: "A prime land parcel surrounded by lush greenery, perfect for developing a private villa."
  },
  {
    id: 22,
    title: "Commercial Office Tower in Business Bay",
    type: "Commercial Building",
    price: 8900000,
    size: 3500,
    zip: 5552,
    city: "Business Bay",
    country: "UAE",
    rooms: 15,
    bathrooms: 10,
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1581093588401-22f25c152de5?w=800&q=80"
    ],
    amenities: ["Parking", "Elevator", "Security System"],
    description: "A modern high-rise commercial building ideal for corporate offices and co-working spaces."
  },
  {
    id: 23,
    title: "Investment Land Near Dubai South",
    type: "Land",
    price: 1500000,
    size: 2500,
    zip: 5553,
    city: "Dubai South",
    country: "UAE",
    rooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["High ROI Potential", "Road Access", "Utility Ready"],
    description: "A large land parcel ready for development, ideal for residential or commercial projects."
  },
  {
    id: 24,
    title: "Retail Building in Deira",
    type: "Commercial Building",
    price: 6200000,
    size: 2800,
    zip: 5554,
    city: "Deira",
    country: "UAE",
    rooms: 8,
    bathrooms: 6,
    images: [
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Retail Units", "Parking", "Security"],
    description: "A commercial property with multiple retail units and steady rental yield."
  },
  {
    id: 25,
    title: "Exclusive Land Plot in Emirates Hills",
    type: "Land",
    price: 5500000,
    size: 3200,
    zip: 5555,
    city: "Emirates Hills",
    country: "UAE",
    rooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Lake View", "Security", "Prime Location"],
    description: "Exclusive residential land in Emirates Hills, perfect for a luxury villa project."
  },
  {
    id: 26,
    title: "Corporate Tower in Downtown Dubai",
    type: "Commercial Building",
    price: 14500000,
    size: 5000,
    zip: 5556,
    city: "Downtown Dubai",
    country: "UAE",
    rooms: 20,
    bathrooms: 12,
    images: [
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1581093588401-22f25c152de5?w=800&q=80"
    ],
    amenities: ["Conference Hall", "High-Speed Elevators", "Parking"],
    description: "A premium commercial tower with modern infrastructure and excellent connectivity."
  },
  {
    id: 27,
    title: "Desert View Land Plot in Al Qudra",
    type: "Land",
    price: 800000,
    size: 2200,
    zip: 5557,
    city: "Al Qudra",
    country: "UAE",
    rooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Open View", "Eco-Friendly Zone", "Easy Access"],
    description: "Scenic land plot perfect for eco-living projects or long-term investment."
  },
  {
    id: 28,
    title: "Showroom Complex in Sheikh Zayed Road",
    type: "Commercial Building",
    price: 9800000,
    size: 4200,
    zip: 5558,
    city: "Sheikh Zayed Road",
    country: "UAE",
    rooms: 12,
    bathrooms: 8,
    images: [
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Showrooms", "Parking", "Prime Road Access"],
    description: "Highly visible commercial building ideal for luxury brand showrooms."
  },
  {
    id: 29,
    title: "Corner Land in Mirdif",
    type: "Land",
    price: 1700000,
    size: 1900,
    zip: 5559,
    city: "Mirdif",
    country: "UAE",
    rooms: 0,
    bathrooms: 0,
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80"
    ],
    amenities: ["Corner Plot", "Community Access", "Investment Ready"],
    description: "A corner plot in Mirdif, ideal for building a residential or rental property."
  },
  {
    id: 30,
    title: "Business Complex in Dubai Silicon Oasis",
    type: "Commercial Building",
    price: 7600000,
    size: 3800,
    zip: 5560,
    city: "Dubai Silicon Oasis",
    country: "UAE",
    rooms: 14,
    bathrooms: 10,
    images: [
      "https://images.unsplash.com/photo-1581093588401-22f25c152de5?w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80"
    ],
    amenities: ["Conference Room", "Security System", "Ample Parking"],
    description: "Modern business complex offering flexible office spaces and excellent amenities."
  }
];

export default properties;
