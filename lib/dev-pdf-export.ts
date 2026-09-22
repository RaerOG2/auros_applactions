import jsPDF from "jspdf";


export type DevPdfStatusGroup = {
  title: string;

  items: {
    title: string;
    description?: string | null;
    priority?: string | null;
    progress?: number | null;
    target?: string | null;
    status?: string | null;
  }[];
};


export type DevRoadmapPdfInput = {
  projectName: string;
  projectShortName?: string | null;

  roadmapTitle: string;
  roadmapCode?: string | null;
  roadmapType?: string | null;
  roadmapStatus?: string | null;

  description?: string | null;

  targetDate?: string | null;
  releaseDate?: string | null;

  overallProgress: number;

  itemCount: number;
  activeCount: number;
  completedCount: number;

  groups: DevPdfStatusGroup[];
};


export type DevUpdatesPdfRoadmapItem = {
  title: string;
  status: string;
  progress: number;
};


export type DevUpdatesPdfItem = {
  title: string;
  code?: string | null;
  description?: string | null;

  type: string;
  status: string;

  progress: number;
  progressMode: string;

  targetDate?: string | null;
  releaseDate?: string | null;

  roadmapItems: DevUpdatesPdfRoadmapItem[];
};


export type DevUpdatesPdfInput = {
  projectName: string;
  projectShortName?: string | null;

  overallProgress: number;

  roadmapItemCount: number;
  autoProgressCount: number;

  updates: DevUpdatesPdfItem[];
};


