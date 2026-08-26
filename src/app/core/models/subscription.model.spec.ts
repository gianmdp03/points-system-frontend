import { SubscriptionPlan, getPlanTier } from './subscription.model';

describe('subscription.model helpers', () => {
  it('should return correct tier numbers for plans', () => {
    expect(getPlanTier(SubscriptionPlan.NONE)).toBe(0);
    expect(getPlanTier(SubscriptionPlan.FREE_TRIAL)).toBe(1);
    expect(getPlanTier(SubscriptionPlan.BASIC)).toBe(2);
    expect(getPlanTier(SubscriptionPlan.PRO)).toBe(3);
    expect(getPlanTier(SubscriptionPlan.ENTERPRISE)).toBe(4);
    expect(getPlanTier(null)).toBe(0);
    expect(getPlanTier(undefined)).toBe(0);
  });
});
