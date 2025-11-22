"use client"
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "../icon.png";

export const Navbar = () => {
    const { user } = useUser();
    return (
      <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-10 md:px-20 lg:px-40 py-4 dark:border-neutral-800">
        <Link href="/" className="flex items-center gap-2">
          <Image src={logo} alt="Askes AI Logo" width={28} height={28} />
          <h1 className="text-base font-bold md:text-2xl">Askes AI</h1>
        </Link>
      
        {!user ? 
        <Link href={"/sign-in"}>
        <button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Login
        </button>
        </Link>:
        <div className="flex items-center gap-5">
        <Link href="/dashboard">
          <Button>Dashboard</Button>
        </Link>
        <UserButton/> 
        </div>
        }
      </nav>
    );
  };
  