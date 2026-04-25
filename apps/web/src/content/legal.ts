export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  eyebrow: "Privacy Policy",
  title: "Privacy Policy",
  summary:
    "This Privacy Policy explains how Orizon collects, uses, shares, and safeguards personal information when you use the Orizon website, applications, and related services.",
  effectiveDate: "April 24, 2026",
  lastUpdated: "April 24, 2026",
  intro: [
    "Orizon is designed to support international students with planning tools, community features, essay support, and curated opportunities. We collect only the information we need to operate, secure, and improve the service.",
    "By using Orizon, you acknowledge the data practices described in this Privacy Policy. If you do not agree with these practices, please do not use the service.",
  ],
  sections: [
    {
      id: "scope",
      title: "Scope",
      paragraphs: [
        "This Privacy Policy applies to information collected through Orizon's website, authenticated product experiences, community tools, application-planning features, essay-support tools, and related communications.",
        "It does not govern third-party websites, universities, scholarship providers, social networks, or other services that may be linked from Orizon or integrated at your direction.",
      ],
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      paragraphs: [
        "We collect information you provide directly, information generated through your use of the service, and limited information received from trusted service providers and authentication partners.",
      ],
      bullets: [
        "Account information, such as your email address, login credentials, and basic authentication records.",
        "Profile information, such as your display name, avatar, and any study-abroad planning details you choose to provide.",
        "User content, such as essay drafts, prompt context, community questions and answers, roadmap inputs, and opportunity submissions.",
        "Communications you send to us, including support requests, feedback, and survey responses.",
        "Technical and usage information, such as device type, browser information, session identifiers, log data, and interaction data needed to maintain and secure the service.",
        "Information from sign-in providers or integrations, such as basic profile details made available through Google sign-in or similar services you choose to use.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "How We Use Information",
      paragraphs: [
        "We use personal information to operate the service, deliver requested features, personalize the student experience, and protect Orizon and its users.",
      ],
      bullets: [
        "Provide account access, authentication, password recovery, and customer support.",
        "Generate and improve roadmaps, essay-support experiences, community workflows, and opportunity discovery features.",
        "Personalize recommendations, content, and product experiences based on the information you provide and your activity in the service.",
        "Moderate user-generated content, detect abuse, enforce our rules, and maintain platform safety.",
        "Monitor performance, troubleshoot errors, perform analytics, and improve reliability and usability.",
        "Comply with legal obligations, respond to lawful requests, and protect the rights, safety, and property of Orizon, our users, and the public.",
      ],
    },
    {
      id: "legal-bases",
      title: "Legal Bases for Processing",
      paragraphs: [
        "Where applicable law requires a legal basis for processing personal information, Orizon generally relies on one or more of the following: performance of a contract with you, legitimate interests in operating and improving the service, your consent, and compliance with legal obligations.",
      ],
    },
    {
      id: "how-we-share-information",
      title: "How We Share Information",
      paragraphs: [
        "We do not sell personal information for money. We may share information only in the limited circumstances described below.",
      ],
      bullets: [
        "With vendors and service providers that help us host, authenticate, secure, analyze, moderate, and operate Orizon.",
        "With AI and infrastructure providers when needed to power essay feedback, roadmap generation, or related product functionality.",
        "With other users when you choose to post content in public or community-facing areas of the service.",
        "With advisors, auditors, law enforcement, regulators, or other parties when required by law or reasonably necessary to protect rights, safety, and platform integrity.",
        "As part of a merger, acquisition, financing, reorganization, or sale of assets, subject to appropriate confidentiality and notice where required.",
      ],
    },
    {
      id: "data-retention",
      title: "Data Retention",
      paragraphs: [
        "We retain personal information for as long as reasonably necessary to provide the service, comply with legal obligations, resolve disputes, enforce our agreements, and maintain appropriate business records.",
        "Retention periods vary depending on the type of information, how the information is used, and applicable legal requirements. We may delete or de-identify information when it is no longer needed.",
      ],
    },
    {
      id: "your-choices-and-rights",
      title: "Your Choices and Rights",
      paragraphs: [
        "Depending on where you live, you may have rights to access, correct, delete, export, or restrict certain uses of your personal information, and to object to certain processing activities.",
      ],
      bullets: [
        "You may update certain account and profile information directly within the service.",
        "You may request account deletion or additional privacy assistance through the support or contact channel made available by Orizon.",
        "You may opt out of non-essential communications by using unsubscribe tools where available.",
        "Your browser or device settings may allow you to manage local storage, cookies, and similar technologies, although disabling them may affect service functionality.",
      ],
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      paragraphs: [
        "Orizon may process and store information in countries other than your own. When personal information is transferred across borders, we take reasonable steps to apply appropriate safeguards consistent with applicable law.",
      ],
    },
    {
      id: "security",
      title: "Security",
      paragraphs: [
        "We use reasonable administrative, technical, and organizational safeguards designed to protect personal information. No system is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      id: "children",
      title: "Children's Privacy",
      paragraphs: [
        "Orizon is not directed to children under 13, and we do not knowingly collect personal information from children under 13 without appropriate authorization. If you believe a child has provided personal information to us inappropriately, please contact us so we can review and address the issue.",
      ],
    },
    {
      id: "changes",
      title: "Changes to This Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. If we make material changes, we may provide notice through the service or by other appropriate means. Your continued use of Orizon after an updated policy becomes effective means the updated policy applies to your use of the service.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      paragraphs: [
        "If you have questions about this Privacy Policy or want to exercise a privacy right, contact Orizon through the support or contact channel identified in the service.",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  eyebrow: "Terms of Service",
  title: "Terms of Service / User Agreement",
  summary:
    "These Terms of Service govern your access to and use of Orizon's website, applications, community tools, AI-assisted features, and related services.",
  effectiveDate: "April 24, 2026",
  lastUpdated: "April 24, 2026",
  intro: [
    "By accessing or using Orizon, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you may not use the service.",
    "If you use Orizon on behalf of an organization, you represent that you have authority to bind that organization to these Terms, and 'you' includes both you and that organization.",
  ],
  sections: [
    {
      id: "eligibility",
      title: "Eligibility and Account Registration",
      paragraphs: [
        "You must be legally able to enter into a binding agreement to use Orizon. You are responsible for providing accurate account information and for keeping your credentials confidential.",
        "You are responsible for all activity that occurs under your account and must notify Orizon promptly if you believe your account has been compromised.",
      ],
    },
    {
      id: "service-description",
      title: "Service Description",
      paragraphs: [
        "Orizon provides software tools and community features intended to support international students with planning, essay development, peer discussion, and opportunity discovery.",
        "Orizon does not provide legal advice, immigration advice, educational institution guarantees, employment guarantees, or professional counseling. You remain responsible for your own decisions, submissions, deadlines, and compliance obligations.",
      ],
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use",
      paragraphs: [
        "You agree to use Orizon lawfully, respectfully, and only for its intended purposes. You may not misuse the service or interfere with other users' access to it.",
      ],
      bullets: [
        "Do not upload, post, or transmit unlawful, infringing, fraudulent, abusive, harassing, hateful, or misleading content.",
        "Do not attempt to gain unauthorized access to accounts, systems, or data.",
        "Do not scrape, reverse engineer, disrupt, overload, or interfere with the service except as expressly allowed by law.",
        "Do not use Orizon to distribute malware, spam, phishing attempts, or harmful code.",
        "Do not impersonate another person or misrepresent your identity, affiliations, qualifications, or opportunities.",
      ],
    },
    {
      id: "user-content",
      title: "User Content and Licenses",
      paragraphs: [
        "You retain ownership of the content you submit to Orizon, including essays, profile information, community posts, answers, and opportunity submissions.",
        "By submitting content, you grant Orizon a non-exclusive, worldwide, royalty-free license to host, store, reproduce, modify, display, and otherwise use that content as needed to operate, secure, improve, and provide the service.",
        "You represent that you have the rights necessary to submit your content and that your content does not violate these Terms or applicable law.",
      ],
    },
    {
      id: "community-and-moderation",
      title: "Community Standards and Moderation",
      paragraphs: [
        "Community areas are intended to support constructive, good-faith participation. Orizon may review, remove, restrict, or moderate user content that violates these Terms, creates safety risks, or undermines platform integrity.",
        "Orizon may also suspend posting privileges, limit access to features, or remove content that appears spammy, duplicative, deceptive, or otherwise harmful to the community.",
      ],
    },
    {
      id: "ai-features",
      title: "AI-Assisted Features",
      paragraphs: [
        "Some Orizon features use artificial intelligence to generate essay feedback, prompts, planning assistance, or other outputs. AI outputs may be incomplete, inaccurate, or unsuitable for your specific circumstances.",
        "You should independently review AI-generated content and should not rely on it as a substitute for professional, legal, immigration, medical, or educational advice.",
      ],
    },
    {
      id: "third-party-services",
      title: "Third-Party Services and Links",
      paragraphs: [
        "Orizon may link to or integrate with third-party services, including sign-in providers, universities, scholarship sources, and other external platforms. Those services are governed by their own terms and privacy policies, and Orizon is not responsible for their content, availability, or practices.",
      ],
    },
    {
      id: "intellectual-property",
      title: "Orizon Intellectual Property",
      paragraphs: [
        "The service, including its software, design, branding, and original content provided by Orizon, is protected by intellectual property and other laws. Except for the limited right to use the service under these Terms, Orizon reserves all rights not expressly granted to you.",
      ],
    },
    {
      id: "termination",
      title: "Suspension and Termination",
      paragraphs: [
        "Orizon may suspend or terminate your access to the service at any time if we reasonably believe you have violated these Terms, created risk for the platform or other users, or if continued access is no longer commercially or operationally feasible.",
        "You may stop using Orizon at any time. Sections that by their nature should survive termination will remain in effect after termination, including provisions relating to intellectual property, disclaimers, limitations of liability, indemnity, and dispute-related terms.",
      ],
    },
    {
      id: "disclaimers",
      title: "Disclaimers",
      paragraphs: [
        "To the maximum extent permitted by law, Orizon is provided on an 'as is' and 'as available' basis without warranties of any kind, whether express, implied, or statutory. Orizon does not warrant that the service will be uninterrupted, error-free, secure, or that any content or output will be accurate, complete, or fit for a particular purpose.",
      ],
    },
    {
      id: "limitation-of-liability",
      title: "Limitation of Liability",
      paragraphs: [
        "To the maximum extent permitted by law, Orizon and its affiliates, team members, licensors, and service providers will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, data, goodwill, or business opportunities arising out of or related to your use of the service.",
        "To the maximum extent permitted by law, the total liability of Orizon for all claims arising out of or relating to the service will not exceed the greater of the amount you paid Orizon for the service in the twelve months before the claim arose or one hundred U.S. dollars.",
      ],
    },
    {
      id: "indemnification",
      title: "Indemnification",
      paragraphs: [
        "You agree to defend, indemnify, and hold harmless Orizon and its affiliates, team members, licensors, and service providers from and against claims, liabilities, damages, losses, and expenses arising out of or related to your content, your use of the service, or your violation of these Terms or applicable law.",
      ],
    },
    {
      id: "governing-law",
      title: "Governing Law and Disputes",
      paragraphs: [
        "Except where mandatory law provides otherwise, these Terms are governed by applicable law without regard to conflict-of-law principles, and any dispute arising from or relating to these Terms or the service must be brought in a court or forum with lawful jurisdiction over the parties and dispute.",
      ],
    },
    {
      id: "changes",
      title: "Changes to These Terms",
      paragraphs: [
        "Orizon may update these Terms from time to time. If we make material changes, we may provide notice through the service or by other appropriate means. Your continued use of Orizon after updated Terms become effective means you agree to the revised Terms.",
      ],
    },
    {
      id: "contact",
      title: "Contact Us",
      paragraphs: [
        "If you have questions about these Terms, contact Orizon through the support or contact channel identified in the service.",
      ],
    },
  ],
};
