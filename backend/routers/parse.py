"""
Parse router — PDF and text file upload + extraction.
POST /api/parse
"""

from fastapi import APIRouter, HTTPException, UploadFile, File

from models.schemas import ParseResponse
from services.parser import extract_text_from_pdf, extract_text_from_txt

router = APIRouter()

# Allowed file types
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md", ".text"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/parse", response_model=ParseResponse)
async def parse_file(file: UploadFile = File(...)):
    """
    Upload a PDF or text file and extract its text content.
    Returns the extracted text, filename, and page count.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Check file extension
    ext = "." + file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read file content
    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)} MB",
        )

    try:
        if ext == ".pdf":
            text, pages = extract_text_from_pdf(content)
        else:
            text = extract_text_from_txt(content)
            pages = 1  # Text files are "1 page"

        if not text.strip():
            raise HTTPException(
                status_code=422,
                detail="No text content could be extracted from the file",
            )

        return ParseResponse(
            text=text,
            filename=file.filename,
            pages=pages,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse file: {str(e)}")
