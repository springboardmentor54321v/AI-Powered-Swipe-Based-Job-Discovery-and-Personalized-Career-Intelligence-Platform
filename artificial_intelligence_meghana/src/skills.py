import spacy
from spacy.matcher import PhraseMatcher

# The predefined curated skills dictionary as required by the SRS Day 2 
CURATED_SKILLS = [
    "Python", "Java", "C", "C++", "JavaScript", "TypeScript", "React", "Node.js",
    "FastAPI", "Django", "SQL", "PostgreSQL", "MongoDB", "AWS", "Azure",
    "Docker", "Kubernetes", "Git", "GitHub", "Machine Learning", "Deep Learning",
    "NLP", "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy",
    "Matplotlib", "LangChain", "RAG", "REST API", "HTML", "CSS", "Tailwind CSS"
]

# Lazy load spaCy model and matcher state so it doesn't block unrequired module imports
_nlp = None
_matcher = None

def _initialize_matcher():
    """
    Initializes a blank spaCy english model and sets up the PhraseMatcher
    with the curated skills list. A blank model is extremely lightweight
    and avoids the need to download large transformer weights.
    """
    global _nlp, _matcher
    if _nlp is None:
        _nlp = spacy.blank("en")
        _matcher = PhraseMatcher(_nlp.vocab, attr="LOWER")
        
        # Create tokenized patterns for each skill
        patterns = [_nlp.make_doc(skill) for skill in CURATED_SKILLS]
        _matcher.add("SKILL_MATCHER", patterns)

def extract_skills(text: str) -> list[str]:
    """
    Extract technical skills from raw resume text using a deterministic 
    spaCy PhraseMatcher against a curated dictionary.
    
    :param text: Cleaned raw text extracted from a resume
    :return: Normalized, deduplicated, predictively formatted list of skill strings
    """
    if not text or not isinstance(text, str):
        return []
        
    _initialize_matcher()
    
    doc = _nlp(text)
    matches = _matcher(doc)
    
    found_skills = set()
    
    # Original dictionary keyed by lowercase for easy normalization lookup (e.g., node.js -> Node.js)
    skill_lookup = {skill.lower(): skill for skill in CURATED_SKILLS}
    
    for match_id, start, end in matches:
        span = doc[start:end]
        matched_text_lower = span.text.lower()
        if matched_text_lower in skill_lookup:
            # Always append the normalized canonical string from our dictionary
            found_skills.add(skill_lookup[matched_text_lower])
            
    # Return as an alphabetically sorted unique list
    return sorted(list(found_skills), key=lambda x: x.lower())


if __name__ == "__main__":
    print("=== SwipeX Skill Extraction Module (src/skills.py) ===")
    sample_text = "I developed machine learning models using Python, Pandas, Scikit-learn and SQL."
    skills = extract_skills(sample_text)
    print(f"Sample Text: '{sample_text}'")
    print(f"Extracted NLP Skills ({len(skills)}): {skills}")
