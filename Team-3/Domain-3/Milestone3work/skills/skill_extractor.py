"""Extract skills from sample_resume.pdf.

This file supports both commands:

    python -m skills.skill_extractor

from the project root, and:

    python skill_extractor.py

from inside the skills folder.
"""

from pathlib import Path
import sys

import spacy
from spacy.matcher import PhraseMatcher


# Add the project root to the import path when this file is run directly.
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

try:
    # Used when running as: python -m skills.skill_extractor
    from .skill_dictionary import SKILLS
except ImportError:
    # Used when running directly inside skills:
    # python skill_extractor.py
    from skill_dictionary import SKILLS

from extraction.pdf_extractor import extract_pdf_text


class SkillExtractor:
    """Extract known skills using spaCy PhraseMatcher."""

    def __init__(self, skills=SKILLS):
        self.nlp = spacy.blank("en")
        self.matcher = PhraseMatcher(self.nlp.vocab, attr="LOWER")

        patterns = [self.nlp.make_doc(skill) for skill in skills]
        self.matcher.add("SKILL", patterns)

    def extract_skills(self, text):
        """Return unique skills found in the supplied text."""
        if not isinstance(text, str):
            raise TypeError("text must be a string")

        if not text.strip():
            return []

        document = self.nlp(text)
        matches = self.matcher(document)

        # Keep the order in which skills appear in the resume.
        matches = sorted(matches, key=lambda match: match[1])

        found_skills = []
        seen = set()

        for match_id, start, end in matches:
            skill = document[start:end].text.strip().lower()

            if skill not in seen:
                found_skills.append(skill)
                seen.add(skill)

        return found_skills


def extract_skills(text):
    """Convenience function using the default skill dictionary."""
    extractor = SkillExtractor()
    return extractor.extract_skills(text)


def main():
    """Read the sample PDF and print the detected skills."""
    resume_path = PROJECT_ROOT / "sample_resume.pdf"

    print("Reading resume:")
    print(resume_path)
    print()

    resume_text = extract_pdf_text(resume_path)
    skills = extract_skills(resume_text)

    print("PDF extraction successful.")
    print("Characters extracted:", len(resume_text))
    print()
    print("Skills found in the resume:")

    if not skills:
        print("No skills found.")
        return

    for number, skill in enumerate(skills, start=1):
        print(f"{number}. {skill}")


if __name__ == "__main__":
    main()
