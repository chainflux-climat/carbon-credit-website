# Content guide

Everything published on climat.today is written to be read by an expert in a hurry
and quoted by an answer engine. Those are the same discipline: say the true thing
first, in a sentence that still makes sense when lifted out of the page.

## File format

One file per page under `content/`. The path is the URL:
`content/guides/additionality.html` is served at `/guides/additionality/`.

Each file starts with a JSON block inside an HTML comment, then the body as an HTML
fragment.

```html
<!--
{
  "layout": "article",
  "kicker": "Guide",
  "title": "Additionality in carbon projects: tests, evidence and common failures",
  "description": "Meta description, 140 to 160 characters, states what the reader gets.",
  "h1": "Additionality, explained for project developers",
  "summary": "A 40 to 60 word direct answer to the question the page exists to answer. It must stand alone: no 'this page', no pronouns that point elsewhere.",
  "updated": "2026-09-28",
  "key_facts": [ { "label": "Applies to", "value": "Verra VCS, Gold Standard" } ],
  "faq": [ { "q": "A question a developer would type", "a": "A two to four sentence answer." } ],
  "sources": [ { "title": "VCS Standard v4.7", "publisher": "Verra", "url": "https://...", "accessed": "2026-09-28" } ],
  "related": [ "guides/what-is-a-pdd", "methodologies/vm0047" ],
  "author": { "name": "Optional. A named person", "role": "their role", "url": "their profile" },
  "reviewer": { "name": "Optional. The practitioner who checked the page", "role": "their role", "url": "their profile" }
}
-->
<h2>What is additionality?</h2>
<p>...</p>
```

Rules for the body:

- Allowed elements: `h2`, `h3`, `p`, `ul`, `ol`, `li`, `table` (with `thead` and
  `tbody`), `blockquote`, `strong`, `em`, `a`, `code`, and
  `<aside class="note">`. No `h1`: the template renders it from the front matter.
- Do not add `id` attributes to headings. The build adds them and builds the table
  of contents.
- Internal links are root-relative with a trailing slash: `/guides/additionality/`.
  The build fails on an internal link that does not resolve.
- `related` entries are content paths without the extension.
- `author` and `reviewer` are optional and must name real people who did the work.
  Without a reviewer, the page says that no named practitioner has reviewed it yet.

## Editorial standard

1. **Answer first.** The `summary`, and the first one or two sentences under every
   `h2`, answer the heading directly. Detail follows.
2. **Headings are the questions people ask.** Prefer "How long does validation
   take?" to "Timelines".
3. **Every specific claim has a primary source.** A number, a rule, a deadline, a
   fee, a version: link it inline to the registry or standards document it came
   from, and list that document in `sources`. If a primary source cannot be found,
   leave the claim out. Secondary sources (consultancy blogs, news) are not enough
   for a rule or a number.
4. **State versions and dates.** Methodologies and standards change. Name the
   version a statement applies to and keep `updated` honest.
5. **Tables for comparison, numbered lists for sequence, prose for reasoning.**
6. **No filler.** No scene-setting paragraph about climate change. No "in today's
   rapidly evolving landscape". No rhetorical questions. Short sentences. American
   spelling.
7. **Do not sell.** Educational pages mention the product once, in a closing
   section titled "How Climat handles this", in two or three sentences, using only
   statements from the product fact sheet below.
8. **Say what is uncertain.** Where a rule depends on judgment by the validator or
   the registry, say so instead of inventing certainty.

Length guide: guides 1,200 to 1,800 words, methodology pages 1,000 to 1,500 words,
glossary definitions 40 to 80 words.

## Product fact sheet

Only these statements may be made about the product. Do not extend them. Each one
was checked against the application code on 2026-09-29; the note in brackets says
where a user meets it.

Available today:

- Climat is an origination workspace for carbon project developers. It is built by
  Chainflux, based in Bengaluru, India.
- A project starts by choosing a registry and a methodology. The intake form is
  generated from the inputs that methodology requires. [intake screen]
- Developers upload evidence as PDF, Word (.docx) or text. A file that yields no
  readable text is flagged and is never counted as evidence. [intake screen]
- The applicability check evaluates every applicability condition of the chosen
  methodology as pass, fail or needs review. Conditions that call for judgment are
  routed to a person instead of being guessed. [intake screen]
- The evidence gap report lists what the project still has to prove, most serious
  first (blocking, required, advisory), before any drafting starts. [evidence gaps
  screen]
- Climat drafts each section of the registry's project document in the registry's
  own order: the VCS project description or the Gold Standard for the Global Goals
  PDD. Statements carry citations to the intake data, to excerpts of the uploaded
  evidence, or to the methodology. A citation to an uploaded document is checked
  against the excerpts that were actually supplied, and flagged if it does not
  match. [drafting screen]
- Conflicts between what the intake says and what the uploaded evidence says are
  raised as warnings on the section where they matter. [drafting screen]
- People stay in control. Every section is reviewed, edited and finalized by a
  person, and a finalized section is never regenerated. [drafting and review
  screens]
- When the case is finalized it is assembled as one document, with a cover note
  for the validation and verification body that discloses the use of AI
  assistance. [export screen] Do not describe a downloadable file or package.
- Methodologies available today: Verra VM0047 v1.1 (afforestation, reforestation
  and revegetation, census-based approach) and Verra VMR0017 v1.0 (grid-connected
  electricity generation from renewable sources). Gold Standard document structure
  is supported; Gold Standard methodologies are being added.
- Climat is not a registry and not a validation body. It does not guarantee
  registration and does not replace validation or verification.

In development. These exist in the engine and are tested, but have no screens yet.
They may be described only with the words "in development":

- A pre-validation review that reads the finished draft adversarially. Each
  finding quotes the exact claim it challenges, states the issue, proposes a
  remedy, and is graded blocking, material or advisory.
- Monitoring periods after registration, carrying the methodology's monitoring
  parameters into each period and blocking submission of an incomplete one.

Not available, do not claim: recording findings raised by a validation body;
importing an existing draft; file downloads; any registry submission or filing
made on the developer's behalf.
