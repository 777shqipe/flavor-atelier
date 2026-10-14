/** Supplier deal data, shared by About → Suppliers and the contact panel's "Why us" column. */

import { supplierDealStrings } from "./i18n/strings/SupplierDeal";

/** The four steps of the deal, in order; each step's copy is looked up by id in i18n/strings/SupplierDeal. */
export const STOPS = ["tell", "reply", "collect", "paid"] as const;

/** Proof points in English for the contact panel; Suppliers reads the translated ones from the strings file. */
export const PROOF = supplierDealStrings.en.proof;
