import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const normalizeDateKey = (value) => {
  const date = new Date(value);
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    .toISOString()
    .slice(0, 10);
};

const getMonthLabel = (date) =>
  date.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric"
  });

const buildCalendarDays = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const leadingDays = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();
  const cells = [];

  for (let index = 0; index < leadingDays; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingDate, setSavingDate] = useState("");
  const [error, setError] = useState("");

  const loadCalendarData = async () => {
    const [logsResponse, streakResponse] = await Promise.all([
      api.get("/workout-log"),
      api.get("/workout-log/streak")
    ]);

    setLogs(logsResponse.data?.workoutLogs || []);
    setStreak(streakResponse.data?.streak || 0);
  };

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setLoading(true);
        setError("");
        await loadCalendarData();
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load workout calendar.");
        setLogs([]);
        setStreak(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCalendarData();
  }, []);

  const completedDateKeys = useMemo(
    () => new Set(logs.map((log) => normalizeDateKey(log?.date))),
    [logs]
  );

  const calendarDays = useMemo(() => buildCalendarDays(currentMonth), [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((previous) => new Date(previous.getFullYear(), previous.getMonth() + 1, 1));
  };

  const handleDateClick = async (date) => {
    if (!date) {
      return;
    }

    const dateKey = normalizeDateKey(date);
    setSavingDate(dateKey);
    setError("");

    try {
      await api.post("/workout-log", {
        date: date.toISOString(),
        completed: true
      });
      await loadCalendarData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to save workout log.");
    } finally {
      setSavingDate("");
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-6xl p-8 text-slate-200">
        Loading workout calendar...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Workout Calendar</p>
        <h1 className="mt-5 section-title">Keep your consistency visible</h1>
        <p className="mt-5 section-copy">
          Click a day to mark your workout complete, review your month at a glance, and keep your streak alive.
        </p>
        <div className="mt-6 inline-flex rounded-full border border-orange-400/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-200">
          {"\uD83D\uDD25"} Current Streak: {streak} day{streak === 1 ? "" : "s"}
        </div>
      </section>

      {error && (
        <div className="rounded-[28px] border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
          {error}
        </div>
      )}

      <section className="surface p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <button type="button" onClick={handlePreviousMonth} className="btn-secondary">
            Previous
          </button>
          <h2 className="text-2xl font-semibold text-white">{getMonthLabel(currentMonth)}</h2>
          <button type="button" onClick={handleNextMonth} className="btn-secondary">
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekdayLabels.map((label) => (
            <div key={label} className="pb-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-sm">
              {label}
            </div>
          ))}

          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="aspect-square rounded-2xl border border-transparent" />;
            }

            const dateKey = normalizeDateKey(date);
            const isCompleted = completedDateKeys.has(dateKey);
            const isSaving = savingDate === dateKey;
            const isToday = dateKey === normalizeDateKey(new Date());

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleDateClick(date)}
                disabled={isSaving}
                className={`aspect-square min-h-[72px] rounded-[22px] border p-2.5 text-left transition duration-200 sm:p-3 ${
                  isCompleted
                    ? "border-brand-500/40 bg-brand-500/15 text-white shadow-[0_14px_36px_rgba(20,184,166,0.18)]"
                    : "border-white/10 bg-slate-950/70 text-slate-200 hover:border-brand-500/30 hover:bg-white/5"
                } ${isToday ? "ring-2 ring-orange-400/50" : ""}`}
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="text-sm font-semibold sm:text-base">{date.getDate()}</span>
                  <span className="text-[11px] text-slate-400 sm:text-xs">
                    {isSaving ? "Saving..." : isCompleted ? "Completed" : "Mark done"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-5">
        <div className="section-header">
          <h2 className="text-2xl font-semibold text-white">Recent Workout Logs</h2>
          <p className="text-slate-300">Your latest completed workout dates are listed here.</p>
        </div>

        {logs.length === 0 ? (
          <div className="empty-state">
            No workouts logged yet. Click a day on the calendar to start your streak.
          </div>
        ) : (
          <div className="grid gap-4">
            {logs
              .slice()
              .reverse()
              .slice(0, 10)
              .map((log) => (
                <div
                  key={log?._id || log?.date}
                  className="card card-hover p-5"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {new Date(log?.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-slate-400">
                        {log?.workoutId?.name || "Workout completed"}
                      </p>
                    </div>
                    <div className="pill border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
                      Completed
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Calendar;
