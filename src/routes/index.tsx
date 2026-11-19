import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav, Footer, useAuthUser } from "@/components/Nav";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

// ---------- Data ----------
type Service = {
  id: string;
  name: string;
  category: string;
  icon: string;
  image: string;
  desc: string;
  long: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  included: string[];
  quoteOnly?: boolean;
};

const services: Service[] = [
  {
    id: "house",
    name: "House Cleaning",
    category: "Home Cleaning",
    icon: "fa-house",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=70",
    desc: "Regular top-to-bottom home cleaning by trusted local pros.",
    long: "A thorough refresh for your home — dusting, mopping, kitchen and bathroom care, and trash removal.",
    price: 15000,
    duration: "2–4 Hours",
    rating: 4.9,
    reviews: 512,
    included: ["Dusting", "Vacuuming", "Bathroom cleaning", "Kitchen cleaning", "Mopping", "Trash removal"],
  },
  {
    id: "deep",
    name: "Deep Cleaning",
    category: "Home Cleaning",
    icon: "fa-spray-can-sparkles",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
    desc: "Detailed cleaning of every corner, appliance and hard-to-reach area.",
    long: "Perfect for seasonal resets. We tackle grime, limescale, and neglected surfaces to restore a like-new feel.",
    price: 35000,
    duration: "4–6 Hours",
    rating: 4.9,
    reviews: 318,
    included: ["Baseboards", "Inside cabinets", "Appliance detail", "Grout scrub", "Windows interior", "Full sanitize"],
  },
  {
    id: "movein",
    name: "Move-in Cleaning",
    category: "Home Cleaning",
    icon: "fa-truck-ramp-box",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70",
    desc: "Start fresh in your new home — sparkling from day one.",
    long: "Move-in ready. We deep clean the empty space before your furniture and belongings arrive.",
    price: 40000,
    duration: "5–7 Hours",
    rating: 4.8,
    reviews: 142,
    included: ["Full sanitize", "Cabinet interiors", "Appliance clean", "Floors detailed", "Windows", "Bathrooms"],
  },
  {
    id: "moveout",
    name: "Move-out Cleaning",
    category: "Home Cleaning",
    icon: "fa-boxes-packing",
    image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=70",
    desc: "Get your deposit back with a landlord-grade clean.",
    long: "Detailed clean designed to meet inspection standards for handover.",
    price: 42000,
    duration: "5–7 Hours",
    rating: 4.9,
    reviews: 96,
    included: ["Wall spot clean", "Deep bathroom", "Kitchen degrease", "Windows", "Floors", "Sanitize"],
  },
  {
    id: "office",
    name: "Office Cleaning",
    category: "Commercial",
    icon: "fa-building",
    image: "/office-cleaning.png",
    desc: "Keep your workspace pristine and your team productive.",
    long: "Recurring or one-off office cleaning with discreet, trained staff.",
    price: 25000,
    duration: "3–5 Hours",
    rating: 4.9,
    reviews: 204,
    included: ["Desk sanitize", "Restrooms", "Kitchenette", "Trash", "Floors", "Common areas"],
    quoteOnly: true,
  },
  {
    id: "postcon",
    name: "Post Construction",
    category: "Specialty",
    icon: "fa-helmet-safety",
    image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=70",
    desc: "Dust, debris and residue removal after renovations.",
    long: "Heavy-duty cleaning after construction or renovation projects. Safe removal of dust and residue.",
    price: 60000,
    duration: "6–10 Hours",
    rating: 4.8,
    reviews: 74,
    included: ["Dust removal", "Paint spots", "Debris", "Window residue", "Floor polish", "Sanitize"],
    quoteOnly: true,
  },
  {
    id: "laundry",
    name: "Laundry & Ironing",
    category: "Laundry",
    icon: "fa-shirt",
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=70",
    desc: "Pick-up, wash, iron and delivery — as fast as 24 hours.",
    long: "Full-service laundry with fabric-safe detergents and crisp ironing. Pick-up and delivery included.",
    price: 8000,
    duration: "24–48 Hours",
    rating: 4.9,
    reviews: 421,
    included: ["Pick-up", "Wash & dry", "Ironing", "Folding", "Packaging", "Delivery"],
  },
  {
    id: "sofa",
    name: "Sofa Cleaning",
    category: "Home Cleaning",
    icon: "fa-couch",
    image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=70",
    desc: "Deep upholstery cleaning that removes stains and odors.",
    long: "Hot-water extraction and fabric-safe treatment to bring your sofa back to life.",
    price: 20000,
    duration: "2–3 Hours",
    rating: 4.8,
    reviews: 187,
    included: ["Vacuum", "Stain treatment", "Shampoo", "Extraction", "Deodorize", "Fabric protect"],
  },
  {
    id: "fumigation",
    name: "Fumigation & Pest",
    category: "Specialty",
    icon: "fa-bug-slash",
    image: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=70",
    desc: "Certified pest control with pet and family-safe products.",
    long: "Certified fumigation for homes and businesses, targeting common pests safely.",
    price: 30000,
    duration: "2–4 Hours",
    rating: 4.8,
    reviews: 88,
    included: ["Inspection", "Treatment", "Nest removal", "Perimeter spray", "Follow-up plan", "Warranty"],
    quoteOnly: true,
  },
  {
    id: "airbnb",
    name: "Airbnb Cleaning",
    category: "Home Cleaning",
    icon: "fa-key",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70",
    desc: "Turnover cleaning between guest stays — fast and reliable.",
    long: "Guest-ready turnovers with linen swap and restock, timed for check-in.",
    price: 18000,
    duration: "2–3 Hours",
    rating: 4.9,
    reviews: 231,
    included: ["Linen swap", "Restock", "Sanitize", "Quick reset", "Photo report", "Trash out"],
  },
  {
    id: "event",
    name: "Event Cleanup",
    category: "Specialty",
    icon: "fa-champagne-glasses",
    image: "/event-cleaning.png",
    desc: "Before or after your event — leave the mess to us.",
    long: "Fast, discreet event cleanup crews for parties, weddings, and corporate events.",
    price: 45000,
    duration: "4–8 Hours",
    rating: 4.8,
    reviews: 62,
    included: ["Trash removal", "Floors", "Furniture reset", "Restrooms", "Kitchen", "Sanitize"],
    quoteOnly: true,
  },
  {
    id: "commercial",
    name: "Commercial Cleaning",
    category: "Commercial",
    icon: "fa-shop",
    image: "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=70",
    desc: "Recurring cleans for retail, gyms and commercial spaces.",
    long: "Custom commercial cleaning contracts with dedicated account management.",
    price: 50000,
    duration: "4–8 Hours",
    rating: 4.8,
    reviews: 47,
    included: ["Floors", "Restrooms", "Windows", "Common areas", "Sanitize", "Trash"],
    quoteOnly: true,
  },
  {
    id: "school",
    name: "School Cleaning",
    category: "Commercial",
    icon: "fa-school",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=70",
    desc: "Classroom, playground and cafeteria cleaning specialists.",
    long: "Child-safe cleaning products and vetted staff for schools and daycares.",
    price: 55000,
    duration: "5–8 Hours",
    rating: 4.9,
    reviews: 39,
    included: ["Classrooms", "Restrooms", "Cafeteria", "Playground", "Sanitize", "Waste"],
    quoteOnly: true,
  },
  {
    id: "hospital",
    name: "Hospital Cleaning",
    category: "Commercial",
    icon: "fa-hospital",
    image: "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=70",
    desc: "Hospital-grade cleaning with strict infection control.",
    long: "Trained crews using hospital-grade disinfectants and protocols.",
    price: 80000,
    duration: "6–10 Hours",
    rating: 5,
    reviews: 22,
    included: ["Disinfect", "Waste handling", "Wards", "Restrooms", "Common areas", "Compliance"],
    quoteOnly: true,
  },
  {
    id: "restaurant",
    name: "Restaurant Cleaning",
    category: "Commercial",
    icon: "fa-burger",
    image: "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70",
    desc: "Kitchen, dining and back-of-house cleans overnight.",
    long: "Health-code compliant restaurant cleaning, scheduled around service.",
    price: 40000,
    duration: "3–6 Hours",
    rating: 4.9,
    reviews: 71,
    included: ["Kitchen degrease", "Dining", "Restrooms", "Floors", "Sanitize", "Trash"],
    quoteOnly: true,
  },
  {
    id: "warehouse",
    name: "Warehouse Cleaning",
    category: "Commercial",
    icon: "fa-warehouse",
    image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=70",
    desc: "Large-scale floor and industrial cleaning services.",
    long: "Heavy-duty machinery and crews for warehouses and industrial spaces.",
    price: 90000,
    duration: "8–12 Hours",
    rating: 4.8,
    reviews: 18,
    included: ["Floor scrub", "Dust", "Racking", "Loading bays", "Restrooms", "Waste"],
    quoteOnly: true,
  },
];

