import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR PRIVACY POLICY — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple privacy policy for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Purpose of Data Collection: Order processing
// - Data sharing: we do not share the data with any other parties
// - Children's Privacy: we do not collect any data from children
// - Updates to the Privacy Policy: users will be updated by email
// - Contact information: marc@shipfa.st

// Please write a simple privacy policy for my site. Add the current date.  Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: 2024-09-04

Privacy Policy for Magic Resume

MagicResume ("we", "us", or "our") respects the privacy of its users ("you" or "your")
and is committed to protecting it through our compliance with this policy.
This policy describes the types of information we may collect from you or that you may provide when you visit
the website https://magic-resume.com (our "Website") and our practices for collecting, using,
maintaining, protecting, and disclosing that information.
Information We Collect

1. Information We Collect About You
We collect several types of information from and about users of our Website, including:

Personal Data: Information by which you may be personally identified, such as name, email address, and payment information.
Non-Personal Data: We also collect non-personal information through web cookies
(e.g., internet connection, the equipment you use to access our Website, and usage details).

3. Disclosure of Your Information
We may disclose aggregated information about our users, and information that does not identify any individual, without restriction. We may disclose personal information that we collect or you provide as described in this privacy policy:

To contractors, service providers, and other third parties we use to support our business.
To fulfill the purpose for which you provide it.
For any other purpose disclosed by us when you provide the information.
With your consent.

4. Data Security
We have implemented measures designed to secure your personal information from accidental loss and from unauthorized access, use, alteration, and disclosure.

5. Changes to Our Privacy Policy
It is our policy to post any changes we make to our privacy policy on this page. If we make material changes to how we treat our users' personal information, we will notify you by email to the email address specified in your account.

6. Contact Information
To ask questions or comment about this privacy policy and our privacy practices, contact us at: arellano.luis88@gmail.com.

By using Magic Resume, you agree to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
