# Security Policy

Thank you for helping keep database.dev, dbdev and their users safe.

## Reporting a vulnerability

Please report suspected vulnerabilities through our HackerOne program:
<https://hackerone.com/supabase>. Please do not open public GitHub issues or
pull requests for security problems.

This repository contains dbdev, a package manager for Postgres trusted language
extensions (TLEs). It holds the database.dev package registry (a Supabase
project whose accounts, organizations and packages live in database tables and
are served through its API), the database.dev website, and the CLI that package
authors use. The hosted registry at database.dev is a target, and so is the
code in this repository that people run themselves. We accept reports for both,
and we triage them differently (see "Hosted vs. self-run" below).

## What we consider a vulnerability

In general, we want to hear about anything that lets an attacker break the
guarantees the registry makes to its users: acting as another account,
publishing or changing a package, version or organization they do not
maintain, reading data that is not meant to be public, or running script in the
database.dev origin. The attacker should not need the victim's credentials, and
the problem should be present on the hosted registry or in a default
configuration of this code.

Examples of what this includes (these are illustrations, not a complete list):

- **Stored XSS in the registry's origin.** User-supplied content, such as
  uploaded files or package metadata, that runs script in the database.dev
  origin or otherwise reaches a database.dev user's session.
- **Bulk exposure of account data.** Listing or enumerating all accounts or
  profiles through the API in a way the public site does not offer, or reading
  fields of an account that are not shown publicly.
- **Write access you should not have.** Publishing, changing or deleting a
  package or version under an account or organization you do not belong to, or
  changing another account's profile or access tokens.
- **Authorization errors in the database layer.** Row level security policies,
  grants or database functions that let a caller read or write beyond what the
  public site and API are meant to allow. Show the data or action you gained
  and why it is not meant to be available to you.

## What we do not consider a vulnerability

These come up often. Reports that rely on them will normally be closed as
informative or not applicable.

**Behavior that is by design**

- **The registry is public.** Package names, versions, source, accounts,
  handles and profiles are public so that anyone can find and install
  packages. Looking up an individual account or profile by its handle is
  expected. Account and organization UUIDs are not sensitive.
- **Access tokens stay valid until they expire.** database.dev signs in through
  Supabase Auth, whose access tokens are stateless JWTs. Signing out revokes
  the refresh token, but an access token that was already issued keeps working
  until it expires. Show a token working *after* its expiry.
- **Public client-side keys.** Keys that the website ships to the browser by
  design, such as the error-reporting (Bugsnag) API key, are meant to be
  public. Show that a key grants something it should not.

**Prerequisites that make the attack pointless**

- The attacker needs the victim's session, access token or password.
- Response tampering through your own intercepting proxy. Changing a response
  in your own browser changes what you see, not who you are signed in as or
  what the server lets you do.

**Missing hardening or noise**

- Repeated password-reset requests that only increase the number of emails
  sent. They do not make it easier to compromise an account.
- Clickjacking with no sensitive action shown being hijacked.

**Reports that are not evidence of a flaw**

- **Script running on the storage origin.** Files that users upload are served
  from the project's Supabase Storage URL, a different origin from
  database.dev. That origin holds no database.dev session or tokens, and
  `*.supabase.co` is on the Public Suffix List, so one project's subdomain
  cannot read another's data. A file there that only shows an alert is not
  account takeover. Show script running in the database.dev origin, or access
  to another user's data.
- **SQL injection claimed from status codes.** A `200` response to a tautology
  payload proves nothing when the opposite payload returns the same thing.
  Show a change in query behavior or data that the query should not return.
- **Automated scanner output** with no demonstrated impact, and reports that
  were not reproduced against a real deployment.

## Out of scope for every Supabase asset

