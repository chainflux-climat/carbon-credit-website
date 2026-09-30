# Pre-validation review

> Pre-validation is a critical review of a project document carried out before it is submitted to a validation and verification body, so that likely findings are fixed first. Climat's pre-validation review is in development: it is built and tested in the engine, and is not yet available to users.

Updated 2026-09-29. Canonical: https://climat.today/product/pre-validation/

In development

## What is pre-validation?

Pre-validation is a review of the project document before it goes to the validator. Its purpose is to find the issues a validation and verification body is likely to raise, while they are still cheap to fix. A finding raised during validation costs a round trip: the validator writes it up, the developer responds, the validator reviews the response. For how that process runs, see [validation and verification](https://climat.today/guides/validation-and-verification/).

## What will Climat's review do?

It will read the finished draft adversarially, one section at a time, with the methodology's own conditions and the other sections in view. Each finding will have four parts.

| Part | What it contains |
| --- | --- |
| Claim | The exact words of the document that are being challenged, quoted word for word |
| Issue | What is wrong or unsupported, and why a validator would raise it |
| Remedy | What would resolve it: a source, a correction, a document |
| Severity | Blocking, material or advisory |

## How will findings be graded?

| Severity | Meaning |
| --- | --- |
| Blocking | The document would fail validation on this point alone |
| Material | Likely to be raised by a validator, and will cost a round trip |
| Advisory | Would strengthen the case, but is not a likely finding |

## What kinds of problem will it look for?

- **Unsupported claim.** Something asserted with no citation.

- **Evidence gap.** Something cited to evidence that does not exist yet.

- **Methodology deviation.** Something that conflicts with the methodology's own rules.

- **Internal inconsistency.** Something that contradicts another section or the intake.

- **Registry requirement.** Something the registry asks for that the section leaves out.

- **Calculation.** An arithmetic or unit error.

## What is available today instead?

Three checks that catch many of the same problems earlier are available now: the [applicability check](https://climat.today/product/applicability-check/), the evidence gap report, and the citation checks and conflict warnings in [document drafting](https://climat.today/product/document-drafting/).

## Frequently asked questions

### Is pre-validation available in Climat today?

Not yet. The review is in development. It is built and tested in the engine, and its screens are being added. We will say so on this page when it can be used.

### Is pre-validation a substitute for validation?

No. Validation is carried out by a validation and verification body approved by the registry, and only that body's opinion counts. Pre-validation is a self-review that aims to reduce the number of findings the validator has to raise.

### Will the review always find something?

No. A section that is sound should produce no findings, and the review is designed to return an empty list when that is the honest answer.
