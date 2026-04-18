import { useEffect, useState } from "react";
import api from "../services/api";

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/trainers");
        setTrainers(response.data?.trainers || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load trainers.");
        setTrainers([]);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, []);

  const handleSelectTrainer = async (trainer) => {
    try {
      setSelectedTrainer(trainer);
      setLoadingClients(true);
      setError("");
      setClients([]);

      const response = await api.get(`/admin/trainers/${trainer?._id}/clients`);
      setClients(response.data?.clients || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to load trainer clients.");
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  if (loading) {
    return (
      <div className="surface mx-auto max-w-6xl p-8 text-slate-200">
        Loading trainers...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl page-stack fade-in-up">
      <section className="surface p-8 sm:p-10">
        <p className="section-kicker">Admin Trainers</p>
        <h1 className="mt-5 section-title">Trainer Assignments</h1>
        <p className="mt-5 section-copy">
          Review trainers and see which members are assigned to each coach.
        </p>
      </section>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">Trainers</h2>
            <p className="text-slate-300">Select a trainer to view their assigned clients.</p>
          </div>

          {trainers.length === 0 ? (
            <div className="empty-state">No trainers found.</div>
          ) : (
            <div className="grid gap-3">
              {trainers.map((trainer) => (
                <button
                  key={trainer?._id}
                  type="button"
                  onClick={() => handleSelectTrainer(trainer)}
                  className={`rounded-[20px] border px-5 py-4 text-left transition duration-200 ${
                    selectedTrainer?._id === trainer?._id
                      ? "border-brand-400/40 bg-brand-400/10"
                      : "border-white/10 bg-slate-950/60 hover:border-brand-400/25 hover:bg-white/5"
                  }`}
                >
                  <p className="font-semibold text-white">{trainer?.name || "Unnamed trainer"}</p>
                  <p className="mt-1 break-all text-sm text-slate-300">{trainer?.email || "No email"}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="surface p-8">
          <div className="section-header">
            <h2 className="text-2xl font-semibold text-white">
              {selectedTrainer ? `${selectedTrainer?.name}'s Clients` : "Assigned Clients"}
            </h2>
            <p className="text-slate-300">
              {selectedTrainer ? "Client list for the selected trainer." : "Choose a trainer to load clients."}
            </p>
          </div>

          {!selectedTrainer ? (
            <div className="empty-state">Select a trainer from the list.</div>
          ) : loadingClients ? (
            <div className="empty-state">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="empty-state">No clients assigned to this trainer yet.</div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900/90 text-left">
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Client Name</th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Email</th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Membership Plan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client?._id} className="border-t border-white/10 bg-slate-950/75">
                        <td className="px-5 py-4 text-white">{client?.name || "Unknown client"}</td>
                        <td className="px-5 py-4 text-slate-300">{client?.email || "No email"}</td>
                        <td className="px-5 py-4 text-slate-300">{client?.membershipPlan || "None"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminTrainers;
