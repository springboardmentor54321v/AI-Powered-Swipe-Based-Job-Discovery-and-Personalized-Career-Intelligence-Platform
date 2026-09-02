import os
import time

from flask import (
    Blueprint,
    request,
    current_app,
)

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
)

from werkzeug.utils import secure_filename

from app.extensions import db
from app.models.resume import Resume


resume_bp = Blueprint(
    "resume",
    __name__
)


# ============================================================
# CONFIGURATION
# ============================================================

ALLOWED_EXTENSIONS = {
    "pdf",
    "doc",
    "docx",
}

UPLOAD_FOLDER = os.path.join(
    os.getcwd(),
    "uploads",
    "resumes"
)


# ============================================================
# FILE HELPERS
# ============================================================

def allowed_file(filename):

    if not filename:
        return False

    if "." not in filename:
        return False

    extension = (
        filename
        .rsplit(".", 1)[1]
        .lower()
    )

    return extension in ALLOWED_EXTENSIONS


def extract_text_from_file(
    file_path,
    filename
):

    extension = (
        filename
        .rsplit(".", 1)[1]
        .lower()
        if "." in filename
        else ""
    )

    # --------------------------------------------------------
    # PDF
    # --------------------------------------------------------

    if extension == "pdf":

        try:
            from pypdf import PdfReader

            reader = PdfReader(
                file_path
            )

            text = ""

            for page in reader.pages:
                text += (
                    page.extract_text()
                    or ""
                )

                text += "\n"

            return text

        except Exception as error:

            current_app.logger.warning(
                f"PDF extraction failed: {error}"
            )

            return ""

    # --------------------------------------------------------
    # DOCX
    # --------------------------------------------------------

    if extension == "docx":

        try:
            from docx import Document

            document = Document(
                file_path
            )

            paragraphs = []

            for paragraph in document.paragraphs:

                if paragraph.text.strip():

                    paragraphs.append(
                        paragraph.text
                    )

            return "\n".join(
                paragraphs
            )

        except Exception as error:

            current_app.logger.warning(
                f"DOCX extraction failed: {error}"
            )

            return ""

    # --------------------------------------------------------
    # DOC
    # --------------------------------------------------------

    # Basic support for storage.
    # Text extraction can be added later using antiword/
    # LibreOffice if required.

    return ""


# ============================================================
# SKILL EXTRACTION
# ============================================================

KNOWN_SKILLS = [

    "java",
    "python",
    "javascript",
    "typescript",

    "react",
    "react.js",

    "node",
    "node.js",

    "spring",
    "spring boot",

    "sql",
    "mysql",
    "postgresql",
    "mongodb",

    "html",
    "css",

    "git",
    "github",

    "docker",
    "kubernetes",

    "aws",
    "azure",

    "flask",
    "django",

    "rest",
    "rest api",

    "microservices",

    "hibernate",

    "c",
    "c++",

    "machine learning",
    "deep learning",

    "tensorflow",
    "pytorch",

    "figma",
    "ui",
    "ux",

    "bootstrap",
    "tailwind",

    "redis",

    "linux",

    "data structures",
    "algorithms",

]


def extract_skills(text):

    if not text:
        return []

    normalized = text.lower()

    found = []

    for skill in KNOWN_SKILLS:

        if skill.lower() in normalized:

            found.append(skill)

    # Remove duplicates while preserving order
    return list(
        dict.fromkeys(found)
    )


# ============================================================
# ATS METRICS
# ============================================================

ATS_KEYWORDS = [

    "experience",
    "education",
    "skills",
    "projects",
    "project",
    "certifications",
    "summary",
    "objective",
    "achievements",
    "responsibilities",

    "java",
    "python",
    "javascript",
    "react",
    "spring",
    "spring boot",
    "sql",
    "api",
    "git",
    "docker",

]


