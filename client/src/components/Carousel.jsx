import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Link } from "react-router-dom";
import API_URL from "../config/api";
import api from "../services/api";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const fallbackSlides = [
  {
    id: "muscle-gain",
    title: "Transform Your Body",
    subtitle: "Build lean muscle with guided plans, progressive workouts, and nutrition support tailored for growth.",
    ctaLabel: "Get Started",
    ctaLink: "/register",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "fat-loss",
    title: "Own Your Fat Loss Journey",
    subtitle: "Stay consistent with structured training, meal planning, and a system that keeps every week on track.",
    ctaLabel: "Start Cutting Smart",
    ctaLink: "/register",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: "ai-workout",
    title: "Generate Smarter Workouts With AI",
    subtitle: "Use PrimePhysique AI tools to create personalized plans based on your goal, level, and weekly schedule.",
    ctaLabel: "Explore AI Builder",
    ctaLink: "/login",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=1600&q=80"
  }
];

const sliderSettings = {
  dots: true,
  infinite: true,
  speed: 700,
  autoplay: true,
  autoplaySpeed: 5000,
  arrows: false,
  fade: true,
  pauseOnHover: true
};

const Carousel = () => {
  const [slides, setSlides] = useState(fallbackSlides);

  useEffect(() => {
    const loadSlides = async () => {
      try {
        const response = await api.get(`${API_URL}/api/carousel`);
        const apiSlides = response.data?.slides;

        if (Array.isArray(apiSlides) && apiSlides.length > 0) {
          setSlides(apiSlides);
        }
      } catch {
        setSlides(fallbackSlides);
      }
    };

    loadSlides();
  }, []);

  return (
    <section className="hero-carousel overflow-hidden rounded-[2rem] border border-slate-800/80 shadow-glow">
      <Slider {...sliderSettings}>
        {slides.map((slide) => (
          <div key={slide.id || slide.title}>
            <div
              className="relative min-h-[460px] overflow-hidden sm:min-h-[540px]"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(2, 6, 23, 0.82), rgba(15, 23, 42, 0.55), rgba(20, 184, 166, 0.2)), url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.24),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.22),transparent_26%)]" />

              <div className="relative mx-auto flex min-h-[460px] max-w-6xl items-center px-6 py-16 sm:min-h-[540px] sm:px-10 lg:px-16">
                <div className="max-w-3xl">
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-200">
                    PrimePhysique
                  </span>
                  <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
                    {slide.title}
                  </h1>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                    {slide.subtitle}
                  </p>
                  <div className="mt-8">
                    <Link to={slide.ctaLink || "/register"} className="btn-primary shadow-glow">
                      {slide.ctaLabel || "Get Started"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default Carousel;
