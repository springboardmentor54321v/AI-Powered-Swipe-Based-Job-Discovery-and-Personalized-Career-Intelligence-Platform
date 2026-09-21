import os
import io
import sys
import unittest
from unittest.mock import patch, MagicMock
import docx

# Ensure src module is importable
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from src.parser import extract_text_from_pdf, extract_text_from_docx, extract_text
from src.skills import extract_skills

class TestDay2Extractors(unittest.TestCase):

    def test_01_extract_text_from_docx(self):
        """Test DOCX extraction on the sample generated file"""
        sample_path = os.path.join(ROOT_DIR, "data", "resumes", "sample_resume.docx")
        self.assertTrue(os.path.exists(sample_path), "Sample DOCX missing")
        text = extract_text_from_docx(sample_path)
        self.assertIn("JANE DOE", text)
        self.assertIn("Software Engineer", text)
        self.assertIn("Machine Learning", text)

    def test_02_extract_text_from_empty_docx(self):
        """Verify empty DOCX gracefully fails with ValueError"""
        buffer = io.BytesIO()
        doc = docx.Document()
        doc.save(buffer)
        buffer.seek(0)
        
        with self.assertRaises(ValueError) as context:
            extract_text_from_docx(buffer)
        
        self.assertIn("No readable text", str(context.exception))

    @patch('src.parser.pdfplumber.open')
    def test_03_extract_text_from_pdf_mocked(self, mock_pdfplumber_open):
        """Test PDF logic accurately extracts and cleans text"""
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_text.return_value = "PDF test string \n\n Python \t  Data Analysis"
        mock_pdf.pages = [mock_page]
        
        mock_pdfplumber_open.return_value.__enter__.return_value = mock_pdf
        
        text = extract_text_from_pdf(b"dummy_bytes")
        self.assertEqual(text, "PDF test string Python Data Analysis")

    def test_04_supported_extensions_router(self):
        """Test extract_text router correctly distinguishes file types based on filename"""
        with patch('src.parser.extract_text_from_docx') as m_docx:
            m_docx.return_value = "docx_content"
            res = extract_text(b"some bytes", "my_resume.Docx")
            self.assertEqual(res, "docx_content")
            
        with patch('src.parser.extract_text_from_pdf') as m_pdf:
            m_pdf.return_value = "pdf_content"
            res = extract_text(b"some bytes", "my_resume.PDF")
            self.assertEqual(res, "pdf_content")

    def test_05_unsupported_extensions(self):
        """Test extract_text throws clear ValueError on unsupported extensions"""
        with self.assertRaises(ValueError) as context:
            extract_text(b"some text data", "my_resume.txt")
        self.assertIn("Unsupported file type", str(context.exception))

    def test_06_skill_extraction_empty(self):
        """Test skill extraction gracefully handles empty text"""
        self.assertEqual(extract_skills(""), [])
        self.assertEqual(extract_skills(None), [])

    def test_07_skill_extraction_cases(self):
        """Test skill extraction deduplication and casing normalization"""
        text = "Experience with python, JAVAScript, and Node.js. Used nOde.Js daily."
        skills = extract_skills(text)
        self.assertEqual(skills, ["JavaScript", "Node.js", "Python"])
        
    def test_08_skill_extraction_duplicate(self):
        """Test skill extraction deduplicates repeating skills"""
        text = "Python Python Java PyTorch PyTorch I love Python."
        skills = extract_skills(text)
        self.assertEqual(skills, ["Java", "Python", "PyTorch"])

    def test_09_skill_extraction_no_match(self):
        """Test skill extraction cleanly returns empty list for unrelated text"""
        text = "I am a very good leader with great communication and synergy."
        skills = extract_skills(text)
        self.assertEqual(skills, [])

    def test_10_skill_extraction_full(self):
        """Test skill extraction on the docx file text"""
        sample_path = os.path.join(ROOT_DIR, "data", "resumes", "sample_resume.docx")
        text = extract_text_from_docx(sample_path)
        skills = extract_skills(text)
        self.assertIn("Python", skills)
        self.assertIn("TypeScript", skills)
        self.assertIn("React", skills)
        self.assertIn("Kubernetes", skills)
        self.assertIn("Machine Learning", skills)
        self.assertIn("PyTorch", skills)
        self.assertIn("Scikit-learn", skills)

if __name__ == '__main__':
    unittest.main()
