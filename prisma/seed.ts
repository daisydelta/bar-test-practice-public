import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with 9 core subjects and demonstration data...");

  // Clean existing demo data if any
  await prisma.evaluation.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.legalReference.deleteMany();
  await prisma.question.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.userMaterial.deleteMany();

  // 1. Political Law
  const polLaw = await prisma.subject.create({
    data: {
      name: "Political Law",
      slug: "political-law",
      description: "Constitutional Law, Administrative Law, Law on Public Officers, Election Law, and Local Government.",
      sortOrder: 1,
      topics: {
        create: [
          { name: "Constitutional Law & Bill of Rights", slug: "constitutional-law-bill-of-rights", syllabusSection: "I. The 1987 Constitution" },
          { name: "Executive Department & Presidential Powers", slug: "executive-department", syllabusSection: "II. Structure of Government" },
          { name: "Legislative Department", slug: "legislative-department", syllabusSection: "II. Structure of Government" },
          { name: "Judicial Department & Judicial Review", slug: "judicial-department", syllabusSection: "II. Structure of Government" },
          { name: "Administrative Law & Public Officers", slug: "administrative-law", syllabusSection: "III. Administrative Law" },
          { name: "Law on Public Officers & Election Law", slug: "public-officers-election-law", syllabusSection: "IV. Public Officers & Elections" },
        ],
      },
    },
    include: { topics: true },
  });

  // 2. Civil Law
  const civLaw = await prisma.subject.create({
    data: {
      name: "Civil Law",
      slug: "civil-law",
      description: "Persons & Family Relations, Property, Obligations & Contracts, Torts, and Succession.",
      sortOrder: 2,
      topics: {
        create: [
          { name: "Persons and Family Relations", slug: "persons-and-family-relations", syllabusSection: "I. Persons" },
          { name: "Obligations and Contracts", slug: "obligations-and-contracts", syllabusSection: "IV. Obligations & Contracts" },
          { name: "Torts and Quasi-Delicts", slug: "torts-and-quasi-delicts", syllabusSection: "V. Torts & Damages" },
          { name: "Property and Ownership", slug: "property-and-ownership", syllabusSection: "II. Property" },
          { name: "Succession and Wills", slug: "succession-and-wills", syllabusSection: "III. Succession" },
          { name: "Special Contracts & Sales", slug: "sales-special-contracts", syllabusSection: "VI. Special Contracts" },
        ],
      },
    },
    include: { topics: true },
  });

  // 3. Criminal Law
  const crimLaw = await prisma.subject.create({
    data: {
      name: "Criminal Law",
      slug: "criminal-law",
      description: "Revised Penal Code (Book 1 & Book 2) and Special Penal Laws.",
      sortOrder: 3,
      topics: {
        create: [
          { name: "General Principles & Modifying Circumstances", slug: "general-principles-modifying", syllabusSection: "Book 1: Articles 1-113" },
          { name: "Justifying and Exempting Circumstances", slug: "justifying-exempting-circumstances", syllabusSection: "Book 1: Articles 11-12" },
          { name: "Crimes Against Persons", slug: "crimes-against-persons", syllabusSection: "Book 2: Title 8" },
          { name: "Crimes Against Property", slug: "crimes-against-property", syllabusSection: "Book 2: Title 10" },
          { name: "Special Penal Laws", slug: "special-penal-laws", syllabusSection: "Special Statutes" },
        ],
      },
    },
    include: { topics: true },
  });

  // 4. Labor Law
  const laborLaw = await prisma.subject.create({
    data: {
      name: "Labor Law",
      slug: "labor-law",
      description: "Labor Standards, Labor Relations, Termination of Employment, and Social Legislation.",
      sortOrder: 4,
      topics: {
        create: [
          { name: "Labor Standards & Conditions of Employment", slug: "labor-standards", syllabusSection: "Book 3" },
          { name: "Termination of Employment & Just/Authorized Causes", slug: "termination-of-employment", syllabusSection: "Book 6" },
          { name: "Labor Relations, Unions & Collective Bargaining", slug: "labor-relations", syllabusSection: "Book 5" },
          { name: "Jurisdiction & Procedure (Labor Arbiter & NLRC)", slug: "labor-jurisdiction-procedure", syllabusSection: "Book 5: Title 2" },
          { name: "Social Legislation (SSS, GSIS, PhilHealth)", slug: "social-legislation", syllabusSection: "Special Social Laws" },
        ],
      },
    },
    include: { topics: true },
  });

  // 5. Commercial Law
  const commLaw = await prisma.subject.create({
    data: {
      name: "Commercial Law",
      slug: "commercial-law",
      description: "Revised Corporation Code, Intellectual Property, Banking, Insurance, and Securities.",
      sortOrder: 5,
      topics: {
        create: [
          { name: "Revised Corporation Code & Corporate Governance", slug: "revised-corporation-code", syllabusSection: "R.A. 11232" },
          { name: "Intellectual Property Code", slug: "intellectual-property-code", syllabusSection: "R.A. 8293" },
          { name: "Banking Laws & Anti-Money Laundering (AMLA)", slug: "banking-laws-amla", syllabusSection: "Special Commercial Laws" },
          { name: "Insurance Code", slug: "insurance-code", syllabusSection: "R.A. 10607" },
          { name: "Negotiable Instruments Law", slug: "negotiable-instruments-law", syllabusSection: "Act No. 2031" },
        ],
      },
    },
    include: { topics: true },
  });

  // 6. Remedial Law
  const remLaw = await prisma.subject.create({
    data: {
      name: "Remedial Law",
      slug: "remedial-law",
      description: "Civil Procedure, Provisional Remedies, Special Civil Actions, Criminal Procedure, and Evidence.",
      sortOrder: 6,
      topics: {
        create: [
          { name: "General Principles & Civil Procedure (Rules 1-71)", slug: "civil-procedure", syllabusSection: "1997 Rules as amended" },
          { name: "Provisional Remedies & Special Civil Actions (Rule 65)", slug: "provisional-remedies-special-civil-actions", syllabusSection: "Rules 57-71" },
          { name: "Criminal Procedure (Rules 110-127)", slug: "criminal-procedure", syllabusSection: "Revised Rules of Criminal Procedure" },
          { name: "Evidence (Rules 128-133)", slug: "evidence", syllabusSection: "2019 Revised Rules on Evidence" },
          { name: "Special Proceedings (Rules 72-109)", slug: "special-proceedings", syllabusSection: "Special Proceedings" },
        ],
      },
    },
    include: { topics: true },
  });

  // 7. Legal Ethics
  const legalEthics = await prisma.subject.create({
    data: {
      name: "Legal Ethics",
      slug: "legal-ethics",
      description: "Admission to the practice of law, classic canons, attorney-client relationship, and disciplinary proceedings under Rule 138/139.",
      sortOrder: 7,
      topics: {
        create: [
          { name: "Admission to the Practice of Law (Rule 138)", slug: "admission-to-the-bar", syllabusSection: "Rules of Court, Rule 138" },
          { name: "Nature of Attorney-Client Relationship & Fiduciary Duty", slug: "nature-of-attorney-client-relationship", syllabusSection: "General Legal Ethics" },
          { name: "Privileges, Rights, and General Responsibilities of Lawyers", slug: "privileges-and-responsibilities", syllabusSection: "Rule 138, Sec. 20" },
          { name: "Classic Code of Professional Responsibility (Historical Principles)", slug: "classic-cpr-principles", syllabusSection: "Historical Canons" },
          { name: "Disbarment, Suspension & Reinstatement Proceedings", slug: "disbarment-and-discipline", syllabusSection: "Rule 139-B" },
        ],
      },
    },
    include: { topics: true },
  });

  // 8. Statutory Construction (Full Topic Architecture)
  const statCon = await prisma.subject.create({
    data: {
      name: "Statutory Construction",
      slug: "statutory-construction",
      description: "Principles, maxims, and judicial rules governing the interpretation and construction of Philippine statutes and constitutional provisions.",
      sortOrder: 8,
      topics: {
        create: [
          { name: "Legislative intent & legislative history", slug: "legislative-intent", syllabusSection: "I. Fundamental Principles" },
          { name: "Plain meaning rule (Verba legis)", slug: "plain-meaning-rule-verba-legis", syllabusSection: "I. Fundamental Principles" },
          { name: "Literal vs. liberal construction", slug: "literal-vs-liberal-construction", syllabusSection: "I. Fundamental Principles" },
          { name: "Ejusdem generis", slug: "ejusdem-generis", syllabusSection: "II. Maxims of Interpretation" },
          { name: "Expressio unius est exclusio alterius", slug: "expressio-unius", syllabusSection: "II. Maxims of Interpretation" },
          { name: "Noscitur a sociis", slug: "noscitur-a-sociis", syllabusSection: "II. Maxims of Interpretation" },
          { name: "General vs. special laws (Generalia specialibus non derogant)", slug: "general-vs-special-laws", syllabusSection: "III. Conflicting Statutes" },
          { name: "Mandatory vs. directory provisions", slug: "mandatory-vs-directory", syllabusSection: "IV. Nature of Provisions" },
          { name: "Prospective vs. retroactive application", slug: "prospective-vs-retroactive", syllabusSection: "V. Temporal Application" },
          { name: "Construction of constitutional provisions", slug: "construction-of-constitution", syllabusSection: "VI. Constitutional Interpretation" },
          { name: "Construction of statutes (penal, tax, labor, remedial)", slug: "construction-of-statutes", syllabusSection: "VII. Subject-Specific Statutes" },
          { name: "Administrative construction & contemporaneous construction", slug: "administrative-construction", syllabusSection: "VIII. Administrative Interpretation" },
          { name: "Judicial construction & stare decisis", slug: "judicial-construction", syllabusSection: "IX. Judicial Precedent" },
          { name: "Constitutional avoidance", slug: "constitutional-avoidance", syllabusSection: "X. Judicial Restraint" },
          { name: "Separation of powers as it relates to statutory construction", slug: "separation-of-powers-statcon", syllabusSection: "XI. Constitutional Framework" },
          { name: "Other major Philippine StatCon doctrines and jurisprudence", slug: "philippine-statcon-jurisprudence", syllabusSection: "XII. Landmark Doctrines" },
        ],
      },
    },
    include: { topics: true },
  });

  // 9. Basic Legal and Judicial Ethics (Full Topic Architecture with CPRA)
  const basicEthics = await prisma.subject.create({
    data: {
      name: "Basic Legal and Judicial Ethics",
      slug: "basic-legal-and-judicial-ethics",
      description: "The Code of Professional Responsibility and Accountability (CPRA, A.M. No. 22-09-01-SC), judicial ethics, and ethical standards of bench and bar.",
      sortOrder: 9,
      topics: {
        create: [
          { name: "Duties and responsibilities of lawyers", slug: "duties-responsibilities-lawyers", syllabusSection: "CPRA General Provisions" },
          { name: "Professional independence", slug: "professional-independence", syllabusSection: "CPRA Canon I" },
          { name: "Integrity", slug: "integrity", syllabusSection: "CPRA Canon II (Propriety)" },
          { name: "Competence and diligence", slug: "competence-and-diligence", syllabusSection: "CPRA Canon IV" },
          { name: "Confidentiality & Privileged Communications", slug: "confidentiality", syllabusSection: "CPRA Canon III, Sec. 28-34" },
          { name: "Conflict of interest (Concurrent and Successive)", slug: "conflict-of-interest", syllabusSection: "CPRA Canon III, Sec. 13-22" },
          { name: "Candor toward the courts", slug: "candor-toward-courts", syllabusSection: "CPRA Canon II, Sec. 1-5" },
          { name: "Respect for courts and judicial officers", slug: "respect-for-courts", syllabusSection: "CPRA Canon II" },
          { name: "Proper conduct in legal proceedings", slug: "proper-conduct-legal-proceedings", syllabusSection: "CPRA Canon II" },
          { name: "Lawyer-client relationship & Legal Fees", slug: "lawyer-client-relationship", syllabusSection: "CPRA Canon III" },
          { name: "Duties to the administration of justice", slug: "duties-administration-of-justice", syllabusSection: "CPRA Canon II" },
          { name: "Judicial ethics & standards applicable to judges", slug: "judicial-ethics-standards", syllabusSection: "New Code of Judicial Conduct" },
          { name: "Code of Professional Responsibility and Accountability (CPRA)", slug: "cpra-overview", syllabusSection: "A.M. No. 22-09-01-SC" },
          { name: "Relevant Philippine Supreme Court jurisprudence", slug: "supreme-court-ethics-jurisprudence", syllabusSection: "Disciplinary Decisions" },
        ],
      },
    },
    include: { topics: true },
  });

  // Small, High-Quality Demonstration Dataset (Strictly Verified Philippine Authorities)
  console.log("Seeding small demonstration questions with verified legal authorities...");

  // Demonstration Question 1: Statutory Construction (Verba Legis)
  const statConTopic = statCon.topics.find((t) => t.slug === "plain-meaning-rule-verba-legis")!;
  const qStatCon = await prisma.question.create({
    data: {
      subjectId: statCon.id,
      topicId: statConTopic.id,
      title: "Application of the Plain Meaning Rule (Verba Legis)",
      difficulty: "MEDIUM",
      questionSource: "INSTRUCTOR_CREATED",
      barYearReference: "Illustrative Statutory Construction Problem",
      verificationStatus: "VERIFIED",
      verifiedBy: "Philippine Legal Editorial Staff",
      dateVerified: new Date("2026-01-15T00:00:00Z"),
      factsIssue:
        "A newly enacted municipal tax ordinance imposes a business tax on 'all operators of physical retail stores selling consumer electronic devices within the municipality.'\n\n" +
        "Company X operates an online e-commerce platform registered in the municipality that delivers electronics exclusively through courier services and has no walk-in retail store. The Municipal Treasurer assessed Company X for the business tax, arguing that the legislative intent was to tax all retail sales of electronics originating in the municipality, regardless of format.\n\n" +
        "Company X protested the assessment, arguing that under the plain meaning of the ordinance, it cannot be classified as an operator of a 'physical retail store.'\n\n" +
        "May the Municipal Treasurer validly assess Company X for the business tax? Answer using the ALAC method.",
      bestAnswerA:
        "No, the Municipal Treasurer may not validly assess Company X for the business tax.",
      bestAnswerL:
        "Under the basic statutory construction maxim of verba legis (plain meaning rule), when the language of the law is clear, plain, and free from ambiguity, it must be given its literal and ordinary meaning without resort to judicial or administrative construction (Globe-Mackay Cable and Radio Corp. v. NLRC, G.R. No. 82511, March 3, 1992). Furthermore, tax statutes are construed strictly against the taxing authority and liberally in favor of the taxpayer.",
      bestAnswerA2:
        "In this case, the ordinance clearly and explicitly limits the tax to operators of 'physical retail stores.' Company X operates exclusively through an online e-commerce platform and delivers goods via couriers, possessing no walk-in or physical retail storefront. Because the language of the ordinance is clear and unambiguous, the Municipal Treasurer cannot expand the scope of the phrase 'physical retail store' to include purely virtual or online businesses under the guise of discerning legislative intent.",
      bestAnswerC:
        "Therefore, the tax assessment against Company X is invalid because the ordinance does not apply to non-physical online retail operations.",
      howToAnswer:
        "1. Open with a categorical 'No.'\n2. Cite the verba legis rule and strict construction of tax statutes.\n3. Apply the specific wording 'physical retail stores' to the factual circumstance of Company X operating purely online.\n4. Conclude that ambiguity is required before legislative intent can override clear text.",
      legalReferences: {
        create: [
          {
            authorityType: "SUPREME_COURT_CASE",
            citation: "Globe-Mackay Cable and Radio Corp. v. NLRC, G.R. No. 82511, March 3, 1992, 206 SCRA 701",
            officialTitle: "Globe-Mackay Cable and Radio Corporation vs. NLRC",
            keyProvisionsText:
              "Under the rule of statutory construction of verba legis, if the statute is clear, plain and free from ambiguity, it must be given its literal meaning and applied without attempted interpretation.",
            doctrineSummary: "When the law is clear, there is no room for interpretation; only application.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
          {
            authorityType: "STATUTE",
            citation: "Civil Code of the Philippines (R.A. 386), Article 10",
            officialTitle: "Interpretation of Laws",
            keyProvisionsText:
              "In case of doubt in the interpretation or application of laws, it is presumed that the lawmaking body intended right and justice to prevail.",
            doctrineSummary: "Presumption of legislative intent applies when there is doubt or ambiguity.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
        ],
      },
    },
  });

  // Demonstration Question 2: Basic Legal and Judicial Ethics (CPRA Conflict of Interest)
  const ethicsTopic = basicEthics.topics.find((t) => t.slug === "conflict-of-interest")!;
  const qEthics = await prisma.question.create({
    data: {
      subjectId: basicEthics.id,
      topicId: ethicsTopic.id,
      title: "Concurrent Conflict of Interest under the CPRA",
      difficulty: "MEDIUM",
      questionSource: "INSTRUCTOR_CREATED",
      barYearReference: "Illustrative CPRA Ethics Problem",
      verificationStatus: "VERIFIED",
      verifiedBy: "Philippine Legal Editorial Staff",
      dateVerified: new Date("2026-01-15T00:00:00Z"),
      factsIssue:
        "Atty. Bernardo is the retained legal counsel of Alpha Corporation in an ongoing contractual dispute against Beta Corporation before the Regional Trial Court.\n\n" +
        "While this litigation is pending, Delta, an individual employee of Beta Corporation, approaches Atty. Bernardo seeking representation in an unrelated labor case against Gamma Corporation. However, Beta Corporation has a direct cross-indemnity interest in Gamma's labor liabilities.\n\n" +
        "Alpha Corporation objects to Atty. Bernardo taking on Delta's case, stating that representing Delta undermines the firm's loyalty. Atty. Bernardo insists that because the labor case is against Gamma and not Alpha, no conflict of interest exists.\n\n" +
        "Did Atty. Bernardo violate the rule against representation of conflicting interests under the Code of Professional Responsibility and Accountability (CPRA)? Explain using the ALAC method.",
      bestAnswerA:
        "Yes, Atty. Bernardo violated the rule against representing conflicting interests under the Code of Professional Responsibility and Accountability (CPRA).",
      bestAnswerL:
        "Under Canon III (Fidelity), Section 13 of the CPRA (A.M. No. 22-09-01-SC), a lawyer shall not represent conflicting interests except by the written informed consent of all concerned parties given after full disclosure. There is conflict of interest when a lawyer represents inconsistent interests, or when the duty to one client requires contending for that which duty to another client requires opposing, or where the representation of a new client would invite suspicion of unfaithfulness or double-dealing (Quiambao v. Bamba, A.C. No. 6708, August 25, 2005).",
      bestAnswerA2:
        "In this case, Atty. Bernardo is actively representing Alpha Corporation against Beta Corporation. Accepting the representation of Delta, an employee of Beta whose claim affects cross-indemnity interests, creates an impermissible tension between his ongoing duty of undivided fidelity to Alpha and his proposed duty to Delta. Because Alpha Corporation formally objected and did not give written informed consent after full disclosure, Atty. Bernardo's undertaking of the representation constitutes prohibited conflict of interest.",
      bestAnswerC:
        "Therefore, Atty. Bernardo's conduct violates Canon III, Section 13 of the CPRA for representing conflicting interests without written informed consent.",
      howToAnswer:
        "1. Begin with an affirmative 'Yes.'\n2. Cite Canon III, Section 13 of the CPRA (A.M. No. 22-09-01-SC) and the classic test in Quiambao v. Bamba.\n3. Apply the requirement of written informed consent and highlight Alpha's objection.\n4. Conclude with ethical liability under the CPRA.",
      legalReferences: {
        create: [
          {
            authorityType: "CANON_CPRA",
            citation: "Code of Professional Responsibility and Accountability (CPRA), A.M. No. 22-09-01-SC, Canon III, Section 13",
            officialTitle: "Conflict of Interest",
            keyProvisionsText:
              "A lawyer shall not represent conflicting interests except by written informed consent of all concerned given after a full disclosure of the facts.",
            doctrineSummary: "Representation of conflicting interests is prohibited without written informed consent of all parties.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
          {
            authorityType: "SUPREME_COURT_CASE",
            citation: "Quiambao v. Bamba, A.C. No. 6708, August 25, 2005, 468 SCRA 1",
            officialTitle: "Quiambao vs. Bamba",
            keyProvisionsText:
              "The rule prohibiting representation of conflicting interests applies even if the cases are totally unrelated and inconsistent with each other, to protect the client's confidence and avoid suspicion of double-dealing.",
            doctrineSummary: "Conflict rule applies even in unrelated actions between existing and prospective clients.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
        ],
      },
    },
  });

  // Demonstration Question 3: Civil Law (Quasi-Delicts / Torts)
  const civilTopic = civLaw.topics.find((t) => t.slug === "torts-and-quasi-delicts")!;
  const qCivil = await prisma.question.create({
    data: {
      subjectId: civLaw.id,
      topicId: civilTopic.id,
      title: "Requisites of Quasi-Delict under Article 2176",
      difficulty: "MEDIUM",
      questionSource: "VERIFIED_BAR_QUESTION",
      barYearReference: "Adapted from Philippine Bar Examinations, Civil Law",
      verificationStatus: "VERIFIED",
      verifiedBy: "Philippine Legal Editorial Staff",
      dateVerified: new Date("2026-01-15T00:00:00Z"),
      factsIssue:
        "While driving his private car at 80 km/h along a residential street with a posted speed limit of 30 km/h, Mario glanced at his mobile phone to read a text message. As a consequence, he failed to notice Teresa, who was crossing the marked pedestrian lane. Mario's vehicle struck Teresa, inflicting severe physical injuries and requiring surgical hospitalization costing ₱300,000.\n\n" +
        "Teresa filed a civil action for damages against Mario based on quasi-delict. Mario argued in defense that he did not intend to hit Teresa and that it was a purely accidental mishap.\n\n" +
        "Is Mario liable to Teresa for damages based on quasi-delict? Answer using the ALAC method.",
      bestAnswerA:
        "Yes, Mario is civilly liable to Teresa for damages based on quasi-delict under Article 2176 of the Civil Code.",
      bestAnswerL:
        "Under Article 2176 of the Civil Code, whoever by act or omission causes damage to another, there being fault or negligence, is obliged to pay for the damage done, provided there is no pre-existing contractual relation between the parties. The elements of a quasi-delict are: (1) an act or omission by the defendant; (2) fault or negligence; (3) damage or injury caused to the plaintiff; (4) a direct relation of cause and effect between the fault or negligence and the damage (proximate cause); and (5) no pre-existing contractual relation (Picart v. Smith, 37 Phil. 809).",
      bestAnswerA2:
        "In this case, all elements are present. Mario operated his vehicle well above the posted speed limit in a residential zone while looking at his mobile phone, establishing patent negligence. His negligent act directly and proximately caused physical injuries and ₱300,000 in hospital expenses to Teresa, who was lawfully crossing on a pedestrian lane. The absence of intent does not absolve him because quasi-delict is founded precisely on fault or negligence, not malice, and there is no contractual relationship between them.",
      bestAnswerC:
        "Therefore, Mario is liable to indemnify Teresa for the damages she sustained as a direct result of his quasi-delict.",
      howToAnswer:
        "1. State a clear, categorical 'Yes.'\n2. Enumerate Article 2176 and the established elements of quasi-delict.\n3. Subsume Mario's conduct (speeding + texting while driving) under the element of negligence, and link it as the proximate cause of Teresa's injuries.\n4. Conclude confirming liability for compensatory damages.",
      legalReferences: {
        create: [
          {
            authorityType: "STATUTE",
            citation: "Civil Code of the Philippines (R.A. 386), Article 2176",
            officialTitle: "Quasi-Delict: Fault or Negligence",
            keyProvisionsText:
              "Whoever by act or omission causes damage to another, there being fault or negligence, is obliged to pay for the damage done. Such fault or negligence, if there is no pre-existing contractual relation between the parties, is called a quasi-delict...",
            doctrineSummary: "Establishes non-contractual civil liability for damage caused through fault or negligence.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
          {
            authorityType: "SUPREME_COURT_CASE",
            citation: "Picart v. Smith, 37 Phil. 809 (1918)",
            officialTitle: "Picart vs. Smith",
            keyProvisionsText:
              "The test for determining whether a person is negligent in doing an act is this: Would a prudent man, in the position of the person to whom negligence is attributed, foresee harm to the person injured as a reasonable consequence of the course about to be pursued?",
            doctrineSummary: "The classic prudent man test for legal negligence in Philippine tort law.",
            verificationStatus: "VERIFIED",
            dateVerified: new Date("2026-01-15T00:00:00Z"),
          },
        ],
      },
    },
  });

  console.log(`Database seeded successfully! Seeded 9 subjects, full topic taxonomies, and 3 verified demonstration questions.`);
}

main()
  .catch((e) => {
    console.error("Error during database seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
