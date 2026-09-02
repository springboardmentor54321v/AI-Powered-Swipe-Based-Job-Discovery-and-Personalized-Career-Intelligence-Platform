from app.extensions import db


class Resume(db.Model):
    __tablename__ = "resumes"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        nullable=False,
        index=True
    )

    filename = db.Column(
        db.String(255),
        nullable=False
    )

    file_path = db.Column(
        db.String(500),
        nullable=True
    )

    # ---------------------------------------------------------
    # ATS SCORES
    # ---------------------------------------------------------

    ats_score = db.Column(
        db.Integer,
        nullable=True
    )

    keyword_relevance = db.Column(
        db.Integer,
        nullable=True
    )

    format_readability = db.Column(
        db.Integer,
        nullable=True
    )

    section_completeness = db.Column(
        db.Integer,
        nullable=True
    )

    # Job-specific score.
    # NULL means no specific job was selected.
    job_profile_fit = db.Column(
        db.Integer,
        nullable=True
    )

    # ---------------------------------------------------------
    # EXTRACTED DATA
    # ---------------------------------------------------------

    skills = db.Column(
        db.Text,
        nullable=True
    )

    keywords = db.Column(
        db.Text,
        nullable=True
    )

    missing_keywords = db.Column(
        db.Text,
        nullable=True
    )

    missing_skills = db.Column(
        db.Text,
        nullable=True
    )

    summary = db.Column(
        db.Text,
        nullable=True
    )

    suggestions = db.Column(
        db.Text,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        server_default=db.func.now(),
        nullable=False
    )

    def to_dict(self):

        return {
            "id": self.id,

            "user_id": self.user_id,

            "filename": self.filename,

            "file_path": self.file_path,

            # ATS
            "ats_score": self.ats_score,

            "keyword_relevance":
                self.keyword_relevance,

            "format_readability":
                self.format_readability,

            "section_completeness":
                self.section_completeness,

            "job_profile_fit":
                self.job_profile_fit,

            # Extracted information
            "skills":
                self.skills.split(",")
                if self.skills
                else [],

            "keywords":
                self.keywords.split(",")
                if self.keywords
                else [],

            "missing_keywords":
                self.missing_keywords.split(",")
                if self.missing_keywords
                else [],

            "missing_skills":
                self.missing_skills.split(",")
                if self.missing_skills
                else [],

            "summary":
                self.summary,

            "suggestions":
                self.suggestions.split("|")
                if self.suggestions
                else [],

            "created_at":
                self.created_at.isoformat()
                if self.created_at
                else None,
        }





















# from app.extensions import db


# class Resume(db.Model):
#     __tablename__ = "resumes"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     user_id = db.Column(
#         db.Integer,
#         nullable=False,
#         index=True
#     )

#     filename = db.Column(
#         db.String(255),
#         nullable=False
#     )

#     file_path = db.Column(
#         db.String(500),
#         nullable=True
#     )

#     ats_score = db.Column(
#         db.Integer,
#         nullable=True
#     )

#     skills = db.Column(
#         db.Text,
#         nullable=True
#     )

#     summary = db.Column(
#         db.Text,
#         nullable=True
#     )

#     suggestions = db.Column(
#         db.Text,
#         nullable=True
#     )

#     created_at = db.Column(
#         db.DateTime,
#         server_default=db.func.now(),
#         nullable=False
#     )

#     def to_dict(self):
#         return {
#             "id": self.id,
#             "user_id": self.user_id,
#             "filename": self.filename,
#             "file_path": self.file_path,
#             "ats_score": self.ats_score,
#             "skills": self.skills.split(",")
#             if self.skills
#             else [],
#             "summary": self.summary,
#             "suggestions": self.suggestions.split("|")
#             if self.suggestions
#             else [],
#             "created_at":
#                 self.created_at.isoformat()
#                 if self.created_at
#                 else None,
#         }