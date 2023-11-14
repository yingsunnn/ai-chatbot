import Image from "next/image";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/notes");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex items-center gap-4">
        <Image src={logo} alt="Chatbot logo" width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tighter lg:text-5xl">
          Chatbot
        </span>
      </div>
      <p className="max-w-prose text-center">ChatGPT chatbot</p>
      <Button asChild size="lg">
        <Link href="/notes">Open</Link>
      </Button>
    </main>
  );
}
