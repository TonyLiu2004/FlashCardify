export type SubscriptionStatus = 
  | "active"
  | "trialing"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "unpaid"
  | "paused"
  | null;

export interface Price {
  id: string;
  interval: 'day' | 'week' | 'month' | 'year' | null;
  currency: string | null;
  unit_amount: number | null;
  active: boolean | null;
  interval_count: number | null;
  product_id: string | null;
  trial_period_days: number | null;
  type: 'one_time' | 'recurring' | null;
}

export interface ProductWithPrices {
  id: string;
  name: string;
  prices: Price[];
  description: string | null;
  active: boolean;
  image: string | null;
  metadata: Record<string, string>;
}

export interface PriceWithProduct extends Price {
  products: ProductWithPrices | null;
}

export interface SubscriptionWithProduct {
  id: string;
  status: SubscriptionStatus;
  prices: PriceWithProduct | null;
  cancel_at: string | null;
  cancel_at_period_end: boolean | null;
  canceled_at: string | null;
  created: string;
  current_period_start: string;
  current_period_end: string;
  ended_at: string | null;
  metadata: Record<string, string> | null;
  price_id: string | null;
  quantity: number | null;
  trial_end: string | null;
  trial_start: string | null;
  user_id: string;
}

export interface FlashcardPosition {
  x: number;
  y: number;
}


export interface UserStats {
    totalCardsReviewed: number;
    decksStarred: number;
    dailyStreak: number;
    cardsStreak: number;
    accuracyRate: number;
    retentionRate: number;
    totalCards: number;
  }

export interface Deck {
    id: string;
    name: string;
    description?: string;
    visibility?: string;
    shared?: boolean;
    user_id?: string;
    isLiked: boolean;
    likes?: { id: string; user_id: string; created_at: string }[];
  }

export type Flashcard = {
    id: string;
    user_id: string;
    front_text: string;
    back_text: string;
    created_at: string;
    updated_at: string;
    deck_id: string;
};

export type CleanedFlashcard = Omit<Flashcard, 'user_id' | 'created_at' | 'updated_at' | 'deck_id'>;
