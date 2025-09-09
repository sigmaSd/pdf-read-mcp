import { McpServer } from "npm:@modelcontextprotocol/sdk@1.8.0/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@1.8.0/server/stdio.js";
import { z } from "npm:zod@3.24.2";
import * as pdfjsLib from "npm:pdfjs-dist@4.0.379";


// Create an MCP server
const server = new McpServer({
  name: "PDF-Read",
  version: "1.0.0",
});

// Helper function to load PDF from path or URL
async function loadPDF(source: string): Promise<any> {
  let data: Uint8Array;

  if (source.startsWith('http://') || source.startsWith('https://')) {
    // Handle URL
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    data = new Uint8Array(arrayBuffer);
  } else {
    // Handle local file path
    try {
      data = await Deno.readFile(source);
    } catch (error) {
      throw new Error(`Failed to read PDF file: ${error.message}`);
    }
  }

  return await pdfjsLib.getDocument({ data }).promise;
}

// Helper function to parse page range
function parsePageRange(pageRange: string | undefined, totalPages: number): number[] {
  if (!pageRange) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const parts = pageRange.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      if (isNaN(start) || isNaN(end)) {
        throw new Error(`Invalid page range format: ${part}`);
      }
      for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
        if (!pages.includes(i)) pages.push(i);
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (isNaN(pageNum)) {
        throw new Error(`Invalid page number: ${part}`);
      }
      if (pageNum >= 1 && pageNum <= totalPages && !pages.includes(pageNum)) {
        pages.push(pageNum);
      }
    }
  }

  return pages.sort((a, b) => a - b);
}

// Tool to read PDF content
server.tool("read_pdf", {
  path: z.string().describe("The file path or URL to the PDF document to read"),
  page_range: z.string().optional().describe("Specific page range to extract (e.g., '1-5' or '3,7,10-12'). If not provided, all pages will be extracted."),
}, async ({ path, page_range }) => {
  try {
    const pdfDoc = await loadPDF(path);
    const totalPages = pdfDoc.numPages;
    const pagesToRead = parsePageRange(page_range, totalPages);

    let fullText = "";
    const pageTexts: string[] = [];

    for (const pageNum of pagesToRead) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageText = "";
      for (const item of textContent.items) {
        if ('str' in item) {
          pageText += item.str + " ";
        }
      }

      pageText = pageText.trim();
      if (pageText) {
        const formattedPageText = `--- Page ${pageNum} ---\n${pageText}\n`;
        pageTexts.push(formattedPageText);
        fullText += formattedPageText + "\n";
      }
    }

    if (!fullText.trim()) {
      return {
        content: [{
          type: "text",
          text: `No text content found in the specified pages of PDF: ${path}`
        }],
      };
    }

    const summary = `Extracted text from ${pageTexts.length} pages (${pagesToRead.join(', ')}) of PDF: ${path}\nTotal pages in document: ${totalPages}\n\n${fullText}`;

    return {
      content: [{ type: "text", text: summary }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error reading PDF: ${error.message}`
      }],
    };
  }
});

// Tool to get PDF metadata
server.tool("pdf_info", {
  path: z.string().describe("The file path or URL to the PDF document"),
}, async ({ path }) => {
  try {
    const pdfDoc = await loadPDF(path);
    const metadata = await pdfDoc.getMetadata();

    const info: Record<string, any> = {
      "File Path/URL": path,
      "Total Pages": pdfDoc.numPages,
      "PDF Version": pdfDoc.pdfInfo?.PDFFormatVersion || "Unknown",
    };

    // Add metadata if available
    if (metadata?.info) {
      const metaInfo = metadata.info;
      if (metaInfo.Title) info["Title"] = metaInfo.Title;
      if (metaInfo.Author) info["Author"] = metaInfo.Author;
      if (metaInfo.Subject) info["Subject"] = metaInfo.Subject;
      if (metaInfo.Creator) info["Creator"] = metaInfo.Creator;
      if (metaInfo.Producer) info["Producer"] = metaInfo.Producer;
      if (metaInfo.CreationDate) info["Creation Date"] = metaInfo.CreationDate;
      if (metaInfo.ModDate) info["Modification Date"] = metaInfo.ModDate;
    }

    const infoText = Object.entries(info)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    return {
      content: [{ type: "text", text: `PDF Information:\n\n${infoText}` }],
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: `Error getting PDF info: ${error.message}`
      }],
    };
  }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
