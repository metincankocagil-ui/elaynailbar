const designNames = [
  'Sütlü French','Altın İnce Hat','Espresso Işıltı','Blush Aura','İnci Chrome','Bordo İmza','Mocha Dalga','Minimal Nokta','Tortoiseshell','Negatif Alan',
  'Altın Çift French','Bordo Ters French','Mocha Diyagonal','İncili French','Siyah Mikro French','Karamel Ombre','Baby Boomer','Şampanya Glazed','Espresso Cat Eye','Bordo Velvet',
  'Altın Damarlı Mermer','Mocha Mermer','Rose Quartz','Jade Mermer','Smoky Quartz','Krem Terrazzo','Karamel Agate','Siyah Onyx','Amber Resin','Mat Sandstone',
  'Negatif Kavis','İnce Grid','Asimetrik Altın Nokta','Mocha Yarım Ay','Terracotta Color Block','Soyut Çizgi','Mocha Checker','Bauhaus','Altın Cuff','Mini Bordo Kalp',
  'Pressed Flowers','Beyaz Papatya','Zeytin Dalı','Altın Botanik','Kiraz Çiçeği','Bordo Gül','Lavanta','Tropik Yaprak','Sonbahar Botanik','Bridal Floral',
  'Knit Texture','Bordo Velvet Matte','Champagne Sugar','Pearl Relief','Liquid Chrome','Sculpted Wave','Crystal Drops','Mini Bow','Pearl Shell','Bridal Lace',
  'Klasik Kırmızı','Zamansız Nude','Jet Black','Milky White','Ballet Pink','Deep Plum','Midnight Navy','Soft Sage','Warm Terracotta','Dark Chocolate',
  'Nude Gold Foil','Silver Mirror','Rose Gold Mirror','Champagne Fade','Crystal Accent','Golden Constellation','Midnight Moon','Gold Flame','Jeweled French','Disco Chrome',
  'Tortoise French','Winter Snow','Pastel Micro French','Coral Aura','Bordo Gold','Warm Watercolor','Black Ink','Porcelain Blue','Espresso Latte','Refined Leopard',
  'Pearl Bridal','Short Classic French','Coffin Ombre','Natural Oval','Black Gold Stiletto','Mocha Squoval','Long Champagne Chrome','Short Scarlet','Ballerina Marble','Elay Editorial'
];
export const nailDesigns = designNames.map((name,index)=>({code:`ELAY-${String(index+1).padStart(3,'0')}`,name,photo:`/design-${String(index+1).padStart(3,'0')}.png`}));
export type NailDesign=(typeof nailDesigns)[number];
