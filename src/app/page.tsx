import Browser from "@/components/Browser";

export default function Home() {
  return (
    <>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Live <span className="text-live">Sports</span>
      </h1>
      <p className="mt-2 text-base text-mute">Watch live sports from around the world</p>
      <Browser />
    </>
  );
}
