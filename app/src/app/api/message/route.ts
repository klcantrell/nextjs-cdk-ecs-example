export async function POST(req: Request) {
  const { name } = await req.json();
  await delay(10000);
  return Response.json({ message: `Hello, ${name}!` });
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, milliseconds);
  });
}
