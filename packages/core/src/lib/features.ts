export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'school';
export type SubscriptionStatus = 'active' | 'trialing' | 'cancelled' | 'expired' | 'past_due';

export interface Subscription {
  id?: string;
  family_id?: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  paypal_subscription_id?: string | null;
  trial_ends_at?: string | null;
  current_period_ends_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FeatureFlags {
  diktat: boolean;
  uebungen: boolean;
  aiDiktat: boolean;
  aiUebungen: boolean;
  elevenlabsTTS: boolean;
  lesen: boolean;
  maxChildren: number;
  progressTracking: boolean;
  exportProgress: boolean;
  teacherDashboard: boolean;
}

export type FeatureKey = keyof FeatureFlags;

const FEATURES: Record<SubscriptionTier, FeatureFlags> = {
  free: {
    diktat: true,
    uebungen: true,
    aiDiktat: false,
    aiUebungen: false,
    elevenlabsTTS: false,
    lesen: false,
    maxChildren: 1,
    progressTracking: true,
    exportProgress: false,
    teacherDashboard: false,
  },
  plus: {
    diktat: true,
    uebungen: true,
    aiDiktat: false,
    aiUebungen: false,
    elevenlabsTTS: false,
    lesen: true,
    maxChildren: 4,
    progressTracking: true,
    exportProgress: true,
    teacherDashboard: false,
  },
  pro: {
    diktat: true,
    uebungen: true,
    aiDiktat: true,
    aiUebungen: true,
    elevenlabsTTS: true,
    lesen: true,
    maxChildren: 4,
    progressTracking: true,
    exportProgress: true,
    teacherDashboard: false,
  },
  school: {
    diktat: true,
    uebungen: true,
    aiDiktat: true,
    aiUebungen: true,
    elevenlabsTTS: true,
    lesen: true,
    maxChildren: 35,
    progressTracking: true,
    exportProgress: true,
    teacherDashboard: true,
  },
};

export function canUseFeature(tier: SubscriptionTier, feature: FeatureKey): boolean {
  const flags = FEATURES[tier];
  const value = flags[feature];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value > 0;
  return !!value;
}

export function getTrialDaysRemaining(subscription: Subscription): number {
  if (!subscription.trial_ends_at) return 0;
  const now = new Date();
  const trialEnd = new Date(subscription.trial_ends_at);
  const diff = trialEnd.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialing(subscription: Subscription): boolean {
  return subscription.status === 'trialing' && getTrialDaysRemaining(subscription) > 0;
}

export function hasActiveSubscription(subscription: Subscription): boolean {
  if (subscription.status === 'active') return true;
  if (isTrialing(subscription)) return true;
  return false;
}

export { FEATURES };
