from app.extensions import db

class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    recruiter_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(150), nullable=False)
    company = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    location = db.Column(db.String(150), nullable=False)
    skills = db.Column(db.String(500), nullable=False)
    salary = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "recruiter_id": self.recruiter_id,
            "title": self.title,
            "company": self.company,
            "description": self.description,
            "location": self.location,
            "skills": self.skills,
            "salary": self.salary
        }
