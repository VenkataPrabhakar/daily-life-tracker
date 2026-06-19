import type { CategoryDefinition, FinanceTag } from '../../core/types';

type ExpenseGroup = { id: string; label: string; icon?: string; children: { id: string; label: string }[] };

const EXPENSE_TREE: ExpenseGroup[] = [
  {
    id: 'housing', label: 'Housing', icon: '🏠',
    children: [
      { id: 'rent', label: 'Rent' },
      { id: 'mortgage', label: 'Mortgage' },
      { id: 'hoa', label: 'HOA' },
      { id: 'repairs', label: 'Repairs' },
    ],
  },
  {
    id: 'utilities', label: 'Utilities', icon: '💡',
    children: [
      { id: 'electricity', label: 'Electricity' },
      { id: 'water', label: 'Water' },
      { id: 'gas', label: 'Gas' },
      { id: 'internet', label: 'Internet' },
      { id: 'mobile', label: 'Mobile' },
      { id: 'cable', label: 'Cable' },
    ],
  },
  {
    id: 'food', label: 'Food', icon: '🍽️',
    children: [
      { id: 'groceries', label: 'Groceries' },
      { id: 'restaurants', label: 'Restaurants' },
      { id: 'coffee', label: 'Coffee' },
    ],
  },
  {
    id: 'transportation', label: 'Transportation', icon: '🚗',
    children: [
      { id: 'fuel', label: 'Fuel' },
      { id: 'parking', label: 'Parking' },
      { id: 'toll', label: 'Toll' },
      { id: 'car-maintenance', label: 'Car Maintenance' },
      { id: 'registration', label: 'Registration' },
    ],
  },
  {
    id: 'insurance', label: 'Insurance', icon: '🛡️',
    children: [
      { id: 'health-insurance', label: 'Health Insurance' },
      { id: 'auto-insurance', label: 'Auto Insurance' },
      { id: 'home-insurance', label: 'Home Insurance' },
      { id: 'life-insurance', label: 'Life Insurance' },
    ],
  },
  {
    id: 'healthcare', label: 'Healthcare', icon: '🏥',
    children: [
      { id: 'doctor', label: 'Doctor' },
      { id: 'dentist', label: 'Dentist' },
      { id: 'medicines', label: 'Medicines' },
      { id: 'vision', label: 'Vision' },
    ],
  },
  {
    id: 'fitness', label: 'Fitness', icon: '💪',
    children: [
      { id: 'gym', label: 'Gym' },
      { id: 'supplements', label: 'Supplements' },
      { id: 'protein', label: 'Protein Powder' },
    ],
  },
  {
    id: 'entertainment', label: 'Entertainment', icon: '🎬',
    children: [
      { id: 'netflix', label: 'Netflix' },
      { id: 'spotify', label: 'Spotify' },
      { id: 'movies', label: 'Movies' },
      { id: 'games', label: 'Games' },
    ],
  },
  {
    id: 'shopping', label: 'Shopping', icon: '🛍️',
    children: [
      { id: 'amazon', label: 'Amazon' },
      { id: 'clothes', label: 'Clothes' },
      { id: 'electronics', label: 'Electronics' },
    ],
  },
  {
    id: 'education', label: 'Education', icon: '📚',
    children: [
      { id: 'tuition', label: 'Tuition' },
      { id: 'certifications', label: 'Certifications' },
      { id: 'books', label: 'Books' },
    ],
  },
  {
    id: 'travel', label: 'Travel', icon: '✈️',
    children: [
      { id: 'flights', label: 'Flights' },
      { id: 'hotels', label: 'Hotels' },
      { id: 'activities', label: 'Activities' },
    ],
  },
  {
    id: 'family', label: 'Family', icon: '👨‍👩‍👧',
    children: [
      { id: 'gifts', label: 'Gifts' },
      { id: 'parents', label: 'Parents' },
      { id: 'kids', label: 'Kids' },
      { id: 'pets', label: 'Pets' },
    ],
  },
  {
    id: 'miscellaneous', label: 'Miscellaneous', icon: '📦',
    children: [{ id: 'misc', label: 'Other' }],
  },
];

export function buildExpenseCategories(): CategoryDefinition[] {
  const out: CategoryDefinition[] = [];
  for (const group of EXPENSE_TREE) {
    out.push({ id: group.id, label: group.label, icon: group.icon, module: 'expenses' });
    for (const child of group.children) {
      out.push({ id: child.id, label: child.label, parentId: group.id, module: 'expenses' });
    }
  }
  return out;
}

export const INCOME_SOURCES: CategoryDefinition[] = [
  { id: 'salary', label: 'Salary', module: 'income' },
  { id: 'bonus', label: 'Bonus', module: 'income' },
  { id: 'freelancing', label: 'Freelancing', module: 'income' },
  { id: 'side-income', label: 'Side Income', module: 'income' },
  { id: 'business', label: 'Business Income', module: 'income' },
  { id: 'rental', label: 'Rental Income', module: 'income' },
  { id: 'dividends', label: 'Dividends', module: 'income' },
  { id: 'interest', label: 'Interest', module: 'income' },
];

export const FINANCE_TAGS: FinanceTag[] = [
  { id: 'essential', label: 'essential', color: '#64748b' },
  { id: 'health', label: 'health', color: '#10b981' },
  { id: 'vacation', label: 'vacation', color: '#0ea5e9' },
  { id: 'tax', label: 'tax', color: '#f59e0b' },
  { id: 'business', label: 'business', color: '#8b5cf6' },
  { id: 'fun', label: 'fun', color: '#f43f5e' },
];

export const ASSET_TYPES: CategoryDefinition[] = [
  { id: 'checking', label: 'Checking Account', module: 'assets', icon: '🏦' },
  { id: 'savings-account', label: 'Savings Account', module: 'assets', icon: '💰' },
  { id: 'cash', label: 'Cash', module: 'assets', icon: '💵' },
  { id: 'investments', label: 'Investments', module: 'assets', icon: '📈' },
  { id: 'property', label: 'Property', module: 'assets', icon: '🏠' },
  { id: 'vehicle', label: 'Vehicle', module: 'assets', icon: '🚗' },
];

export const DEFAULT_SAVINGS_FUNDS = [
  { name: 'Emergency Fund', icon: '🆘' },
  { name: 'Vacation Fund', icon: '🏖️' },
  { name: 'House Fund', icon: '🏠' },
  { name: 'Car Fund', icon: '🚗' },
  { name: 'Wedding Fund', icon: '💍' },
  { name: 'Retirement Fund', icon: '🌅' },
];
