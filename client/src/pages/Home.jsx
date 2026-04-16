import { Link } from "react-router-dom";
import Carousel from "../components/Carousel";
import SocialLinks from "../components/SocialLinks";
import YouTubeSection from "../components/YouTubeSection";

const features = [
  {
    title: "Personalized Dashboard",
    description: "Track workouts, meals, progress, streaks, and notifications from one clean hub."
  },
  {
    title: "AI Coaching Tools",
    description: "Generate workouts with AI and turn rough fitness goals into structured plans in seconds."
  },
  {
    title: "Progress That Sticks",
    description: "Use your calendar, streaks, and logs to stay accountable and make momentum visible."
  }
];

const Home = () => {
  return (
    <div className="page-stack">
      <div className="fade-in-up">
        <Carousel />
      </div>

      <YouTubeSection />

      <section className="grid gap-6 lg:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="card card-hover p-7">
            <span className="eyebrow">Core Feature</span>
            <h2 className="mt-4 text-2xl font-bold text-white">{feature.title}</h2>
            <p className="mt-3 text-base leading-7 text-slate-300">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="surface p-8 sm:p-10">
          <span className="section-kicker">
            Built for Consistency
          </span>
          <h2 className="mt-5 section-title">
            Fitness tools that feel connected instead of scattered.
          </h2>
          <p className="mt-5 section-copy">
            PrimePhysique blends training, diet guidance, AI planning, progress tracking, reminders, and messaging into one flow that is easier to stick with.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn-secondary">
              Sign In
            </Link>
          </div>
        </div>

        <div className="surface overflow-hidden p-8 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="surface-muted p-5">
              <p className="eyebrow">AI Workout Plans</p>
              <h3 className="mt-3 text-4xl font-bold text-white">Smart</h3>
            </div>
            <div className="rounded-[26px] border border-brand-400/20 bg-brand-400/10 p-5">
              <p className="eyebrow text-brand-100">Calendar Tracking</p>
              <h3 className="mt-3 text-4xl font-bold text-white">Daily</h3>
            </div>
            <div className="rounded-[26px] border border-orange-400/20 bg-orange-500/10 p-5 sm:col-span-2">
              <p className="eyebrow text-orange-200">Why it works</p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Clear goals, visible momentum, and an interface that keeps your next step obvious.
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="surface p-8 sm:p-10">
          <span className="pill">
            Follow Us
          </span>
          <h2 className="mt-5 section-title">
            Join the PrimePhysique community beyond the app.
          </h2>
          <p className="mt-5 section-copy">
            Get training inspiration, nutrition ideas, AI feature updates, and quick motivation drops across our social channels.
          </p>
        </div>

        <div className="surface p-8 sm:p-10">
          <SocialLinks title="Stay Connected" />
        </div>
      </section>
    </div>
  );
};

export default Home;
