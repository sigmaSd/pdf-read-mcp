# PDF and DOCX Read MCP Server

A Model Context Protocol (MCP) server that provides access to PDF and DOCX
document reading and text extraction capabilities.

## Overview

This server provides an MCP interface for reading and extracting text content
from PDF and DOCX files. It allows AI assistants to access and process documents
by providing tools to read files from local paths or URLs.

## Features

- Simple MCP-based interface for PDF and DOCX text extraction
- Support for local files and URLs for both PDF and DOCX
- Exposes tools for reading content and metadata for both formats

## Tools

### read_pdf

Allows clients to extract text content from PDF files.

**Parameters:**

- `path` (string): The file path or URL to the PDF document to read
- `page_range` (string, optional): Specific page range to extract (e.g., "1-5"
  or "3,7,10-12")

**Returns:**

- Extracted text content from the PDF in plain text format
- Page numbers and metadata when available

### pdf_info

Retrieves metadata information about a PDF document.

**Parameters:**

- `path` (string): The file path or URL to the PDF document

**Returns:**

- PDF metadata including title, author, creation date, page count, etc.

### read_docx

Allows clients to extract text content from DOCX files.

**Parameters:**

- `path` (string): The file path or URL to the DOCX document to read
- `format` (string, optional): Output format: 'text' for plain text or 'html'
  for HTML with formatting (default: 'text')

**Returns:**

- Extracted text content from the DOCX in the specified format
- Warnings if any formatting issues are encountered

### docx_info

Retrieves basic information about a DOCX document.

**Parameters:**

- `path` (string): The file path or URL to the DOCX document

**Returns:**

- DOCX information including file size, word count, character count, and content
  presence

## Usage

```bash
# Run the server with file system permissions
deno run --allow-read --allow-net jsr:@sigmasd/pdf-read-mcp
```

## Requirements

- Deno runtime
- Network permissions (for URL-based documents)
- File system read permissions (for local documents)

## Example

```bash
# Start the MCP server
deno run --allow-read --allow-net jsr:@sigmasd/pdf-read-mcp

# The server will be available for MCP clients to connect via stdio transport
```

## License

MIT
