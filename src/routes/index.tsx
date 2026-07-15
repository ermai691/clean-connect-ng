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
  price: number; // starting price NGN
  duration: string;
  rating: number;
  reviews: number;
  included: string[];
};

const services: Service[] = [
  {
    id: "house",
    name: "House Cleaning",
    category: "Home Cleaning",
    icon: "fa-house",
    image:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
    desc: "Keep your workspace pristine and your team productive.",
    long: "Recurring or one-off office cleaning with discreet, trained staff.",
    price: 25000,
    duration: "3–5 Hours",
    rating: 4.9,
    reviews: 204,
    included: ["Desk sanitize", "Restrooms", "Kitchenette", "Trash", "Floors", "Common areas"],
  },
  {
    id: "postcon",
    name: "Post Construction",
    category: "Specialty",
    icon: "fa-helmet-safety",
    image:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=70",
    desc: "Dust, debris and residue removal after renovations.",
    long: "Heavy-duty cleaning after construction or renovation projects. Safe removal of dust and residue.",
    price: 60000,
    duration: "6–10 Hours",
    rating: 4.8,
    reviews: 74,
    included: ["Dust removal", "Paint spots", "Debris", "Window residue", "Floor polish", "Sanitize"],
  },
  {
    id: "laundry",
    name: "Laundry & Ironing",
    category: "Laundry",
    icon: "fa-shirt",
    image:
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=1200&q=70",
    desc: "Certified pest control with pet and family-safe products.",
    long: "Certified fumigation for homes and businesses, targeting common pests safely.",
    price: 30000,
    duration: "2–4 Hours",
    rating: 4.8,
    reviews: 88,
    included: ["Inspection", "Treatment", "Nest removal", "Perimeter spray", "Follow-up plan", "Warranty"],
  },
  {
    id: "airbnb",
    name: "Airbnb Cleaning",
    category: "Home Cleaning",
    icon: "fa-key",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=70",
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
    image:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=70",
    desc: "Before or after your event — leave the mess to us.",
    long: "Fast, discreet event cleanup crews for parties, weddings, and corporate events.",
    price: 45000,
    duration: "4–8 Hours",
    rating: 4.8,
    reviews: 62,
    included: ["Trash removal", "Floors", "Furniture reset", "Restrooms", "Kitchen", "Sanitize"],
  },
  {
    id: "commercial",
    name: "Commercial Cleaning",
    category: "Commercial",
    icon: "fa-shop",
    image:
      "https://images.unsplash.com/photo-1604014237800-1c9102c219da?auto=format&fit=crop&w=1200&q=70",
    desc: "Recurring cleans for retail, gyms and commercial spaces.",
    long: "Custom commercial cleaning contracts with dedicated account management.",
    price: 50000,
    duration: "4–8 Hours",
    rating: 4.8,
    reviews: 47,
    included: ["Floors", "Restrooms", "Windows", "Common areas", "Sanitize", "Trash"],
  },
  {
    id: "school",
    name: "School Cleaning",
    category: "Commercial",
    icon: "fa-school",
    image:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=70",
    desc: "Classroom, playground and cafeteria cleaning specialists.",
    long: "Child-safe cleaning products and vetted staff for schools and daycares.",
    price: 55000,
    duration: "5–8 Hours",
    rating: 4.9,
    reviews: 39,
    included: ["Classrooms", "Restrooms", "Cafeteria", "Playground", "Sanitize", "Waste"],
  },
  {
    id: "hospital",
    name: "Hospital Cleaning",
    category: "Commercial",
    icon: "fa-hospital",
    image:
      "https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=1200&q=70",
    desc: "Hospital-grade cleaning with strict infection control.",
    long: "Trained crews using hospital-grade disinfectants and protocols.",
    price: 80000,
    duration: "6–10 Hours",
    rating: 5,
    reviews: 22,
    included: ["Disinfect", "Waste handling", "Wards", "Restrooms", "Common areas", "Compliance"],
  },
  {
    id: "restaurant",
    name: "Restaurant Cleaning",
    category: "Commercial",
    icon: "fa-burger",
    image:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=70",
    desc: "Kitchen, dining and back-of-house cleans overnight.",
    long: "Health-code compliant restaurant cleaning, scheduled around service.",
    price: 40000,
    duration: "3–6 Hours",
    rating: 4.9,
    reviews: 71,
    included: ["Kitchen degrease", "Dining", "Restrooms", "Floors", "Sanitize", "Trash"],
  },
  {
    id: "warehouse",
    name: "Warehouse Cleaning",
    category: "Commercial",
    icon: "fa-warehouse",
    image:
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=70",
    desc: "Large-scale floor and industrial cleaning services.",
    long: "Heavy-duty machinery and crews for warehouses and industrial spaces.",
    price: 90000,
    duration: "8–12 Hours",
    rating: 4.8,
    reviews: 18,
    included: ["Floor scrub", "Dust", "Racking", "Loading bays", "Restrooms", "Waste"],
  },
];

