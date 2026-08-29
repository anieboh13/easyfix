import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type RefreshResult = { id: string; success: boolean; action?: string; error?: string }
type RefreshSummary = { totalProcessed: number; results: RefreshResult[] }

// Raw sender — never throws, so a broken email alert can never crash the
// cron job it's supposed to be reporting on.
export async function sendFailureAlert(subject: string, bodyLines: string[]) {
  try {
    await resend.emails.send({
      from: 'Easy Fix Screens <onboarding@resend.dev>',
      to: process.env.ALERT_EMAIL_TO!,
      subject,
      text: bodyLines.join('\n'),
    })
  } catch (err) {
    console.error('Failed to send alert email:', err)
  }
}

// Looks at a refresh job's summary and emails only if something actually
// failed — silent on a clean run, so you're never spammed on success.
export async function alertOnPartialFailures(jobName: string, summary: RefreshSummary) {
  const failures = summary.results.filter((r) => !r.success)
  if (failures.length === 0) return

  const lines = [
    `${jobName} finished with ${failures.length} failure(s) out of ${summary.totalProcessed} product(s) processed.`,
    '',
    ...failures.slice(0, 20).map((f) => `- Product ${f.id}: ${f.error ?? 'unknown error'}`),
  ]
  if (failures.length > 20) {
    lines.push(`...and ${failures.length - 20} more.`)
  }

  await sendFailureAlert(`[Easy Fix Screens] ${jobName}: ${failures.length} failure(s)`, lines)
}