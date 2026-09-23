"""PDF resume text extraction for SwipeX Day 2."""

from pathlib import Path
from typing import Union

import pdfplumber


def extract_pdf_text(file_path: Union[str, Path]) -> str:
    """Extract readable text from a PDF resume.

    Args:
        file_path: Path to a PDF file.

    Returns:
        Cleaned text from all pages.

    Raises:
        FileNotFoundError: If the file does not exist.
        ValueError: If the file is not a PDF or contains no readable text.
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError("Resume file not found: {}".format(path))

    if not path.is_file():
        raise ValueError("Resume path is not a file: {}".format(path))

    if path.suffix.lower() != ".pdf":
        raise ValueError("Only PDF resume files are supported.")

    page_texts = []

    try:
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                text = page.extract_text() or ""
                text = " ".join(text.split())

                if text:
                    page_texts.append(text)

    except Exception as error:
        raise ValueError(
            "Could not read the PDF resume: {}".format(error)
        )

    extracted_text = "\n".join(page_texts).strip()

    if not extracted_text:
        raise ValueError(
            "No readable text was found. "
            "The PDF may be empty or scanned as an image."
        )

    return extracted_text


if __name__ == "__main__":
    # Run this file directly to test your sample resume.
    resume_path = Path(__file__).resolve().parent.parent / "sample_resume.pdf"

    try:
        resume_text = extract_pdf_text(resume_path)

        print("PDF extraction successful.")
        print("Characters extracted:", len(resume_text))
        print("\nFirst 500 characters:\n")
        print(resume_text[:500])

    except Exception as error:
        print("PDF extraction failed:")
        print(error)
