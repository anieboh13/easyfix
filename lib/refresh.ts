import { prisma } from './prisma'
import { refreshProduct } from './aliexpress-api'
import { updateExchangeRate } from './exchange-rate'
import { sendFailureAlert } from './cron-alerts'

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function refreshAllProducts() {
  // Step 1: refresh the FX rate first, so every product below is priced at
  // the latest rate. A failure here must NOT abort the price refresh — we
  // just fall back to the last stored rate and note it.
  let rateNote: string
  try {
    const { rate } = await updateExchangeRate()
    rateNote = `Exchange rate updated to NGN ${rate}/$`
  } catch (err) {
    rateNote = `Exchange rate update failed, using last stored rate: ${String(err)}`
    console.error(rateNote)
    await sendFailureAlert('[Easy Fix Screens] Exchange-rate fetch failed', [rateNote])
  }

  const products = await prisma.product.findMany({
    where: { status: 'active' },
    select: { id: true, sourceId: true, categoryId: true, finalPrice: true },
  })

  const results: { id: string; success: boolean; action?: string; error?: string }[] = []

    for (const product of products) {
    let result = await refreshProduct(product)

    // If we hit a temporary error (e.g. rate limit), retry with increasing
    // waits before giving up — a single retry isn't always enough to
    // outlast AliExpress's rate-limit window.
    const retryDelays = [3000, 6000]
    for (const waitMs of retryDelays) {
      if (result.success || result.action !== 'skipped-temporary-error') break
      await delay(waitMs)
      result = await refreshProduct(product)
    }

    results.push({ id: product.id, ...result })
    await delay(2000) // slower pacing — AliExpress's real limit is tighter than 1/sec
  }

  return {
    totalProcessed: results.length,
    results,
    rateNote,
  }
}