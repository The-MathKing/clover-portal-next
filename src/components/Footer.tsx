import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-black py-12 px-6 border-t border-[#222] mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
          <Image src="/logo.png" alt="Clovrr Logo" width={20} height={20} className="rounded-sm grayscale hover:grayscale-0 transition-all" />
          <span className="text-sm font-semibold tracking-wide text-white">Clovrr</span>
        </div>
        <div className="text-[#a1a1a6] text-sm">
          © {new Date().getFullYear()} Clovrr Solutions. All rights reserved.
        </div>
        <div className="flex gap-6 text-sm font-medium text-[#a1a1a6]">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
