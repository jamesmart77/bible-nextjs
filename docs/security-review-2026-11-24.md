# Security review — November 24, 2026

## Dependency findings and remediation

The initial npm audit reported six affected packages: one critical (Next.js), three high (Serwist build packages and Zod), and two moderate (Glob and Minimatch). Counts include affected parent packages, not six independent vulnerabilities.

Updated Next.js from 16.4.0 to 16.4.6 and Serwist packages from 9.5.13 to 9.5.15, with patched transitive dependencies. Raised package.json minimum versions and synchronized package-lock.json. Existing React 19.2.8 did not require an update according to the registry audit.

The Next.js findings included remote code execution in image optimization and typed-array cache returns, Server Action denial of service, and November cache disclosure, image validation, header disclosure, and response injection advisories. Patching the framework covers applicable framework vulnerabilities regardless of whether each affected feature is currently used.

References:

- [Next.js October security release](https://nextjs.org/blog/nextjs-security-update-october-14-2026)
- [Next.js security advisories, including November 3 updates](https://github.com/vercel/next.js/security)

Final `npm audit --json`: **zero known vulnerabilities**, including development dependencies. This is a point-in-time dependency check, not a guarantee against undisclosed vulnerabilities.

## Application findings remediated

- AI-generated responses and saved assisted-search history previously passed unrestricted markup into an HTML-to-React parser. They now share an allowlist renderer that drops executable/embedded elements, rebuilds supported formatting without source attributes, and accepts only local scripture links. This also protects existing saved responses.
- The cron endpoint could accept `Bearer undefined` if CRON_SECRET was absent. It now fails closed when the secret is missing.
- The request proxy now strips inbound identity headers before forwarding identity derived from a verified session, including anonymous and invalid-session paths.
- Registration failures now return a generic response instead of exposing internal exception details.

## Unresolved authentication finding

`app/api/auth/signin/route.ts` issues a session for an email address after a CAPTCHA check without verifying email ownership. Someone who knows another reader's email and passes CAPTCHA can impersonate that reader and access associated account data. CAPTCHA is bot protection, not authentication.

The user chose to keep the current login flow for now. The email-ownership vulnerability remains documented and unremediated by that decision. A future migration should verify email ownership and invalidate previously issued sessions.

## Validation and limits

- Production build and TypeScript checks pass.
- 36 tests pass, including malicious assisted HTML, unsafe links, identity-header spoofing, missing cron secret, and existing audio, interlinear, and assisted-search behavior.
- Browser checks confirmed clearing and refocusing in passage, keyword, and assisted search; next/previous chapter arrows reset scroll to zero from near chapter bottoms; all six action buttons remain within a 320px viewport at extra-large text size.
- The production build reports an existing dynamic-file-tracing warning in the Serwist route.
- This review covers repository dependencies and the inspected application paths. It does not audit deployed infrastructure, database row-level security configuration, credential history, or external service settings. Changes need deployment to protect production.
