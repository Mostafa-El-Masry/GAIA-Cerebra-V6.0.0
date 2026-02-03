export type TimelineEvent = {
  id: string;
  /** ISO date for calendar events */
  date?: string;
  /** Years before present for deep-time events (Earth formation, dinosaurs, etc.) */
  yearsAgo?: number;
  title: string;
  description?: string;
};

/** Era: start (years ago, older) and end (years ago, younger). Present = 0; future = negative. */
export type Era = {
  id: string;
  name: string;
  startYearsAgo: number;
  endYearsAgo: number;
};

export const eras: Era[] = [
  { id: "universe", name: "Universe", startYearsAgo: 13_800_000_000, endYearsAgo: 4_600_000_000 },
  { id: "earth-life", name: "Earth & Life", startYearsAgo: 4_600_000_000, endYearsAgo: 252_000_000 },
  { id: "dinosaurs", name: "Dinosaurs", startYearsAgo: 252_000_000, endYearsAgo: 66_000_000 },
  { id: "cenozoic", name: "Cenozoic & Hominids", startYearsAgo: 66_000_000, endYearsAgo: 12_000 },
  { id: "civilization", name: "Civilization", startYearsAgo: 12_000, endYearsAgo: 525 },
  { id: "1500s", name: "1500s", startYearsAgo: 525, endYearsAgo: 425 },
  { id: "1600s", name: "1600s", startYearsAgo: 425, endYearsAgo: 325 },
  { id: "1700s", name: "1700s", startYearsAgo: 325, endYearsAgo: 225 },
  { id: "1800s", name: "1800s", startYearsAgo: 225, endYearsAgo: 125 },
  { id: "1900s", name: "1900s", startYearsAgo: 125, endYearsAgo: 65 },
  { id: "1960s", name: "1960s", startYearsAgo: 65, endYearsAgo: 55 },
  { id: "1970s", name: "1970s", startYearsAgo: 55, endYearsAgo: 45 },
  { id: "1980s", name: "1980s", startYearsAgo: 45, endYearsAgo: 35 },
  { id: "1990s", name: "1990s", startYearsAgo: 35, endYearsAgo: 25 },
  { id: "2000s", name: "2000s", startYearsAgo: 25, endYearsAgo: 15 },
  { id: "2010s", name: "2010s", startYearsAgo: 15, endYearsAgo: 5 },
  { id: "2020s", name: "2020s", startYearsAgo: 5, endYearsAgo: 0 },
  { id: "future", name: "Future / GAIA", startYearsAgo: 0, endYearsAgo: -10 },
];

