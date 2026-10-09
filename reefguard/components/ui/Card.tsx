export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-ocean-800 border border-ocean-700 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}
