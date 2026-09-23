from sentence_transformers import SentenceTransformer, util

# Load a small, free, pre-trained model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Two sentences that MEAN similar things, but use different words
sentence1 = "I have experience in team leadership"
sentence2 = "I have experience in people management"

# Two sentences that mean COMPLETELY different things
sentence3 = "I enjoy riding bicycles on weekends"

# Convert each sentence into an embedding (a list of numbers)
embedding1 = model.encode(sentence1)
embedding2 = model.encode(sentence2)
embedding3 = model.encode(sentence3)

print("Embedding for sentence 1 (first 5 numbers only):", embedding1[:5])
print("Length of the full embedding:", len(embedding1))

# Now measure how "close" these embeddings are to each other
similarity_1_2 = util.cos_sim(embedding1, embedding2)
similarity_1_3 = util.cos_sim(embedding1, embedding3)

print("\nSimilarity between 'team leadership' and 'people management':", similarity_1_2.item())
print("Similarity between 'team leadership' and 'riding bicycles':", similarity_1_3.item())