import React, { useState, useEffect, useRef } from "react";

// Hook to reveal elements when scrolled into view
function useIntersectionObserver() {
  const observerRef = useRef(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    }, { threshold: 0.15 });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (el) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el);
    }
  };
}


// Scroll-Linked Text Highlight (Word-by-word progressive illumination)
function ScrollHighlightText({ text }) {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const startY = windowHeight * 0.85; 
      const endY = windowHeight * 0.25;   
      
      const currentY = rect.top;
      const progress = (startY - currentY) / (startY - endY);
      const clampedProgress = Math.max(0, Math.min(1.1, progress)); 
      
      setScrollProgress(clampedProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const words = text.split(" ");
  return (
    <h2 ref={containerRef} className="scroll-highlight-text">
      {words.map((word, index) => {
        const wordProgress = (index / words.length) * 0.85;
        const wordOpacity = Math.max(0.12, Math.min(1, (scrollProgress - wordProgress) * 5 + 0.12));
        
        return (
          <span 
            key={index} 
            className="highlight-word" 
            style={{ 
              opacity: wordOpacity,
              color: wordOpacity > 0.6 ? "#ffffff" : "var(--muted)"
            }}
          >
            {word}{" "}
          </span>
        );
      })}
    </h2>
  );
}

// Mouse-Tracking Spotlight Card Component (NeoPOP style + Cursor spotlight)
const SpotlightCard = React.forwardRef(({ children, className = "", borderAccent = "", style = {} }, ref) => {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const rectRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseEnter = () => {
    if (cardRef.current) {
      rectRef.current = cardRef.current.getBoundingClientRect();
    }
  };

  const handleMouseMove = (e) => {
    if (!rectRef.current || !overlayRef.current) return;
    const x = e.clientX - rectRef.current.left;
    const y = e.clientY - rectRef.current.top;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (overlayRef.current) {
        overlayRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const setRefs = (node) => {
    cardRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  return (
    <div 
      ref={setRefs} 
      className={`card-neopop spotlight-card ${className}`} 
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      style={{ ...style, "--border-hover": borderAccent, "--shadow-hover": borderAccent }}
    >
      <div ref={overlayRef} className="spotlight-overlay"></div>
      <div className="card-content">{children}</div>
    </div>
  );
});

// Scroll Parallax Stacked Cards Component
function CardStack() {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      if (rect.top < viewHeight && rect.bottom > 0) {
        const progress = (viewHeight - rect.top) / (viewHeight + rect.height);
        setOffset((progress - 0.5) * 120);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={containerRef} className="about-card-stack">
      <div className="stacked-card card-gold" style={{ transform: `translateY(${offset * -0.4}px) rotate(-8deg) translateX(-15px)` }}>
        <div className="stacked-card-logo">card</div>
        <div className="stacked-card-chip"></div>
        <div className="stacked-card-number">•••• 1980</div>
      </div>
      <div className="stacked-card card-mint" style={{ transform: `translateY(${offset * 0.3}px) rotate(6deg) translateX(30px)` }}>
        <div className="stacked-card-logo">card</div>
        <div className="stacked-card-chip"></div>
        <div className="stacked-card-number">•••• 2026</div>
      </div>
      <div className="stacked-card card-purple" style={{ transform: `translateY(${offset * -0.15}px) rotate(-2deg) translateX(8px)` }}>
        <div className="stacked-card-logo">card</div>
        <div className="stacked-card-chip"></div>
        <div className="stacked-card-number">•••• 8012</div>
      </div>
    </div>
  );
}

// Animated Counter component
function AnimatedCounter({ value, duration = 1800, suffix = "" }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasRun) {
          setHasRun(true);
          let startTimestamp = null;
          const isFloat = value.includes(".");
          const target = parseFloat(value);

          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const easeProgress = progress * (2 - progress);
            const currentVal = easeProgress * target;
            
            setCount(isFloat ? currentVal.toFixed(1) : Math.floor(currentVal));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(value);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration, hasRun]);

  return <span ref={elementRef}>{count}{suffix}</span>;
}

// SVG Icons
const Icons = {
  BillPayments: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="6" y1="15" x2="10" y2="15" />
    </svg>
  ),
  Rewards: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7a4 4 0 0 1-4-4 4 4 0 0 1 8 0 4 4 0 0 1-4 4z" />
    </svg>
  ),
  CreditScore: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L18 8" />
      <path d="M16 3h5v5" />
      <line x1="12" y1="12" x2="21" y2="3" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  Upi: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Coins: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v8" />
      <path d="M9.5 10h5" />
      <path d="M9.5 14h5" />
    </svg>
  ),
  Cashback: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Shield: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
};

