import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";

// CHATGPT PROMPT TO GENERATE YOUR TERMS & SERVICES — replace with your own data 👇

// 1. Go to https://chat.openai.com/
// 2. Copy paste bellow
// 3. Replace the data with your own (if needed)
// 4. Paste the answer from ChatGPT directly in the <pre> tag below

// You are an excellent lawyer.

// I need your help to write a simple Terms & Services for my website. Here is some context:
// - Website: https://shipfa.st
// - Name: ShipFast
// - Contact information: marc@shipfa.st
// - Description: A JavaScript code boilerplate to help entrepreneurs launch their startups faster
// - Ownership: when buying a package, users can download code to create apps. They own the code but they do not have the right to resell it. They can ask for a full refund within 7 day after the purchase.
// - User data collected: name, email and payment information
// - Non-personal data collection: web cookies
// - Link to privacy-policy: https://shipfa.st/privacy-policy
// - Governing Law: France
// - Updates to the Terms: users will be updated by email

// Please write a simple Terms & Services for my site. Add the current date. Do not add or explain your reasoning. Answer:

export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: September 9, 2024

Welcome to Magic Resume. By accessing or using our website (https://magic-resume.com), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these Terms, you may not use our service.

1. Description of Service
Magic Resume ("we", "us", "our") provides a web application that allows users to test their resumes against an Applicant Tracking System (ATS) and make improvements.

2. User Accounts
You may be required to create an account to use certain features of our service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.

3. User Data
We collect and process personal data as described in our Privacy Policy (https://magic-resume.com/privacy-policy). By using our service, you consent to such processing and you warrant that all data provided by you is accurate.

4. Intellectual Property
The content, features, and functionality of Magic Resume are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

5. User Content
You retain all rights to any content you submit, post, or display on or through our service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and distribute your content for the purpose of providing and improving our service.

6. Prohibited Uses
You agree not to use Magic Resume:
In any way that violates any applicable law or regulation
To impersonate or attempt to impersonate the company, an employee, or any other person
To engage in any other conduct that restricts or inhibits anyone's use of the service

7. Termination
We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.

8. Limitation of Liability
In no event shall Magic Resume, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to use the service.

9. Changes to Terms
We reserve the right to modify or replace these Terms at any time. We will notify users of any changes by email. Your continued use of the service after any such changes constitutes your acceptance of the new Terms.

10. Governing Law
These Terms shall be governed and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.

11. Contact Us
If you have any questions about these Terms, please contact us at arellano.luis88@gmail.com.`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