def calculate_keyword_relevance(
    text,
    skills
):

    if not text:
        return 0

    normalized = text.lower()

    matched = 0

    for keyword in ATS_KEYWORDS:

        if keyword.lower() in normalized:
            matched += 1

    score = (
        matched /
        len(ATS_KEYWORDS)
    ) * 100

    # Skills contribute additional confidence.
    skill_bonus = min(
        len(skills) * 2,
        15
    )

    return min(
        round(score + skill_bonus),
        100
    )


def calculate_format_readability(
    text
):

    if not text:
        return 0

    score = 0

    word_count = len(
        text.split()
    )

    # --------------------------------------------------------
    # Resume has enough readable text
    # --------------------------------------------------------

    if word_count >= 300:

        score += 35

    elif word_count >= 150:

        score += 25

    elif word_count >= 75:

        score += 15

    # --------------------------------------------------------
    # Line structure
    # --------------------------------------------------------

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    if len(lines) >= 10:
        score += 20

    elif len(lines) >= 5:
        score += 10

    # --------------------------------------------------------
    # Avoid excessive weird characters
    # --------------------------------------------------------

    total_chars = max(
        len(text),
        1
    )

    normal_chars = sum(
        1
        for character in text
        if character.isalnum()
        or character.isspace()
        or character in ".,;:-()/%&+@#"
    )

    readability_ratio = (
        normal_chars /
        total_chars
    )

    if readability_ratio >= 0.95:

        score += 25

    elif readability_ratio >= 0.90:

        score += 15

    # --------------------------------------------------------
    # Basic contact information
    # --------------------------------------------------------

    if "@" in text:

        score += 10

    if any(
        digit.isdigit()
        for digit in text
    ):

        score += 10

    return min(
        score,
        100
    )


def calculate_section_completeness(
    text
):

    if not text:
        return 0

    normalized = text.lower()

    sections = [

        [
            "summary",
            "objective",
            "profile"
        ],

        [
            "experience",
            "work experience",
            "professional experience"
        ],

        [
            "education",
            "academic"
        ],

        [
            "skills",
            "technical skills",
            "technical expertise"
        ],

        [
            "project",
            "projects",
            "personal projects"
        ],

        [
            "certification",
            "certifications"
        ],

        [
            "achievement",
            "achievements"
        ],

    ]

    found_sections = 0

    for alternatives in sections:

        if any(
            section in normalized
            for section in alternatives
        ):

            found_sections += 1

    return round(
        (
            found_sections /
            len(sections)
        ) * 100
    )


def calculate_ats_score(
    keyword_relevance,
    format_readability,
    section_completeness
):

    score = (

        keyword_relevance * 0.40

        +

        format_readability * 0.30

        +

        section_completeness * 0.30

    )

    return round(
        min(score, 100)
    )


# ============================================================
# SUGGESTIONS
# ============================================================

def build_suggestions(
    text,
    skills,
    keyword_relevance,
    format_readability,
    section_completeness
):

    suggestions = []

    normalized = (
        text.lower()
        if text
        else ""
    )

    # --------------------------------------------------------
    # Sections
    # --------------------------------------------------------

    if (
        "experience" not in normalized
        and "work experience" not in normalized
    ):

        suggestions.append(
            "Add a clear Experience section."
        )

    if "education" not in normalized:

        suggestions.append(
            "Add an Education section."
        )

    if (
        "skill" not in normalized
    ):

        suggestions.append(
            "Add a dedicated Skills section."
        )

    if (
        "project" not in normalized
    ):

        suggestions.append(
            "Add relevant projects with measurable outcomes."
        )

    # --------------------------------------------------------
    # Keywords
    # --------------------------------------------------------

    if keyword_relevance < 60:

        suggestions.append(
            "Add more job-relevant technical keywords."
        )

    elif keyword_relevance < 80:

        suggestions.append(
            "Tailor your keywords to the job description."
        )

    # --------------------------------------------------------
    # Readability
    # --------------------------------------------------------

    if format_readability < 60:

        suggestions.append(
            "Improve resume structure and ATS readability."
        )

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    if len(skills) < 5:

        suggestions.append(
            "Add more relevant technical skills."
        )

    # --------------------------------------------------------
    # Final fallback
    # --------------------------------------------------------

    if not suggestions:

        suggestions.append(
            "Resume structure looks strong. Tailor keywords for each target role."
        )

    return suggestions


