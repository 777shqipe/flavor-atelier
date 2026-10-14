/** Supplier deal data, shared by About → Suppliers and the contact panel's "Why us" column. */

/** Each step of the deal, with what it does for the supplier (the old "why us"). */
export const STOPS = [
  {
    title: "Tell us what you've got",
    tag: "2 min",
    text: "A few lines is plenty: what it is, how much, and when it needs to move.",
    gain: "No minimum order. A few pallets or a full truckload.",
  },
  {
    title: "We come back fast",
    tag: "Same day",
    text: "Our buying team gets back to you with a clear offer.",
    gain: "Fast decisions and flexible volumes, so stock never sits.",
  },
  {
    title: "Seal it, collect it",
    tag: "Door to door",
    text: "Deals are sealed and stock collected, often the same day.",
    gain: "Your surplus gets a second life instead of a skip bin.",
  },
  {
    title: "Paid upfront",
    tag: "100% upfront",
    text: "No invoices chasing, no delays. Every pallet tracked door to door.",
    gain: "Every sale means less good food thrown away.",
  },
] as const;

export const PROOF = [
  ["0", "Minimum order"],
  ["Same day", "Answers and pick-ups"],
  ["100%", "Paid upfront"],
] as const;
