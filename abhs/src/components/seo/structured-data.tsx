export function StructuredData() {
  const hairSalon = {
    '@context': 'https://schema.org',
    '@type': 'HairSalon',
    '@id': 'https://allbeautyhairstudio.com/#salon',
    name: 'All Beauty Hair Studio',
    alternateName: 'ABHS',
    description:
      'Intentional hair design by Karli Rosario. Precision cuts and lived-in dimensional color that grows out gracefully. Located at The Colour Parlor in Wildomar, CA. Serving Wildomar, Murrieta, Temecula, Lake Elsinore, Menifee, and Canyon Lake.',
    url: 'https://allbeautyhairstudio.com',
    telephone: '+19515416620',
    image: 'https://allbeautyhairstudio.com/images/og-image-v2.jpg',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '32395 Clinton Keith Rd, Suite A-103',
      addressLocality: 'Wildomar',
      addressRegion: 'CA',
      postalCode: '92595',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.5975,
      longitude: -117.2653,
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Tuesday', opens: '09:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Wednesday', opens: '09:00', closes: '19:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: 'Thursday', opens: '09:00', closes: '19:00' },
    ],
    areaServed: [
      { '@type': 'City', name: 'Wildomar', sameAs: 'https://en.wikipedia.org/wiki/Wildomar,_California' },
      { '@type': 'City', name: 'Murrieta' },
      { '@type': 'City', name: 'Temecula' },
      { '@type': 'City', name: 'Lake Elsinore' },
      { '@type': 'City', name: 'Menifee' },
      { '@type': 'City', name: 'Canyon Lake' },
      { '@type': 'City', name: 'Hemet' },
      { '@type': 'City', name: 'Perris' },
      { '@type': 'City', name: 'Sun City' },
    ],
    founder: { '@id': 'https://allbeautyhairstudio.com/#karli' },
    hasOfferCatalog: { '@id': 'https://allbeautyhairstudio.com/#services' },
    sameAs: [
      'https://instagram.com/allbeautyhairstudio',
      'https://facebook.com/allbeautyhair',
    ],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': 'https://allbeautyhairstudio.com/#karli',
    name: 'Karli Rosario',
    jobTitle: 'Intentional Hair Designer',
    description:
      'Licensed hair artist specializing in precision scissor and razor cuts, lived-in dimensional color, and low maintenance hair design in Wildomar, CA.',
    worksFor: { '@id': 'https://allbeautyhairstudio.com/#salon' },
    workLocation: {
      '@type': 'Place',
      name: 'The Colour Parlor',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '32395 Clinton Keith Rd, Suite A-103',
        addressLocality: 'Wildomar',
        addressRegion: 'CA',
        postalCode: '92595',
      },
    },
    sameAs: [
      'https://instagram.com/allbeautyhairstudio',
      'https://facebook.com/allbeautyhair',
    ],
  };

  const services = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': 'https://allbeautyhairstudio.com/#services',
    name: 'Hair Services',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Precision Haircut & Style',
          description: 'Signature scissor and razor cuts designed to grow out beautifully and work with your natural texture.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Low Maintenance Color',
          description: 'Color designed to grow out gracefully so you decide when to come back, not your hair.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Lived-in Dimensional Color',
          description: 'Balayage and dimensional highlights placed strategically for natural, sun-kissed movement.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Mini Service',
          description: 'Quick services like bang trims, toner refreshes, and minor adjustments between full appointments.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Color Correction',
          description: 'Fixing color gone wrong, whether from box dye, another salon, or a DIY experiment. Honest assessment, realistic timeline.',
          provider: { '@id': 'https://allbeautyhairstudio.com/#salon' },
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hairSalon) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(services) }}
      />
    </>
  );
}
