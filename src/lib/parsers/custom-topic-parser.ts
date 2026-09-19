/**
 * Parser for User-Pasted Custom Syllabus Topics and Assigned Cases.
 *
 * Example input:
 * Constitution as the Fundamental Law of the Land
 * 1. Marbury v. Madison, 1 Cranch 137 (1803) — read the facts, main issue...
 * 2. Republic v. Sandiganbayan, 407 SCRA 10 (2003)
 * 3. Gudani v. Senga, 498 SCRA 671 (2006)
 * 4. Nicolas v. Romulo, G.R. No. 175888, February 11, 2009
 */

export interface ParsedCase {
  caseTitle: string;
  caseCitation: string;
  notes?: string;
  verificationStatus: "USER_PROVIDED_NEEDS_REVIEW" | "VERIFIED";
}

export interface ParsedCustomTopic {
  title: string;
  description?: string;
  cases: ParsedCase[];
}

export function parseCustomTopicText(
  rawText: string,
  providedTitle?: string,
  providedDescription?: string
): ParsedCustomTopic {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let detectedTitle = providedTitle?.trim() || "";
  let detectedDescription = providedDescription?.trim() || "";
  const cases: ParsedCase[] = [];

  let lineIndex = 0;

  // If no title was provided in the dedicated field, the first non-empty line can be the title
  if (!detectedTitle && lines.length > 0) {
    // Check if first line looks like a case or a topic header
    const firstLine = lines[0];
    const looksLikeCase = isCaseLine(firstLine);

    if (!looksLikeCase) {
      detectedTitle = cleanLinePrefix(firstLine);
      lineIndex = 1;
    } else {
      detectedTitle = "Custom Study Topic";
    }
  }

  // Parse remaining lines as cases or description
  for (let i = lineIndex; i < lines.length; i++) {
    const line = lines[i];

    // If it's a general note or description before cases start
    if (cases.length === 0 && !isCaseLine(line) && !line.includes(" v. ") && !line.includes(" vs. ")) {
      if (!detectedDescription) {
        detectedDescription = line;
      } else {
        detectedDescription += `\n${line}`;
      }
      continue;
    }

    const parsedCase = parseSingleCaseLine(line);
    if (parsedCase) {
      cases.push(parsedCase);
    }
  }

  return {
    title: detectedTitle || "Untitled Study Module",
    description: detectedDescription || undefined,
    cases,
  };
}

/**
 * Checks if a line resembles a case entry
 */
function isCaseLine(line: string): boolean {
  const clean = cleanLinePrefix(line);
  // Contains common case indicators
  return (
    /\bv\.?\s/i.test(clean) ||
    /\bvs\.?\s/i.test(clean) ||
    /\bin\s+re\b/i.test(clean) ||
    /\bSCRA\b/i.test(clean) ||
    /\bG\.?R\.?\s*No\.?/i.test(clean) ||
    /\bPhil\.?\b/i.test(clean) ||
    /\bCranch\b/i.test(clean) ||
    /\bU\.S\.\b/i.test(clean)
  );
}

/**
 * Cleans list numbering or bullet points from the beginning of a line
 * e.g., "1. ", "• ", "- ", "[1] "
 */
function cleanLinePrefix(line: string): string {
  return line
    .replace(/^(\d+[\.\)\:\-]\s*|\[\d+\]\s*|\(\d+\)\s*|[•\-\*\–\—\>]\s*)+/g, "")
    .trim();
}

/**
 * Parses a single case entry with optional notes
 */
function parseSingleCaseLine(rawLine: string): ParsedCase | null {
  const clean = cleanLinePrefix(rawLine);
  if (!clean) return null;

  let mainPart = clean;
  let notes: string | undefined = undefined;

  // Split on note delimiter: em-dash, en-dash, double hyphen, spaced hyphen, colon followed by text, or pipe
  const noteSplitRegex = /\s*(?:—|–|--|\s-\s|\s:\s|\s\|\s|\s\/\/\s)\s*/;
  const noteMatch = clean.search(noteSplitRegex);

  if (noteMatch !== -1) {
    mainPart = clean.slice(0, noteMatch).trim();
    const noteText = clean.replace(mainPart, "").replace(noteSplitRegex, "").trim();
    if (noteText) {
      notes = noteText;
    }
  }

  // Separate Case Title from Case Citation
  let caseTitle = mainPart;
  let caseCitation = "";

  // Typical format: "Title, Citation"
  // Look for the delimiter separating title from citation
  // Usually the comma preceding G.R. No., SCRA, Phil., Cranch, volume number, or year
  const citationMarkerRegex = /,\s*(?=(?:G\.?R\.?\s*No\.?|\d+\s*(?:SCRA|Phil|Cranch|U\.S\.|Dall|Wheat|F\.)|\d{4}\b))/i;
  const commaIndex = mainPart.search(citationMarkerRegex);

  if (commaIndex !== -1) {
    caseTitle = mainPart.slice(0, commaIndex).trim();
    caseCitation = mainPart.slice(commaIndex + 1).trim().replace(/^,\s*/, "");
  } else {
    // Fallback: look for the first comma if present
    const firstComma = mainPart.indexOf(",");
    if (firstComma !== -1 && firstComma < mainPart.length - 3) {
      caseTitle = mainPart.slice(0, firstComma).trim();
      caseCitation = mainPart.slice(firstComma + 1).trim();
    } else {
      // No comma: look for parenthesis with year e.g., "(1803)" or citation keywords
      const yearMatch = mainPart.search(/\s*\(\d{4}\)/);
      if (yearMatch !== -1) {
        caseTitle = mainPart.slice(0, yearMatch).trim();
        caseCitation = mainPart.slice(yearMatch).trim();
      } else {
        caseTitle = mainPart;
        caseCitation = "Citation not specified";
      }
    }
  }

  // Crucial policy: User-provided citations must NOT automatically be marked Verified.
  // Must be clearly marked "USER_PROVIDED_NEEDS_REVIEW".
  return {
    caseTitle,
    caseCitation: caseCitation || "Citation not specified",
    notes,
    verificationStatus: "USER_PROVIDED_NEEDS_REVIEW",
  };
}
