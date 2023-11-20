import Image from "next/image";
import Link from "next/link";
import React from "react";
import { inter } from "~/lib/fonts";
import { cn } from "~/lib/utils";

function Guest({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col items-stretch bg-background font-inter antialiased",
      )}
    >
      <div className="sticky top-0 z-50 hidden w-full justify-between bg-white px-5 py-4 text-sm backdrop-blur-[3px] lg:flex">
        {/* left side */}
        <div className="flex items-center gap-5">
          <Image src="/logo.png" alt="logo" width={145} height={48} />
          <Link href="/">Solutions</Link>
          <Link href="/">Contact sales</Link>
          <Link href="/">Plan & Pricing</Link>
        </div>
        {/* right side */}
        <div className="flex items-center gap-5">
          <Link href="/">Join a Meeting Room</Link>
          <Link href="/">Login</Link>
          <button className=" rounded-2xl bg-konn3ct-green px-4 py-2 text-white">
            Sign up, It&apos;s Free
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default Guest;
