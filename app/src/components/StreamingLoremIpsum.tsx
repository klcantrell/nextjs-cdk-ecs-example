"use client";

import { readStreamableValue } from "ai/rsc";
import { useState } from "react";

import { streamLoremIpsum } from "@/app/actions";
import { useEffectOnce } from "@/utils";

export default function StreamingLoremIpsum() {
  const [message, setMessage] = useState("");

  useEffectOnce(() => {
    (async function () {
      const response = await streamLoremIpsum();

      for await (const content of readStreamableValue(response)) {
        setMessage((previous) => `${previous}${content}`);
      }
    })();
  });

  return <div>Data: {message}</div>;
}
