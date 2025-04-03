import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[12px] row-start-2 items-center justify-items-center">
        <Image
          src="/logo.png"
          alt="Just scripture logo"
          width={180}
          height={38}
          priority
        />
        <h1 style={{ fontWeight: 'bold', fontSize: "2rem"}}>JustScripture's new home</h1>
        <p>Coming soon!</p>
      </main>
    </div>
  );
}
