import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SubscriptionTier = "basic" | "professional" | "enterprise";

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: string;
  app_limit: number;
  current_period_start: string;
  current_period_end: string;
}

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  basic: 2,
  professional: 5,
  enterprise: 10,
};

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setSubscription(data as unknown as Subscription);
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const canCreateProject = (currentProjectCount: number): boolean => {
    if (!subscription) return false;
    const limit = TIER_LIMITS[subscription.tier] || 2;
    return currentProjectCount < limit;
  };

  const tierLabel = subscription?.tier
    ? subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
    : "Starter";

  const appLimit = subscription ? TIER_LIMITS[subscription.tier] : 2;

  return { subscription, loading, canCreateProject, tierLabel, appLimit };
}
