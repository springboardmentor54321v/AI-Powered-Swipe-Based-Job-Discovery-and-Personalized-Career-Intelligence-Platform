from app import create_app
from app.extensions import db
from app.models.company import Company


COMPANIES = [

    # =====================================================
    # GLOBAL TECHNOLOGY
    # =====================================================

    {
        "name": "Google",
        "category": "MNC",
        "industry": "Technology",
        "location": "Bengaluru, India",
        "employee_count": "180,000+",
        "founded_year": 1998,
        "website": "https://www.google.com",
        "logo": "https://logo.clearbit.com/google.com",
        "rating": 4.5,
        "about": "Google develops products and services used by billions of people worldwide, including Search, Cloud, Android and YouTube.",
        "tech_stack": [
            "Java",
            "Python",
            "C++",
            "Go",
            "Kubernetes",
            "Google Cloud",
            "TensorFlow"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work",
            "Employee wellness",
            "Career development"
        ]
    },

    {
        "name": "Microsoft",
        "category": "MNC",
        "industry": "Technology",
        "location": "Hyderabad, India",
        "employee_count": "220,000+",
        "founded_year": 1975,
        "website": "https://www.microsoft.com",
        "logo": "https://logo.clearbit.com/microsoft.com",
        "rating": 4.4,
        "about": "Microsoft builds operating systems, cloud infrastructure, productivity software, developer tools and AI products.",
        "tech_stack": [
            "C#",
            ".NET",
            "Azure",
            "Java",
            "Python",
            "TypeScript",
            "Kubernetes"
        ],
        "benefits": [
            "Health benefits",
            "Learning budget",
            "Flexible work",
            "Retirement benefits",
            "Employee programs"
        ]
    },

    {
        "name": "Amazon",
        "category": "MNC",
        "industry": "E-commerce & Cloud Computing",
        "location": "Bengaluru, India",
        "employee_count": "1,500,000+",
        "founded_year": 1994,
        "website": "https://www.amazon.com",
        "logo": "https://logo.clearbit.com/amazon.com",
        "rating": 4.2,
        "about": "Amazon operates global commerce, logistics, cloud computing and digital services businesses through Amazon and AWS.",
        "tech_stack": [
            "Java",
            "Python",
            "AWS",
            "Spring",
            "React",
            "DynamoDB",
            "Kubernetes"
        ],
        "benefits": [
            "Health insurance",
            "Career development",
            "Employee discounts",
            "Learning programs",
            "Flexible benefits"
        ]
    },

    {
        "name": "Apple",
        "category": "MNC",
        "industry": "Consumer Technology",
        "location": "Hyderabad, India",
        "employee_count": "160,000+",
        "founded_year": 1976,
        "website": "https://www.apple.com",
        "logo": "https://logo.clearbit.com/apple.com",
        "rating": 4.3,
        "about": "Apple designs consumer electronics, operating systems, software and digital services.",
        "tech_stack": [
            "Swift",
            "Objective-C",
            "Python",
            "C++",
            "Cloud",
            "Machine Learning"
        ],
        "benefits": [
            "Health coverage",
            "Employee discounts",
            "Wellness programs",
            "Learning opportunities"
        ]
    },

    {
        "name": "Meta",
        "category": "MNC",
        "industry": "Social Technology",
        "location": "Hyderabad, India",
        "employee_count": "70,000+",
        "founded_year": 2004,
        "website": "https://about.meta.com",
        "logo": "https://logo.clearbit.com/meta.com",
        "rating": 4.3,
        "about": "Meta builds social platforms, immersive technologies and AI systems connecting people around the world.",
        "tech_stack": [
            "React",
            "Python",
            "C++",
            "PHP",
            "PyTorch",
            "GraphQL"
        ],
        "benefits": [
            "Health insurance",
            "Remote flexibility",
            "Wellness programs",
            "Learning resources"
        ]
    },

    {
        "name": "NVIDIA",
        "category": "MNC",
        "industry": "Semiconductors & AI",
        "location": "Bengaluru, India",
        "employee_count": "35,000+",
        "founded_year": 1993,
        "website": "https://www.nvidia.com",
        "logo": "https://logo.clearbit.com/nvidia.com",
        "rating": 4.5,
        "about": "NVIDIA develops accelerated computing platforms, GPUs and technologies powering modern artificial intelligence.",
        "tech_stack": [
            "C++",
            "CUDA",
            "Python",
            "AI",
            "Deep Learning",
            "Linux"
        ],
        "benefits": [
            "Health benefits",
            "Learning programs",
            "Flexible work",
            "Employee stock programs"
        ]
    },

    {
        "name": "Adobe",
        "category": "MNC",
        "industry": "Software",
        "location": "Noida, India",
        "employee_count": "30,000+",
        "founded_year": 1982,
        "website": "https://www.adobe.com",
        "logo": "https://logo.clearbit.com/adobe.com",
        "rating": 4.4,
        "about": "Adobe creates creative, document and digital experience software used by individuals and enterprises.",
        "tech_stack": [
            "Java",
            "C++",
            "JavaScript",
            "React",
            "AWS",
            "AI"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs",
            "Wellness benefits"
        ]
    },

    {
        "name": "Oracle",
        "category": "MNC",
        "industry": "Enterprise Software & Cloud",
        "location": "Bengaluru, India",
        "employee_count": "160,000+",
        "founded_year": 1977,
        "website": "https://www.oracle.com",
        "logo": "https://logo.clearbit.com/oracle.com",
        "rating": 4.1,
        "about": "Oracle provides enterprise databases, cloud infrastructure, business applications and developer technologies.",
        "tech_stack": [
            "Java",
            "Oracle Database",
            "OCI",
            "Python",
            "Kubernetes",
            "SQL"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work",
            "Employee assistance"
        ]
    },

    {
        "name": "IBM",
        "category": "MNC",
        "industry": "Technology & Consulting",
        "location": "Bengaluru, India",
        "employee_count": "280,000+",
        "founded_year": 1911,
        "website": "https://www.ibm.com",
        "logo": "https://logo.clearbit.com/ibm.com",
        "rating": 4.0,
        "about": "IBM provides hybrid cloud, AI, enterprise software and technology consulting services.",
        "tech_stack": [
            "Java",
            "Python",
            "Cloud",
            "Kubernetes",
            "AI",
            "React"
        ],
        "benefits": [
            "Health benefits",
            "Learning programs",
            "Flexible work",
            "Retirement benefits"
        ]
    },

    {
        "name": "Salesforce",
        "category": "MNC",
        "industry": "Enterprise Software",
        "location": "Hyderabad, India",
        "employee_count": "70,000+",
        "founded_year": 1999,
        "website": "https://www.salesforce.com",
        "logo": "https://logo.clearbit.com/salesforce.com",
        "rating": 4.3,
        "about": "Salesforce develops cloud-based CRM and enterprise software platforms.",
        "tech_stack": [
            "Java",
            "JavaScript",
            "Apex",
            "React",
            "AWS",
            "AI"
        ],
        "benefits": [
            "Health insurance",
            "Learning budget",
            "Volunteer programs",
            "Flexible work"
        ]
    },

    # =====================================================
    # INDIAN IT COMPANIES
    # =====================================================

    {
        "name": "Tata Consultancy Services",
        "category": "MNC",
        "industry": "IT Services & Consulting",
        "location": "Mumbai, India",
        "employee_count": "600,000+",
        "founded_year": 1968,
        "website": "https://www.tcs.com",
        "logo": "https://logo.clearbit.com/tcs.com",
        "rating": 4.0,
        "about": "TCS provides IT services, consulting, digital transformation and technology solutions to organizations worldwide.",
        "tech_stack": [
            "Java",
            "Spring Boot",
            "Python",
            "React",
            "AWS",
            "Azure",
            "SQL"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Certification support",
            "Flexible benefits"
        ]
    },

    {
        "name": "Infosys",
        "category": "MNC",
        "industry": "IT Services & Consulting",
        "location": "Bengaluru, India",
        "employee_count": "320,000+",
        "founded_year": 1981,
        "website": "https://www.infosys.com",
        "logo": "https://logo.clearbit.com/infosys.com",
        "rating": 4.0,
        "about": "Infosys provides consulting, digital services and technology solutions to global enterprises.",
        "tech_stack": [
            "Java",
            "Spring Boot",
            "Python",
            "React",
            "AWS",
            "Azure",
            "SQL"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Certifications",
            "Employee wellness"
        ]
    },

    {
        "name": "Wipro",
        "category": "MNC",
        "industry": "IT Services",
        "location": "Bengaluru, India",
        "employee_count": "230,000+",
        "founded_year": 1945,
        "website": "https://www.wipro.com",
        "logo": "https://logo.clearbit.com/wipro.com",
        "rating": 3.9,
        "about": "Wipro provides technology services, consulting and digital transformation solutions.",
        "tech_stack": [
            "Java",
            "Python",
            "Cloud",
            "React",
            "DevOps",
            "SQL"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Certification support"
        ]
    },

    {
        "name": "HCLTech",
        "category": "MNC",
        "industry": "IT Services",
        "location": "Noida, India",
        "employee_count": "220,000+",
        "founded_year": 1976,
        "website": "https://www.hcltech.com",
        "logo": "https://logo.clearbit.com/hcltech.com",
        "rating": 3.9,
        "about": "HCLTech provides technology engineering, cloud, cybersecurity and digital transformation services.",
        "tech_stack": [
            "Java",
            "C++",
            "Python",
            "Cloud",
            "DevOps",
            "React"
        ],
        "benefits": [
            "Health benefits",
            "Learning programs",
            "Flexible work"
        ]
    },

    {
        "name": "Cognizant",
        "category": "MNC",
        "industry": "IT Services & Consulting",
        "location": "Chennai, India",
        "employee_count": "340,000+",
        "founded_year": 1994,
        "website": "https://www.cognizant.com",
        "logo": "https://logo.clearbit.com/cognizant.com",
        "rating": 3.9,
        "about": "Cognizant provides technology and consulting services focused on digital transformation.",
        "tech_stack": [
            "Java",
            "Spring",
            "Python",
            "React",
            "AWS",
            "Azure"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Certification support"
        ]
    },

    {
        "name": "Accenture",
        "category": "MNC",
        "industry": "Technology & Consulting",
        "location": "Bengaluru, India",
        "employee_count": "780,000+",
        "founded_year": 1989,
        "website": "https://www.accenture.com",
        "logo": "https://logo.clearbit.com/accenture.com",
        "rating": 4.0,
        "about": "Accenture provides technology, consulting and business transformation services globally.",
        "tech_stack": [
            "Java",
            "Python",
            "React",
            "Cloud",
            "SAP",
            "AI"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Certification support",
            "Flexible work"
        ]
    },

    {
        "name": "Capgemini",
        "category": "MNC",
        "industry": "IT Services & Consulting",
        "location": "Mumbai, India",
        "employee_count": "350,000+",
        "founded_year": 1967,
        "website": "https://www.capgemini.com",
        "logo": "https://logo.clearbit.com/capgemini.com",
        "rating": 3.9,
        "about": "Capgemini provides consulting, technology and digital transformation services.",
        "tech_stack": [
            "Java",
            "Python",
            "React",
            "AWS",
            "Azure",
            "SAP"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work"
        ]
    },

    # =====================================================
    # INDIAN PRODUCT / STARTUP COMPANIES
    # =====================================================

    {
        "name": "Flipkart",
        "category": "Startup",
        "industry": "E-commerce",
        "location": "Bengaluru, India",
        "employee_count": "30,000+",
        "founded_year": 2007,
        "website": "https://www.flipkart.com",
        "logo": "https://logo.clearbit.com/flipkart.com",
        "rating": 4.1,
        "about": "Flipkart is an Indian digital commerce company operating a large marketplace and technology ecosystem.",
        "tech_stack": [
            "Java",
            "Spring Boot",
            "React",
            "Python",
            "Kafka",
            "AWS",
            "MySQL"
        ],
        "benefits": [
            "Health insurance",
            "Employee discounts",
            "Learning programs",
            "Flexible work"
        ]
    },

    {
        "name": "Swiggy",
        "category": "Startup",
        "industry": "Food Delivery & Technology",
        "location": "Bengaluru, India",
        "employee_count": "5,000+",
        "founded_year": 2014,
        "website": "https://www.swiggy.com",
        "logo": "https://logo.clearbit.com/swiggy.com",
        "rating": 4.1,
        "about": "Swiggy operates a technology platform for food delivery, quick commerce and related services.",
        "tech_stack": [
            "Java",
            "Go",
            "Python",
            "React",
            "Kafka",
            "AWS",
            "Kubernetes"
        ],
        "benefits": [
            "Health insurance",
            "Learning budget",
            "Flexible work",
            "Food benefits"
        ]
    },

    {
        "name": "Zomato",
        "category": "Startup",
        "industry": "Food Technology",
        "location": "Gurugram, India",
        "employee_count": "5,000+",
        "founded_year": 2008,
        "website": "https://www.zomato.com",
        "logo": "https://logo.clearbit.com/zomato.com",
        "rating": 4.0,
        "about": "Zomato operates technology platforms connecting consumers, restaurants and delivery partners.",
        "tech_stack": [
            "Java",
            "Python",
            "React",
            "Kafka",
            "AWS",
            "Kubernetes"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs"
        ]
    },

    {
        "name": "Razorpay",
        "category": "Startup",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "employee_count": "3,000+",
        "founded_year": 2014,
        "website": "https://razorpay.com",
        "logo": "https://logo.clearbit.com/razorpay.com",
        "rating": 4.2,
        "about": "Razorpay provides payment infrastructure and financial technology products for businesses.",
        "tech_stack": [
            "Java",
            "Ruby",
            "React",
            "Kafka",
            "AWS",
            "PostgreSQL",
            "Redis"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs",
            "Wellness benefits"
        ]
    },

    {
        "name": "PhonePe",
        "category": "Startup",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "employee_count": "4,000+",
        "founded_year": 2015,
        "website": "https://www.phonepe.com",
        "logo": "https://logo.clearbit.com/phonepe.com",
        "rating": 4.1,
        "about": "PhonePe provides digital payments and financial technology services in India.",
        "tech_stack": [
            "Java",
            "Spring Boot",
            "React",
            "Kafka",
            "MySQL",
            "Redis",
            "Kubernetes"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work"
        ]
    },

    {
        "name": "Meesho",
        "category": "Startup",
        "industry": "E-commerce",
        "location": "Bengaluru, India",
        "employee_count": "5,000+",
        "founded_year": 2015,
        "website": "https://www.meesho.com",
        "logo": "https://logo.clearbit.com/meesho.com",
        "rating": 4.1,
        "about": "Meesho operates a technology-driven e-commerce marketplace focused on enabling online commerce.",
        "tech_stack": [
            "Java",
            "Go",
            "Python",
            "React",
            "Kafka",
            "AWS"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs"
        ]
    },

    {
        "name": "Groww",
        "category": "Startup",
        "industry": "Fintech & Investing",
        "location": "Bengaluru, India",
        "employee_count": "1,500+",
        "founded_year": 2016,
        "website": "https://groww.in",
        "logo": "https://logo.clearbit.com/groww.in",
        "rating": 4.2,
        "about": "Groww provides digital investment and financial products through a technology platform.",
        "tech_stack": [
            "Java",
            "Kotlin",
            "React",
            "Python",
            "AWS",
            "PostgreSQL",
            "Kafka"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work"
        ]
    },

    {
        "name": "CRED",
        "category": "Startup",
        "industry": "Fintech",
        "location": "Bengaluru, India",
        "employee_count": "1,000+",
        "founded_year": 2018,
        "website": "https://cred.club",
        "logo": "https://logo.clearbit.com/cred.club",
        "rating": 4.1,
        "about": "CRED builds financial products and experiences for creditworthy consumers.",
        "tech_stack": [
            "Java",
            "Kotlin",
            "React",
            "Python",
            "AWS",
            "Kafka"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs"
        ]
    },

    {
        "name": "Zepto",
        "category": "Startup",
        "industry": "Quick Commerce",
        "location": "Mumbai, India",
        "employee_count": "3,000+",
        "founded_year": 2021,
        "website": "https://www.zeptonow.com",
        "logo": "https://logo.clearbit.com/zeptonow.com",
        "rating": 4.0,
        "about": "Zepto operates a technology platform focused on rapid grocery and convenience delivery.",
        "tech_stack": [
            "Java",
            "Go",
            "Python",
            "React",
            "AWS",
            "Kafka",
            "Kubernetes"
        ],
        "benefits": [
            "Health insurance",
            "Flexible work",
            "Learning programs"
        ]
    },

    {
        "name": "Freshworks",
        "category": "Startup",
        "industry": "SaaS",
        "location": "Chennai, India",
        "employee_count": "5,000+",
        "founded_year": 2010,
        "website": "https://www.freshworks.com",
        "logo": "https://logo.clearbit.com/freshworks.com",
        "rating": 4.1,
        "about": "Freshworks develops cloud-based customer and employee experience software.",
        "tech_stack": [
            "Java",
            "Ruby",
            "React",
            "JavaScript",
            "AWS",
            "PostgreSQL"
        ],
        "benefits": [
            "Health insurance",
            "Remote flexibility",
            "Learning programs"
        ]
    },

    {
        "name": "Zoho",
        "category": "Startup",
        "industry": "SaaS",
        "location": "Chennai, India",
        "employee_count": "15,000+",
        "founded_year": 1996,
        "website": "https://www.zoho.com",
        "logo": "https://logo.clearbit.com/zoho.com",
        "rating": 4.1,
        "about": "Zoho develops a broad suite of cloud-based business applications for organizations.",
        "tech_stack": [
            "Java",
            "JavaScript",
            "Python",
            "React",
            "PostgreSQL",
            "Cloud"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work"
        ]
    },

    {
        "name": "BrowserStack",
        "category": "Startup",
        "industry": "Developer Tools",
        "location": "Mumbai, India",
        "employee_count": "1,000+",
        "founded_year": 2011,
        "website": "https://www.browserstack.com",
        "logo": "https://logo.clearbit.com/browserstack.com",
        "rating": 4.3,
        "about": "BrowserStack provides cloud-based testing infrastructure for developers and engineering teams.",
        "tech_stack": [
            "Java",
            "Python",
            "JavaScript",
            "React",
            "AWS",
            "Kubernetes",
            "Selenium"
        ],
        "benefits": [
            "Remote work",
            "Health insurance",
            "Learning budget",
            "Wellness programs"
        ]
    },

    {
        "name": "Postman",
        "category": "Startup",
        "industry": "Developer Tools",
        "location": "Bengaluru, India",
        "employee_count": "1,000+",
        "founded_year": 2014,
        "website": "https://www.postman.com",
        "logo": "https://logo.clearbit.com/postman.com",
        "rating": 4.2,
        "about": "Postman develops API collaboration and development tools used by engineering teams worldwide.",
        "tech_stack": [
            "JavaScript",
            "TypeScript",
            "React",
            "Node.js",
            "AWS",
            "Kubernetes"
        ],
        "benefits": [
            "Remote flexibility",
            "Health insurance",
            "Learning programs"
        ]
    },

    {
        "name": "Urban Company",
        "category": "Startup",
        "industry": "Consumer Services Technology",
        "location": "Gurugram, India",
        "employee_count": "5,000+",
        "founded_year": 2014,
        "website": "https://www.urbancompany.com",
        "logo": "https://logo.clearbit.com/urbancompany.com",
        "rating": 4.0,
        "about": "Urban Company operates a technology marketplace connecting consumers with service professionals.",
        "tech_stack": [
            "Java",
            "Kotlin",
            "React",
            "Python",
            "AWS",
            "PostgreSQL"
        ],
        "benefits": [
            "Health insurance",
            "Learning programs",
            "Flexible work"
        ]
    }
]


def seed():

    app = create_app()

    with app.app_context():

        created = 0
        skipped = 0

        for data in COMPANIES:

            existing = (
                Company.query
                .filter_by(
                    name=data["name"]
                )
                .first()
            )

            if existing:
                skipped += 1
                continue

            company = Company(
                name=data["name"],
                category=data["category"],
                industry=data["industry"],
                location=data["location"],
                employee_count=data["employee_count"],
                founded_year=data["founded_year"],
                website=data["website"],
                logo=data["logo"],
                about=data["about"],
                rating=data["rating"],
                tech_stack=data["tech_stack"],
                benefits=data["benefits"]
            )

            db.session.add(company)
            created += 1

        db.session.commit()

        print(
            f"Companies created: {created}"
        )

        print(
            f"Companies skipped: {skipped}"
        )


if __name__ == "__main__":
    seed()