function ngn(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}

// ---------- Home ----------
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

  // Reveal on scroll
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

  const handleBook = (s: Service) => {
    if (!isAuthenticated()) {
      navigate({ to: "/login", search: { redirect: `/booking?service=${s.id}` } });
      return;
    }
    navigate({ to: "/booking", search: { service: s.id } });
  };


  return (
    <>
      <Nav />

      {/* ---------- Hero ---------- */}
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
              {/* Replace with your own hero image */}
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

      {/* ---------- Services ---------- */}
      <section id="services">
        <div className="container-x">
          <h2 className="section-title reveal">Our Services</h2>
          <p className="section-sub reveal">
            Premium cleaning and laundry services delivered by vetted professionals across Abuja.
          </p>
          <div className="services-grid">
            {services.map((s) => (
              <article className="service-card reveal" key={s.id}>
                <div className="service-media">
                  {/* Replace with your own service image */}
                  <img src={s.image} alt={s.name} loading="lazy" />
                  <span className="service-icon" aria-hidden>
                    {/* Replace with your own Font Awesome icon */}
                    <i className={`fas ${s.icon}`} />
                  </span>
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
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section id="how" style={{ background: "var(--gradient-soft)" }}>
        <div className="container-x">
          <h2 className="section-title reveal">How It Works</h2>
          <p className="section-sub reveal">
            Book in under 60 seconds. Match with a verified pro. Relax.
          </p>
          <div className="steps">
            {[
              { icon: "fa-list-check", t: "Pick a service", d: "Choose from 16+ cleaning and laundry services." },
              { icon: "fa-calendar-check", t: "Choose a time", d: "Same-day or scheduled — you're in control." },
              { icon: "fa-user-check", t: "Match with a pro", d: "Vetted, background-checked and insured." },
              { icon: "fa-sparkles", t: "Enjoy the sparkle", d: "Rate your pro. Satisfaction guaranteed." },
            ].map((st, i) => (
              <div className="step reveal" key={st.t}>
                <div className="step-num">{i + 1}</div>
                <div className="feature-icon" style={{ margin: "0 auto 10px" }}>
                  <i className={`fas ${st.icon}`} />
                </div>
                <h4>{st.t}</h4>
                <p>{st.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Providers ---------- */}
      <section id="providers">
        <div className="container-x">
          <h2 className="section-title reveal">Meet Top Providers</h2>
          <p className="section-sub reveal">
            Every CleanConnect pro is background-checked, trained and insured.
          </p>
          <div className="providers-grid">
            {[
              { name: "Chidinma A.", role: "House Cleaning · Wuse", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=70", jobs: 312, yrs: 5, rating: 4.9 },
              { name: "David O.", role: "Deep Cleaning · Maitama", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=70", jobs: 214, yrs: 4, rating: 4.9 },
              { name: "Fatima B.", role: "Laundry · Garki", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=70", jobs: 501, yrs: 6, rating: 5.0 },
              { name: "Samuel T.", role: "Office Cleaning · Jabi", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=70", jobs: 178, yrs: 3, rating: 4.8 },
            ].map((p) => (
              <div className="provider reveal" key={p.name}>
                {/* Replace with your own provider image */}
                <img src={p.img} alt={p.name} className="provider-avatar" />
                <h4>
                  {p.name} <i className="fas fa-circle-check verified" title="Verified" />
                </h4>
                <p className="role">{p.role}</p>
                <div className="provider-stats">
                  <div>
                    <strong>{p.jobs}</strong>Jobs
                  </div>
                  <div>
                    <strong>{p.yrs}y</strong>Exp
                  </div>
                  <div>
                    <strong>{p.rating}★</strong>Rating
                  </div>
                </div>
                <button className="btn btn-outline" style={{ width: "100%" }}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section id="about" style={{ background: "var(--gradient-soft)" }}>
        <div className="container-x">
          <h2 className="section-title reveal">Why CleanConnect</h2>
          <p className="section-sub reveal">
            Built with premium features you won't find elsewhere.
          </p>
          <div className="features-grid">
            {[
              { icon: "fa-robot", t: "AI Cost Estimator", d: "Answer a few questions and get an instant fair-price estimate." },
              { icon: "fa-wand-magic-sparkles", t: "Smart Recommendations", d: "The right package for your home — matched automatically." },
              { icon: "fa-camera-retro", t: "Before & After Photos", d: "Every job comes with visual proof of quality." },
              { icon: "fa-leaf", t: "Eco-Friendly Option", d: "Choose green cleaning products safe for kids and pets." },
              { icon: "fa-venus", t: "Female Pro Option", d: "Request a female provider when available." },
              { icon: "fa-bolt", t: "Same-Day Emergency", d: "Express bookings for last-minute needs." },
              { icon: "fa-repeat", t: "Subscription Plans", d: "Weekly, bi-weekly, monthly — save more, worry less." },
              { icon: "fa-gift", t: "Loyalty Rewards", d: "Earn points on every booking. Redeem for discounts." },
              { icon: "fa-users", t: "Refer & Earn", d: "Invite friends and stack wallet credits." },
              { icon: "fa-map-location-dot", t: "Live ETA & Tracking", d: "Watch your provider en-route, in real time." },
              { icon: "fa-file-invoice", t: "Instant PDF Invoices", d: "Download receipts and invoices in one tap." },
              { icon: "fa-qrcode", t: "QR Booking Verification", d: "Scan on arrival for secure, verified check-ins." },
            ].map((f) => (
              <div className="feature reveal" key={f.t}>
                <div className="feature-icon">
                  <i className={`fas ${f.icon}`} />
                </div>
                <h4>{f.t}</h4>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <section>
        <div className="container-x">
          <h2 className="section-title reveal">What Customers Say</h2>
          <p className="section-sub reveal">
            Real stories from thousands of satisfied Abuja homes and businesses.
          </p>
          <div className="testimonials-grid">
            {[
              {
                q: "Booked a deep clean at 9pm — arrived the next morning. Best decision I've made all year!",
                n: "Amaka N.",
                r: "Wuse II",
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=70",
              },
              {
                q: "The provider was warm, professional and thorough. My kitchen literally sparkles now.",
                n: "Emeka O.",
                r: "Gwarinpa",
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=70",
              },
              {
                q: "We use CleanConnect for our office every week. Reliable, discreet and always on time.",
                n: "Nkechi I.",
                r: "Central Business District",
                img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=70",
              },
            ].map((t) => (
              <div className="testimonial reveal" key={t.n}>
                <span className="quote-mark">"</span>
                <div className="stars">
                  {"★★★★★"}
                </div>
                <p>"{t.q}"</p>
                <div className="testimonial-author">
                  {/* Replace with your own testimonial image */}
                  <img src={t.img} alt={t.n} />
                  <div>
                    <strong>{t.n}</strong>
                    <span>{t.r}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA band ---------- */}
      <section>
        <div className="container-x">
          <div className="cta-band reveal">
            <div>
              <h3>Ready for a sparkling space?</h3>
              <p>Join thousands of happy customers across Abuja. Book in under 60 seconds.</p>
            </div>
            <a href="#services" className="btn btn-accent">
              <i className="fas fa-broom" /> Book Now
            </a>
          </div>
        </div>
      </section>

      <Footer />

      {/* ---------- Learn More Modal ---------- */}
      <div
        className={`modal-overlay ${modalService ? "open" : ""}`}
        onClick={() => setModalService(null)}
        role="dialog"
        aria-modal="true"
      >
        {modalService && (
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              {/* Replace with your own service image */}
              <img src={modalService.image} alt={modalService.name} className="modal-hero" />
              <button
                className="modal-close"
                onClick={() => setModalService(null)}
                aria-label="Close"
              >
                <i className="fas fa-times" />
              </button>
              <div className="modal-icon">
                {/* Replace with your own Font Awesome icon */}
                <i className={`fas ${modalService.icon}`} />
              </div>
            </div>

            <div className="modal-body">
              <div>
                <h2>{modalService.name}</h2>
                <p className="modal-desc">{modalService.long}</p>

                <h4>
                  <i className="fas fa-list-check" /> What's Included
                </h4>
                <ul className="checklist">
                  {modalService.included.map((i) => (
                    <li key={i}>
                      <i className="fas fa-circle-check" /> {i}
                    </li>
                  ))}
                </ul>

                <h4>
                  <i className="fas fa-star" /> Benefits
                </h4>
                <ul className="checklist">
                  {["Time saving", "Verified professionals", "Eco-friendly products", "Safe for children", "Quality assurance", "Insured providers"].map((b) => (
                    <li key={b}>
                      <i className="fas fa-circle-check" /> {b}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="summary-card">
                  <div className="summary-row">
                    <span>Starting price</span>
                    <span>{ngn(modalService.price)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration</span>
                    <span>{modalService.duration}</span>
                  </div>
                  <div className="summary-row total">
                    <span>Fixed Price</span>
                    <span>{ngn(modalService.price)}</span>
                  </div>
                </div>

                <div className="rating-card">
                  <div className="big">{modalService.rating}</div>
                  <div>
                    <div style={{ color: "#f59e0b" }}>★★★★★</div>
                    <small>{modalService.reviews}+ reviews</small>
                  </div>
                </div>

                <div className="guarantee">
                  <h5>
                    <i className="fas fa-shield-halved" /> CleanConnect Guarantee
                  </h5>
                  <ul>
                    <li><i className="fas fa-check" />Verified Provider</li>
                    <li><i className="fas fa-check" />Background Checked</li>
                    <li><i className="fas fa-check" />Secure Payments</li>
                    <li><i className="fas fa-check" />Satisfaction Guarantee</li>
                    <li><i className="fas fa-check" />Free Re-clean if needed</li>
                    <li><i className="fas fa-check" />24/7 Customer Support</li>
                    <li><i className="fas fa-check" />Real-time Tracking</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const s = modalService;
                  setModalService(null);
                  if (s) handleBook(s);
                }}
              >
                <i className="fas fa-calendar-check" /> Book Now — {ngn(modalService.price)}
              </button>
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noreferrer"
                className="btn btn-accent"
              >
                <i className="fab fa-whatsapp" /> Chat Support
              </a>
              <button className="btn btn-outline" onClick={() => setModalService(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hint for logged-out users */}
      {!user && (
        <div style={{ display: "none" }} aria-hidden />
      )}
    </>
  );
}
