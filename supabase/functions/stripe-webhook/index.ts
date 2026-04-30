import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const encoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const timingSafeEqual = (a: string, b: string) => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

const verifyStripeSignature = async (payload: string, signatureHeader: string, webhookSecret: string) => {
  const parts = signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) return acc;
    acc[key] = [...(acc[key] || []), value];
    return acc;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];

  if (!timestamp || signatures.length === 0) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSignature = toHex(digest);

  return signatures.some((signature) => timingSafeEqual(signature, expectedSignature));
};

const getAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

const fetchStripeSubscription = async (subscriptionId: string) => {
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecretKey) throw new Error("STRIPE_SECRET_KEY is not configured");

  const response = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${stripeSecretKey}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || "Stripe subscription fetch failed");
  }

  return data;
};

const activatePro = async ({
  userId,
  provider,
  reference,
  currentPeriodEnd,
}: {
  userId: string;
  provider: string;
  reference: string;
  currentPeriodEnd?: number | null;
}) => {
  const adminClient = getAdminClient();
  const proExpiresAt = currentPeriodEnd
    ? new Date(currentPeriodEnd * 1000).toISOString()
    : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await adminClient
    .from("profiles")
    .update({
      subscription_plan: "pro",
      pro_expires_at: proExpiresAt,
      pro_payment_provider: provider,
      pro_payment_reference: reference,
    })
    .eq("user_id", userId);

  if (error) throw error;
};

const deactivatePro = async (userId: string, reference: string) => {
  const adminClient = getAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({
      subscription_plan: "free",
      pro_expires_at: new Date().toISOString(),
      pro_payment_provider: "stripe",
      pro_payment_reference: reference,
    })
    .eq("user_id", userId);

  if (error) throw error;
};

serve(async (req) => {
  try {
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const signature = req.headers.get("stripe-signature");
    const rawBody = await req.text();

    if (!webhookSecret || !signature) {
      return new Response("Webhook secret or signature missing", { status: 400 });
    }

    const verified = await verifyStripeSignature(rawBody, signature, webhookSecret);
    if (!verified) {
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

      if (userId && subscriptionId) {
        const subscription = await fetchStripeSubscription(subscriptionId);
        await activatePro({
          userId,
          provider: "stripe",
          reference: subscriptionId,
          currentPeriodEnd: subscription.current_period_end,
        });
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;
      const activeStatuses = ["active", "trialing"];

      if (userId && activeStatuses.includes(subscription.status)) {
        await activatePro({
          userId,
          provider: "stripe",
          reference: subscription.id,
          currentPeriodEnd: subscription.current_period_end,
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        await deactivatePro(userId, subscription.id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-webhook error:", error);
    return new Response(error instanceof Error ? error.message : "Webhook error", { status: 500 });
  }
});
