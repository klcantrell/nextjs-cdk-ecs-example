"use server";

import { createStreamableValue } from "ai/rsc";

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function asyncIteratorToStream<T>(iterator: AsyncIterator<T>) {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await iterator.next();

      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },
  });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}

async function* generateLoremIpsum() {
  for (const word of LOREM_IPSUM.replaceAll(" ", "<|split|> ").split(
    "<|split|>"
  )) {
    await delay(200);
    yield word;
  }
}

export async function streamLoremIpsum() {
  const streamableText = createStreamableValue("");

  (async function () {
    for await (const word of generateLoremIpsum()) {
      streamableText.update(word);
    }

    streamableText.done();
  })();

  return streamableText.value;
}
