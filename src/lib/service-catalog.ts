/**
 * CleanConnect – Single source of truth for all services.
 * Used by homepage, booking form, quotation form, and admin.
 */

export type PricingType = "fixed" | "quote";

export type FormFieldKey =
  | "property_type"
  | "property_size"
  | "rooms"
  | "floors"
  | "frequency"
  | "event_type"
  | "attendance"
  | "venue_size"
  | "event_timing"
  | "construction_status"
  | "debris_level"
  | "floor_condition"
  | "classrooms"
  | "facilities"
  | "description"
  | "preferred_date"
  | "preferred_time"
  | "photos"
  | "additional_notes";

export type CatalogService = {
  id: string;
  name: string;
  category: string;
  icon: string;
  /** Starting / display price in NGN. For quote services this is indicative only. */
  price: number;
  pricingType: PricingType;
  shortDesc: string;
  longDesc: string;
  duration: string;
  included: string[];
  /** Fields shown on the in-platform quotation form for this service */
  formFields: FormFieldKey[];
};

export const SERVICE_CATALOG: CatalogService[] = [
  {
    id: "house",
    name: "House Cleaning",
    category: "Home Cleaning",
    icon: "fa-house",
    price: 15000,
    pricingType: "fixed",
    shortDesc: "Regular top-to-bottom home cleaning by trusted local pros.",
    longDesc: "A thorough refresh for your home — dusting, mopping, kitchen and bathroom care, and trash removal.",
    duration: "2–4 Hours",
    included: ["Dusting", "Vacuuming", "Bathroom cleaning", "Kitchen cleaning", "Mopping", "Trash removal"],
    formFields: [],
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    category: "Home Cleaning",
    icon: "fa-spray-can-sparkles",
    price: 35000,
    pricingType: "quote",
    shortDesc: "Starting from ₦35,000. Final price depends on property size, condition and CleanConnect's assessment.",
    longDesc: "Detailed cleaning of every corner. Every Deep Cleaning job is quoted after CleanConnect reviews the property details. The displayed amount is not the final price.",
    duration: "4–6 Hours (estimate)",
    included: ["Baseboards", "Inside cabinets", "Appliance detail", "Grout scrub", "Windows interior", "Full sanitize"],
    formFields: ["property_type", "rooms", "property_size", "debris_level", "description", "preferred_date", "preferred_time", "photos", "additional_notes"],
  },
  {
    id: "movein",
    name: "Move-in Cleaning",
    category: "Home Cleaning",
    icon: "fa-box-open",
    price: 40000,
    pricingType: "fixed",
    shortDesc: "Start fresh in your new home — sparkling from day one.",
    longDesc: "Move-in ready. We deep clean the empty space before your furniture and belongings arrive.",
    duration: "5–7 Hours",
    included: ["Full sanitize", "Cabinet interiors", "Appliance clean", "Floors detailed", "Windows", "Bathrooms"],
    formFields: [],
  },
  {
    id: "moveout",
    name: "Move-out Cleaning",
    category: "Home Cleaning",
    icon: "fa-truck-ramp-box",
    price: 42000,
    pricingType: "fixed",
    shortDesc: "Get your deposit back with a landlord-grade clean.",
    longDesc: "Detailed clean designed to meet inspection standards for handover.",
    duration: "5–7 Hours",
    included: ["Wall spot clean", "Deep bathroom", "Kitchen degrease", "Windows", "Floors", "Sanitize"],
    formFields: [],
  },
  {
    id: "sofa",
    name: "Sofa Cleaning",
    category: "Home Cleaning",
    icon: "fa-couch",
    price: 20000,
    pricingType: "fixed",
    shortDesc: "Deep upholstery cleaning that removes stains and odors.",
    longDesc: "Hot-water extraction and fabric-safe treatment to bring your sofa back to life.",
    duration: "2–3 Hours",
    included: ["Vacuum", "Stain treatment", "Shampoo", "Extraction", "Deodorize", "Fabric protect"],
    formFields: [],
  },
  {
    id: "airbnb",
    name: "Airbnb Cleaning",
    category: "Home Cleaning",
    icon: "fa-bed",
    price: 18000,
    pricingType: "fixed",
    shortDesc: "Turnover cleaning between guest stays — fast and reliable.",
    longDesc: "Guest-ready turnovers with linen swap and restock, timed for check-in.",
    duration: "2–3 Hours",
    included: ["Linen swap", "Restock", "Sanitize", "Quick reset", "Photo report", "Trash out"],
    formFields: [],
  },
  {
    id: "laundry",
    name: "Laundry & Ironing",
    category: "Laundry",
    icon: "fa-shirt",
    price: 8000,
    pricingType: "fixed",
    shortDesc: "Pick-up, wash, iron and delivery — as fast as 24 hours.",
    longDesc: "Full-service laundry with fabric-safe detergents and crisp ironing. Pick-up and delivery included. Price is per the existing package, not a new rate.",
    duration: "24–48 Hours",
    included: ["Pick-up", "Wash & dry", "Ironing", "Folding", "Packaging", "Delivery"],
    formFields: [],
  },
  {
    id: "office",
    name: "Office Cleaning",
    category: "Commercial",
    icon: "fa-building",
    price: 25000,
    pricingType: "quote",
    shortDesc: "Starting from ₦25,000. Final price depends on size, frequency and CleanConnect's assessment.",
    longDesc: "Recurring or one-off office cleaning. The card price is indicative only.",
    duration: "3–5 Hours (estimate)",
    included: ["Desk sanitize", "Restrooms", "Kitchenette", "Trash", "Floors", "Common areas"],
    formFields: ["property_size", "rooms", "floors", "frequency", "description", "preferred_date", "preferred_time", "photos", "additional_notes"],
  },
  {
    id: "postcon",
    name: "Post Construction Cleaning",
    category: "Specialty",
    icon: "fa-helmet-safety",
    price: 60000,
    pricingType: "quote",
    shortDesc: "Starting from ₦60,000. Final price depends on debris, area and whether an inspection is required.",
    longDesc: "Heavy-duty cleaning after construction. CleanConnect issues the final quotation after reviewing the request.",
    duration: "6–10 Hours (estimate)",
    included: ["Dust removal", "Paint spots", "Debris", "Window residue", "Floor polish", "Sanitize"],
    formFields: ["property_type", "property_size", "rooms", "construction_status", "debris_level", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "postreno",
    name: "Post Renovation Cleaning",
    category: "Specialty",
    icon: "fa-paint-roller",
    price: 55000,
    pricingType: "quote",
    shortDesc: "Starting from ₦55,000. Final price depends on the renovation type and areas affected.",
    longDesc: "Cleaning after painting, flooring, kitchen, bathroom or a full renovation.",
    duration: "5–9 Hours (estimate)",
    included: ["Paint residue", "Dust & debris", "Floor care", "Windows", "Fixtures", "Final sanitize"],
    formFields: ["property_type", "property_size", "rooms", "construction_status", "debris_level", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "fumigation",
    name: "Fumigation & Pest Control",
    category: "Specialty",
    icon: "fa-bug-slash",
    price: 30000,
    pricingType: "quote",
    shortDesc: "Starting from ₦30,000. Treatment is quoted after the pest type and severity are reviewed.",
    longDesc: "Pest treatment for homes and businesses. Preparation and re-entry instructions are given by the CleanConnect team. No treatment warranty is promised on this page.",
    duration: "2–4 Hours (estimate)",
    included: ["Inspection", "Treatment", "Follow-up plan"],
    formFields: ["property_type", "property_size", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "event",
    name: "Event Cleaning",
    category: "Specialty",
    icon: "fa-champagne-glasses",
    price: 45000,
    pricingType: "quote",
    shortDesc: "Starting from ₦45,000. Final price depends on venue size, guests and timing.",
    longDesc: "Cleaning before, during or after an event. CleanConnect decides the team size.",
    duration: "4–8 Hours (estimate)",
    included: ["Trash removal", "Floors", "Furniture reset", "Restrooms", "Kitchen", "Sanitize"],
    formFields: ["event_type", "attendance", "venue_size", "event_timing", "description", "preferred_date", "preferred_time", "photos", "additional_notes"],
  },
  {
    id: "commercial",
    name: "Commercial Cleaning",
    category: "Commercial",
    icon: "fa-city",
    price: 50000,
    pricingType: "quote",
    shortDesc: "Starting from ₦50,000. Final price depends on the premises and frequency.",
    longDesc: "Cleaning for shops, gyms, showrooms and other commercial spaces.",
    duration: "4–8 Hours (estimate)",
    included: ["Floors", "Restrooms", "Windows", "Common areas", "Sanitize", "Trash"],
    formFields: ["property_type", "property_size", "floors", "frequency", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "school",
    name: "School Cleaning",
    category: "Commercial",
    icon: "fa-school",
    price: 55000,
    pricingType: "quote",
    shortDesc: "Starting from ₦55,000. Final price depends on classrooms, toilets and frequency.",
    longDesc: "Cleaning for nurseries, primary, secondary and tertiary schools.",
    duration: "5–8 Hours (estimate)",
    included: ["Classrooms", "Restrooms", "Cafeteria", "Playground", "Sanitize", "Waste"],
    formFields: ["classrooms", "floors", "facilities", "frequency", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "hospital",
    name: "Hospital Cleaning",
    category: "Commercial",
    icon: "fa-hospital",
    price: 80000,
    pricingType: "quote",
    shortDesc: "Starting from ₦80,000. Accepted only where CleanConnect has suitable trained staff.",
    longDesc: "Clinic, hospital, diagnostic centre or laboratory cleaning. This page does not claim a healthcare certification.",
    duration: "6–10 Hours (estimate)",
    included: ["Disinfect", "Waste handling", "Wards", "Restrooms", "Common areas"],
    formFields: ["property_size", "floors", "frequency", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "restaurant",
    name: "Restaurant Cleaning",
    category: "Commercial",
    icon: "fa-utensils",
    price: 40000,
    pricingType: "quote",
    shortDesc: "Starting from ₦40,000. Final price depends on kitchen condition and frequency.",
    longDesc: "Kitchen and dining cleaning scheduled around service hours.",
    duration: "3–6 Hours (estimate)",
    included: ["Kitchen degrease", "Dining", "Restrooms", "Floors", "Sanitize", "Trash"],
    formFields: ["property_size", "frequency", "description", "preferred_date", "preferred_time", "photos", "additional_notes"],
  },
  {
    id: "warehouse",
    name: "Warehouse Cleaning",
    category: "Commercial",
    icon: "fa-warehouse",
    price: 90000,
    pricingType: "quote",
    shortDesc: "Starting from ₦90,000. Large sites may require a physical inspection before a final quote.",
    longDesc: "Floor, racking and loading-bay cleaning for warehouses.",
    duration: "8–12 Hours (estimate)",
    included: ["Floor scrub", "Dust", "Racking", "Loading bays", "Restrooms", "Waste"],
    formFields: ["property_size", "floor_condition", "description", "preferred_date", "photos", "additional_notes"],
  },
];

export const PACKAGES = [
  { id: "standard", name: "Standard", multiplier: 1 },
  { id: "premium", name: "Premium", multiplier: 1.4 },
  { id: "express", name: "Express", multiplier: 1.7 },
];

export const QUOTE_SERVICES = SERVICE_CATALOG.filter((s) => s.pricingType === "quote");
export const FIXED_SERVICES = SERVICE_CATALOG.filter((s) => s.pricingType === "fixed");

export function findService(idOrName?: string | null): CatalogService {
  const value = (idOrName ?? "").toLowerCase().trim();
  return (
    SERVICE_CATALOG.find((s) => s.id === value || s.name.toLowerCase() === value) ??
    SERVICE_CATALOG[0]!
  );
}

export function isQuoteService(idOrName?: string | null): boolean {
  return findService(idOrName).pricingType === "quote";
}

export function ngn(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}
