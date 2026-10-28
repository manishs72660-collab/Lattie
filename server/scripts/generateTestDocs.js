// scripts/generateTestDocs.js
// Usage: npm run gen:testdocs
// Creates 3 synthetic PDFs in ./test-docs/ with overlapping entities
// so factual + multi-hop eval questions are possible.
import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const OUT = "test-docs";
fs.mkdirSync(OUT, { recursive: true });

function buildPdf(filename, title, subtitle, sections) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(OUT, filename);
    const stream = fs.createWriteStream(filepath);
    const doc = new PDFDocument({ size: "A4", margin: 54 });
    doc.pipe(stream);

    // Header
    doc.fontSize(20).fillColor("#1a1a1a").text(title);
    doc.moveDown(0.2);
    doc.fontSize(9).fillColor("#777").text(subtitle);
    doc.moveDown(1.2);

    for (const s of sections) {
      if (s.h2) {
        doc.fontSize(14).fillColor("#222").text(s.h2);
        doc.moveDown(0.3);
      }
      if (s.body) {
        doc.fontSize(11).fillColor("#333").text(s.body, { lineGap: 3 });
        doc.moveDown(0.5);
      }
      if (s.bullets) {
        for (const b of s.bullets) {
          doc.fontSize(11).fillColor("#333").text(`• ${b}`, { indent: 14, lineGap: 2 });
        }
        doc.moveDown(0.5);
      }
    }
    doc.end();
    stream.on("finish", () => resolve(filepath));
    stream.on("error", reject);
  });
}

/* ---------------------------------------------------------------- */
/*  DOC 1 — Company Overview                                        */
/* ---------------------------------------------------------------- */
const doc1 = {
  file: "Nimbus_Systems_Company_Overview.pdf",
  title: "Nimbus Systems — Company Overview (2024)",
  subtitle: "Internal fact sheet · Synthetic test data",
  sections: [
    { h2: "1. About Nimbus Systems", body:
      "Nimbus Systems is a workflow automation company that provides cloud-based software to enterprise teams. Nimbus Systems was founded in 2018 by Dr. Maya Chen, a researcher who previously worked at the MIT Media Lab. The company is currently headquartered in Singapore, having relocated from Bengaluru in early 2023." },
    { h2: "2. Flagship Product", body:
      "The company's flagship product is NimbusFlow, a workflow automation platform used by more than 1,200 enterprise customers. NimbusFlow is hosted on Snowpeak Cloud, a major cloud infrastructure provider that Nimbus Systems has partnered with since 2021." },
    { h2: "3. Funding", body:
      "Nimbus Systems raised a Series C round of $120 million in November 2023, led by Meridian Ventures with participation from existing investors. At the time of the round, the company reported annual recurring revenue of $85 million." },
    { h2: "4. Team and Leadership", body:
      "Nimbus Systems employs approximately 340 people across its Singapore headquarters and regional offices. Raj Patel serves as the Chief Technology Officer and previously spent six years at Google as an engineering director." },
    { h2: "5. Key Facts", bullets: [
      "Founded: 2018",
      "Founder and CEO: Dr. Maya Chen",
      "Headquarters: Singapore (relocated from Bengaluru in 2023)",
      "Flagship product: NimbusFlow",
      "Cloud partner: Snowpeak Cloud",
      "Series C: $120 million (November 2023), led by Meridian Ventures",
      "Annual recurring revenue: $85 million",
      "Employees: approximately 340",
      "CTO: Raj Patel (former Google engineering director)",
    ]},
  ],
};

