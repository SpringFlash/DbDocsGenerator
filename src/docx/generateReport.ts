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

const FONT = "Courier New";
const FONT_TITLE = "Arial";
const FONT_SIZE = 24; // 12pt in half-points
const TITLE_SIZE = 52; // 26pt in half-points

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const underlinedBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function centeredImage(
  data: ArrayBuffer,
  width: number,
  height: number
): Paragraph {
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

function emptyLine(): Paragraph {
  return new Paragraph({ children: [] });
}

export async function generateReport(
  data: ReportData,
  assets: ReportAssets
): Promise<Blob> {
  const { reportNumber, agentId, organizationName, items, evidenceData, date } =
    data;

  const evidenceLink = (
    label: string,
    text: string,
    url: string
  ): Paragraph =>
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: `${label} `,
          bold: true,
          font: FONT,
          size: FONT_SIZE,
        }),
        new ExternalHyperlink({
          link: url,
          children: [
            new TextRun({
              text,
              bold: true,
              color: "0563C1",
              style: "Hyperlink",
              font: FONT,
              size: FONT_SIZE,
            }),
          ],
        }),
      ],
    });

  const interrogationParagraphs = items.flatMap((item, idx) => [
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 300, after: 60 },
      children: [
        new TextRun({
          text: `${idx + 1}.${item.text}`,
          bold: true,
          font: FONT,
          size: FONT_SIZE,
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 0, after: 120 },
      children: [
        new ExternalHyperlink({
          link: item.youtubeLink,
          children: [
            new TextRun({
              text: `[${item.timestampFrom}-${item.timestampTo}]`,
              bold: true,
              color: "0563C1",
              style: "Hyperlink",
              font: FONT,
              size: FONT_SIZE,
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
          // 1. LSPD Detective Bureau logo (header) — wider
          centeredImage(assets.lspdLogo, 240, 240),

          // 2. Decorative divider
          centeredImage(assets.divider, 500, 15),

          // 3. Title — Arial, big bold centered
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 0 },
            children: [
              new TextRun({
                text: "Interrogation",
                bold: true,
                font: FONT_TITLE,
                size: TITLE_SIZE,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: `Report №${reportNumber}`,
                bold: true,
                font: FONT_TITLE,
                size: TITLE_SIZE,
              }),
            ],
          }),

          // 4. Intro paragraph — justified
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 100, after: 0 },
            indent: { firstLine: 400 },
            children: [
              new TextRun({
                text: "Я, агент ",
                font: FONT,
                size: FONT_SIZE,
              }),
              new TextRun({
                text: agentId,
                bold: true,
                font: FONT,
                size: FONT_SIZE,
              }),
              new TextRun({
                text: ", спешу доложить вышестоящим лицам, об успешно проведенной специальной операции, в ходе которой был проведен допрос одного из членов",
                font: FONT,
                size: FONT_SIZE,
              }),
            ],
          }),

          // 5. Org paragraph — org name bold, rest normal
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 0, after: 200 },
            children: [
              new TextRun({
                text: `очень странного цирка \u201C`,
                bold: true,
                font: FONT,
                size: FONT_SIZE,
              }),
              new TextRun({
                text: organizationName,
                bold: true,
                font: FONT,
                size: FONT_SIZE,
              }),
              new TextRun({
                text: `\u201D`,
                bold: true,
                font: FONT,
                size: FONT_SIZE,
              }),
              new TextRun({
                text: `, в процессе которого мне удалось узнать следующую информацию:`,
                font: FONT,
                size: FONT_SIZE,
              }),
            ],
          }),

          // 6. Interrogation items
          ...interrogationParagraphs,

          // 7. Empty lines before Evidence
          emptyLine(),
          emptyLine(),
          emptyLine(),

          // 8. Evidence section
          evidenceLink("Evidence:", "[Video]", evidenceData.evidence),
          evidenceLink(
            "Evidence of a violation:",
            "[video]",
            evidenceData.evidenceViolation
          ),
          evidenceLink(
            "Evidence Servers:",
            "[video]",
            evidenceData.evidenceServers
          ),
          evidenceLink(
            "The identity of the person: ",
            "[photo]",
            evidenceData.identityPerson
          ),

          // 9. SEALED image (right-aligned)
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400, after: 200 },
            children: [
              new ImageRun({
                data: assets.sealed,
                transformation: { width: 300, height: 80 },
                type: "png",
              }),
            ],
          }),

          // 10. Footer table — date and agent underlined
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: noBorder,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "Date:",
                            font: FONT,
                            size: FONT_SIZE,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: underlinedBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: date,
                            bold: true,
                            font: FONT,
                            size: FONT_SIZE,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: noBorder,
                    children: [new Paragraph({ children: [] })],
                  }),
                  new TableCell({
                    borders: underlinedBorder,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: agentId,
                            bold: true,
                            font: FONT,
                            size: FONT_SIZE,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // 11. TOP SECRET stamp (left-aligned footer)
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { before: 200 },
            children: [
              new ImageRun({
                data: assets.topSecret,
                transformation: { width: 150, height: 125 },
                type: "png",
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}
