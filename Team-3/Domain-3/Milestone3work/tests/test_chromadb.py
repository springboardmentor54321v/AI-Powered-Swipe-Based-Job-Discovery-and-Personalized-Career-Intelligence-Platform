import chromadb

# Create a ChromaDB client - this stores everything in memory for now (temporary, just for testing)
client = chromadb.Client()

# Create a "collection" - think of this like a table specifically for storing embeddings
collection = client.create_collection(name="test_jobs")

# Let's pretend these are 4 job descriptions
job_descriptions = [
    "Looking for a backend developer with Python and Django experience",
    "Seeking a frontend developer skilled in React and JavaScript",
    "Need a data analyst experienced in SQL and Excel reporting",
    "Hiring a machine learning engineer with Python and PyTorch skills"
]

job_ids = ["job1", "job2", "job3", "job4"]

# Add these jobs into ChromaDB
# ChromaDB automatically converts the text into embeddings behind the scenes
collection.add(
    documents=job_descriptions,
    ids=job_ids
)

print("Added 4 jobs into ChromaDB.\n")

# Now let's pretend this is a resume's summary text
resume_text = "Experienced Python developer who has built REST APIs using Django"

# Ask ChromaDB: "which jobs are closest in MEANING to this resume?"
results = collection.query(
    query_texts=[resume_text],
    n_results=2  # give me the top 2 closest matches
)

print("Resume text:", resume_text)
print("\nTop matching jobs:")
for job_id, job_text, distance in zip(results['ids'][0], results['documents'][0], results['distances'][0]):
    print(f"  {job_id}: \"{job_text}\" (distance: {distance:.4f})")