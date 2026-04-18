import { useEffect, useState } from "react";
import { FaCirclePlay, FaYoutube } from "react-icons/fa6";
import API_URL from "../config/api";

const fallbackVideos = [
  {
    id: "UIPvIYsjfpo",
    title: "Full Body Strength Workout for Beginners"
  },
  {
    id: "ml6cT4AZdqI",
    title: "Fat Loss Cardio and Conditioning Session"
  },
  {
    id: "ixkQaZXVQjs",
    title: "Muscle Gain Training Tips and Technique"
  },
  {
    id: "gC_L9qAHVJ8",
    title: "At-Home Core Workout for Daily Consistency"
  },
  {
    id: "2pLT-olgUJs",
    title: "Upper Body Dumbbell Routine"
  },
  {
    id: "s2NQhpFGIOg",
    title: "Lower Body Workout for Strength and Shape"
  }
];

const YouTubeSection = () => {
  const [videos, setVideos] = useState(fallbackVideos);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch(`${API_URL}/api/youtube`);
        const apiVideos = response.ok ? await response.json() : null;

        if (Array.isArray(apiVideos?.videos) && apiVideos.videos.length > 0) {
          setVideos(apiVideos.videos);
        }
      } catch {
        setVideos(fallbackVideos);
      }
    };

    loadVideos();
  }, []);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-300">
            {"\uD83D\uDD25"} Latest Fitness Videos
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Learn, train, and stay inspired with fresh coaching content.
          </h2>
          <p className="mt-3 max-w-2xl text-slate-400">
            Explore practical workouts, fat-loss strategies, muscle-building sessions, and daily training motivation.
          </p>
        </div>

        <a
          href="https://www.youtube.com/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200 transition hover:scale-[1.02] hover:bg-rose-500/15"
        >
          <FaYoutube />
          Watch on YouTube
        </a>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {videos.map((video) => (
          <article
            key={video.id}
            className="group overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/75 shadow-glow transition duration-300 hover:-translate-y-1 hover:scale-[1.01]"
          >
            <div className="relative aspect-video overflow-hidden">
              <img
                src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                alt={video.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`Watch ${video.title} on YouTube`}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-3xl text-white backdrop-blur transition group-hover:bg-brand-500 group-hover:text-slate-950">
                  <FaCirclePlay />
                </span>
              </a>
            </div>

            <div className="space-y-4 p-5">
              <h3 className="text-xl font-bold text-white">{video.title}</h3>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-400">YouTube Fitness</span>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-brand-300 transition hover:text-brand-200"
                >
                  Play Video
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default YouTubeSection;
