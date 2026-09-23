"""Tests for the Day 2 PDF and skill extraction pipeline."""

from pathlib import Path

import pytest

from extraction.pdf_extractor import extract_pdf_text
from skills.skill_extractor import extract_skills


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def test_skill_extraction_finds_skills():
    """Check single-word and multi-word skill detection."""

    resume_text = (
        "I developed machine learning models using Python and TensorFlow. "
        "I created REST API services using Docker."
    )

    skills = extract_skills(resume_text)

    assert "machine learning" in skills
    assert "python" in skills
    assert "tensorflow" in skills
    assert "rest api" in skills
    assert "docker" in skills


def test_skill_extraction_is_case_insensitive():
    """Check that Python and PYTHON are treated as the same skill."""

    resume_text = "Python PYTHON python SQL sql"

    skills = extract_skills(resume_text)

    assert skills.count("python") == 1
    assert skills.count("sql") == 1


def test_skill_extraction_returns_empty_for_blank_text():
    """Check blank text handling."""

    skills = extract_skills("")

    assert skills == []


def test_pdf_extractor_rejects_non_pdf(tmp_path):
    """Check that non-PDF files are rejected."""

    text_file = tmp_path / "resume.txt"
    text_file.write_text("This is not a PDF", encoding="utf-8")

    with pytest.raises(ValueError, match="Only PDF"):
        extract_pdf_text(text_file)


def test_pdf_extraction_from_sample_resume():
    """Check extraction from the sample PDF in the project root."""

    sample_pdf = PROJECT_ROOT / "sample_resume.pdf"

    if not sample_pdf.exists():
        pytest.skip("sample_resume.pdf was not found in the project root")

    text = extract_pdf_text(sample_pdf)

    assert isinstance(text, str)
    assert len(text.strip()) > 0
