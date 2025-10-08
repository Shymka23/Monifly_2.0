import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">404 - Сторінку не знайдено</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Вибачте, але сторінку, яку ви шукаєте, не знайдено.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        На головну
      </Link>
    </div>
  );
}
