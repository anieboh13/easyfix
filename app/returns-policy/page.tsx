export const metadata = {
  title: 'Returns & Refunds — Easy Fix Screens',
}

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-sm text-[#22304A] leading-relaxed">
      <h1 className="text-3xl font-bold mb-2">Returns &amp; Refunds</h1>
      <p className="text-[#8B93A1] mb-10">Last updated: September 26, 2026</p>

      <p className="mb-6">
        We want you to receive the correct, working part. If there&apos;s a genuine problem with
        your order, here&apos;s how we handle it.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Eligible for return or replacement</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li>The item received does not match what was agreed with you via WhatsApp (wrong model, wrong part).</li>
        <li>The item arrives damaged or is faulty on arrival.</li>
      </ul>
      <p className="mb-6">
        To request this, contact us on WhatsApp at +2349137971703 within
        48 hours of receiving your order, with a photo or short video showing the issue.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Not eligible for return</h2>
      <ul className="list-disc pl-5 space-y-1 mb-6">
        <li>Change of mind after the order has been confirmed and dispatched.</li>
        <li>Damage caused by incorrect installation after delivery.</li>
        <li>Items reported outside the window stated above.</li>
      </ul>

      <h2 className="text-lg font-semibold mt-8 mb-2">Refund method</h2>
      <p className="mb-6">
        Approved refunds are issued via bank transfer to the same account you paid from, or as
        otherwise agreed with you directly, within 5 business days of the return being approved.
      </p>

      <h2 className="text-lg font-semibold mt-8 mb-2">Your statutory rights</h2>
      <p>
        This policy is in addition to, and does not limit, any rights you have under Nigerian
        consumer protection law.
      </p>
    </div>
  )
}