import { promises as fs } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(
  process.env.DATA_DIR || path.join(__dirname, "../../data"),
);
const locks = new Map<string, Promise<void>>();

async function withLock<T>(
  fileName: string,
  operation: () => Promise<T>,
): Promise<T> {
  const previous = locks.get(fileName) || Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => {
    release = resolve;
  });
  locks.set(
    fileName,
    previous.then(() => current),
  );
  await previous;
  try {
    return await operation();
  } finally {
    release();
    if (locks.get(fileName) === current) locks.delete(fileName);
  }
}

export async function readJson<T>(fileName: string, fallback: T): Promise<T> {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(
      await fs.readFile(path.join(dataDir, fileName), "utf8"),
    ) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(fileName: string, value: T): Promise<void> {
  await withLock(fileName, async () => {
    await fs.mkdir(dataDir, { recursive: true });
    const target = path.join(dataDir, fileName);
    await fs.writeFile(`${target}.tmp`, JSON.stringify(value, null, 2));
    await fs.rename(`${target}.tmp`, target);
  });
}

export async function appendJson<T>(fileName: string, value: T): Promise<void> {
  await withLock(fileName, async () => {
    const entries = await readJson<T[]>(fileName, []);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      path.join(dataDir, fileName),
      JSON.stringify([...entries, value], null, 2),
    );
  });
}
