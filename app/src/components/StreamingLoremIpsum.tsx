"use client";

import { readStreamableValue } from "ai/rsc";
import { useState } from "react";

import { streamLoremIpsum } from "@/app/actions";
import { useEffectOnce } from "@/utils";

const DOES_THIS_APPEAR_IN_THE_BUNDLE = 'DOES_THIS_APPEAR_IN_THE_BUNDLE'

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

  return <div>{DOES_THIS_APPEAR_IN_THE_BUNDLE}Data: {message}</div>;
}
