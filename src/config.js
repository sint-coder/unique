// Prices/limits live here only. Checkout is created by the backend from plan id.
export const PRICING_PLANS = [
  { id: 'student', name: 'Student', price: '$9.99', period: '/ month', words: '10,000 words / month' },
  { id: 'pro', name: 'Pro', price: '$19.99', period: '/ month', words: '50,000 words / month' },
  { id: 'one_time', name: 'One-time', price: '$29.99', period: '', words: '100,000 words, no subscription' },
];
export const MODES = [
  { id: 'natural', name: 'Natural', hint: 'Less repetitive, smoother transitions' },
  { id: 'academic', name: 'Academic', hint: 'Keeps formal tone, sounds less mechanical' },
  { id: 'simple', name: 'Simple English', hint: 'Clearer wording for non-native writers' },
];
export const FREE_WORDS = 1000;
export const MIN_WORDS = 50;
export const MAX_WORDS = 2000;
export const HEROES = {
  default: 'Make AI-assisted writing sound natural.',
  professor: 'Make your AI-assisted essay sound natural.',
  essay: 'Turn a stiff draft into an essay that reads well.',
  chatgpt: 'Edit your ChatGPT draft until it sounds like you.',
  deadline: 'Fix your AI draft before your deadline.',
};
