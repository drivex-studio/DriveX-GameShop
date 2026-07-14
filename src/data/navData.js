export const navItems = [
  { text: 'Home', link: { href: '/' } },
  { text: 'Work', link: { href: '/work' } },
  { text: 'Pricing', link: { href: '/pricing' } },  
  { text: 'About', link: { href: '/about' } },
  { text: 'Contact', link: { href: '/contact' } },
];

export const flyout = {
  contact: { 
    email: 'hello@drivex.com', 
    phone: '+95 9 123 456 789' 
  },
  team: [
    { name: 'Jane Doe', email: 'jane@drivex.com' }
  ],
  socials: [
    { name: 'Instagram', handle: '@drivex', href: 'https://instagram.com/drivex' }
  ],
  location: 'Yangon, Myanmar',
  availability: { 
    text: 'Available for work', 
    isAvailable: true 
  },
  
  centerImage: { 
    image: {
      _id: 'image-c512a295f807dc326d0a163eaf21d603df6e9381-2556x1179-jpg',
      dimensions: {
        width: 2556,
        height: 1179,
        aspectRatio: 2556 / 1179
      }
    }, 
    caption: 'Latest project' 
  },
  featuredProject: { 
    project: { 
      uri: '/work/project-1', 
      image: {
        _id: 'image-c512a295f807dc326d0a163eaf21d603df6e9381-2556x1179-jpg',
        dimensions: {
          width: 2556,
          height: 1179,
          aspectRatio: 2556 / 1179
        }
      }, 
      title: 'Project 1' 
    }, 
    caption: 'Featured' 
  },
};

export const headerCta = { text: 'Book a call' };
export const spotsRemaining = 3;
