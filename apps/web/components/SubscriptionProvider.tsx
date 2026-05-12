"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import type { SubscriptionTier, SubscriptionStatus, Subscription, FeatureKey } from "@schreibfix/core";
import { canUseFeature } from "@schreibfix/core";
import { PaywallModal } from "@/components/PaywallModal";

export interface SubscriptionData {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  trialDaysRemaining: number;
  features: Record<string, boolean | number>;
  subscription: Subscription;
  loading: boolean;
}

interface SubscriptionCtx extends SubscriptionData {
  showPaywall: (feature: FeatureKey) => void;
  hidePaywall: () => void;
  refresh: () => void;
}

const DEFAULT: SubscriptionData = {
  tier: "free",
  status: "active",
  trialDaysRemaining: 0,
  features: {},
  subscription: { tier: "free", status: "active" },
  loading: true,
};

const SubscriptionContext = createContext<SubscriptionCtx>({
  ...DEFAULT,
  showPaywall: () => undefined,
  hidePaywall: () => undefined,
  refresh: () => undefined,
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<SubscriptionData>(DEFAULT);
  const [paywallFeature, setPaywallFeature] = useState<FeatureKey | null>(null);
  const fetchedRef = useRef(false);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setData({ ...DEFAULT, loading: false, tier: "free" });
      return;
    }

    try {
      const { data: { session } } = await import("@/lib/supabase").then(m =>
        m.supabase.auth.getSession()
      );
      const token = session?.access_token;
      if (!token) {
        setData({ ...DEFAULT, loading: false });
        return;
      }

      const res = await fetch("/api/subscription/status", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setData({ ...DEFAULT, loading: false });
        return;
      }

      const json = await res.json() as SubscriptionData;
      setData({ ...json, loading: false });
    } catch {
      setData({ ...DEFAULT, loading: false });
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setData({ ...DEFAULT, loading: false });
      fetchedRef.current = false;
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    void fetchSubscription();
  }, [user, authLoading, fetchSubscription]);

  const showPaywall = useCallback((feature: FeatureKey) => {
    setPaywallFeature(feature);
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallFeature(null);
  }, []);

  const refresh = useCallback(() => {
    fetchedRef.current = false;
    void fetchSubscription();
  }, [fetchSubscription]);

  return (
    <SubscriptionContext.Provider
      value={{ ...data, showPaywall, hidePaywall, refresh }}
    >
      {children}
      {paywallFeature && (
        <PaywallModal
          feature={paywallFeature}
          onClose={hidePaywall}
          onTrialStart={refresh}
        />
      )}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}

export function usePaywall() {
  const ctx = useContext(SubscriptionContext);

  const checkFeature = useCallback(
    (feature: FeatureKey): boolean => {
      const allowed = canUseFeature(ctx.tier, feature);
      if (!allowed) {
        ctx.showPaywall(feature);
      }
      return allowed;
    },
    [ctx],
  );

  return { checkFeature, tier: ctx.tier, features: ctx.features, loading: ctx.loading };
}
