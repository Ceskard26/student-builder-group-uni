/**
 * Envío en lotes con espera entre lotes, porque Gmail SMTP tiene un límite
 * diario de envíos. Segura de reintentar: procesa un ítem a la vez, registra
 * el resultado y, si `sendOne` es idempotente (como los correos de este
 * proyecto), reintentar sobre el mismo conjunto solo reenvía a quienes
 * fallaron o nunca se procesaron.
 */

const DEFAULT_BATCH_SIZE = 20;
const DEFAULT_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface BatchItemResult<T> {
  item: T;
  result: "sent" | "skipped" | "failed";
  error?: string;
}

export async function sendInBatches<T>(
  items: T[],
  sendOne: (item: T) => Promise<"sent" | "skipped" | "failed">,
  options?: { batchSize?: number; delayMs?: number },
): Promise<BatchItemResult<T>[]> {
  const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS;
  const results: BatchItemResult<T>[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    for (const item of batch) {
      try {
        const result = await sendOne(item);
        results.push({ item, result });
      } catch (err) {
        results.push({ item, result: "failed", error: String(err) });
      }
    }

    const isLastBatch = i + batchSize >= items.length;
    if (!isLastBatch) {
      await sleep(delayMs);
    }
  }

  return results;
}
