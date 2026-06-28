import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Aryan Padarthi Clovrr Solutions",
  description:
    "Read the Privacy Policy for Aryan Padarthi Clovrr Solutions, a sole proprietorship based in Allen, Texas.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-[var(--text)]">
      <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-neutral-500 mb-10">
        Effective Date: June 25, 2026 &nbsp;|&nbsp; Last Updated: June 25, 2026
      </p>

      <section className="mb-10">
        <p className="leading-relaxed">
          Welcome to <strong>Aryan Padarthi Clovrr Solutions</strong>{" "}
          (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). We are a
          sole proprietorship headquartered in Allen, Collin County, Texas. This
          Privacy Policy explains how we collect, use, disclose, and protect
          information when you visit our website or use our services. By
          accessing our website, you agree to the practices described in this
          policy.
        </p>
      </section>

      {/* 1 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          1. Information We Collect
        </h2>
        <p className="leading-relaxed mb-4">
          We collect information in the following ways:
        </p>

        <h3 className="text-lg font-semibold mb-2">
          a. Automatically Collected Data (Analytics &amp; Infrastructure)
        </h3>
        <p className="leading-relaxed mb-4">
          When you visit our website, our hosting infrastructure (including
          Vercel) and analytics tools may automatically collect certain
          technical information, such as:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed mb-4 pl-2">
          <li>IP address and approximate geographic location</li>
          <li>Browser type and version</li>
          <li>Operating system</li>
          <li>Referring URLs and pages visited on our site</li>
          <li>Date and time of your visit</li>
          <li>
            Cookies and similar tracking technologies used to remember
            preferences and analyze site traffic
          </li>
        </ul>
        <p className="leading-relaxed mb-4">
          <strong>Cookies:</strong> We may use session and persistent cookies to
          improve your experience. You can instruct your browser to refuse all
          cookies or to indicate when a cookie is being sent. However, some
          features of our site may not function properly if cookies are
          disabled.
        </p>

        <h3 className="text-lg font-semibold mb-2">
          b. Information You Provide Directly (Contact Forms)
        </h3>
        <p className="leading-relaxed mb-4">
          If you choose to contact us via a form on our website, we may collect:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed pl-2">
          <li>Your full name</li>
          <li>Email address</li>
          <li>Any message or inquiry you submit</li>
        </ul>
        <p className="leading-relaxed mt-4">
          We use this information solely to respond to your inquiry and to
          improve our services. We do not add you to any marketing list without
          your explicit consent.
        </p>

        <h3 className="text-lg font-semibold mt-6 mb-2">
          c. Payment Information
        </h3>
        <p className="leading-relaxed">
          If you make a purchase or payment through our website, payment
          processing is handled by trusted, PCI-DSS–compliant third-party
          processors (such as Stripe). <strong>We do not directly collect,
          store, or process your credit card numbers or other sensitive payment
          details.</strong> Please review your payment processor&rsquo;s privacy
          policy for information on how they handle your data.
        </p>
      </section>

      {/* 2 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          2. How We Use Your Information
        </h2>
        <p className="leading-relaxed mb-2">
          We use the information we collect to:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed pl-2">
          <li>Operate, maintain, and improve our website and services</li>
          <li>Respond to your inquiries and provide customer support</li>
          <li>Analyze usage trends and diagnose technical issues</li>
          <li>Process transactions and send related notices</li>
          <li>Comply with applicable legal obligations</li>
        </ul>
      </section>

      {/* 3 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          3. Sharing of Your Information
        </h2>
        <p className="leading-relaxed mb-2">
          We do not sell, trade, or rent your personal information to third
          parties. We may share information with:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed pl-2">
          <li>
            <strong>Service Providers:</strong> Trusted vendors who assist us in
            operating our website (e.g., Vercel for hosting, payment processors,
            email delivery services), bound by confidentiality obligations.
          </li>
          <li>
            <strong>Legal Requirements:</strong> If required by law, subpoena,
            or other legal process, or to protect the rights and safety of our
            business and users.
          </li>
          <li>
            <strong>Business Transfers:</strong> In the event of a merger,
            acquisition, or sale of assets, your information may be transferred
            as part of that transaction.
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          4. Children&rsquo;s Privacy (COPPA Compliance)
        </h2>
        <p className="leading-relaxed">
          Our website and services are not directed to children under the age of
          13. We do not knowingly collect personal information from children
          under 13, and we do not knowingly market to or target minors. If you
          believe a child under 13 has provided us with personal information,
          please contact us immediately at{" "}
          <a
            href="mailto:aryan.r.padarthi@gmail.com"
            className="text-emerald-600 underline"
          >
            aryan.r.padarthi@gmail.com
          </a>{" "}
          and we will take steps to delete that information promptly.
        </p>
      </section>

      {/* 5 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">5. Data Retention</h2>
        <p className="leading-relaxed">
          We retain personal information for as long as necessary to fulfill the
          purposes outlined in this policy, unless a longer retention period is
          required or permitted by law. When information is no longer needed, we
          take reasonable steps to securely delete or anonymize it.
        </p>
      </section>

      {/* 6 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
        <p className="leading-relaxed">
          We implement reasonable administrative, technical, and physical
          safeguards to protect your information from unauthorized access,
          disclosure, alteration, or destruction. However, no method of
          transmission over the Internet or method of electronic storage is
          100% secure. We cannot guarantee absolute security.
        </p>
      </section>

      {/* 7 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">7. Your Rights</h2>
        <p className="leading-relaxed mb-2">
          Depending on your jurisdiction, you may have the right to:
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm leading-relaxed pl-2">
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your personal data</li>
          <li>Opt out of any marketing communications</li>
        </ul>
        <p className="leading-relaxed mt-4">
          To exercise any of these rights, please contact us at{" "}
          <a
            href="mailto:aryan@clovrr.com"
            className="text-emerald-600 underline"
          >
            aryan@clovrr.com
          </a>
          .
        </p>
      </section>

      {/* 8 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          8. Third-Party Links
        </h2>
        <p className="leading-relaxed">
          Our website may contain links to third-party websites. We are not
          responsible for the privacy practices or content of those sites. We
          encourage you to review the privacy policies of any third-party sites
          you visit.
        </p>
      </section>

      {/* 9 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">
          9. Changes to This Policy
        </h2>
        <p className="leading-relaxed">
          We reserve the right to update this Privacy Policy at any time. When
          we do, we will revise the &ldquo;Last Updated&rdquo; date at the top
          of this page. We encourage you to review this policy periodically to
          stay informed about how we protect your information. Continued use of
          our website after changes are posted constitutes your acceptance of
          the updated policy.
        </p>
      </section>

      {/* 10 */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
        <p className="leading-relaxed">
          If you have any questions or concerns about this Privacy Policy,
          please contact us:
        </p>
        <address className="not-italic mt-4 text-sm leading-loose">
          <strong>Aryan Padarthi Clovrr Solutions</strong>
          <br />
          Allen, Collin County, Texas
          <br />
          Email:{" "}
          <a
            href="mailto:aryan.r.padarthi@gmail.com"
            className="text-emerald-600 underline"
          >
            aryan.r.padarthi@gmail.com
          </a>
        </address>
      </section>
    </main>
  );
}