function safeFileName(
  value: string
) {
  return value
    .trim()
    .replace(
      /[<>:"/\\|?*\u0000-\u001F]/g,
      "-"
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}


function formatPdfDate(
  value?: string | null
) {
  if (!value) {
    return null;
  }


  const date =
    new Date(
      value.length === 10
        ? `${value}T12:00:00`
        : value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }


  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function priorityLabel(
  value?: string | null
) {
  if (!value) {
    return null;
  }


  return value
    .replaceAll(
      "_",
      " "
    )
    .toUpperCase();
}


function statusText(
  value: string
) {
  return value
    .replaceAll(
      "_",
      " "
    )
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character.toUpperCase()
    );
}


function createPdf() {
  return new jsPDF({
    orientation:
      "portrait",

    unit:
      "mm",

    format:
      "a4",
  });
}


function drawDocumentFooter(
  pdf: jsPDF,
  generatedAt: Date
) {
  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();

  const marginX =
    18;

  const pages =
    pdf.getNumberOfPages();


  for (
    let page =
      1;
    page <= pages;
    page += 1
  ) {
    pdf.setPage(
      page
    );


    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7
    );

    pdf.setTextColor(
      140,
      148,
      160
    );


    pdf.text(
      `Generated ${generatedAt.toLocaleString(
        "en-GB"
      )}`,
      marginX,
      pageHeight - 9
    );


    pdf.text(
      `Page ${page} / ${pages}`,
      pageWidth - marginX,
      pageHeight - 9,
      {
        align:
          "right",
      }
    );
  }
}


export function exportDevRoadmapPdf(
  input: DevRoadmapPdfInput
) {
  const pdf =
    createPdf();


  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();


  const marginX =
    18;

  const contentWidth =
    pageWidth -
    marginX * 2;


  let y =
    20;


  const generatedAt =
    new Date();


  function drawPageHeader() {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7
    );

    pdf.setTextColor(
      125,
      137,
      160
    );

    pdf.text(
      "AUROS DEVELOPMENT",
      marginX,
      10
    );


    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.text(
      input.projectName,
      pageWidth - marginX,
      10,
      {
        align:
          "right",
      }
    );


    pdf.setDrawColor(
      220,
      225,
      232
    );

    pdf.line(
      marginX,
      13,
      pageWidth - marginX,
      13
    );
  }


  function addPage() {
    pdf.addPage();

    y =
      20;

    drawPageHeader();
  }


  function ensureSpace(
    height: number
  ) {
    if (
      y + height >
      pageHeight - 18
    ) {
      addPage();
    }
  }


  function drawStat(
    x: number,
    width: number,
    label: string,
    value: string
  ) {
    pdf.setFillColor(
      246,
      248,
      251
    );

    pdf.setDrawColor(
      225,
      230,
      237
    );

    pdf.roundedRect(
      x,
      y,
      width,
      18,
      2.5,
      2.5,
      "FD"
    );


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      6.5
    );

    pdf.setTextColor(
      120,
      130,
      146
    );

    pdf.text(
      label,
      x + 4,
      y + 6
    );


    pdf.setFontSize(
      13
    );

    pdf.setTextColor(
      22,
      28,
      38
    );

    pdf.text(
      value,
      x + 4,
      y + 14
    );
  }


  drawPageHeader();


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    8
  );

  pdf.setTextColor(
    126,
    71,
    214
  );

  pdf.text(
    input.roadmapType
      ? `${input.roadmapType.toUpperCase()} ROADMAP`
      : "ROADMAP",
    marginX,
    y
  );


  y +=
    9;


  if (
    input.roadmapCode
  ) {
    pdf.setFontSize(
      10
    );

    pdf.text(
      input.roadmapCode,
      marginX,
      y
    );

    y +=
      7;
  }


  pdf.setFontSize(
    25
  );

  pdf.setTextColor(
    18,
    23,
    32
  );


  const titleLines =
    pdf.splitTextToSize(
      input.roadmapTitle,
      contentWidth
    );


  pdf.text(
    titleLines,
    marginX,
    y
  );


  y +=
    titleLines.length *
      9 +
    3;


  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    9
  );

  pdf.setTextColor(
    100,
    110,
    125
  );


  pdf.text(
    input.projectShortName
      ? `${input.projectName} - ${input.projectShortName}`
      : input.projectName,
    marginX,
    y
  );


  y +=
    7;


  if (
    input.description
  ) {
    pdf.setFontSize(
      8.5
    );

    pdf.setTextColor(
      94,
      105,
      120
    );


    const descriptionLines =
      pdf.splitTextToSize(
        input.description,
        contentWidth
      );


    pdf.text(
      descriptionLines,
      marginX,
      y
    );


    y +=
      descriptionLines.length *
        4.6 +
      4;
  }


  const metadata: string[] =
    [];


  if (
    input.roadmapStatus
  ) {
    metadata.push(
      `Status: ${input.roadmapStatus}`
    );
  }


  const targetDate =
    formatPdfDate(
      input.targetDate
    );


  if (
    targetDate
  ) {
    metadata.push(
      `Target: ${targetDate}`
    );
  }


  const releaseDate =
    formatPdfDate(
      input.releaseDate
    );


  if (
    releaseDate
  ) {
    metadata.push(
      `Release: ${releaseDate}`
    );
  }


  if (
    metadata.length
  ) {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.setTextColor(
      91,
      102,
      118
    );


    pdf.text(
      metadata.join(
        "    -    "
      ),
      marginX,
      y
    );


    y +=
      9;
  }


  ensureSpace(
    25
  );


  const statGap =
    3;

  const statWidth =
    (contentWidth -
      statGap * 3) /
    4;


  drawStat(
    marginX,
    statWidth,
    "ITEMS",
    String(
      input.itemCount
    )
  );


  drawStat(
    marginX +
      statWidth +
      statGap,
    statWidth,
    "ACTIVE",
    String(
      input.activeCount
    )
  );


  drawStat(
    marginX +
      (statWidth +
        statGap) *
        2,
    statWidth,
    "DONE",
    String(
      input.completedCount
    )
  );


  drawStat(
    marginX +
      (statWidth +
        statGap) *
        3,
    statWidth,
    "PROGRESS",
    `${input.overallProgress}%`
  );


  y +=
    25;


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    7
  );

  pdf.setTextColor(
    102,
    113,
    128
  );

  pdf.text(
    "OVERALL ROADMAP PROGRESS",
    marginX,
    y
  );


  pdf.text(
    `${input.overallProgress}%`,
    pageWidth - marginX,
    y,
    {
      align:
        "right",
    }
  );


  y +=
    4;


  pdf.setFillColor(
    230,
    234,
    240
  );

  pdf.roundedRect(
    marginX,
    y,
    contentWidth,
    4,
    2,
    2,
    "F"
  );


  const progressWidth =
    Math.max(
      0,
      Math.min(
        contentWidth,
        contentWidth *
          (input.overallProgress /
            100)
      )
    );


  if (
    progressWidth >
    0
  ) {
    pdf.setFillColor(
      126,
      71,
      214
    );

    pdf.roundedRect(
      marginX,
      y,
      progressWidth,
      4,
      2,
      2,
      "F"
    );
  }


  y +=
    14;


  for (
    const group of input.groups
  ) {
    if (
      group.items.length ===
      0
    ) {
      continue;
    }


    ensureSpace(
      18
    );


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      11
    );

    pdf.setTextColor(
      26,
      33,
      44
    );


    pdf.text(
      group.title,
      marginX,
      y
    );


    pdf.setFontSize(
      7
    );

    pdf.setTextColor(
      121,
      131,
      145
    );


    pdf.text(
      String(
        group.items.length
      ),
      pageWidth - marginX,
      y,
      {
        align:
          "right",
      }
    );


    y +=
      5;


    pdf.setDrawColor(
      224,
      229,
      236
    );

    pdf.line(
      marginX,
      y,
      pageWidth - marginX,
      y
    );


    y +=
      7;


    for (
      const item of group.items
    ) {
      const descriptionLines =
        item.description
          ? pdf.splitTextToSize(
              item.description,
              contentWidth -
                10
            )
          : [];


      const estimatedHeight =
        24 +
        descriptionLines.length *
          4.2 +
        (item.target
          ? 5
          : 0);


      ensureSpace(
        estimatedHeight
      );


      pdf.setFillColor(
        248,
        249,
        251
      );

      pdf.setDrawColor(
        228,
        232,
        238
      );


      pdf.roundedRect(
        marginX,
        y,
        contentWidth,
        estimatedHeight -
          3,
        2.5,
        2.5,
        "FD"
      );


      const cardTop =
        y;


      y +=
        7;


      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(
        10
      );

      pdf.setTextColor(
        25,
        31,
        41
      );


      const itemTitleLines =
        pdf.splitTextToSize(
          item.title,
          contentWidth -
            34
        );


      pdf.text(
        itemTitleLines,
        marginX + 5,
        y
      );


      const itemProgress =
        item.progress ??
        0;


      pdf.setFontSize(
        8
      );

      pdf.setTextColor(
        126,
        71,
        214
      );


      pdf.text(
        `${itemProgress}%`,
        pageWidth -
          marginX -
          5,
        y,
        {
          align:
            "right",
        }
      );


      y +=
        Math.max(
          5,
          itemTitleLines.length *
            4.5
        );


      const priority =
        priorityLabel(
          item.priority
        );


      if (
        priority
      ) {
        pdf.setFontSize(
          6.5
        );

        pdf.setTextColor(
          115,
          126,
          141
        );


        pdf.text(
          priority,
          marginX + 5,
          y
        );


        y +=
          5;
      }


      if (
        descriptionLines.length
      ) {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          8
        );

        pdf.setTextColor(
          91,
          103,
          119
        );


        pdf.text(
          descriptionLines,
          marginX + 5,
          y
        );


        y +=
          descriptionLines.length *
            4.2 +
          2;
      }


      if (
        item.target
      ) {
        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          6.8
        );

        pdf.setTextColor(
          103,
          114,
          129
        );


        pdf.text(
          `TARGET: ${item.target}`,
          marginX + 5,
          y
        );


        y +=
          5;
      }


      const barY =
        cardTop +
        estimatedHeight -
        8;


      pdf.setFillColor(
        226,
        231,
        237
      );

      pdf.roundedRect(
        marginX + 5,
        barY,
        contentWidth - 10,
        2.5,
        1.25,
        1.25,
        "F"
      );


      const itemBarWidth =
        (contentWidth -
          10) *
        (Math.max(
          0,
          Math.min(
            100,
            itemProgress
          )
        ) /
          100);


      if (
        itemBarWidth >
        0
      ) {
        pdf.setFillColor(
          126,
          71,
          214
        );

        pdf.roundedRect(
          marginX + 5,
          barY,
          itemBarWidth,
          2.5,
          1.25,
          1.25,
          "F"
        );
      }


      y =
        cardTop +
        estimatedHeight +
        3;
    }


    y +=
      4;
  }


  if (
    input.groups.every(
      (
        group
      ) =>
        group.items.length ===
        0
    )
  ) {
    ensureSpace(
      25
    );


    pdf.setFillColor(
      248,
      249,
      251
    );

    pdf.setDrawColor(
      228,
      232,
      238
    );


    pdf.roundedRect(
      marginX,
      y,
      contentWidth,
      22,
      3,
      3,
      "FD"
    );


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      100,
      110,
      124
    );


    pdf.text(
      "No roadmap items",
      pageWidth / 2,
      y + 9,
      {
        align:
          "center",
      }
    );


    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.5
    );


    pdf.text(
      "There are currently no items in this roadmap.",
      pageWidth / 2,
      y + 15,
      {
        align:
          "center",
      }
    );
  }


  drawDocumentFooter(
    pdf,
    generatedAt
  );


  const fileNameParts = [
    "Auros",
    input.projectShortName ||
      input.projectName,
    "Roadmap",
    input.roadmapCode ||
      input.roadmapTitle,
  ];


  pdf.save(
    `${safeFileName(
      fileNameParts.join(
        "-"
      )
    )}.pdf`
  );
}


