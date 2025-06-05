interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'indigo' | 'emerald';
}

const colorClasses = {
  blue: 'bg-blue-100/80 text-blue-700',
  green: 'bg-green-100/80 text-green-700',
  purple: 'bg-purple-100/80 text-purple-700',
  yellow: 'bg-yellow-100/80 text-yellow-700',
  indigo: 'bg-indigo-100/80 text-indigo-700',
  emerald: 'bg-emerald-100/80 text-emerald-700',
};

export function StatsCard({ title, value, subtitle, icon: Icon, color }: StatsCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
