export const projects = [
  {
    title: 'Rainbow Six Siege Analysis',
    description:
      'With the idea of helping players find a better playstyle, I started developing this project with the hope of training a ML model on player behavior to suggest better positions or find a better playstyle. I currently developed how I want to organize the player data from the R6Stats API. As for future plans, I\'m thinking about how to develop the ML model and store the data from profiles for the model to use.',
    image: '/images/bg-car-engine.JPG',
    link: 'https://github.com/harshpavuluri/r6analysisproject',
    tags: ['Python', 'ML', 'API'],
    featured: true,
  },
  {
    title: 'Classification Using Graph Convolution',
    description:
      'A replication piece in bringing a strong production model of Graph Convolution to Pytorch. I focused on building my own convolution layer so that I could classify nodes in a graph dataset. I also conducted hyperparameter testing to see how each hyperparameter affects the accuracy and speed of the simple model that replicates the original work of Kipf/Welling.',
    image: '/images/bg-board-table.JPG',
    link: 'https://github.com/harshpavuluri/pygcn',
    tags: ['PyTorch', 'Graph Neural Networks'],
    featured: false,
  },
  {
    title: 'TrustWorthy Modules',
    description:
      'This project was focused on creating an implementation on scoring NPM modules and deploying that to the cloud for a company to see what modules may be deemed "trustworthy". This involved creating grading scripts based on aspects within NPM modules, building a Flask API, and our own CI/CD pipeline deployed to Google Cloud.',
    image: '/images/bg-car-rear.JPG',
    link: null,
    tags: ['Flask', 'CI/CD', 'Google Cloud'],
    featured: false,
  },
]
