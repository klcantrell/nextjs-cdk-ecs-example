"use client";

import { useQuery } from "@tanstack/react-query";

export default function Greeting() {
  const greetingQuery = useQuery<{ message: string }>({
    queryKey: ["message"],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/message`, {
        method: "POST",
        body: JSON.stringify({ name: "Kalalau" }),
      });
      return response.json();
    },
  });

  if (greetingQuery.isPending || !greetingQuery.data) {
    return <span>Loading...</span>;
  }

  return <span>{greetingQuery.data.message}</span>;
}