export const events: TimelineEvent[] = [
  // Universe
  {
    id: "e0-bigbang",
    yearsAgo: 13_800_000_000,
    title: "Big Bang",
    description: "Universe begins; space, time, and the first particles emerge from a hot, dense state.",
  },
  {
    id: "e0-cmb",
    yearsAgo: 13_800_000_000,
    title: "Recombination — first light",
    description: "Universe becomes transparent; photons decouple. This light is the cosmic microwave background (CMB).",
  },
  {
    id: "e0-first-stars",
    yearsAgo: 13_400_000_000,
    title: "First stars (Population III)",
    description: "First stars form from hydrogen and helium; no heavy elements yet.",
  },
  {
    id: "e0-first-galaxies",
    yearsAgo: 13_200_000_000,
    title: "First galaxies",
    description: "Matter clumps into protogalaxies; early structure in the universe.",
  },
  {
    id: "e0-milky-way",
    yearsAgo: 13_000_000_000,
    title: "Milky Way begins",
    description: "Our galaxy starts to form from mergers of smaller protogalaxies.",
  },
  {
    id: "e0-solar-system",
    yearsAgo: 4_600_000_000,
    title: "Solar System forms",
    description: "Sun and protoplanetary disk form from a collapsing cloud; planets will accrete.",
  },
  // Earth, life, dinosaurs, mankind
  {
    id: "e0-formation",
    yearsAgo: 4_540_000_000,
    title: "Formation of Earth",
    description: "Earth accretes from the solar nebula; molten surface, heavy bombardment.",
  },
  {
    id: "e0-moon",
    yearsAgo: 4_510_000_000,
    title: "Giant impact — Moon forms",
    description: "Theia collides with Earth; debris coalesces into the Moon.",
  },
  {
    id: "e0-life",
    yearsAgo: 3_800_000_000,
    title: "Earliest life",
    description: "First evidence of life (stromatolites, possible earlier).",
  },
  {
    id: "e0-oxygen",
    yearsAgo: 2_400_000_000,
    title: "Great Oxidation Event",
    description: "Cyanobacteria oxygenate the atmosphere; mass extinction of anaerobes.",
  },
  {
    id: "e0-dino-triassic",
    yearsAgo: 252_000_000,
    title: "Triassic — dinosaurs appear",
    description: "After Permian–Triassic extinction; first dinosaurs and mammals.",
  },
  {
    id: "e0-dino-jurassic",
    yearsAgo: 201_000_000,
    title: "Jurassic — age of giants",
    description: "Sauropods, stegosaurs, early birds; Pangea splits.",
  },
  {
    id: "e0-dino-cretaceous",
    yearsAgo: 145_000_000,
    title: "Cretaceous — flowering plants",
    description: "T. rex, Triceratops; first flowering plants and bees.",
  },
  {
    id: "e0-k-t",
    yearsAgo: 66_000_000,
    title: "K–T extinction — dinosaurs die out",
    description: "Asteroid impact (Chicxulub); non-avian dinosaurs and many species go extinct.",
  },
  {
    id: "e0-primates",
    yearsAgo: 55_000_000,
    title: "Early primates",
    description: "Primate-like mammals diversify after the extinction.",
  },
  {
    id: "e0-hominids",
    yearsAgo: 6_000_000,
    title: "Hominids split from other apes",
    description: "Line leading to humans diverges from chimpanzee line.",
  },
  {
    id: "e0-homo",
    yearsAgo: 2_800_000,
    title: "Genus Homo",
    description: "Early Homo (habilis, erectus) — stone tools, fire, migration.",
  },
  {
    id: "e0-sapiens",
    yearsAgo: 300_000,
    title: "Homo sapiens",
    description: "Anatomically modern humans; art, symbolism, complex culture.",
  },
  {
    id: "e0-agriculture",
    yearsAgo: 12_000,
    title: "Agriculture and settlements",
    description: "Domestication of plants and animals; first villages and cities.",
  },
  // 1500s
  {
    id: "e15-copernicus",
    date: "1543-05-24",
    title: "Copernicus — De revolutionibus",
    description: "Heliocentric model published; Earth orbits the Sun.",
  },
  {
    id: "e15-armada",
    date: "1588-08-08",
    title: "Defeat of the Spanish Armada",
    description: "English fleet defeats the Spanish Armada; shift in naval power.",
  },
  {
    id: "e15-shakespeare",
    date: "1599-01-01",
    title: "Globe Theatre opens",
    description: "Shakespeare's company opens the Globe in London.",
  },
  // 1600s
  {
    id: "e16-galileo",
    date: "1610-01-07",
    title: "Galileo — Sidereus Nuncius",
    description: "Telescopic observations of the Moon, Jupiter's moons; evidence for heliocentrism.",
  },
  {
    id: "e16-mayflower",
    date: "1620-11-21",
    title: "Mayflower Compact",
    description: "Pilgrims sign the Mayflower Compact at Plymouth.",
  },
  {
    id: "e16-newton",
    date: "1687-07-05",
    title: "Newton — Principia",
    description: "Mathematical Principles of Natural Philosophy; laws of motion and gravity.",
  },
  // 1700s
  {
    id: "e17-enlightenment",
    date: "1751-01-01",
    title: "Encyclopédie (Diderot)",
    description: "First volume of the French Encyclopédie; Enlightenment project.",
  },
  {
    id: "e17-independence",
    date: "1776-07-04",
    title: "US Declaration of Independence",
    description: "American colonies declare independence from Britain.",
  },
  {
    id: "e17-french-rev",
    date: "1789-07-14",
    title: "Fall of the Bastille",
    description: "Start of the French Revolution; symbol of the ancien régime falls.",
  },
  {
    id: "e17-jenner",
    date: "1796-05-14",
    title: "Jenner — first smallpox vaccine",
    description: "Edward Jenner inoculates with cowpox; birth of vaccination.",
  },
  // 1800s
  {
    id: "e18-napoleon",
    date: "1804-12-02",
    title: "Napoleon crowned Emperor",
    description: "Napoleon Bonaparte crowns himself Emperor of the French.",
  },
  {
    id: "e18-darwin",
    date: "1859-11-24",
    title: "Darwin — On the Origin of Species",
    description: "Evolution by natural selection; foundation of modern biology.",
  },
  {
    id: "e18-telephone",
    date: "1876-03-10",
    title: "First telephone transmission",
    description: "Alexander Graham Bell: 'Mr. Watson, come here.'",
  },
  {
    id: "e18-light-bulb",
    date: "1879-10-21",
    title: "Edison — practical incandescent lamp",
    description: "Thomas Edison demonstrates a long-lasting carbon filament bulb.",
  },
  {
    id: "e18-xray",
    date: "1895-11-08",
    title: "Röntgen discovers X-rays",
    description: "Wilhelm Röntgen observes X-rays; first Nobel Prize in Physics (1901).",
  },
  // 1900s (1900–1959)
  {
    id: "e19-wright",
    date: "1903-12-17",
    title: "Wright brothers — first powered flight",
    description: "Orville and Wilbur Wright fly at Kitty Hawk, North Carolina.",
  },
  {
    id: "e19-einstein",
    date: "1905-09-26",
    title: "Einstein — special relativity",
    description: "Annus mirabilis paper: E = mc², relativity of space and time.",
  },
  {
    id: "e19-wwi",
    date: "1914-07-28",
    title: "World War I begins",
    description: "Austria-Hungary declares war on Serbia; Great War starts.",
  },
  {
    id: "e19-penicillin",
    date: "1928-09-28",
    title: "Fleming discovers penicillin",
    description: "Alexander Fleming notices mould killing bacteria; first antibiotic.",
  },
  {
    id: "e19-wwii",
    date: "1939-09-01",
    title: "World War II begins",
    description: "Germany invades Poland; Britain and France declare war.",
  },
  {
    id: "e19-hiroshima",
    date: "1945-08-06",
    title: "Atomic bomb — Hiroshima",
    description: "First use of a nuclear weapon in war; Enola Gay drops Little Boy.",
  },
  {
    id: "e19-sputnik",
    date: "1957-10-04",
    title: "Sputnik 1",
    description: "First artificial satellite; USSR launches the Space Age.",
  },
  // Project / GAIA
  {
    id: "e1",
    date: "2026-03-23",
    title: "Phase 5 begins",
    description: "GAIA v2.0 Beta kicks off.",
  },
  {
    id: "e2",
    date: "2026-03-27",
    title: "Citadel foundation",
    description: "Tower + Academy skeleton.",
  },
  {
    id: "e3",
    date: "2026-03-31",
    title: "ELEUTHIA foundation",
    description: "Zero‑knowledge vault online.",
  },
  {
    id: "e4",
    date: "2026-04-02",
    title: "Instagram polish",
    description: "Swipe + arrows + no layout shift.",
  },
  // Historical
  {
    id: "e5",
    date: "1969-07-20",
    title: "Apollo 11 Moon landing",
    description: "Neil Armstrong and Buzz Aldrin land on the Moon; first humans on another celestial body.",
  },
  {
    id: "e6",
    date: "1989-11-09",
    title: "Fall of the Berlin Wall",
    description: "East Germany opens the border; the Wall is opened and later dismantled.",
  },
  {
    id: "e7",
    date: "1991-08-25",
    title: "Linus Torvalds announces Linux",
    description: "First public post about the Linux kernel on comp.os.minix.",
  },
  {
    id: "e8",
    date: "1998-09-04",
    title: "Google founded",
    description: "Larry Page and Sergey Brin incorporate Google in Menlo Park, California.",
  },
  {
    id: "e9",
    date: "2001-01-15",
    title: "Wikipedia launched",
    description: "Jimmy Wales and Larry Sanger launch Wikipedia as a free, editable encyclopedia.",
  },
  {
    id: "e10",
    date: "2007-01-09",
    title: "iPhone introduced",
    description: "Steve Jobs unveils the first iPhone at Macworld in San Francisco.",
  },
  {
    id: "e11",
    date: "2012-08-06",
    title: "Curiosity lands on Mars",
    description: "NASA's Curiosity rover lands in Gale Crater on Mars.",
  },
  {
    id: "e12",
    date: "2020-03-11",
    title: "COVID-19 declared pandemic",
    description: "WHO declares the novel coronavirus outbreak a global pandemic.",
  },
];
