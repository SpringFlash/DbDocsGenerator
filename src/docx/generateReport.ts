import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { ReportData } from "../types";
import { ReportAssets } from "./loadAssets";

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function centeredImage(data: ArrayBuffer, width: number, height: number): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [
      new ImageRun({
        data,
        transformation: { width, height },
        type: "png",
      }),
    ],
  });
}

export async function generateReport(data: ReportData, assets: ReportAssets): Promise<Blob> {
  const {
    reportNumber,
    agentId,
    organizationName,
    items,
    evidenceData,
    date,
  } = data;

  const evidenceLink = (label: string, text: string, url: string): Paragraph =>
    new Paragraph({
      children: [
        new TextRun({ text: `${label} `, bold: true }),
        new ExternalHyperlink({
          link: url,
          children: [
            new TextRun({ text, bold: true, color: "0563C1", style: "Hyperlink" }),
          ],
        }),
      ],
    });

  const interrogationParagraphs = items.flatMap((item, idx) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${idx + 1}.${item.text}`, bold: true }),
        new TextRun({ text: "\n" }),
        new ExternalHyperlink({
          link: item.youtubeLink,
          children: [
            new TextRun({
              text: `[${item.timestampFrom}-${item.timestampTo}]`,
              bold: true,
              color: "0563C1",
              style: "Hyperlink",
            }),
          ],
        }),
      ],
    }),
  ]);

  const doc = new Document({
    sections: [
      {
        children: [
          // 1. LSPD Detective Bureau logo (header)
          centeredImage(assets.lspdLogo, 200, 200),

          // 2. Decorative divider
          centeredImage(assets.divider, 500, 15),

          // 3. Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Interrogation", bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: `Report №${reportNumber}`, bold: true })],
          }),

          // 4. Intro paragraph
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: "Я, агент " }),
              new TextRun({ text: agentId, bold: true }),
              new TextRun({
                text: ", спешу доложить вышестоящим лицам, об успешно проведенной специальной операции, в ходе которой был проведен допрос одного из членов",
              }),
            ],
          }),

          // 5. Org paragraph
          new Paragraph({
            children: [
              new TextRun({
                text: `очень странного цирка "${organizationName}", в процессе которого мне удалось узнать следующую информацию:`,
                bold: true,
              }),
            ],
          }),

          // 6. Interrogation items
          ...interrogationParagraphs,

          // 7. SEALED image
          centeredImage(assets.sealed, 300, 80),

          // 8. Evidence section
          evidenceLink("Evidence:", "[Video]", evidenceData.evidence),
          evidenceLink("Evidence of a violation:", "[video]", evidenceData.evidenceViolation),
          evidenceLink("Evidence Servers:", "[video]", evidenceData.evidenceServers),
          evidenceLink("The identity of the person: ", "[photo]", evidenceData.identityPerson),

          // 9. Footer table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ children: [new TextRun("Date:")] })],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: date, bold: true })] })],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ children: [] })],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ children: [new TextRun({ text: agentId, bold: true })] })],
                  }),
                ],
              }),
            ],
          }),

          // 10. TOP SECRET stamp (footer)
          centeredImage(assets.topSecret, 300, 250),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
