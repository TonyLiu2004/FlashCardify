import { toDateTime } from '@/utils/helpers';
import { stripe } from '@/utils/stripe/config';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import type { Database, Tables, TablesInsert } from 'types_db';
import { UserStats } from '@/types';
type Product = Tables<'products'>;
type Price = Tables<'prices'>;
// type FlashCard = Tables<'flashcards'>;
type Deck = Tables<'decks'>;
type AiSuggestion = Tables<'ai_suggestions'>;
type UserProgress = Tables<'user_progress'>;

// Change to control trial period length
const TRIAL_PERIOD_DAYS = 0;

// Note: supabaseAdmin uses the SERVICE_ROLE_KEY which you must only use in a secure server-side context
// as it has admin privileges and overwrites RLS policies!
const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const upsertProductRecord = async (product: Stripe.Product) => {
  const productData: Product = {
    id: product.id,
    active: product.active,
    name: product.name,
    description: product.description ?? null,
    image: product.images?.[0] ?? null,
    metadata: product.metadata
  };

  const { error: upsertError } = await supabaseAdmin
    .from('products')
    .upsert([productData]);
  if (upsertError)
    throw new Error(`Product insert/update failed: ${upsertError.message}`);
  console.log(`Product inserted/updated: ${product.id}`);
};