function ngn(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

const categories = ["All", "Home Cleaning", "Commercial", "Laundry", "Specialty"];

function Home() {
  const [modalService, setModalService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const user = useAuthUser();

  const filteredServices = services.filter((s) => {
    const matchesCategory = activeCategory === "All" || s.category === activeCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.desc.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = modalService ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalService]);

  const openLearnMore = (s: Service) => {
    setModalService(s);
  };

  const WHATSAPP_NUMBER = "2349078870211";

  const handleBook = (s: Service) => {
    if (s.quoteOnly) {
      const message = encodeURIComponent(
        `Hi CleanConnect! I would like to request a quote for *${s.name}*.\n\nPlease get back to me. Thank you.`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
      return;
    }
    if (!isAuthenticated()) {
      navigate({ to: "/login", search: { redirect: `/booking?service=${s.id}` } });
      return;
    }
    navigate({ to: "/booking", search: { service: s.id } });
  };

  return (
    <>
      <Nav />
      <header className="hero">
        <div className="container-x hero-grid">
          <div>
            <span className="hero-pill">
              <i className="fas fa-shield-check" /> 4,000+ verified pros in Abuja
            </span>
            <h1>Cleaning made effortless. Trusted pros, on demand.</h1>
            <p className="lede">
              Book verified cleaners and laundry professionals across Abuja in minutes.
              Fixed prices, insured providers, and satisfaction guaranteed.
            </p>
            <div className="hero-actions">
              <a href="#services" className="btn btn-accent">
                <i className="fas fa-broom" /> Book a Cleaner
              </a>
              <a href="#how" className="btn btn-outline" style={{ background: "transparent", color: "#fff", borderColor: "rgba(255,255,255,0.4)" }}>
                How it works
              </a>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>4,000+</strong>
                <span>Verified pros</span>
              </div>
              <div className="hero-stat">
                <strong>50k+</strong>
                <span>Cleanings done</span>
              </div>
              <div className="hero-stat">
                <strong>4.9★</strong>
                <span>Avg. rating</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <img
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=70"
                alt="Professional cleaner at work"
              />
              <div className="hero-card-meta">
                <div>
                  <strong>Chidinma A.</strong>
                  <div style={{ color: "var(--muted-foreground)", fontSize: "0.85rem" }}>
                    House Cleaning · Wuse II
                  </div>
                </div>
                <div className="service-rating">
                  <i className="fas fa-star" /> 4.9
                </div>
              </div>
            </div>
            <div className="hero-badge b1">
              <i className="fas fa-shield-halved" /> Insured & Verified
            </div>
            <div className="hero-badge b2">
              <i className="fas fa-bolt" /> Same-day booking
            </div>
          </div>
        </div>
      </header>

      <section id="services">
        <div className="container-x">
          <h2 className="section-title reveal">Our Services</h2>
          <p className="section-sub reveal">
            Premium cleaning and laundry services delivered by vetted professionals across Abuja.
          </p>

          <div className="services-filter-bar reveal">
            <div className="services-search">
              <i className="fas fa-magnifying-glass" aria-hidden />
              <input
                type="text"
                placeholder="Search cleaning or laundry services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search services"
              />
              {searchQuery && (
                <button
                  className="services-search-clear"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <i className="fas fa-xmark" />
                </button>
              )}
            </div>
            <div className="services-categories" role="group" aria-label="Filter by category">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`category-chip ${activeCategory === cat ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="services-results reveal">
            Showing {filteredServices.length} of {services.length} services
            {activeCategory !== "All" && <span> in <strong>{activeCategory}</strong></span>}
            {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
          </div>

          {filteredServices.length > 0 ? (
            <div className="services-grid">
              {filteredServices.map((s) => (
                <article className="service-card reveal" key={s.id}>
                  <div className="service-media">
                    <img src={s.image} alt={s.name} loading="lazy" />
                    <span className="service-icon" aria-hidden>
                      <i className={`fas ${s.icon}`} />
                    </span>
                    <span className="service-category-badge">{s.category}</span>
                  </div>
                  <div className="service-body">
                    <h3>{s.name}</h3>
                    <p className="desc">{s.desc}</p>
                    <div className="service-meta">
                      <div className="service-price">
                        {ngn(s.price)} <span>starting</span>
                      </div>
                      <div className="service-rating">
                        <i className="fas fa-star" /> {s.rating}
                      </div>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted-foreground)" }}>
                      <i className="far fa-clock" /> {s.duration}
                    </div>
                  </div>
                  <div className="service-actions">
                    <button className="btn btn-outline" onClick={() => openLearnMore(s)}>
                      Learn More
                    </button>
                    <button className="btn btn-primary" onClick={() => handleBook(s)}>
                      {s.quoteOnly ? "Request a Quote" : "Book Now"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="services-empty reveal">
              <p>No services found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      <div className={`modal-overlay ${modalService ? "open" : ""}`} onClick={() => setModalService(null)}>
        {modalService && (
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalService(null)}>
              <i className="fas fa-xmark" />
            </button>
            <img src={modalService.image} alt={modalService.name} className="modal-hero" />
            <div className="modal-body">
              <div className="modal-icon">
                <i className={`fas ${modalService.icon}`} />
              </div>
              <h2>{modalService.name}</h2>
              <p className="modal-desc">{modalService.long}</p>
              <h4>What's included</h4>
              <ul className="modal-includes">
                {modalService.included.map((i) => (
                  <li key={i}><i className="fas fa-check" /> {i}</li>
                ))}
              </ul>
              <div className="modal-meta">
                <div><span>Starting from</span><span>{ngn(modalService.price)}</span></div>
                <div><span>Duration</span><span>{modalService.duration}</span></div>
                <div><span>Rating</span><span>{modalService.rating} ({modalService.reviews}+ reviews)</span></div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" onClick={() => { const s = modalService; if (s) handleBook(s); }}>
                  <i className={`fas ${modalService.quoteOnly ? "fa-comments" : "fa-calendar-check"}`} />{" "}
                  {modalService.quoteOnly ? "Request a Quote on WhatsApp" : `Book Now — ${ngn(modalService.price)}`}
                </button>
                <a href="https://wa.me/2349078870211" target="_blank" rel="noreferrer" className="btn btn-accent">
                  <i className="fab fa-whatsapp" /> Chat Support
                </a>
                <button className="btn btn-outline" onClick={() => setModalService(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