const features = [
  {
    title: "credit card bill payments",
    body: "pay all your credit cards in one place. get instant payment status, smart auto-reminders, and full statement analysis.",
    stat: "instant",
    tag: "BILL PAY",
    accent: "var(--mint)",
    icon: Icons.BillPayments
  },
  {
    title: "luxury club rewards",
    body: "earn card coins on every rupee paid. redeem them for high-value rewards, premium products, and curated travel experiences.",
    stat: "500+ brands",
    tag: "REWARDS",
    accent: "var(--gold)",
    icon: Icons.Rewards
  },
  {
    title: "real-time credit monitoring",
    body: "track your credit health 24/7. get detailed reports, score history charts, and tips to optimize your rating.",
    stat: "24/7",
    tag: "CREDIT HEALTH",
    accent: "var(--pink-pong)",
    icon: Icons.CreditScore
  },
  {
    title: "reimagined UPI experiences",
    body: "send money securely. scan any QR code instantly and get double the rewards compared to traditional banking apps.",
    stat: "2x rewards",
    tag: "UPI PAYMENTS",
    accent: "var(--poli-purple)",
    icon: Icons.Upi
  },
  {
    title: "premium card coins",
    body: "your coins never expire. stack them to access private discounts, member-only drops, and luxury retail experiences.",
    stat: "1:1 ratio",
    tag: "COINS",
    accent: "var(--orange-sunshine)",
    icon: Icons.Coins
  },
  {
    title: "statement cashbacks",
    body: "unlock surprise cashback rewards. get direct credit statements or bank transfers instantly upon completing bills.",
    stat: "₹10k+ weekly",
    tag: "CASHBACKS",
    accent: "var(--blue-electric)",
    icon: Icons.Cashback
  }
];

const securityCards = [
  {
    title: "bank-grade encryption",
    desc: "all data is secured with AES-256 and SSL/TLS protocols during transit and storage.",
    highlight: "256-bit encryption"
  },
  {
    title: "tokenized transactions",
    desc: "your real card numbers are never stored. card uses RBI-compliant secure digital tokens.",
    highlight: "compliant tokenization"
  },
  {
    title: "device-level lock",
    desc: "biometric verification ensures only you can access card statements and execute payments.",
    highlight: "biometric verification"
  },
  {
    title: "private financial insights",
    desc: "your credit data belongs to you. card never shares or sells financial records to third parties.",
    highlight: "100% data privacy"
  }
];