# ============================================================
# UPLOAD + ANALYZE
# ============================================================

@resume_bp.post("/analyze")
@jwt_required()
def analyze_resume():

    user_id = int(
        get_jwt_identity()
    )

    # --------------------------------------------------------
    # FILE
    # --------------------------------------------------------

    if "resume" not in request.files:

        return {
            "success": False,
            "message":
                "Resume file is required"
        }, 400

    file = request.files["resume"]

    if (
        not file
        or not file.filename
    ):

        return {
            "success": False,
            "message":
                "Please select a resume"
        }, 400

    if not allowed_file(
        file.filename
    ):

        return {
            "success": False,
            "message":
                "Only PDF, DOC and DOCX files are supported"
        }, 400

    # --------------------------------------------------------
    # UPLOAD DIRECTORY
    # --------------------------------------------------------

    os.makedirs(
        UPLOAD_FOLDER,
        exist_ok=True
    )

    original_filename = (
        file.filename
    )

    safe_filename = (
        secure_filename(
            original_filename
        )
    )

    unique_filename = (
        f"{user_id}_"
        f"{int(time.time())}_"
        f"{safe_filename}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        unique_filename
    )

    file.save(file_path)

    # --------------------------------------------------------
    # TEXT EXTRACTION
    # --------------------------------------------------------

    text = extract_text_from_file(
        file_path,
        original_filename
    )

    # --------------------------------------------------------
    # SKILLS
    # --------------------------------------------------------

    skills = extract_skills(
        text
    )

    # --------------------------------------------------------
    # ATS METRICS
    # --------------------------------------------------------

    keyword_relevance = (
        calculate_keyword_relevance(
            text,
            skills
        )
    )

    format_readability = (
        calculate_format_readability(
            text
        )
    )

    section_completeness = (
        calculate_section_completeness(
            text
        )
    )

    ats_score = (
        calculate_ats_score(
            keyword_relevance,
            format_readability,
            section_completeness
        )
    )

    # --------------------------------------------------------
    # SUGGESTIONS
    # --------------------------------------------------------

    suggestions = build_suggestions(
        text,
        skills,
        keyword_relevance,
        format_readability,
        section_completeness
    )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    summary = (
        f"Your resume received an ATS score "
        f"of {ats_score}%. "
        f"{len(skills)} technical skills "
        f"were detected."
    )

    # --------------------------------------------------------
    # SAVE
    # --------------------------------------------------------

    resume = Resume(

        user_id=user_id,

        filename=original_filename,

        file_path=file_path,

        ats_score=ats_score,

        keyword_relevance=
            keyword_relevance,

        format_readability=
            format_readability,

        section_completeness=
            section_completeness,

        # No target job yet.
        job_profile_fit=None,

        skills=",".join(
            skills
        ),

        keywords=",".join(
            skills
        ),

        missing_keywords="",

        missing_skills="",

        summary=summary,

        suggestions="|".join(
            suggestions
        ),
    )

    db.session.add(
        resume
    )

    db.session.commit()

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    analysis = {

        "resume_id":
            resume.id,

        # Overall
        "atsScore":
            ats_score,

        # Diagnostic metrics
        "keywordRelevance":
            keyword_relevance,

        "formatReadability":
            format_readability,

        "sectionCompleteness":
            section_completeness,

        # Job-specific comparison
        "jobProfileFit":
            None,

        # Resume information
        "skills":
            skills,

        "keywordsFound":
            skills,

        "missingKeywords":
            [],

        "missingSkills":
            [],

        "summary":
            summary,

        "suggestions":
            suggestions,
    }

    return {

        "success": True,

        "message":
            "Resume uploaded and analyzed successfully",

        "resume":
            resume.to_dict(),

        "analysis":
            analysis,

    }, 201


