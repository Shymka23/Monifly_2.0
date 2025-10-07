import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/favicon.png"
        alt="Monifly Logo"
        width={32}
        height={32}
        className="rounded-lg"
        priority
      />
      <span className="font-bold text-xl">Monifly</span>
    </Link>
  );
}
