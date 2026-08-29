import { NextRequest, NextResponse } from 'next/server'
import { refreshAllProductVariants } from '@/lib/refresh-variants'
import { alertOnPartialFailures, sendFailureAlert } from '@/lib/cron-alerts'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }


  try {
    const summary = await refreshAllProductVariants()
    await alertOnPartialFailures('Variant refresh', summary)
    return NextResponse.json(summary)
  } catch (err) {
    await sendFailureAlert('[Easy Fix Screens] Variant refresh cron crashed', [
      'The variant-refresh cron job crashed entirely before finishing:',
      String(err),
    ])
    return NextResponse.json(
      { error: 'Cron job failed', details: String(err) },
      { status: 500 }
    )
  }
}