import { db, withTransaction } from '../src/db.js';

const jobs = [
  ['Backend Engineer', 'Acme', 'Build APIs and services.', ['node.js', 'javascript', 'sql', 'rest api'], ['express', 'postgresql', 'docker', 'testing']],
  ['Data Analyst', 'Globex', 'Analyze business and product data.', ['sql', 'python', 'data analysis', 'excel'], ['tableau', 'power bi', 'statistics', 'etl']],
  ['Product Designer', 'Initech', 'Design accessible product experiences.', ['figma', 'user research', 'prototyping', 'accessibility'], ['wireframes', 'usability testing', 'design systems', 'ux']]
];
const insert = db.prepare('INSERT INTO jobs (id,title,company,description,required_skills,keywords) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET title=excluded.title, company=excluded.company, description=excluded.description, required_skills=excluded.required_skills, keywords=excluded.keywords');
withTransaction(() => jobs.forEach(([title, company, description, skills, keywords], index) => insert.run(index + 1, title, company, description, JSON.stringify(skills), JSON.stringify(keywords))));
const upsertSkill = db.prepare('INSERT INTO skills (name,normalized_name) VALUES (?,?) ON CONFLICT(normalized_name) DO NOTHING');
withTransaction(() => jobs.flatMap(([, , , skills, keywords]) => [...skills, ...keywords]).forEach(skill => upsertSkill.run(skill, skill.toLowerCase())));
console.log(`Backfilled ${jobs.length} seeded jobs with required_skills and keywords.`);
