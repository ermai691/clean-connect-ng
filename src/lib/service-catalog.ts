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
  // ── Home Cleaning (fixed) ──────────────────────────────────────────────
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
    pricingType: "fixed",
    shortDesc: "Detailed cleaning of every corner, appliance and hard-to-reach area.",
    longDesc: "Perfect for seasonal resets. We tackle grime, limescale, and neglected surfaces to restore a like-new feel.",
    duration: "4–6 Hours",
    included: ["Baseboards", "Inside cabinets", "Appliance detail", "Grout scrub", "Windows interior", "Full sanitize"],
    formFields: [],
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

  // ── Laundry (fixed) ────────────────────────────────────────────────────
  {
    id: "laundry",
    name: "Laundry & Ironing",
    category: "Laundry",
    icon: "fa-shirt",
    price: 8000,
    pricingType: "fixed",
    shortDesc: "Pick-up, wash, iron and delivery — as fast as 24 hours.",
    longDesc: "Full-service laundry with fabric-safe detergents and crisp ironing. Pick-up and delivery included.",
    duration: "24–48 Hours",
    included: ["Pick-up", "Wash & dry", "Ironing", "Folding", "Packaging", "Delivery"],
    formFields: [],
  },

  // ── Quote-based services ───────────────────────────────────────────────
  {
    id: "office",
    name: "Office Cleaning",
    category: "Commercial",
    icon: "fa-building",
    price: 25000,
    pricingType: "quote",
    shortDesc: "Keep your workspace pristine and your team productive.",
    longDesc: "Recurring or one-off office cleaning with discreet, trained staff.",
    duration: "3–5 Hours",
    included: ["Desk sanitize", "Restrooms", "Kitchenette", "Trash", "Floors", "Common areas"],
    formFields: ["property_size", "rooms", "floors", "frequency", "description", "preferred_date", "preferred_time", "photos", "additional_notes"],
  },
  {
    id: "postcon",
    name: "Post Construction",
    category: "Specialty",
    icon: "fa-helmet-safety",
    price: 60000,
    pricingType: "quote",
    shortDesc: "Dust, debris and residue removal after construction.",
    longDesc: "Heavy-duty cleaning after construction projects. Safe removal of dust and residue.",
    duration: "6–10 Hours",
    included: ["Dust removal", "Paint spots", "Debris", "Window residue", "Floor polish", "Sanitize"],
    formFields: ["property_type", "property_size", "rooms", "construction_status", "debris_level", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "postreno",
    name: "Post Renovation",
    category: "Specialty",
    icon: "fa-paint-roller",
    price: 55000,
    pricingType: "quote",
    shortDesc: "Detailed clean after home or office renovation works.",
    longDesc: "Specialised cleaning after renovations — paint, dust, adhesive residue and finishing touches.",
    duration: "5–9 Hours",
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
    shortDesc: "Certified pest control with pet and family-safe products.",
    longDesc: "Certified fumigation for homes and businesses, targeting common pests safely.",
    duration: "2–4 Hours",
    included: ["Inspection", "Treatment", "Nest removal", "Perimeter spray", "Follow-up plan", "Warranty"],
    formFields: ["property_type", "property_size", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "event",
    name: "Event Cleaning",
    category: "Specialty",
    icon: "fa-champagne-glasses",
    price: 45000,
    pricingType: "quote",
    shortDesc: "Before or after your event — leave the mess to us.",
    longDesc: "Fast, discreet event cleanup crews for parties, weddings, and corporate events.",
    duration: "4–8 Hours",
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
    shortDesc: "Recurring cleans for retail, gyms and commercial spaces.",
    longDesc: "Custom commercial cleaning contracts with dedicated account management.",
    duration: "4–8 Hours",
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
    shortDesc: "Classroom, playground and cafeteria cleaning specialists.",
    longDesc: "Child-safe cleaning products and vetted staff for schools and daycares.",
    duration: "5–8 Hours",
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
    shortDesc: "Hospital-grade cleaning with strict infection control.",
    longDesc: "Trained crews using hospital-grade disinfectants and protocols.",
    duration: "6–10 Hours",
    included: ["Disinfect", "Waste handling", "Wards", "Restrooms", "Common areas", "Compliance"],
    formFields: ["property_size", "floors", "frequency", "description", "preferred_date", "photos", "additional_notes"],
  },
  {
    id: "restaurant",
    name: "Restaurant Cleaning",
    category: "Commercial",
    icon: "fa-utensils",
    price: 40000,
    pricingType: "quote",
    shortDesc: "Kitchen, dining and back-of-house cleans overnight.",
    longDesc: "Health-code compliant restaurant cleaning, scheduled around service.",
    duration: "3–6 Hours",
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
    shortDesc: "Large-scale floor and industrial cleaning services.",
    longDesc: "Heavy-duty machinery and crews for warehouses and industrial spaces.",
    duration: "8–12 Hours",
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
