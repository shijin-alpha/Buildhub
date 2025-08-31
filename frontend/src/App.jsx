import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Register from "./components/Register.jsx";
import Login from "./components/Login.jsx";
import ForgotPassword from "./components/ForgotPassword.jsx";
import ResetPassword from "./components/ResetPassword.jsx";
import HomeownerDashboard from "./components/HomeownerDashboard.jsx";
import ContractorDashboard from "./components/ContractorDashboard.jsx";
import ArchitectDashboard from "./components/ArchitectDashboard.jsx";
import AuthorizedRedirectURIs from "./components/AuthorizedRedirectURIs.jsx";
import AdminLogin from "./components/AdminLogin.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute.jsx";
import HomeownerRoute from "./components/HomeownerRoute.jsx";
import ArchitectRoute from "./components/ArchitectRoute.jsx";
import ContractorRoute from "./components/ContractorRoute.jsx";

// Home page component
function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const heroTitle = document.querySelector(".hero h1");
    const heroText = document.querySelector(".hero p");
    const btnGroup = document.querySelector(".btn-group");

    setTimeout(() => (heroTitle.style.opacity = "1"), 100);
    setTimeout(() => (heroText.style.opacity = "1"), 600);
    setTimeout(() => (btnGroup.style.opacity = "1"), 1100);
  }, []);

  const handleScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  function Counter({ end, label }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let startTime = null;
      const duration = 2000;

      function animate(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = timestamp - startTime;
        const current = Math.min(Math.floor((progress / duration) * end), end);
        setCount(current);
        if (progress < duration) {
          requestAnimationFrame(animate);
        }
      }
      requestAnimationFrame(animate);
    }, [end]);

    return (
      <div className="counter" aria-label={`${label} counter`}>
        {count}+
        <div style={{ fontWeight: 600, fontSize: "1rem", marginTop: "0.3rem" }}>{label}</div>
      </div>
    );
  }

  const [activeIndex, setActiveIndex] = useState(null);
  const faqs = [
    {
      question: "How does BuildHub simplify construction planning?",
      answer:
        "BuildHub provides AI-powered tools and smart suggestions to make your project planning fast and effective.",
    },
    {
      question: "Can I get accurate cost estimation?",
      answer:
        "Yes! Our platform offers detailed and transparent cost breakdowns to help you manage your budget.",
    },
    {
      question: "Do you provide design assistance?",
      answer:
        "Absolutely. Get professional layouts and designs created by top architects tailored to your project.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <header>
        <div
          className="logo"
          onClick={() => handleScroll("home")}
          tabIndex={0}
          role="button"
          aria-label="Scroll to top"
        >
          BuildHub
        </div>
        <nav>
          <Link to="/">Home</Link>
          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              handleScroll("features");
            }}
            aria-label="Features"
          >
            Features
          </a>
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              handleScroll("contact");
            }}
            aria-label="Contact"
          >
            Contact
          </a>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/forgot-password">Forgot Password</Link>
        </nav>
      </header>

      <section className="hero" id="home" role="banner">
        <h1>BuildHub – Smart Construction Platform</h1>
        <p>Plan, estimate, and design your construction projects with ease.</p>
        <div className="btn-group">
          <button className="primary" onClick={() => navigate("/register")}>
            Get Started
          </button>
          <button className="secondary" onClick={() => alert("Learn More clicked!")}>
            Learn More
          </button>
        </div>
      </section>

      <section className="features" id="features" role="region" aria-label="Features Section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card glass-card">
            <h3>🏗️ Smart Planning</h3>
            <p>Plan your construction projects with advanced tools and AI-powered suggestions.</p>
          </div>
          <div className="feature-card glass-card">
            <h3>📊 Cost Estimation</h3>
            <p>Accurate and transparent project cost breakdown to fit your budget.</p>
          </div>
          <div className="feature-card glass-card">
            <h3>🎨 Design Assistance</h3>
            <p>Get professional layouts and designs from top architects in the industry.</p>
          </div>
        </div>

        <div className="counters" aria-live="polite" aria-atomic="true">
          <Counter end={150} label="Projects Completed" />
          <Counter end={75} label="Trusted Contractors" />
          <Counter end={20} label="Award-Winning Designs" />
        </div>

        <div className="accordion" aria-label="Frequently Asked Questions">
          {faqs.map(({ question, answer }, i) => (
            <div className="accordion-item" key={i}>
              <div
                className={`accordion-header ${activeIndex === i ? "active" : ""}`}
                onClick={() => toggleFAQ(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") toggleFAQ(i);
                }}
                role="button"
                tabIndex={0}
                aria-expanded={activeIndex === i}
                aria-controls={`faq${i}-content`}
                id={`faq${i}-header`}
              >
                {question}
              </div>
              <div
                id={`faq${i}-content`}
                className={`accordion-content ${activeIndex === i ? "active" : ""}`}
                role="region"
                aria-labelledby={`faq${i}-header`}
              >
                <p>{answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="contact" id="contact" role="region" aria-label="Contact Section">
        <h2>Contact Us</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Thank you for reaching out! We will get back to you soon.");
            e.target.reset();
          }}
        >
          <input type="text" name="name" placeholder="Your Name" required aria-label="Your Name" />
          <input type="email" name="email" placeholder="Your Email" required aria-label="Your Email" />
          <textarea name="message" placeholder="Your Message" required aria-label="Your Message"></textarea>
          <button type="submit">Send Message</button>
        </form>
      </section>

      <footer>© {new Date().getFullYear()} BuildHub. All rights reserved.</footer>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/homeowner-dashboard" element={
          <HomeownerRoute>
            <HomeownerDashboard />
          </HomeownerRoute>
        } />
        <Route path="/contractor-dashboard" element={
          <ContractorRoute>
            <ContractorDashboard />
          </ContractorRoute>
        } />
        <Route path="/architect-dashboard" element={
          <ArchitectRoute>
            <ArchitectDashboard />
          </ArchitectRoute>
        } />
        <Route path="/authorized-redirect-uris" element={<AuthorizedRedirectURIs />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}
