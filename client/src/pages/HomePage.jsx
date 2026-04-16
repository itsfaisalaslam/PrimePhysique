import { Link } from "react-router-dom";

const features = [
  {
    title: "Personalized Dashboard",
    description: "Keep your profile, workout plans, nutrition guidance, and progress updates in one place."
  },
  {
    title: "Goal-Based Plans",
    description: "Choose from structured workout and diet plans tailored for weight loss, muscle gain, or maintenance."
  },
  {
    title: "Admin Controls",
    description: "Manage users, assign plans, and keep your library of fitness programs fresh and organized."
  }
];

const HomePage = () => {
  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="inline-flex rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-semibold text-brand-300">
            Elevate every rep, meal, and milestone
          </span>
          <h1 className="mt-6 max-w-3xl font-display text-5xl font-extrabold leading-tight text-white sm:text-6xl">
            Build a stronger body with a platform designed for progress.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-slate-300">
            PrimePhysique helps users stay consistent with guided training, nutrition support, and simple progress tracking.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary shadow-glow">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn-secondary">
              Explore Dashboard
            </Link>
          </div>
        </div>

        <div className="card overflow-hidden p-8">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5">
              <p className="text-sm text-slate-400">Active Members</p>
              <h3 className="mt-3 text-4xl font-bold text-white">1.2K</h3>
            </div>
            <div className="rounded-3xl bg-brand-500/10 p-5">
              <p className="text-sm text-brand-200">Completed Sessions</p>
              <h3 className="mt-3 text-4xl font-bold text-white">18K</h3>
            </div>
            <div className="rounded-3xl bg-orange-500/10 p-5 sm:col-span-2">
              <p className="text-sm text-orange-200">Why users stay</p>
              <h3 className="mt-3 text-2xl font-bold text-white">
                Clear plans, habit tracking, and a coaching-friendly admin workflow.
              </h3>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="card p-6">
            <h2 className="text-xl font-bold text-white">{feature.title}</h2>
            <p className="mt-3 text-slate-400">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default HomePage;
