# PDF-Read MCP Server

A Model Context Protocol (MCP) server that provides access to PDF document
reading and text extraction capabilities.

## Overview

This server provides an MCP interface for reading and extracting text content
from PDF files. It allows AI assistants to access and process PDF documents by
providing tools to read PDF files from local paths or URLs.

## Features

- Simple MCP-based interface for PDF text extraction
- Support for local PDF files and PDF URLs
- Exposes tools for reading PDF content and metadata

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

## Usage

```bash
# Run the server with file system permissions
deno run --allow-read --allow-net server.ts
```

## Requirements

- Deno runtime
- Network permissions (for URL-based PDFs)
- File system read permissions (for local PDFs)

## Example

```bash
# Start the MCP server
deno run --allow-read --allow-net server.ts

# The server will be available for MCP clients to connect via stdio transport
```

## License

MIT
