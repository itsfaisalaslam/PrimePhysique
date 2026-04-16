const StatCard = ({ label, value, accent = "brand" }) => {
  const accentClasses = {
    brand: "from-brand-500/25 to-brand-700/5",
    orange: "from-orange-500/25 to-orange-700/5",
    blue: "from-sky-500/25 to-sky-700/5"
  };

  return (
    <div className={`card bg-gradient-to-br ${accentClasses[accent]} p-5`}>
      <p className="text-sm text-slate-400">{label}</p>
      <h3 className="mt-3 text-3xl font-bold text-white">{value}</h3>
    </div>
  );
};

export default StatCard;
