/** Shared CleanConnect service catalogue (name, category, starting price). */
export type CatalogService = {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: string;
};

export const SERVICE_CATALOG: CatalogService[] = [
  { id: "house", name: "House Cleaning", category: "Home Cleaning", price: 15000, icon: "fa-house" },
  { id: "deep", name: "Deep Cleaning", category: "Home Cleaning", price: 35000, icon: "fa-spray-can-sparkles" },
  { id: "movein", name: "Move-in Cleaning", category: "Home Cleaning", price: 40000, icon: "fa-box-open" },
  { id: "moveout", name: "Move-out Cleaning", category: "Home Cleaning", price: 42000, icon: "fa-truck-ramp-box" },
  { id: "office", name: "Office Cleaning", category: "Commercial", price: 25000, icon: "fa-building" },
  { id: "postcon", name: "Post Construction", category: "Specialty", price: 60000, icon: "fa-helmet-safety" },
  { id: "laundry", name: "Laundry & Ironing", category: "Laundry", price: 8000, icon: "fa-shirt" },
  { id: "sofa", name: "Sofa Cleaning", category: "Home Cleaning", price: 20000, icon: "fa-couch" },
  { id: "fumigation", name: "Fumigation & Pest", category: "Specialty", price: 30000, icon: "fa-bug-slash" },
  { id: "airbnb", name: "Airbnb Cleaning", category: "Home Cleaning", price: 18000, icon: "fa-bed" },
  { id: "event", name: "Event Cleanup", category: "Specialty", price: 45000, icon: "fa-champagne-glasses" },
  { id: "commercial", name: "Commercial Cleaning", category: "Commercial", price: 50000, icon: "fa-city" },
  { id: "school", name: "School Cleaning", category: "Commercial", price: 55000, icon: "fa-school" },
  { id: "hospital", name: "Hospital Cleaning", category: "Commercial", price: 80000, icon: "fa-hospital" },
  { id: "restaurant", name: "Restaurant Cleaning", category: "Commercial", price: 40000, icon: "fa-utensils" },
  { id: "warehouse", name: "Warehouse Cleaning", category: "Commercial", price: 90000, icon: "fa-warehouse" },
];

export const PACKAGES = [
  { id: "standard", name: "Standard", multiplier: 1 },
  { id: "premium", name: "Premium", multiplier: 1.4 },
  { id: "express", name: "Express", multiplier: 1.7 },
];

export function findService(idOrName?: string | null): CatalogService {
  const value = (idOrName ?? "").toLowerCase().trim();
  return (
    SERVICE_CATALOG.find((s) => s.id === value || s.name.toLowerCase() === value) ??
    SERVICE_CATALOG[0]!
  );
}

export function ngn(value: number) {
  return `₦${Math.round(value).toLocaleString("en-NG")}`;
}
