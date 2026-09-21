import os
import sys
import unittest
import pandas as pd
from unittest.mock import patch, MagicMock

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.parser import extract_text_from_pdf, extract_text_from_docx
from src.skills import extract_skills

class TestDay6Extraction(unittest.TestCase):
    def test_01_pdf_extraction_valid(self):
        """Test valid PDF logic. pdfplumber logic mocked to verify cleaning."""
        with patch('pdfplumber.open') as mock_pdf:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = "Hello \nWorld  !"
            mock_pdf.return_value.__enter__.return_value.pages = [mock_page]
            text = extract_text_from_pdf(b"dummy")
            self.assertEqual(text, "Hello \nWorld  !")

    def test_02_pdf_extraction_multi_page(self):
        """Test multi-page PDF extraction concatenates properly."""
        with patch('pdfplumber.open') as mock_pdf:
            page1 = MagicMock()
            page1.extract_text.return_value = "Page 1 Content."
            page2 = MagicMock()
            page2.extract_text.return_value = "Page 2 Content."
            mock_pdf.return_value.__enter__.return_value.pages = [page1, page2]
            text = extract_text_from_pdf(b"dummy")
            self.assertEqual(text, "Page 1 Content.\nPage 2 Content.")

    def test_03_pdf_extraction_empty(self):
        """Test empty PDF extraction returns empty string."""
        with patch('pdfplumber.open') as mock_pdf:
            mock_page = MagicMock()
            mock_page.extract_text.return_value = None
            mock_pdf.return_value.__enter__.return_value.pages = [mock_page]
            text = extract_text_from_pdf(b"dummy")
            self.assertEqual(text, "")

    def test_04_pdf_extraction_invalid(self):
        """Test invalid PDF bytes raises ValueError."""
        with self.assertRaises(ValueError):
            extract_text_from_pdf(b"invalid%pdf")

    def test_05_docx_extraction_valid(self):
        """Test valid DOCX paragraphs extraction."""
        with patch('src.parser.docx.Document') as mock_doc:
            p1 = MagicMock(); p1.text = "Para 1"
            p2 = MagicMock(); p2.text = "Para 2"
            mock_doc.return_value.paragraphs = [p1, p2]
            text = extract_text_from_docx(b"dummy")
            self.assertEqual(text, "Para 1\nPara 2")

    def test_06_docx_extraction_empty(self):
        """Test empty DOCX extraction returns empty."""
        with patch('src.parser.docx.Document') as mock_doc:
            mock_doc.return_value.paragraphs = []
            text = extract_text_from_docx(b"dummy")
            self.assertEqual(text, "")

    def test_07_skill_known_technical(self):
        """Test standard technical skill extraction."""
        text = "I have 5 years experience with Python and SQL."
        skills = extract_skills(text)
        self.assertIn("Python", skills)
        self.assertIn("SQL", skills)

    def test_08_skill_mixed_capitalization(self):
        """Test mixed casing deduplication."""
        text = "I know pyThon, PYTHON, and sql."
        skills = extract_skills(text)
        # Assuming extract_skills canonicalizes based on dictionary, it returns 'Python' exactly once
        self.assertEqual(skills.count("Python") + skills.count("python"), 1)
        self.assertEqual(skills.count("SQL") + skills.count("sql"), 1)

    def test_09_skill_multiple_in_sentence_and_duplicates(self):
        """Test duplicate skills in the same text are deduplicated."""
        text = "Java is great. I love Java. Docker is also good, docker docker."
        skills = extract_skills(text)
        self.assertEqual(skills.count("Java") + skills.count("java"), 1)
        self.assertEqual(skills.count("Docker") + skills.count("docker"), 1)

    def test_10_skill_not_in_dict(self):
        """Test skills not in the internal dictionary are ignored."""
        text = "I know AdvancedObscureTech89."
        skills = extract_skills(text)
        self.assertNotIn("AdvancedObscureTech89", [s.lower() for s in skills])

    def test_11_skill_empty_or_no_skill(self):
        """Test behavior for empty text and non-skill text."""
        self.assertEqual(extract_skills(""), [])
        self.assertEqual(extract_skills("I am a very hard worker. Dedicated."), [])

if __name__ == '__main__':
    unittest.main()