These are excluded program-wide (see also
<https://supabase.com/.well-known/security.txt>). They are repeated here so
you do not need to leave this repository to find them.

- Clickjacking on pages with no sensitive actions.
- Unauthenticated, logout and login CSRF.
- Attacks requiring MITM or physical access to a user's device.
- Attacks requiring social engineering.
- Any activity that could lead to the disruption of our service (DoS).
  This means volumetric attacks, load testing and flooding. A vulnerability in
  our code that lets an unprivileged attacker crash a service or exhaust
  resources for other users or tenants is in scope. Denial of service that only
  affects the attacker's own project, or that needs admin or owner privileges,
  is not.
- Content spoofing and text injection issues without showing an attack vector,
  or without being able to modify HTML/CSS.
- Email spoofing.
- Missing DNSSEC, CAA or CSP headers.
- Lack of Secure or HttpOnly flags on non-sensitive cookies.
- Dead links.
- User enumeration.

## Known and documented behavior

These are described in our public documentation. Please check them before
reporting.

- **Access tokens after sign-out.** The Supabase Auth sessions guide
  (<https://supabase.com/docs/guides/auth/sessions>) explains that an access
  token can be used until it expires, and how applications that need a
  stronger guarantee can check for an active session.
- **What dbdev installs.** dbdev installs trusted language extensions, which
  are restricted to trusted languages such as SQL and PL/pgSQL. See the README
  and <https://database.dev/docs>.

## Hosted vs. self-run

Most reports concern the hosted registry and website at database.dev and its
API. You can also run the registry and website locally from this repository
with the Supabase CLI, as `CONTRIBUTING.md` describes. That setup is for
development. Local default keys and settings are not findings against the
hosted registry. If your finding is in the code, show that it also affects
database.dev, or explain why it would affect anyone who runs the code as
documented.

## How to write a report that gets triaged quickly

- **Say what you tested, at the top of the report and in the title.** Use one of
  these labels, for example `[database.dev] ...` in the title and a "Target"
  line at the start of the description:
  - **database.dev**: the hosted registry, website and API, using an account
    you own. Never act on another user's account, packages or organizations.
  - **Local, default configuration**: the code in this repository run exactly
    as `CONTRIBUTING.md` describes, with no changed settings. Include the commit
    and how you started it.
  - **Local, custom configuration**: you changed settings, policies or code.
    List every change and why. We triage these lower unless the setting is one
    we document.

  Reports that do not say which of the three they are about are slower to
  triage, and are often closed with a request to retest. A finding that works
  only on a custom configuration is not a finding against database.dev.

- **Test a real deployment.** Code reading alone is rarely enough. Static
  analysis findings, including findings in SQL migrations and RLS policies,
  need a working proof of concept against one of the targets above.
- **Give a short, runnable PoC.** Exact requests, a script or a screen
  recording, and the output showing the impact. For XSS, show which origin the
  script runs in and what it can reach.
- **State the attacker's starting position.** An anonymous visitor, a newly
  signed-up account, a package maintainer, or someone holding a victim's token?
- **Name the boundary you crossed.** Which account, package or organization
  could not do this before? Show that the data you read is not already public
  on database.dev. If nothing was crossed, it is probably a hardening
  suggestion.
- **Check the docs and this file first.** If the behavior is documented, explain
  why the documented design still fails.
- **Include versions.** The commit for local tests, and the CLI version if the
  CLI is involved.
- **One issue per report.** Link variants of the same root cause instead of
  filing each variant separately.
- **Do not send unreviewed AI output.** Reports that were not reproduced by a
  human and that ignore the documentation are closed. AI-assisted analysis is
  fine when you have verified the result.
- **Respond to follow-up questions.** Reports that go quiet after we ask for a
  reproduction are closed.

## Severity

We rate severity by realistic impact on the hosted registry. Exposure of data
that is already public, or that is low in sensitivity, is rated lower even
when the access path is valid, and we may fix such issues as defense in depth.

## Testing and disclosure

These are our program-wide rules. They also apply to AI agents and automated
tools acting on your behalf.

**Testing**

- Do not run automated scanners against other customers' projects. Scanners can
  run up costs for our users, can disrupt services, and our own security
  systems cannot tell hostile reconnaissance from research. If you want to run
  an automated scanner, notify security@supabase.com first and run it only on
  your own Supabase project.
- Do not attack projects that belong to other customers.
- Do not take advantage of a vulnerability you find, for example by downloading
  more data than necessary to demonstrate it, or by deleting or modifying other
  people's data.

**Disclosure**

- Do not reveal the problem to others until we have researched and fixed it and
  informed affected customers.
- If you want to share your research publicly (a conference, a blog or any
  other public forum), send us a draft for review and approval at least 30 days
  before the publication date. Do not include data about Supabase customer
  projects, customers' data, or information about Supabase employees,
  contractors or partners.

**What we promise**

- We will respond to your report within 5 business days with our evaluation and
  an expected resolution date.
- If you have followed these instructions, we will not take legal action against
  you in regard to the report.
- We will handle your report with strict confidentiality and will not pass on
  your personal details to third parties without your permission.
- We will keep you informed of our progress.
- In public information about the problem, we will name you as the discoverer
  unless you prefer otherwise.