const upsertFlashcardRecord = async (flashcard: TablesInsert<'flashcards'>) => {
  try {
    // Step 1: Check if the flashcard ID exists
    const { data: existingFlashcard, error: fetchError } = await supabaseAdmin
      .from('flashcards')
      .select('user_id')
      .eq('id', flashcard.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 indicates no rows found
      throw new Error(`Error fetching flashcard: ${fetchError.message}`);
    }

    // Step 2: If the flashcard exists, verify the user_id matches
    if (existingFlashcard && existingFlashcard.user_id !== flashcard.user_id) {
      throw new Error(`User ID mismatch: You are not authorized to update this flashcard.`);
    }

    // Step 3: If no mismatch or flashcard doesn't exist, proceed with upsert
    const flashcardData = {
      id: flashcard.id,
      user_id: flashcard.user_id,
      deck_id: flashcard.deck_id,
      front_text: flashcard.front_text,
      back_text: flashcard.back_text,
      created_at: flashcard.created_at ?? null,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('flashcards')
      .upsert([flashcardData]);

    if (upsertError) {
      throw new Error(`Flashcard insert/update failed: ${upsertError.message}`);
    } else {
      console.log(`Flashcard inserted/updated: ${flashcard.id}`);
    }
  } catch (error: any) {
    console.error('Error during flashcard upsert:', error.message);
    throw error;
  }
};

const upsertDeckRecord = async (deck: TablesInsert<'decks'>) => {
  const deckData: TablesInsert<'decks'> = {
    id: deck.id,
    user_id: deck.user_id,
    name: deck.name,
    description: deck.description ?? null,
    created_at: deck.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    visibility: deck.visibility ?? 'private',
  };

  const { error: upsertError } = await supabaseAdmin
    .from('decks')
    .upsert(deckData, {
      onConflict: 'id',
    });

  if (upsertError) {
    throw new Error(`Deck insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Deck inserted/updated: ${deck.id}`);
  }
};


const upsertPriceRecord = async (
  price: Stripe.Price,
  retryCount = 0,
  maxRetries = 3
) => {
  const priceData: Price = {
    id: price.id,
    product_id: typeof price.product === 'string' ? price.product : '',
    active: price.active,
    currency: price.currency,
    type: price.type,
    unit_amount: price.unit_amount ?? null,
    interval: price.recurring?.interval ?? null,
    interval_count: price.recurring?.interval_count ?? null,
    trial_period_days: price.recurring?.trial_period_days ?? TRIAL_PERIOD_DAYS
  };

  const { error: upsertError } = await supabaseAdmin
    .from('prices')
    .upsert([priceData]);

  if (upsertError?.message.includes('foreign key constraint')) {
    if (retryCount < maxRetries) {
      console.log(`Retry attempt ${retryCount + 1} for price ID: ${price.id}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await upsertPriceRecord(price, retryCount + 1, maxRetries);
    } else {
      throw new Error(
        `Price insert/update failed after ${maxRetries} retries: ${upsertError.message}`
      );
    }
  } else if (upsertError) {
    throw new Error(`Price insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Price inserted/updated: ${price.id}`);
  }
};

const deleteProductRecord = async (product: Stripe.Product) => {
  const { error: deletionError } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', product.id);
  if (deletionError)
    throw new Error(`Product deletion failed: ${deletionError.message}`);
  console.log(`Product deleted: ${product.id}`);
};

const deletePriceRecord = async (price: Stripe.Price) => {
  const { error: deletionError } = await supabaseAdmin
    .from('prices')
    .delete()
    .eq('id', price.id);
  if (deletionError) throw new Error(`Price deletion failed: ${deletionError.message}`);
  console.log(`Price deleted: ${price.id}`);
};

const upsertCustomerToSupabase = async (uuid: string, customerId: string) => {
  const { error: upsertError } = await supabaseAdmin
    .from('customers')
    .upsert([{ id: uuid, stripe_customer_id: customerId }]);

  if (upsertError)
    throw new Error(`Supabase customer record creation failed: ${upsertError.message}`);

  return customerId;
};

const createCustomerInStripe = async (uuid: string, email: string) => {
  const customerData = { metadata: { supabaseUUID: uuid }, email: email };
  const newCustomer = await stripe.customers.create(customerData);
  if (!newCustomer) throw new Error('Stripe customer creation failed.');

  return newCustomer.id;
};

const createOrRetrieveCustomer = async ({
  email,
  uuid
}: {
  email: string;
  uuid: string;
}) => {
  // Check if the customer already exists in Supabase
  const { data: existingSupabaseCustomer, error: queryError } =
    await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', uuid)
      .maybeSingle();

  if (queryError) {
    throw new Error(`Supabase customer lookup failed: ${queryError.message}`);
  }

  // Retrieve the Stripe customer ID using the Supabase customer ID, with email fallback
  let stripeCustomerId: string | undefined;
  if (existingSupabaseCustomer?.stripe_customer_id) {
    const existingStripeCustomer = await stripe.customers.retrieve(
      existingSupabaseCustomer.stripe_customer_id
    );
    stripeCustomerId = existingStripeCustomer.id;
  } else {
    // If Stripe ID is missing from Supabase, try to retrieve Stripe customer ID by email
    const stripeCustomers = await stripe.customers.list({ email: email });
    stripeCustomerId =
      stripeCustomers.data.length > 0 ? stripeCustomers.data[0].id : undefined;
  }

  // If still no stripeCustomerId, create a new customer in Stripe
  const stripeIdToInsert = stripeCustomerId
    ? stripeCustomerId
    : await createCustomerInStripe(uuid, email);
  if (!stripeIdToInsert) throw new Error('Stripe customer creation failed.');

  if (existingSupabaseCustomer && stripeCustomerId) {
    // If Supabase has a record but doesn't match Stripe, update Supabase record
    if (existingSupabaseCustomer.stripe_customer_id !== stripeCustomerId) {
      const { error: updateError } = await supabaseAdmin
        .from('customers')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', uuid);

      if (updateError)
        throw new Error(
          `Supabase customer record update failed: ${updateError.message}`
        );
      console.warn(
        `Supabase customer record mismatched Stripe ID. Supabase record updated.`
      );
    }
    // If Supabase has a record and matches Stripe, return Stripe customer ID
    return stripeCustomerId;
  } else {
    console.warn(
      `Supabase customer record was missing. A new record was created.`
    );

    // If Supabase has no record, create a new record and return Stripe customer ID
    const upsertedStripeCustomer = await upsertCustomerToSupabase(
      uuid,
      stripeIdToInsert
    );
    if (!upsertedStripeCustomer)
      throw new Error('Supabase customer record creation failed.');

    return upsertedStripeCustomer;
  }
};

/**
 * Copies the billing details from the payment method to the customer object.
 */
const copyBillingDetailsToCustomer = async (
  uuid: string,
  payment_method: Stripe.PaymentMethod
) => {
  //Todo: check this assertion
  const customer = payment_method.customer as string;
  const { name, phone, address } = payment_method.billing_details;
  if (!name || !phone || !address) return;
  //@ts-ignore
  await stripe.customers.update(customer, { name, phone, address });
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      billing_address: { ...address },
      payment_method: { ...payment_method[payment_method.type] }
    })
    .eq('id', uuid);
  if (updateError) throw new Error(`Customer update failed: ${updateError.message}`);
};

const manageSubscriptionStatusChange = async (
  subscriptionId: string,
  customerId: string,
  createAction = false
) => {
  // Get customer's UUID from mapping table.
  const { data: customerData, error: noCustomerError } = await supabaseAdmin
    .from('customers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (noCustomerError)
    throw new Error(`Customer lookup failed: ${noCustomerError.message}`);

  const { id: uuid } = customerData!;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method']
  });
  // Upsert the latest status of the subscription object.
  const subscriptionData: TablesInsert<'subscriptions'> = {
    id: subscription.id,
    user_id: uuid,
    metadata: subscription.metadata,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id,
    //TODO check quantity on subscription
    // @ts-ignore
    quantity: subscription.quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    cancel_at: subscription.cancel_at
      ? toDateTime(subscription.cancel_at).toISOString()
      : null,
    canceled_at: subscription.canceled_at
      ? toDateTime(subscription.canceled_at).toISOString()
      : null,
    current_period_start: toDateTime(
      subscription.current_period_start
    ).toISOString(),
    current_period_end: toDateTime(
      subscription.current_period_end
    ).toISOString(),
    created: toDateTime(subscription.created).toISOString(),
    ended_at: subscription.ended_at
      ? toDateTime(subscription.ended_at).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? toDateTime(subscription.trial_start).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? toDateTime(subscription.trial_end).toISOString()
      : null
  };

  const { error: upsertError } = await supabaseAdmin
    .from('subscriptions')
    .upsert([subscriptionData]);
  if (upsertError)
    throw new Error(`Subscription insert/update failed: ${upsertError.message}`);
  console.log(
    `Inserted/updated subscription [${subscription.id}] for user [${uuid}]`
  );

  // For a new subscription copy the billing details to the customer object.
  // NOTE: This is a costly operation and should happen at the very end.
  if (createAction && subscription.default_payment_method && uuid)
    //@ts-ignore
    await copyBillingDetailsToCustomer(
      uuid,
      subscription.default_payment_method as Stripe.PaymentMethod
    );
};


const getDecks = async (user_id: string) => {
  try {
    const { data: decks, error: decksError } = await supabaseAdmin
      .from('decks')
      .select('*')
      .eq('user_id', user_id);

    if (decksError) {
      throw new Error(`Error fetching decks: ${decksError.message}`);
    }

    if (!decks || decks.length === 0) {
      return [];
    }

    const deckIds = decks.map(deck => deck.id);
    const { data: likes, error: likesError } = await supabaseAdmin
      .from('likes')
      .select('deck_id')
      .eq('user_id', user_id)
      .in('deck_id', deckIds);

    if (likesError) {
      throw new Error(`Error fetching likes: ${likesError.message}`);
    }

    const decksWithLikes = decks.map(deck => ({
      ...deck,
      isLiked: likes.some(like => like.deck_id === deck.id),
    }));

    return decksWithLikes;
  } catch (error: any) {
    console.error('Error fetching decks with likes:', error.message);
    throw error;
  }
};


const getFlashcards = async (deck_id: string, user_id: string) => {
  try {
    const { data: deck, error: deckError } = await supabaseAdmin
      .from('decks')
      .select('*')
      .eq('id', deck_id)
      .single();

    if (deckError) {
      throw new Error(`Error fetching deck: ${deckError.message}`);
    }

    if (deck.user_id === user_id || deck.visibility === 'public') {
      const { data: flashcards, error: flashcardsError } = await supabaseAdmin
        .from('flashcards')
        .select('*')
        .eq('deck_id', deck_id);

      if (flashcardsError) {
        throw new Error(`Error fetching cards: ${flashcardsError.message}`);
      }

      return flashcards.filter((flashcard) => flashcard.user_id === user_id || deck.visibility === 'public');
    } else {
      throw new Error('You are not authorized to access this deck');
    }
  } catch (error: any) {
    console.error('Error fetching cards:', error.message);
    throw error;
  }
};

const deleteFlashcard = async (flashcard_id: string, deck_id: string, user_id: string) => {
  try {
    const { error: deletionError } = await supabaseAdmin
      .from('flashcards')
      .delete()
      .eq('id', flashcard_id)
      .eq('deck_id', deck_id)
      .eq('user_id', user_id);

    if (deletionError) {
      throw new Error(`Flashcard deletion failed: ${deletionError.message}`);
    }

    console.log(`Flashcard deleted: ${flashcard_id}`);
  } catch (error: any) {
    console.error('Error deleting flashcard:', error.message);
    throw error;
  }
};

const deleteDeck = async (deck_id: string, user_id: string) => {
  try {
    // Fetch the count of flashcards in the deck
    const { data: flashcards, error: fetchFlashcardsError } = await supabaseAdmin
      .from('flashcards')
      .select('id')
      .eq('deck_id', deck_id)
      .eq('user_id', user_id);

    if (fetchFlashcardsError) {
      throw new Error(`Failed to fetch flashcards: ${fetchFlashcardsError.message}`);
    }

    const flashcardsCount = flashcards?.length || 0;

    // Delete the deck
    const { error: deletionError } = await supabaseAdmin
      .from('decks')
      .delete()
      .eq('id', deck_id)
      .eq('user_id', user_id);

    if (deletionError) {
      throw new Error(`Deck deletion failed: ${deletionError.message}`);
    }

    console.log(`Deck deleted: ${deck_id}`);

    // If there were flashcards in the deck, decrement the total_cards count
    if (flashcardsCount > 0) {
      const { data: user, error: fetchUserError } = await supabaseAdmin
        .from('users')
        .select('total_cards')
        .eq('id', user_id)
        .single();

      if (fetchUserError) {
        throw new Error(`Failed to fetch user: ${fetchUserError.message}`);
      }

      const newTotal = (user?.total_cards || 0) - flashcardsCount;

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ total_cards: newTotal })
        .eq('id', user_id);

      if (updateError) {
        throw new Error(`Failed to update total cards: ${updateError.message}`);
      }

      console.log(`Total cards updated successfully for user: ${user_id}`);
    }
  } catch (error: any) {
    console.error("Error deleting deck:", error.message);
    throw error;
  }
};

const incrementTotalCards = async (user_id: string, increment: boolean) => {
  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('total_cards')
      .eq('id', user_id)
      .single();

    if (fetchError) throw fetchError;

    const newTotal = increment ? (user.total_cards || 0) + 1 : (user.total_cards || 0) - 1;

    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ total_cards: newTotal })
      .eq('id', user_id);

    if (updateError) throw updateError;

    console.log('Total cards updated successfully:', data);
  } catch (error: any) {
    console.error('Error updating total cards:', error.message);
  }
};

const incrementTotalCardsBatch = async (user_id: string, incrementCount: number) => {
  try {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('total_cards')
      .eq('id', user_id)
      .single();

    if (fetchError) throw fetchError;

    const newTotal = (user.total_cards || 0) + incrementCount;

    const { data, error: updateError } = await supabaseAdmin
      .from('users')
      .update({ total_cards: newTotal })
      .eq('id', user_id);

    if (updateError) throw updateError;

    console.log('Total cards updated successfully:', data);
  } catch (error: any) {
    console.error('Error updating total cards:', error.message);
  }
};


const getUserStats = async (user_id: string): Promise<UserStats> => {
  try {
    // Fetch user stats including totalCards and dailyStreak from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('total_cards, daily_streak')
      .eq('id', user_id)
      .single();

    if (userError) {
      throw new Error(`User fetch failed: ${userError.message}`);
    }

    // Fetch totalCardsReviewed and cardsStreak from user_progress
    const { data: countData, error: countError } = await supabaseAdmin
      .from('user_progress')
      .select('status, attempts, correct_attempts, cards_streak, retention_rate')
      .eq('user_id', user_id);

    if (countError) {
      throw new Error(`Stats fetch failed: ${countError.message}`);
    }

    // Fetch the number of decks the user has liked from the likes table
    const { data: likesData, error: likesError } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', user_id);

    if (likesError) {
      throw new Error(`Likes fetch failed: ${likesError.message}`);
    }

    const decksStarred = likesData?.length || 0;

    // If no data found in user_progress, return 0 for all stats
    if (!countData || countData.length === 0) {
      console.log(`No stats found for user: ${user_id}`);
      return {
        totalCardsReviewed: 0,
        decksStarred,
        dailyStreak: userData.daily_streak || 0,
        cardsStreak: 0,
        accuracyRate: 0,
        retentionRate: 0,
        totalCards: userData.total_cards || 0,
      };
    }

    // Calculate totals and averages
    const totalCardsReviewed = countData.length;
    const cardsStreak = Math.max(...countData.map((record: any) => record.cards_streak || 0), 0);

    const accuracyRate = countData.length > 0
      ? parseFloat(
        (
          (countData.reduce(
            (acc: number, record: any) => acc + (record.correct_attempts || 0),
            0
          ) /
            countData.reduce(
              (acc: number, record: any) => acc + (record.attempts || 1),
              0
            )) * 100
        ).toFixed(2)
      )
      : 0;

    const retentionRate = countData.length > 0
      ? parseFloat(
        (
          countData.reduce(
            (acc: number, record: any) => acc + (record.retention_rate || 0),
            0
          ) / countData.length
        ).toFixed(2)
      )
      : 0;

    const userStats: UserStats = {
      totalCardsReviewed,
      decksStarred,
      dailyStreak: userData.daily_streak || 0,
      cardsStreak,
      accuracyRate,
      retentionRate,
      totalCards: userData.total_cards || 0,
    };

    console.log(`Stats fetched successfully for user: ${user_id}`);
    return userStats;
  } catch (error: any) {
    console.error("Error fetching stats:", error.message);
    throw error;
  }
};

const upsertLoginStreak = async (user_id: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('daily_streak, max_streak, last_login')
      .eq('id', user_id)
      .single();

    if (error) {
      throw new Error(`Error fetching user streak data: ${error.message}`);
    }

    let { daily_streak, max_streak, last_login } = data;

    daily_streak = daily_streak ?? 0;
    max_streak = max_streak ?? 0;

    const lastLoginDate = last_login ? new Date(last_login) : null;
    const currentDate = new Date();

    let newDailyStreak = daily_streak;
    let newMaxStreak = max_streak;
    let shouldUpdateLoginTime = false;

    if (lastLoginDate) {
      const differenceInDays = Math.floor(
        (currentDate.getTime() - lastLoginDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (differenceInDays === 1) {
        newDailyStreak += 1;
        shouldUpdateLoginTime = true;
      } else if (differenceInDays > 1) {
        newMaxStreak = Math.max(newMaxStreak, newDailyStreak);
        newDailyStreak = 1;
        shouldUpdateLoginTime = true;
      }
    } else {
      newDailyStreak = 1;
      shouldUpdateLoginTime = true;
    }

    const updateData: {
      daily_streak: number;
      max_streak: number;
      last_login?: string;
    } = {
      daily_streak: newDailyStreak,
      max_streak: newMaxStreak,
    };

    if (shouldUpdateLoginTime) {
      updateData.last_login = currentDate.toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', user_id);

    if (updateError) {
      throw new Error(`Error updating user streak data: ${updateError.message}`);
    }

    return { daily_streak: newDailyStreak, max_streak: newMaxStreak };
  } catch (error: any) {
    console.error('Error updating login streak:', error.message);
    throw error;
  }
};


const getPublicDecks = async () => {
  try {
    const { data: decks, error: decksError } = await supabaseAdmin
      .from('decks')
      .select('*')
      .eq('visibility', 'public');

    if (decksError) {
      throw new Error(`Shared Decks error: ${decksError.message}`);
    }

    if (!decks || decks.length === 0) {
      console.log('No public decks found');
      return [];
    }

    const decksWithLikes = [];

    for (const deck of decks) {
      const { data: likes, error: likesError } = await supabaseAdmin
        .from('likes')
        .select('id, user_id, created_at')
        .eq('deck_id', deck.id);

      if (likesError) {
        throw new Error(`Error fetching likes for deck ${deck.id}: ${likesError.message}`);
      }

      decksWithLikes.push({
        ...deck,
        likes: likes || [],
      });
    }

    console.log('Shared decks with likes fetched');
    return decksWithLikes;
  } catch (error: any) {
    console.error('Error getting shared decks:', error.message);
    throw error;
  }
};

const changeDeckPreference = async (id: string, deck_id: string, user_id: string, isStarred: boolean) => {
  try {
    if (isStarred) {
      // User wants to like the deck (upsert the like)
      const { data, error } = await supabaseAdmin
        .from('likes')
        .upsert({ id, user_id, deck_id })
        .eq('user_id', user_id)
        .eq('deck_id', deck_id);

      if (error) {
        throw new Error(`Error liking deck: ${error.message}`);
      }

      console.log('Deck liked successfully');
      return data;
    } else {
      // User wants to unlike the deck (delete the like)
      const { error } = await supabaseAdmin
        .from('likes')
        .delete()
        .eq('user_id', user_id)
        .eq('deck_id', deck_id);

      if (error) {
        throw new Error(`Error unliking deck: ${error.message}`);
      }

      console.log('Deck unliked successfully');
      return null;
    }
  } catch (error: any) {
    console.error('Error updating like status:', error.message);
    throw error;
  }
};

const upsertChallengeRecord = async (
  id: string,
  deck_id: string,
  user_id: string,
  times_taken: number | null,
  overall_correct: number | null,
  overall_incorrect: number | null,
  overall_accuracy: number | null,
  status: 'started' | 'completed' | null
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('challenges')
      .upsert(
        {
          id,
          deck_id,
          user_id,
          times_taken: times_taken || 0,
          overall_correct: overall_correct || 0,
          overall_incorrect: overall_incorrect || 0,
          overall_accuracy: overall_accuracy || 0,
          status: status || 'started',
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error upserting challenge record:', err);
    throw err;
  }
};

const insertChallengeHistoryRecord = async (
  challengeId: string,
  accuracy: number,
  incorrect: number,
  correct: number,
  aiSuggestion: string,
  timeTaken: number,
  attemptNumber: number
) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('challenge_history')
      .insert([
        {
          challenge_id: challengeId,
          accuracy,
          incorrect,
          correct,
          ai_suggestion: aiSuggestion,
          time_taken: timeTaken,
          attempt_number: attemptNumber,
        },
      ]);

    if (error) {
      console.error('Error inserting challenge history record:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Error inserting challenge history record:', err);
    throw err;
  }
};

const upsertQuestionRecord = async (question: TablesInsert<'questions'>) => {
  const questionData: TablesInsert<'questions'> = {
    id: question.id,
    challenge_id: question.challenge_id,
    question_number: question.question_number,
    flashcard_id: question.flashcard_id,
    question: question.question,
    choice_a: question.choice_a,
    choice_b: question.choice_b,
    choice_c: question.choice_c,
    choice_d: question.choice_d,
    answer: question.answer,
    user_answer: question.user_answer,
    status: question.status,
    shuffle_index: question.shuffle_index,
    created_at: question.created_at ?? new Date().toISOString(),
  };

  const { error: upsertError } = await supabaseAdmin
    .from('questions')
    .upsert(questionData, {
      onConflict: 'id',
    });

  if (upsertError) {
    throw new Error(`Question insert/update failed: ${upsertError.message}`);
  } else {
    console.log(`Question inserted/updated: ${question.id}`);
  }
};

const updateQuestionsFields = async (questionId: string, updatedFields: Partial<TablesInsert<'questions'>>) => {
  try {
    if (!questionId) {
      throw new Error('Question ID is required for update.');
    }

    const { error: updateError } = await supabaseAdmin
      .from('questions')
      .update(updatedFields)
      .eq('id', questionId);

    if (updateError) {
      throw new Error(`Failed to update question: ${updateError.message}`);
    } else {
      console.log(`Question ${questionId} updated successfully with fields:`, updatedFields);
    }
  } catch (error: any) {
    console.error('Error updating question fields:', error.message);
    throw error;
  }
};

const getQuestions = async (challenge_id: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('challenge_id', challenge_id);

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getQuestions:', err);
    throw err;
  }
};

const getChallengeHistory = async (user_id: string) => {
  try {
    const { data: challenges, error: challengesError } = await supabaseAdmin
      .from('challenges')
      .select('id, deck_id')
      .eq('user_id', user_id)
      .eq('status', 'completed');

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      throw challengesError;
    }

    if (!challenges || challenges.length === 0) {
      console.log('No completed challenges found for this user.');
      return [];
    }
    const deckIds = challenges.map((challenge) => challenge.deck_id);

    const { data: decks, error: decksError } = await supabaseAdmin
      .from('decks')
      .select('id, name')
      .in('id', deckIds);

    if (decksError) {
      console.error('Error fetching deck names:', decksError);
      throw decksError;
    }

    const deckNamesMap = decks.reduce((acc, deck) => {
      acc[deck.id] = deck.name;
      return acc;
    }, {} as Record<string, string>);

    const challengeIds = challenges.map((challenge) => challenge.id);
    const { data: challengeHistories, error: historyError } = await supabaseAdmin
      .from('challenge_history')
      .select('*')
      .in('challenge_id', challengeIds);

    if (historyError) {
      console.error('Error fetching challenge history:', historyError);
      throw historyError;
    }

    const challengeHistoriesWithDeckNames = challengeHistories.map((history) => {
      const challenge = challenges.find(challenge => challenge.id === history.challenge_id);
      const deckName = challenge ? deckNamesMap[challenge.deck_id || ''] : 'Unknown Deck';
      return {
        ...history,
        deck_name: deckName || 'Unknown Deck',
      };
    });

    return challengeHistoriesWithDeckNames;
  } catch (err) {
    console.error('Unexpected error in getChallengeHistory:', err);
    throw err;
  }
};

const getFeatureDeck = async (user_id: string) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('decks')
      .select('id, name, description, visibility, likes_count')
      .eq('visibility', 'public')
      .order('likes_count', { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('No public decks found');
    }

    const featureDeck = data[0];

    const { data: likes, error: likesError } = await supabaseAdmin
      .from('likes')
      .select('deck_id')
      .eq('user_id', user_id)
      .eq('deck_id', featureDeck.id);

    if (likesError) {
      throw new Error(`Error fetching likes: ${likesError.message}`);
    }

    const featureDeckWithLikeStatus = {
      ...featureDeck,
      isLiked: likes.length > 0,
    };

    return featureDeckWithLikeStatus;
  } catch (err: any) {
    console.error('Getting Feature Deck Failed: ', err.message);
    throw err;
  }
};

export {
  upsertProductRecord,
  upsertFlashcardRecord,
  upsertDeckRecord,
  upsertPriceRecord,
  deleteProductRecord,
  deletePriceRecord,
  createOrRetrieveCustomer,
  manageSubscriptionStatusChange,
  getDecks,
  getFlashcards,
  deleteFlashcard,
  deleteDeck,
  incrementTotalCards,
  incrementTotalCardsBatch,
  getUserStats,
  upsertLoginStreak,
  getPublicDecks,
  changeDeckPreference,
  upsertChallengeRecord,
  insertChallengeHistoryRecord,
  upsertQuestionRecord,
  updateQuestionsFields,
  getQuestions,
  getChallengeHistory,
  getFeatureDeck
};
