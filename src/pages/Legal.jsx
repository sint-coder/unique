import { Link } from 'react-router-dom';

const pages = {
  privacy: {
    title: 'Privacy policy',
    intro: 'This notice describes the personal data Unique Write processes to provide the writing service and the choices available to you.',
    sections: [
      ['Who is responsible', <p key="p">The service is operated under the name <strong>Unique Write</strong>. Contact the service at <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a>. The operator’s registered legal name and postal address should also be published when available.</p>],
      ['Information we process', <ul key="u"><li>Account details: email address, password hash, sign-in provider identifier, and email-verification status.</li><li>Writing content: submitted text, generated result, selected style, word count, and request timestamps.</li><li>Service and security data: session identifier, request metadata needed to secure the service, and records of account, balance, and subscription activity.</li><li>Attribution data: a browser visitor identifier and referral/campaign parameters, stored to understand which campaigns bring visitors.</li><li>Payments: payment provider references, plan, amount, and payment status. Card details are handled by the payment provider and are not stored by Unique Write.</li></ul>],
      ['Why we use it', <ul key="u"><li>To create and secure accounts, verify email addresses, and provide sign-in.</li><li>To process submitted text, return a rewrite, maintain the user’s word balance, and show recent history.</li><li>To accept and reconcile payments, prevent abuse, troubleshoot errors, and meet legal obligations.</li><li>To measure referral and campaign performance using the attribution data described above.</li></ul>],
      ['Writing content and retention', <p key="p">Submitted text and generated results are stored in the service database so the rewrite can be returned and shown in History. History is retained for 7 days; you can delete an item sooner. Automatic deletion depends on the scheduled cleanup job running. Account, payment, security, and campaign records may be retained for longer where needed to operate the service or meet legal requirements.</p>],
      ['Service providers and transfers', <p key="p">Text rewriting is sent to Google through the Gemini API. Google’s data handling depends on the API project’s billing tier: for unpaid Gemini API services, submitted content and generated responses may be used to improve Google products; paid services are not used for that purpose, though Google may process prompts for abuse monitoring under its terms. Google may also process data when you choose Google sign-in. Stripe processes payments when paid billing is enabled. The deployed service may also use email-delivery and bot-protection providers. These providers may process data in countries other than your own under their applicable terms and safeguards. The final production configuration determines which providers are active.</p>],
      ['Cookies and browser storage', <p key="p">The service uses a session cookie for sign-in and short-lived cookies during Google sign-in. It also stores a visitor identifier and campaign attribution in browser storage. See the <Link to="/cookies">Cookie notice</Link> for details. Confirm whether consent is required for the regions where the service will be offered and implement the required controls before launch.</p>],
      ['Your choices and requests', <p key="p">You can delete individual history entries. You may also have rights to access, correct, or delete personal data under the law that applies to you. Email requests to <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a>. Some account and payment records may need to be retained to prevent fraud or meet legal obligations.</p>],
      ['Children and changes', <p key="p">Unique Write is intended for people aged 18 or older. We do not knowingly invite children to create accounts. We will update this page when our data practices change. Effective date: <strong>2 October 2026</strong>.</p>],
    ],
  },
  terms: {
    title: 'Terms of service',
    intro: 'These terms explain the basic rules for using Unique Write. The terms shown at checkout apply to any paid plan you purchase.',
    sections: [
      ['Provider and eligibility', <p key="p">The service is provided under the name <strong>Unique Write</strong> (“we”). It is intended for people aged 18 or older. By creating an account or using the service, you agree to these terms. Consumer rights that apply where you live remain unaffected.</p>],
      ['The service', <p key="p">Unique Write uses AI to revise text in Natural, Academic, or Simple English styles. Requests must contain 50 to 2,000 words. You are responsible for the text you submit and for reviewing the result before using or sharing it. AI output can be inaccurate, incomplete, or unsuitable. We do not promise that a result preserves every nuance or meets a particular quality standard.</p>],
      ['Your content and acceptable use', <p key="p">You retain your rights in your input. You authorize us and our processing providers to use it only as needed to operate, secure, and improve delivery of the requested service, as described in the <Link to="/privacy">Privacy policy</Link>. You must have the rights and permissions needed to submit the content. Do not submit unlawful material or use the service to violate others’ rights, evade academic or workplace rules, or misrepresent authorship. You are responsible for complying with the rules that apply to your work.</p>],
      ['Accounts and security', <p key="p">Keep your sign-in credentials secure and provide a working email address. You are responsible for activity under your account. We may suspend access where reasonably necessary to protect the service, users, or others, or to address a breach of these terms.</p>],
      ['Plans, renewals, and cancellation', <p key="p">Free accounts receive the word allowance shown in the product. Paid plan names, prices, word allowances, billing frequency, and renewal terms are shown at checkout before payment. A subscription renews until cancelled. You can cancel it in account settings; cancellation stops the next renewal, and access remains available until the end of the paid period. One-time word credits expire 12 months after purchase. See the <Link to="/refunds">Refund policy</Link>.</p>],
      ['Availability, ownership, and liability', <p key="p">We may change or discontinue features and will take reasonable steps to give notice of material changes. The service, software, and branding belong to Unique Write or its licensors. To the extent permitted by applicable law, the service is provided without a guarantee of uninterrupted or error-free operation. Nothing in these terms excludes rights or remedies that cannot legally be excluded. These terms do not choose a governing law or take away mandatory consumer protections that apply where you live.</p>],
      ['Updates and contact', <p key="p">We may update these terms by publishing a revised version and effective date. For help, email <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a>. Effective date: <strong>2 October 2026</strong>.</p>],
    ],
  },
  cookies: {
    title: 'Cookie and browser storage notice',
    intro: 'This notice describes the cookies and browser storage used by the current Unique Write MVP. Production configuration may add or change providers.',
    sections: [
      ['What the service stores', <ul key="u"><li><strong>Session cookie (sid):</strong> keeps you signed in. It is HTTP-only, uses SameSite=Lax, and is marked Secure in production. The server session is configured for up to 30 days.</li><li><strong>Google sign-in cookies:</strong> short-lived state and attribution cookies used during OAuth sign-in, configured for roughly 10 minutes.</li><li><strong>Visitor identifier (vid):</strong> a persistent browser-storage identifier used to associate visits and sign-ups.</li><li><strong>Attribution data (attr):</strong> referral and campaign parameters stored in browser storage for 30 days.</li></ul>],
      ['Purpose and third parties', <p key="p">Session and OAuth cookies support login and account security. The visitor identifier and attribution data support campaign measurement. The current code does not show third-party advertising cookies. Production providers or analytics may add storage. For details about personal data, see the <Link to="/privacy">Privacy policy</Link>.</p>],
      ['Managing storage', <p key="p">You can clear cookies and browser storage through your browser settings. Clearing the session cookie signs you out; clearing the visitor or attribution values may remove referral attribution. The MVP does not currently display a cookie-consent banner.</p>],
      ['Changes and contact', <p key="p">We will update this notice if our use of cookies or browser storage changes. For questions, email <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a>. Effective date: <strong>2 October 2026</strong>.</p>],
    ],
  },
  refunds: {
    title: 'Cancellation and refund policy',
    intro: 'This policy explains how subscription cancellations and refund requests are handled for Unique Write purchases.',
    sections: [
      ['Subscription cancellation', <p key="p">You can cancel a subscription in account settings at any time. Cancellation stops the next renewal; your current paid access remains available until the end of the billing period. Cancelling does not automatically refund a payment already made. Any mandatory statutory cancellation or refund right still applies.</p>],
      ['Refunds for paid plans', <p key="p">You may request a refund within 14 days of a charge if you have not used any words from that purchase. Refund rights for partially used word allowances, duplicate charges, unauthorized charges, or service outages are governed by applicable law. This policy does not limit any mandatory statutory right to cancel or receive a refund.</p>],
      ['One-time credits and requests', <p key="p">One-time word credits expire 12 months after purchase. To request a refund, email <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a> from the email address associated with your account. Include the purchase date and a short explanation; never send full card details.</p>],
      ['Contact and effective date', <p key="p">For refund questions, email <a href="mailto:mail@uniquewrite.com">mail@uniquewrite.com</a>. Effective date: <strong>2 October 2026</strong>.</p>],
    ],
  },
};

const policyLinks = [['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/cookies', 'Cookies'], ['/refunds', 'Refunds']];

export default function Legal({ page }) {
  const content = pages[page];
  return <main className="legal-page">
    <div className="legal-shell">
      <Link to="/" className="legal-back">← Back to Unique Write</Link>
      <div className="legal-draft"><strong>Unique Write policies</strong><span>Effective 2 October 2026 · Consumer rights under applicable law remain unaffected.</span></div>
      <article className="legal-document">
        <span className="legal-eyebrow">UNIQUE WRITE · LEGAL</span>
        <h1>{content.title}</h1>
        <p className="legal-intro">{content.intro}</p>
        <div className="legal-sections">{content.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2>{body}</section>)}</div>
        <nav className="legal-nav" aria-label="Legal pages">{policyLinks.filter(([href]) => href !== `/${page}`).map(([href, label]) => <Link key={href} to={href}>{label}</Link>)}</nav>
      </article>
    </div>
  </main>;
}