/* ---------------------------------------------------------------- */
/*  DOC 2 — Acquisitions & Expansion                                */
/* ---------------------------------------------------------------- */
const doc2 = {
  file: "Nimbus_Systems_Acquisitions.pdf",
  title: "Nimbus Systems — Acquisitions and Expansion Strategy",
  subtitle: "Internal strategy memo · Synthetic test data",
  sections: [
    { h2: "1. Overview", body:
      "Nimbus Systems has grown partly through acquisitions. Since 2022, the company has acquired two smaller analytics and engineering firms to expand its product portfolio and geographic reach." },
    { h2: "2. Acquisition of Polaris Analytics (September 2022)", body:
      "In September 2022, Nimbus Systems acquired Polaris Analytics, a Berlin-based business intelligence startup. Polaris Analytics was founded in 2019 by Elena Volkov, who was serving as its CEO at the time of acquisition. Following the acquisition, Elena Volkov joined Nimbus Systems as Chief Data Officer, and the Polaris Analytics technology was integrated into the NimbusFlow platform to provide embedded analytics features." },
    { h2: "3. Acquisition of Kite Labs (March 2024)", body:
      "In March 2024, Nimbus Systems acquired Kite Labs, a Tokyo-based engineering firm focused on developer tooling. Kite Labs was founded in 2020 by Hiroshi Tanaka. After the acquisition, Hiroshi Tanaka was named Vice President of Engineering at Nimbus Systems. The Tokyo office became Nimbus Systems' Asia-Pacific engineering hub." },
    { h2: "4. Strategic Rationale", body:
      "The Polaris Analytics acquisition gave Nimbus Systems its first presence in Europe, while the Kite Labs acquisition strengthened its Asia-Pacific engineering capabilities and accelerated the developer tooling roadmap." },
    { h2: "5. Key Facts", bullets: [
      "September 2022: Acquired Polaris Analytics (Berlin, founded 2019 by Elena Volkov)",
      "March 2024: Acquired Kite Labs (Tokyo, founded 2020 by Hiroshi Tanaka)",
      "Elena Volkov became Chief Data Officer after Polaris acquisition",
      "Hiroshi Tanaka became VP of Engineering after Kite Labs acquisition",
      "Tokyo office is now the Asia-Pacific engineering hub",
      "Polaris acquisition gave Nimbus its first European presence",
    ]},
  ],
};

/* ---------------------------------------------------------------- */
/*  DOC 3 — Leadership Biographies                                  */
/* ---------------------------------------------------------------- */
const doc3 = {
  file: "Nimbus_Systems_Leadership_Bios.pdf",
  title: "Nimbus Systems — Leadership Biographies",
  subtitle: "For press and recruiting use · Synthetic test data",
  sections: [
    { h2: "Dr. Maya Chen — Founder and Chief Executive Officer", body:
      "Dr. Maya Chen is the founder and CEO of Nimbus Systems. Before founding Nimbus Systems in 2018, she worked as a research scientist at the MIT Media Lab, and prior to that she completed her PhD at Stanford University. Her research focused on human-computer interaction and workflow automation." },
    { h2: "Raj Patel — Chief Technology Officer", body:
      "Raj Patel is the Chief Technology Officer of Nimbus Systems. Before joining Nimbus Systems, he spent six years at Google as an engineering director, where he led teams building developer platform infrastructure." },
    { h2: "Elena Volkov — Chief Data Officer", body:
      "Elena Volkov is the Chief Data Officer at Nimbus Systems. She was previously the CEO and founder of Polaris Analytics, a Berlin-based business intelligence startup that Nimbus Systems acquired in September 2022." },
    { h2: "Hiroshi Tanaka — Vice President of Engineering", body:
      "Hiroshi Tanaka is the Vice President of Engineering at Nimbus Systems. He founded Kite Labs in Tokyo in 2020, which Nimbus Systems acquired in 2024. Prior to founding Kite Labs, he worked as a senior engineer at several Japanese software companies." },
    { h2: "Board and Advisors", body:
      "The Nimbus Systems board includes representatives from Meridian Ventures, the lead investor in the company's Series C round. Additional independent directors bring experience in enterprise software and global operations." },
    { h2: "Leadership Summary", bullets: [
      "Maya Chen: founder & CEO, ex-MIT Media Lab, PhD from Stanford",
      "Raj Patel: CTO, ex-Google engineering director",
      "Elena Volkov: CDO, founder of Polaris Analytics (Berlin, acquired 2022)",
      "Hiroshi Tanaka: VP Engineering, founder of Kite Labs (Tokyo, acquired 2024)",
      "Board includes Meridian Ventures representatives",
    ]},
  ],
};

/* ---------------------------------------------------------------- */
const files = await Promise.all([
  buildPdf(doc1.file, doc1.title, doc1.subtitle, doc1.sections),
  buildPdf(doc2.file, doc2.title, doc2.subtitle, doc2.sections),
  buildPdf(doc3.file, doc3.title, doc3.subtitle, doc3.sections),
]);
console.log("✅ Created test PDFs:");
for (const f of files) console.log("  -", f);
console.log("\nNext: upload these 3 PDFs from the app's Documents page.");