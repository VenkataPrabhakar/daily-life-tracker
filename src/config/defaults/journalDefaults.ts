import type { JournalPrompt, JournalReminder, JournalTemplate } from '../../core/types';

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'morning',
    label: 'Morning Journal',
    icon: '🌅',
    category: 'daily',
    description: 'Start the day with intention and gratitude',
    prompts: [
      { id: 'intention', label: "Today's intention", placeholder: 'What matters most today?', hint: 'One clear focus' },
      { id: 'gratitude', label: 'Gratitude', placeholder: 'Three things you appreciate', hint: 'Big or small' },
      { id: 'energy', label: 'How do you feel waking up?', placeholder: 'Rested, anxious, excited...' },
    ],
  },
  {
    id: 'night',
    label: 'Night Journal',
    icon: '🌙',
    category: 'daily',
    description: 'Close the day with reflection and release',
    prompts: [
      { id: 'wins', label: 'Wins today', placeholder: 'What went well?', hint: 'Celebrate progress' },
      { id: 'challenges', label: 'Challenges', placeholder: 'What was difficult?', hint: 'No judgment' },
      { id: 'tomorrow', label: "Tomorrow's focus", placeholder: 'One priority for tomorrow' },
      { id: 'release', label: 'Let go of', placeholder: 'What can you release before sleep?' },
    ],
  },
  {
    id: 'daily-diary',
    label: 'Daily Diary',
    icon: '📔',
    category: 'daily',
    description: 'Capture the story of your day',
    prompts: [
      { id: 'headline', label: 'Headline of the day', placeholder: 'If today were a headline...' },
      { id: 'highlight', label: 'Best moment', placeholder: 'What stood out?' },
      { id: 'story', label: 'What happened', placeholder: 'Tell the story of your day...' },
      { id: 'feeling', label: 'Overall feeling', placeholder: 'How do you feel about today?' },
    ],
  },
  {
    id: 'weekly',
    label: 'Weekly Reflection',
    icon: '📆',
    category: 'reflection',
    description: 'Review your week and set direction',
    prompts: [
      { id: 'wins', label: 'Weekly wins', placeholder: 'What went well this week?' },
      { id: 'lessons', label: 'Lessons learned', placeholder: 'What did you learn?' },
      { id: 'improve', label: 'What to improve', placeholder: 'One thing to do differently' },
      { id: 'next-week', label: 'Next week focus', placeholder: 'Top 3 priorities' },
    ],
  },
  {
    id: 'monthly',
    label: 'Monthly Review',
    icon: '🗓️',
    category: 'reflection',
    description: 'Big-picture monthly check-in',
    prompts: [
      { id: 'summary', label: 'Month in summary', placeholder: 'How would you describe this month?' },
      { id: 'proud', label: 'Proud of', placeholder: 'What are you proud of?' },
      { id: 'growth', label: 'Growth areas', placeholder: 'Where did you grow?' },
      { id: 'goals', label: 'Next month goals', placeholder: 'What matters next month?' },
    ],
  },
  {
    id: 'workout',
    label: 'Workout Journal',
    icon: '🏋️',
    category: 'activity',
    description: 'Log training, effort, and recovery',
    prompts: [
      { id: 'activity', label: 'Activity', placeholder: 'Run, lift, yoga...' },
      { id: 'duration', label: 'Duration & intensity', placeholder: '45 min · moderate' },
      { id: 'body', label: 'How your body felt', placeholder: 'Strong, tired, sore...' },
      { id: 'notes', label: 'Notes', placeholder: 'PRs, form, next session' },
    ],
  },
  {
    id: 'food',
    label: 'Food Journal',
    icon: '🍽️',
    category: 'activity',
    description: 'Mindful eating and nutrition notes',
    prompts: [
      { id: 'meals', label: 'Meals & snacks', placeholder: 'What did you eat?' },
      { id: 'hunger', label: 'Hunger & fullness', placeholder: 'How satisfied did you feel?' },
      { id: 'mood-food', label: 'Mood while eating', placeholder: 'Stressed, calm, social...' },
      { id: 'notes', label: 'Notes', placeholder: 'Energy, cravings, wins' },
    ],
  },
  {
    id: 'travel',
    label: 'Travel Journal',
    icon: '✈️',
    category: 'activity',
    description: 'Document places, people, and moments',
    prompts: [
      { id: 'location', label: 'Where', placeholder: 'City, place, coordinates...' },
      { id: 'highlights', label: 'Highlights', placeholder: 'Best moments' },
      { id: 'people', label: 'People met', placeholder: 'Who made the day memorable?' },
      { id: 'senses', label: 'Sensory snapshot', placeholder: 'What did you see, hear, taste?' },
    ],
  },
  {
    id: 'gratitude',
    label: 'Gratitude Journal',
    icon: '🙏',
    category: 'reflection',
    description: 'Train your mind to notice the good',
    prompts: [
      { id: 'grateful1', label: 'Grateful for', placeholder: 'Someone or something' },
      { id: 'grateful2', label: 'Another blessing', placeholder: 'Keep going...' },
      { id: 'grateful3', label: 'One more', placeholder: 'Even tiny things count' },
      { id: 'why', label: 'Why it matters', placeholder: 'How did this enrich your life?' },
    ],
  },
  {
    id: 'dream',
    label: 'Dream Journal',
    icon: '💭',
    category: 'reflection',
    description: 'Capture dreams before they fade',
    prompts: [
      { id: 'dream', label: 'The dream', placeholder: 'Describe what you remember...' },
      { id: 'symbols', label: 'Symbols & feelings', placeholder: 'Recurring themes, emotions' },
      { id: 'interpret', label: 'What it might mean', placeholder: 'Optional reflection' },
    ],
  },
  {
    id: 'freeform',
    label: 'Free Journal',
    icon: '✍️',
    category: 'free',
    description: 'No prompts — just write',
    prompts: [
      { id: 'content', label: 'Your thoughts', placeholder: 'Start writing freely...' },
    ],
  },
];

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  { id: 'sr-1', category: 'self-reflection', text: 'What am I avoiding right now, and why?' },
  { id: 'sr-2', category: 'self-reflection', text: 'When did I feel most like myself this week?' },
  { id: 'sr-3', category: 'self-reflection', text: 'What belief is holding me back?' },
  { id: 'car-1', category: 'career', text: 'What skill would most accelerate my career?' },
  { id: 'car-2', category: 'career', text: 'What did I learn from my biggest work challenge?' },
  { id: 'fin-1', category: 'finance', text: 'What purchase brought genuine value this month?' },
  { id: 'fin-2', category: 'finance', text: 'What money habit am I proud of?' },
  { id: 'hea-1', category: 'health', text: 'How did my body feel today, and what did it need?' },
  { id: 'hea-2', category: 'health', text: 'What one health habit had the biggest impact?' },
  { id: 'rel-1', category: 'relationships', text: 'Who made me feel seen recently?' },
  { id: 'rel-2', category: 'relationships', text: 'What conversation do I want to have?' },
  { id: 'gr-1', category: 'gratitude', text: 'Three ordinary things I would miss if gone' },
  { id: 'gr-2', category: 'gratitude', text: 'Who deserves a thank-you from me?' },
  { id: 'pro-1', category: 'productivity', text: 'What drained my energy today?' },
  { id: 'pro-2', category: 'productivity', text: 'What is the one thing that would make tomorrow successful?' },
];

export const DEFAULT_JOURNAL_REMINDERS: JournalReminder[] = [
  { id: 'rem-morning', templateId: 'morning', frequency: 'daily', time: '07:30', enabled: true },
  { id: 'rem-night', templateId: 'night', frequency: 'daily', time: '21:00', enabled: true },
  { id: 'rem-weekly', templateId: 'weekly', frequency: 'weekly', time: '18:00', dayOfWeek: 0, enabled: true },
  { id: 'rem-monthly', templateId: 'monthly', frequency: 'monthly', time: '10:00', dayOfMonth: 1, enabled: true },
];

export const PROMPT_CATEGORY_LABELS: Record<JournalPrompt['category'], string> = {
  'self-reflection': 'Self Reflection',
  career: 'Career',
  finance: 'Finance',
  health: 'Health',
  relationships: 'Relationships',
  gratitude: 'Gratitude',
  productivity: 'Productivity',
};

export const WEATHER_OPTIONS = ['☀️ Sunny', '⛅ Partly cloudy', '☁️ Cloudy', '🌧️ Rainy', '⛈️ Stormy', '❄️ Snowy', '🌫️ Foggy', '🌬️ Windy'];