export function exportDevUpdatesPdf(
  input: DevUpdatesPdfInput
) {
  const pdf =
    createPdf();


  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const pageHeight =
    pdf.internal.pageSize.getHeight();


  const marginX =
    18;

  const contentWidth =
    pageWidth -
    marginX * 2;


  const generatedAt =
    new Date();


  let y =
    20;


  function drawPageHeader() {
    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      7
    );

    pdf.setTextColor(
      125,
      137,
      160
    );

    pdf.text(
      "AUROS DEVELOPMENT",
      marginX,
      10
    );


    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.text(
      input.projectName,
      pageWidth - marginX,
      10,
      {
        align:
          "right",
      }
    );


    pdf.setDrawColor(
      220,
      225,
      232
    );

    pdf.line(
      marginX,
      13,
      pageWidth - marginX,
      13
    );
  }


  function addPage() {
    pdf.addPage();

    y =
      20;

    drawPageHeader();
  }


  function ensureSpace(
    height: number
  ) {
    if (
      y + height >
      pageHeight - 18
    ) {
      addPage();
    }
  }


  function drawStat(
    x: number,
    width: number,
    label: string,
    value: string
  ) {
    pdf.setFillColor(
      246,
      248,
      251
    );

    pdf.setDrawColor(
      225,
      230,
      237
    );

    pdf.roundedRect(
      x,
      y,
      width,
      18,
      2.5,
      2.5,
      "FD"
    );


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      6.2
    );

    pdf.setTextColor(
      120,
      130,
      146
    );

    pdf.text(
      label,
      x + 4,
      y + 6
    );


    pdf.setFontSize(
      13
    );

    pdf.setTextColor(
      22,
      28,
      38
    );

    pdf.text(
      value,
      x + 4,
      y + 14
    );
  }


  drawPageHeader();


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    8
  );

  pdf.setTextColor(
    126,
    71,
    214
  );

  pdf.text(
    "RELEASE PLANNING",
    marginX,
    y
  );


  y +=
    9;


  pdf.setFontSize(
    25
  );

  pdf.setTextColor(
    18,
    23,
    32
  );

  pdf.text(
    "Updates & Seasons",
    marginX,
    y
  );


  y +=
    12;


  pdf.setFont(
    "helvetica",
    "normal"
  );

  pdf.setFontSize(
    8.5
  );

  pdf.setTextColor(
    94,
    105,
    120
  );


  const description =
    pdf.splitTextToSize(
      "Release planning overview with update progress, dates and assigned roadmap work.",
      contentWidth
    );


  pdf.text(
    description,
    marginX,
    y
  );


  y +=
    description.length *
      4.6 +
    8;


  ensureSpace(
    25
  );


  const statGap =
    3;

  const statWidth =
    (contentWidth -
      statGap * 3) /
    4;


  drawStat(
    marginX,
    statWidth,
    "UPDATES",
    String(
      input.updates.length
    )
  );


  drawStat(
    marginX +
      statWidth +
      statGap,
    statWidth,
    "ROADMAP ITEMS",
    String(
      input.roadmapItemCount
    )
  );


  drawStat(
    marginX +
      (statWidth +
        statGap) *
        2,
    statWidth,
    "AUTO PROGRESS",
    String(
      input.autoProgressCount
    )
  );


  drawStat(
    marginX +
      (statWidth +
        statGap) *
        3,
    statWidth,
    "OVERALL",
    `${input.overallProgress}%`
  );


  y +=
    27;


  pdf.setFont(
    "helvetica",
    "bold"
  );

  pdf.setFontSize(
    7
  );

  pdf.setTextColor(
    102,
    113,
    128
  );

  pdf.text(
    "OVERALL UPDATE PROGRESS",
    marginX,
    y
  );


  pdf.text(
    `${input.overallProgress}%`,
    pageWidth - marginX,
    y,
    {
      align:
        "right",
    }
  );


  y +=
    4;


  pdf.setFillColor(
    230,
    234,
    240
  );

  pdf.roundedRect(
    marginX,
    y,
    contentWidth,
    4,
    2,
    2,
    "F"
  );


  const overallBarWidth =
    contentWidth *
    (Math.max(
      0,
      Math.min(
        100,
        input.overallProgress
      )
    ) /
      100);


  if (
    overallBarWidth >
    0
  ) {
    pdf.setFillColor(
      126,
      71,
      214
    );

    pdf.roundedRect(
      marginX,
      y,
      overallBarWidth,
      4,
      2,
      2,
      "F"
    );
  }


  y +=
    15;


  if (
    input.updates.length ===
    0
  ) {
    pdf.setFillColor(
      248,
      249,
      251
    );

    pdf.setDrawColor(
      228,
      232,
      238
    );

    pdf.roundedRect(
      marginX,
      y,
      contentWidth,
      24,
      3,
      3,
      "FD"
    );


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      100,
      110,
      124
    );

    pdf.text(
      "No updates or seasons",
      pageWidth / 2,
      y + 10,
      {
        align:
          "center",
      }
    );


    pdf.setFont(
      "helvetica",
      "normal"
    );

    pdf.setFontSize(
      7.5
    );

    pdf.text(
      "There are currently no release planning entries.",
      pageWidth / 2,
      y + 16,
      {
        align:
          "center",
      }
    );
  }


  for (
    const update of input.updates
  ) {
    const descriptionLines =
      update.description
        ? pdf.splitTextToSize(
            update.description,
            contentWidth - 10
          )
        : [];


    const roadmapHeight =
      update.roadmapItems.length >
      0
        ? 9 +
          update.roadmapItems.length *
            7
        : 10;


    const cardHeight =
      42 +
      descriptionLines.length *
        4.2 +
      roadmapHeight;


    ensureSpace(
      cardHeight + 6
    );


    const cardTop =
      y;


    pdf.setFillColor(
      248,
      249,
      251
    );

    pdf.setDrawColor(
      226,
      231,
      238
    );

    pdf.roundedRect(
      marginX,
      cardTop,
      contentWidth,
      cardHeight,
      3,
      3,
      "FD"
    );


    y +=
      7;


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      6.5
    );

    pdf.setTextColor(
      126,
      71,
      214
    );


    const headingParts =
      [
        update.type.toUpperCase(),
        update.status.toUpperCase(),
      ];


    pdf.text(
      headingParts.join(
        "    -    "
      ),
      marginX + 5,
      y
    );


    y +=
      7;


    if (
      update.code
    ) {
      pdf.setFontSize(
        7
      );

      pdf.setTextColor(
        126,
        71,
        214
      );

      pdf.text(
        update.code,
        marginX + 5,
        y
      );


      y +=
        5;
    }


    pdf.setFontSize(
      14
    );

    pdf.setTextColor(
      23,
      29,
      39
    );


    const titleLines =
      pdf.splitTextToSize(
        update.title,
        contentWidth - 32
      );


    pdf.text(
      titleLines,
      marginX + 5,
      y
    );


    pdf.setFontSize(
      10
    );

    pdf.setTextColor(
      126,
      71,
      214
    );

    pdf.text(
      `${update.progress}%`,
      pageWidth -
        marginX -
        5,
      y,
      {
        align:
          "right",
      }
    );


    y +=
      Math.max(
        7,
        titleLines.length *
          5.5
      );


    if (
      descriptionLines.length
    ) {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        8
      );

      pdf.setTextColor(
        91,
        103,
        119
      );

      pdf.text(
        descriptionLines,
        marginX + 5,
        y
      );


      y +=
        descriptionLines.length *
          4.2 +
        3;
    }


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      6.7
    );

    pdf.setTextColor(
      105,
      116,
      132
    );


    const metadata: string[] =
      [
        `PROGRESS MODE: ${update.progressMode.toUpperCase()}`,
      ];


    const targetDate =
      formatPdfDate(
        update.targetDate
      );


    if (
      targetDate
    ) {
      metadata.push(
        `TARGET: ${targetDate}`
      );
    }


    const releaseDate =
      formatPdfDate(
        update.releaseDate
      );


    if (
      releaseDate
    ) {
      metadata.push(
        `RELEASE: ${releaseDate}`
      );
    }


    pdf.text(
      metadata.join(
        "    -    "
      ),
      marginX + 5,
      y
    );


    y +=
      6;


    pdf.setFillColor(
      226,
      231,
      237
    );

    pdf.roundedRect(
      marginX + 5,
      y,
      contentWidth - 10,
      2.5,
      1.25,
      1.25,
      "F"
    );


    const progressWidth =
      (contentWidth -
        10) *
      (Math.max(
        0,
        Math.min(
          100,
          update.progress
        )
      ) /
        100);


    if (
      progressWidth >
      0
    ) {
      pdf.setFillColor(
        126,
        71,
        214
      );

      pdf.roundedRect(
        marginX + 5,
        y,
        progressWidth,
        2.5,
        1.25,
        1.25,
        "F"
      );
    }


    y +=
      8;


    pdf.setFont(
      "helvetica",
      "bold"
    );

    pdf.setFontSize(
      6.7
    );

    pdf.setTextColor(
      112,
      123,
      139
    );

    pdf.text(
      `ASSIGNED ROADMAP - ${update.roadmapItems.length}`,
      marginX + 5,
      y
    );


    y +=
      5;


    if (
      update.roadmapItems.length ===
      0
    ) {
      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        7.5
      );

      pdf.setTextColor(
        135,
        145,
        159
      );

      pdf.text(
        "No roadmap items assigned.",
        marginX + 5,
        y
      );


      y +=
        5;
    } else {
      for (
        const item of update.roadmapItems
      ) {
        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          7.5
        );

        pdf.setTextColor(
          63,
          73,
          87
        );


        const itemTitle =
          pdf.splitTextToSize(
            item.title,
            contentWidth - 52
          )[0] ??
          item.title;


        pdf.text(
          itemTitle,
          marginX + 7,
          y
        );


        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setTextColor(
          115,
          126,
          141
        );

        pdf.text(
          statusText(
            item.status
          ),
          pageWidth -
            marginX -
            22,
          y,
          {
            align:
              "right",
          }
        );


        pdf.setTextColor(
          126,
          71,
          214
        );

        pdf.text(
          `${item.progress}%`,
          pageWidth -
            marginX -
            5,
          y,
          {
            align:
              "right",
          }
        );


        y +=
          7;
      }
    }


    y =
      Math.max(
        y + 5,
        cardTop +
          cardHeight +
          6
      );
  }


  drawDocumentFooter(
    pdf,
    generatedAt
  );


  pdf.save(
    `${safeFileName(
      [
        "Auros",
        input.projectShortName ||
          input.projectName,
        "Updates",
      ].join(
        "-"
      )
    )}.pdf`
  );
}