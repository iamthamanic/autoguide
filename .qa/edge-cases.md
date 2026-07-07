# AutoGuide — project-specific edge cases for verify-ui

Extends the universal matrix in the verify-ui skill.
Add rows as features ship.

## Global

| ID | Case | Fail if |
|----|------|---------|
| G-01 | App loads | Blank screen, uncaught console errors |
| G-02 | Locale | UI language does not match AGENTS.md (de) |
| G-03 | Missing docs | Widget throws when `.autoguide/` missing |
| G-04 | Dev mode | Low-confidence facts visible to dev in development mode |
| G-05 | Published mode | Unapproved facts visible to end user in published mode |

## CLI

| ID | Case | Fail if |
|----|------|---------|
| CLI-01 | init | `autoguide init` fails on valid React Vite project |
| CLI-02 | scan | `autoguide scan` exits non-zero on invalid config |
| CLI-03 | doctor | `autoguide doctor` does not report missing deps |

## Help Widget

| ID | Case | Fail if |
|----|------|---------|
| HW-01 | Context | Widget shows wrong page context |
| HW-02 | Empty | No empty state when no docs for route |
| HW-03 | Loading | No loading state while docs load |

## Inspector

| ID | Case | Fail if |
|----|------|---------|
| IN-01 | Select | Cannot select element and see fact panel |
| IN-02 | Safety | Inspector triggers destructive actions |

## AI / Privacy

| ID | Case | Fail if |
|----|------|---------|
| AI-01 | Cloud gate | Cloud AI sends data without user confirmation |
| AI-02 | Override | AI overwrites developer-reviewed fact |
