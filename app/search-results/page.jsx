"use client";
import { useSearchParams } from "next/navigation";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const pickup = searchParams.get("pickup");
  const dropoff = searchParams.get("dropoff");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Search Results</h1>
      <p>Pickup Location: {pickup}</p>
      <p>Dropoff Location: {dropoff}</p>
      
    </div>
  );
}
