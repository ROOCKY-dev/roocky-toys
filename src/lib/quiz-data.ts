export type QuizCategory = 'All' | 'Tech' | 'Science' | 'Pop Culture' | 'General' | 'Gaming';

export interface Question {
  id: string;
  category: QuizCategory;
  text: string;
  options: string[];
  correct: number;
}

export const QUIZ_QUESTIONS: Question[] = [
  // Tech
  { id: 't1', category: 'Tech', text: 'What does "HTTP" stand for?', options: ['HyperText Transfer Protocol', 'HyperLink Transfer Technology', 'HyperText Transmission Process', 'Hyper Transfer Text Protocol'], correct: 0 },
  { id: 't2', category: 'Tech', text: 'Which programming language is known as the "mother of all languages"?', options: ['Java', 'C', 'Assembly', 'Python'], correct: 1 },
  { id: 't3', category: 'Tech', text: 'What is the main function of a DNS?', options: ['Secure networks', 'Store databases', 'Translate domain names to IP addresses', 'Host websites'], correct: 2 },
  { id: 't4', category: 'Tech', text: 'In what year was the iPhone first released?', options: ['2005', '2007', '2009', '2010'], correct: 1 },
  { id: 't5', category: 'Tech', text: 'What company acquired GitHub in 2018?', options: ['Google', 'Amazon', 'Facebook', 'Microsoft'], correct: 3 },
  // Science
  { id: 's1', category: 'Science', text: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], correct: 2 },
  { id: 's2', category: 'Science', text: 'Which planet is known as the Red Planet?', options: ['Venus', 'Mars', 'Jupiter', 'Saturn'], correct: 1 },
  { id: 's3', category: 'Science', text: 'What is the hardest natural substance on Earth?', options: ['Gold', 'Iron', 'Diamond', 'Platinum'], correct: 2 },
  { id: 's4', category: 'Science', text: 'What force keeps planets in orbit around the sun?', options: ['Magnetism', 'Friction', 'Gravity', 'Centrifugal Force'], correct: 2 },
  { id: 's5', category: 'Science', text: 'At what temperature are Celsius and Fahrenheit equal?', options: ['-40', '0', '32', '100'], correct: 0 },
  // Pop Culture
  { id: 'p1', category: 'Pop Culture', text: 'Who played Neo in The Matrix?', options: ['Tom Cruise', 'Keanu Reeves', 'Brad Pitt', 'Will Smith'], correct: 1 },
  { id: 'p2', category: 'Pop Culture', text: 'Which movie won the first Academy Award for Best Animated Feature?', options: ['Toy Story', 'Shrek', 'Finding Nemo', 'Spirited Away'], correct: 1 },
  { id: 'p3', category: 'Pop Culture', text: 'What is the highest-grossing film of all time (as of 2024)?', options: ['Avatar', 'Avengers: Endgame', 'Titanic', 'Star Wars: The Force Awakens'], correct: 0 },
  { id: 'p4', category: 'Pop Culture', text: 'Who is the author of the Harry Potter series?', options: ['J.R.R. Tolkien', 'George R.R. Martin', 'J.K. Rowling', 'Stephen King'], correct: 2 },
  { id: 'p5', category: 'Pop Culture', text: 'What band was John Lennon a part of?', options: ['The Rolling Stones', 'The Who', 'The Beatles', 'Pink Floyd'], correct: 2 },
  // General
  { id: 'g1', category: 'General', text: 'What is the capital of Japan?', options: ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'], correct: 2 },
  { id: 'g2', category: 'General', text: 'How many continents are there?', options: ['5', '6', '7', '8'], correct: 2 },
  { id: 'g3', category: 'General', text: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correct: 1 },
  { id: 'g4', category: 'General', text: 'What is the largest ocean on Earth?', options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], correct: 3 },
  { id: 'g5', category: 'General', text: 'In which year did World War II end?', options: ['1941', '1943', '1945', '1947'], correct: 2 },
  // Gaming
  { id: 'v1', category: 'Gaming', text: 'What is the best-selling video game of all time?', options: ['Minecraft', 'Tetris', 'GTA V', 'Wii Sports'], correct: 0 },
  { id: 'v2', category: 'Gaming', text: 'Which character is the mascot of SEGA?', options: ['Mario', 'Pac-Man', 'Sonic', 'Crash Bandicoot'], correct: 2 },
  { id: 'v3', category: 'Gaming', text: 'In what game do you build and survive in a blocky 3D world?', options: ['Terraria', 'Roblox', 'Minecraft', 'Fortnite'], correct: 2 },
  { id: 'v4', category: 'Gaming', text: 'What is the name of the princess in The Legend of Zelda?', options: ['Peach', 'Zelda', 'Daisy', 'Rosalina'], correct: 1 },
  { id: 'v5', category: 'Gaming', text: 'Which console is developed by Sony?', options: ['Xbox', 'Switch', 'PlayStation', 'Genesis'], correct: 2 },
];
