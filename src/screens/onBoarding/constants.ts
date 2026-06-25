import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_COUNT = 5;
const DEBOUNCE_MS = 300;
const REMINDERS_KEY = 'onboarding_reminders';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

type ReminderTime = string;

const SLIDES = [
  {
    icon: 'language' as const,
    titleKey: 'onboarding.slide0.title' as const,
    descKey: 'onboarding.slide0.description' as const,
    iconLabelKey: 'onboarding.slide0.iconLabel' as const,
  },
  {
    icon: 'person-outline' as const,
    titleKey: 'onboarding.slideName.title' as const,
    descKey: 'onboarding.slideName.description' as const,
    iconLabelKey: 'onboarding.slideName.iconLabel' as const,
  },
  {
    icon: 'mic-circle' as const,
    titleKey: 'onboarding.slide1.title' as const,
    descKey: 'onboarding.slide1.description' as const,
    iconLabelKey: 'onboarding.slide1.iconLabel' as const,
  },
  {
    icon: 'shield-checkmark' as const,
    titleKey: 'onboarding.slide2.title' as const,
    descKey: 'onboarding.slide2.description' as const,
    iconLabelKey: 'onboarding.slide2.iconLabel' as const,
  },
  {
    icon: 'options' as const,
    titleKey: 'onboarding.slide3.title' as const,
    descKey: 'onboarding.slide3.description' as const,
    iconLabelKey: 'onboarding.slide3.iconLabel' as const,
  },
];

interface OnboardingScreenProps {
  onFinish?: (name?: string) => void;
  name?: string;
  onNameChange?: (name: string) => void;
}

export { SCREEN_WIDTH, SLIDE_COUNT, DEBOUNCE_MS, SLIDES, REMINDERS_KEY, ONBOARDING_COMPLETED_KEY };

export type { ReminderTime, OnboardingScreenProps };