# ============================================================
# GET MY RESUMES
# ============================================================

@resume_bp.get("/")
@jwt_required()
def get_my_resumes():

    user_id = int(
        get_jwt_identity()
    )

    resumes = (
        Resume.query
        .filter_by(
            user_id=user_id
        )
        .order_by(
            Resume.id.desc()
        )
        .all()
    )

    return {

        "success": True,

        "count":
            len(resumes),

        "resumes": [
            resume.to_dict()
            for resume in resumes
        ],

    }, 200


# ============================================================
# GET LATEST ANALYSIS
# ============================================================

@resume_bp.get("/analysis")
@jwt_required()
def get_analysis():

    user_id = int(
        get_jwt_identity()
    )

    resume = (
        Resume.query
        .filter_by(
            user_id=user_id
        )
        .order_by(
            Resume.id.desc()
        )
        .first()
    )

    if not resume:

        return {

            "success": True,

            "resume": None,

            "analysis": None,

            "message":
                "No resume uploaded",

        }, 200

    skills = (
        resume.skills.split(",")
        if resume.skills
        else []
    )

    keywords = (
        resume.keywords.split(",")
        if resume.keywords
        else skills
    )

    missing_keywords = (
        resume.missing_keywords.split(",")
        if resume.missing_keywords
        else []
    )

    missing_skills = (
        resume.missing_skills.split(",")
        if resume.missing_skills
        else []
    )

    suggestions = (
        resume.suggestions.split("|")
        if resume.suggestions
        else []
    )

    analysis = {

        "resume_id":
            resume.id,

        "atsScore":
            resume.ats_score or 0,

        "keywordRelevance":
            resume.keyword_relevance or 0,

        "formatReadability":
            resume.format_readability or 0,

        "sectionCompleteness":
            resume.section_completeness or 0,

        # NULL is intentional.
        # No target job has been selected.
        "jobProfileFit":
            resume.job_profile_fit,

        "skills":
            skills,

        "keywordsFound":
            keywords,

        "missingKeywords":
            missing_keywords,

        "missingSkills":
            missing_skills,

        "summary":
            resume.summary,

        "suggestions":
            suggestions,
    }

    return {

        "success": True,

        "resume":
            resume.to_dict(),

        "analysis":
            analysis,

    }, 200


# ============================================================
# GET SPECIFIC ATS RESULT
# ============================================================

@resume_bp.get(
    "/<int:resume_id>/ats"
)
@jwt_required()
def get_ats_result(
    resume_id
):

    user_id = int(
        get_jwt_identity()
    )

    resume = (
        Resume.query
        .filter_by(
            id=resume_id,
            user_id=user_id
        )
        .first()
    )

    if not resume:

        return {

            "success": False,

            "message":
                "Resume not found",

        }, 404

    return {

        "success": True,

        "resume_id":
            resume.id,

        "ats_score":
            resume.ats_score or 0,

        "status":
            (
                "analysis_pending"
                if resume.ats_score is None
                else
                "analysis_complete"
            ),

        "analysis": {

            "atsScore":
                resume.ats_score or 0,

            "keywordRelevance":
                resume.keyword_relevance or 0,

            "formatReadability":
                resume.format_readability or 0,

            "sectionCompleteness":
                resume.section_completeness or 0,

            "jobProfileFit":
                resume.job_profile_fit,

            "skills":
                resume.skills.split(",")
                if resume.skills
                else [],

            "keywordsFound":
                resume.keywords.split(",")
                if resume.keywords
                else [],

            "missingKeywords":
                resume.missing_keywords.split(",")
                if resume.missing_keywords
                else [],

            "missingSkills":
                resume.missing_skills.split(",")
                if resume.missing_skills
                else [],

            "summary":
                resume.summary,

            "suggestions":
                resume.suggestions.split("|")
                if resume.suggestions
                else [],

        },

    }, 200