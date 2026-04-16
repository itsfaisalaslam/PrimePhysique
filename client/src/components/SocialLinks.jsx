import {
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube
} from "react-icons/fa6";

const socialPlatforms = [
  {
    label: "Instagram",
    href: "https://instagram.com/primephysique",
    icon: FaInstagram,
    hoverClass: "hover:border-pink-500/40 hover:text-pink-300"
  },
  {
    label: "YouTube",
    href: "https://youtube.com/@primephysique",
    icon: FaYoutube,
    hoverClass: "hover:border-rose-500/40 hover:text-rose-300"
  },
  {
    label: "Twitter X",
    href: "https://x.com/primephysique",
    icon: FaXTwitter,
    hoverClass: "hover:border-slate-500/40 hover:text-white"
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/primephysique",
    icon: FaLinkedinIn,
    hoverClass: "hover:border-sky-500/40 hover:text-sky-300"
  }
];

const buildShareLinks = () => {
  const shareUrl =
    typeof window !== "undefined" ? window.location.href : "https://primephysique.app";

  const shareText = "Check out PrimePhysique for workouts, AI coaching, progress tracking, and more.";

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  };
};

const SocialLinks = ({ compact = false, showShare = true, title = "Follow Us" }) => {
  const shareLinks = buildShareLinks();

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div>
        <h3 className={`${compact ? "text-lg" : "text-2xl"} font-semibold text-white`}>{title}</h3>
        {!compact && (
          <p className="mt-2 text-slate-400">
            Stay connected for new workouts, nutrition tips, and platform updates.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        {socialPlatforms.map((platform) => {
          const Icon = platform.icon;

          return (
            <a
              key={platform.label}
              href={platform.href}
              target="_blank"
              rel="noreferrer"
              aria-label={platform.label}
              className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/70 text-lg text-slate-300 transition duration-200 hover:scale-110 ${platform.hoverClass}`}
            >
              <Icon />
            </a>
          );
        })}
      </div>

      {showShare && (
        <div className="flex flex-wrap gap-3">
          <a
            href={shareLinks.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:scale-[1.02] hover:bg-emerald-500/15"
          >
            <FaWhatsapp className="text-base" />
            Share on WhatsApp
          </a>
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-600/40 bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:scale-[1.02] hover:border-brand-500/30 hover:text-white"
          >
            <FaXTwitter className="text-base" />
            Share on Twitter
          </a>
        </div>
      )}
    </div>
  );
};

export default SocialLinks;
