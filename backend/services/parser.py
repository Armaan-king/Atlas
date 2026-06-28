"""
File parsing service for PDF and text files.
Uses pdfplumber for PDF extraction.
"""

import io
import pdfplumber


def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, int]:
    """
    Extract text from a PDF file.
    Returns (extracted_text, page_count).
    """
    text_parts = []
    page_count = 0

    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        page_count = len(pdf.pages)
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n\n".join(text_parts), page_count


def extract_text_from_txt(file_bytes: bytes) -> str:
    """
    Extract text from a plain text file.
    Tries UTF-8 first, then falls back to latin-1.
    """
    try:
        return file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        return file_bytes.decode("latin-1")
