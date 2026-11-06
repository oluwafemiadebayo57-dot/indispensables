export default function Spinner({ full = false }) {
  const cls = full
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-10';
  return (
    <div className={cls}>
      <div className="h-10 w-10 rounded-full border-4 border-gold border-t-transparent animate-spin" />
    </div>
  );
}