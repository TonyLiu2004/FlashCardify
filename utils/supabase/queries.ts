import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export function getFlashcardConfig(productId: string): number {
  const flashcardConfig = process.env.NEXT_PUBLIC_FLASHCARD_CONFIG;
  
  if (!flashcardConfig) {
    console.error("Flashcard configuration not found in environment variables.");
    return 5;
  }
  
  let flashcardCounts: { [key: string]: number };
  
  try {
    flashcardCounts = JSON.parse(flashcardConfig);
  } catch (error) {
    console.error("Error parsing flashcard configuration:", error);
    return 5;
  }

  return flashcardCounts[productId] ?? 5;
}

export const getUser = cache(async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getSubscription = cache(async (supabase: SupabaseClient, userId: string) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*, prices(*, products(*))')
    .eq('user_id', userId) 
    .in('status', ['trialing', 'active'])
    .maybeSingle();

  return subscription;
});

export const getProducts = cache(async (supabase: SupabaseClient) => {
  const { data: products, error } = await supabase
    .from('products')
    .select('*, prices(*)')
    .eq('active', true)
    .eq('prices.active', true)
    .order('metadata->index')
    .order('unit_amount', { referencedTable: 'prices' });

  return products;
});

export const getUserDetails = cache(async (supabase: SupabaseClient, userId: string) => {
  const { data: userDetails } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  return userDetails;
});