function App() {
  const revealElement = useIntersectionObserver();

  // Custom States
  const [emailInput, setEmailInput] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleJoinClub = (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes("@")) {
      setErrorMessage("please enter a valid email address");
      return;
    }
    setErrorMessage("");
    setIsJoined(true);
  };

  return (
    <div className="app">
      {/* Background Radial Glow Blobs */}
      <div className="glow-blob blob-one"></div>
      <div className="glow-blob blob-two"></div>
      <div className="glow-blob blob-three"></div>
      <div className="bg-grid"></div>

      {/* Navigation Header */}
      <header className="navbar">
        <a className="brand" href="#hero">
          <span>card</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#about">about</a>
          <a href="#features">features</a>
          <a href="#security">security</a>
          <a href="#footer">company</a>
        </nav>
        <a className="button-neopop nav-button" href="#invite">
          get invite
        </a>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero" id="hero">
          <div className="hero-copy reveal" ref={revealElement}>
            <p className="eyebrow">members-only club</p>
            <h1>pay your credit card bills. earn rewards.</h1>
            <p className="hero-subtext">
              join 15M+ members who pay their credit card bills on time, track
              their credit health, and unlock exclusive luxury rewards.
            </p>
            <div className="hero-actions">
              <a className="button-neopop btn-gold" href="#invite">
                join the club
              </a>
              <a className="button-neopop btn-outline" href="#features">
                explore benefits
              </a>
            </div>
          </div>

          {/* Interactive Phone Stage with 3D Flip Card */}
          <div className="phone-stage reveal" ref={revealElement} aria-label="Interactive premium application mockup">
            <div 
              className="glow-card card-one neopop-shadow-yellow"
              style={{ transform: `translateY(${Math.min(100, scrollY * 0.09)}px)` }}
            >
              <div className="glow-header">
                <span>statement paid</span>
                <span className="dot yellow"></span>
              </div>
              <strong>₹48,250</strong>
              <small>+ 4,825 card coins</small>
            </div>

            <div 
              className={`phone-frame ${isCardFlipped ? "flipped" : ""}`}
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              title="Click to flip credit card"
              style={{ 
                transform: `scale(${Math.min(1.08, 1 + scrollY * 0.00015)}) rotateY(${isCardFlipped ? 180 : scrollY * 0.015}deg) translateY(${scrollY * 0.02}px)`
              }}
            >
              <div className="phone-screen">
                <div className="speaker"></div>
                <div className="app-header">
                  <div className="app-title">card</div>
                  <div className="status-dot"></div>
                </div>

                {/* Flip Card Component */}
                <div className="credit-card-container">
                  <div className="credit-card-inner">
                    {/* Front */}
                    <div className="credit-card-front">
                      <div className="card-top">
                        <span className="chip"></span>
                        <span className="wifi">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12a10 10 0 0 1 14 0" />
                            <path d="M8.5 15.5a5 5 0 0 1 7 0" />
                            <path d="M12 18.5a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1z" />
                          </svg>
                        </span>
                      </div>
                      <div className="card-number">•••• •••• •••• 8012</div>
                      <div className="card-footer">
                        <div>
                          <small>MEMBER SINCE</small>
                          <div>2026</div>
                        </div>
                        <div className="card-logo">CARD.</div>
                      </div>
                    </div>
                    {/* Back */}
                    <div className="credit-card-back">
                      <div className="magnetic-strip"></div>
                      <div className="signature-area">
                        <span>CVV 999</span>
                      </div>
                      <p className="card-back-text">
                        exclusive members-only network access card.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="score-widget">
                  <div className="score-label">credit score</div>
                  <div className="score-number">812</div>
                  <div className="score-bar"><div className="fill"></div></div>
                  <div className="score-status">excellent rating</div>
                </div>

                <div className="card-action-list">
                  <div className="action-row">
                    <span>security check</span>
                    <strong>active</strong>
                  </div>
                  <div className="action-row">
                    <span>UPI status</span>
                    <strong>secured</strong>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="glow-card card-two neopop-shadow-mint"
              style={{ transform: `translateY(${Math.max(-100, -scrollY * 0.08)}px)` }}
            >
              <div className="glow-header">
                <span>cashback claim</span>
                <span className="dot mint"></span>
              </div>
              <strong>₹1,500</strong>
              <small>transferred to bank</small>
            </div>
          </div>
        </section>

        {/* About / Trust Section with ScrollHighlightText & CardStack */}
        <section className="trust-section" id="about">
          <div className="section-copy reveal" ref={revealElement}>
            <p className="eyebrow">about card</p>
            <ScrollHighlightText text="only the best deserve the best. card is a members-only club for individuals who value better financial habits. we believe that creditworthiness should be rewarded with premium experiences, luxury benefits, and total financial control." />
          </div>
          <div className="trust-panel-wrapper reveal" ref={revealElement}>
            <CardStack />
          </div>
        </section>

        {/* Features Section with mouse tracking SpotlightCards */}
        <section className="features-section" id="features">
          <div className="section-copy centered reveal" ref={revealElement}>
            <p className="eyebrow">member utilities</p>
            <h2>engineered for convenience.</h2>
            <p>
              one single application to handle all your credit needs. clean,
              modern, and incredibly fast.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, idx) => {
              const IconComponent = feature.icon;
              return (
                <SpotlightCard 
                  ref={revealElement}
                  className="feature-card reveal" 
                  key={feature.title}
                  borderAccent={feature.accent}
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="feature-icon-wrapper" style={{ backgroundColor: feature.accent }}>
                    <IconComponent />
                  </div>
                  <span className="feature-tag" style={{ color: feature.accent }}>{feature.tag}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.body}</p>
                  <div className="feature-footer">
                    <span className="stat">{feature.stat}</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </section>

        {/* Testimonials / Ratings & Animated Statistics */}
        <section className="ratings-section">
          <article className="rating-card reveal" ref={revealElement}>
            <strong>
              <AnimatedCounter value="4.8" />
            </strong>
            <span>App Store rating</span>
            <small>based on 500k+ reviews</small>
          </article>
          
          <article className="rating-card reveal" ref={revealElement}>
            <strong>
              <AnimatedCounter value="4.7" />
            </strong>
            <span>Play Store rating</span>
            <small>based on 1M+ reviews</small>
          </article>

          <article className="rating-card reveal" ref={revealElement}>
            <strong>
              <AnimatedCounter value="15" suffix="M+" />
            </strong>
            <span>Active Members</span>
            <small>joined the exclusive network</small>
          </article>
        </section>

        {/* Security Section */}
        <section className="security-section" id="security">
          <div className="section-copy reveal" ref={revealElement}>
            <p className="eyebrow">security first</p>
            <h2>complete protection. no compromise.</h2>
            <p>
              your money and credentials are protected by the most advanced
              defense pipelines. card is certified, audited, and strictly
              monitored.
            </p>
            
            <div className="security-badge-row">
              <div className="badge">
                <span className="badge-dot green"></span>
                <span>ISO 27001 Certified</span>
              </div>
              <div className="badge">
                <span className="badge-dot green"></span>
                <span>PCI-DSS Compliant</span>
              </div>
            </div>
          </div>

          {/* Interactive Security Orbit Visual */}
          <div className="security-orbit-container reveal" ref={revealElement}>
            <div className="orbit-shield">
              <Icons.Shield />
              <span>SECURED</span>
            </div>
            <div className="orbit-ring ring-one"></div>
            <div className="orbit-ring ring-two"></div>
            <div className="orbit-ring ring-three"></div>
            
            {/* Dynamic Floating Chips */}
            <div className="orbit-chip chip-1 border-gold" style={{ transform: `translateY(${Math.sin(scrollY * 0.003) * 15}px)` }}>encryption</div>
            <div className="orbit-chip chip-2 border-mint" style={{ transform: `translateY(${Math.cos(scrollY * 0.003) * 15}px)` }}>tokenized</div>
            <div className="orbit-chip chip-3 border-pink" style={{ transform: `translateY(${Math.sin(scrollY * 0.003 + 2) * 15}px)` }}>biometrics</div>
            <div className="orbit-chip chip-4 border-blue" style={{ transform: `translateY(${Math.cos(scrollY * 0.003 + 2) * 15}px)` }}>private</div>
          </div>

          <div className="security-cards-grid">
            {securityCards.map((card, idx) => (
              <SpotlightCard 
                ref={revealElement}
                className="security-detail-card reveal" 
                key={card.title} 
                borderAccent="var(--gold)"
                style={{ transitionDelay: `${idx * 80}ms` }}
              >
                <span className="badge-text">{card.highlight}</span>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
              </SpotlightCard>
            ))}
          </div>
        </section>

        {/* Request Access / Invite Section */}
        <section className="invite-section" id="invite">
          <div className="invite-container card-neopop border-gold reveal" ref={revealElement}>
            {!isJoined ? (
              <form onSubmit={handleJoinClub}>
                <p className="eyebrow">request invitation</p>
                <h2>experience finance, upgraded.</h2>
                <p className="invite-desc">
                  enter your email address below to request an invitation code for the members-only club.
                </p>
                <div className="invite-form-group">
                  <input
                    type="email"
                    placeholder="enter your email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="invite-input"
                  />
                  <button type="submit" className="button-neopop btn-gold">
                    get invite
                  </button>
                </div>
                {errorMessage && <p className="error-text">{errorMessage}</p>}
              </form>
            ) : (
              <div className="invite-success reveal">
                <div className="success-icon">✓</div>
                <h2>you are on the list.</h2>
                <p>
                  thank you for requesting access to card. we've sent a verification
                  link to <strong>{emailInput}</strong>. your credit score evaluation will
                  begin shortly.
                </p>
                <button className="button-neopop btn-outline" onClick={() => { setIsJoined(false); setEmailInput(""); }}>
                  request another invite
                </button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer" id="footer">
        <div className="footer-brand-col">
          <strong className="footer-logo">card</strong>
          <p className="footer-copytext">
            experience the premium lifestyle. manage your bills, secure your
            data, and unlock exclusive brand benefits.
          </p>
          <div className="social-links">
            <a href="#facebook" aria-label="Facebook">fb</a>
            <a href="#twitter" aria-label="Twitter">tw</a>
            <a href="#instagram" aria-label="Instagram">ig</a>
            <a href="#linkedin" aria-label="LinkedIn">in</a>
          </div>
        </div>
        
        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>products</h4>
            <a href="#features">bill pay</a>
            <a href="#features">rewards</a>
            <a href="#features">credit health</a>
            <a href="#features">UPI payments</a>
          </div>
          <div className="footer-col">
            <h4>resources</h4>
            <a href="#about">about card</a>
            <a href="#footer">careers</a>
            <a href="#footer">press kit</a>
            <a href="#footer">media guides</a>
          </div>
          <div className="footer-col">
            <h4>legal</h4>
            <a href="#footer">privacy policy</a>
            <a href="#footer">terms & conditions</a>
            <a href="#footer">security disclosures</a>
            <a href="#footer">governance</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} card club. all rights reserved. this is a premium fintech simulation.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
