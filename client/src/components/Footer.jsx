import { Link } from "react-router-dom";
import SocialLinks from "./SocialLinks";

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-white/5 bg-slate-950/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div className="space-y-5">
          <Link to="/" className="text-2xl font-extrabold tracking-tight text-white">
            Prime<span className="text-brand-400">Physique</span>
          </Link>
          <p className="max-w-xl text-slate-400">
            PrimePhysique brings workouts, nutrition, AI planning, progress tracking, and accountability tools together in one modern fitness platform.
          </p>
          <p className="text-sm text-slate-500">Train smarter. Stay consistent. Keep moving forward.</p>
        </div>

        <div className="lg:justify-self-end">
          <SocialLinks compact title="Connect With Us" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
