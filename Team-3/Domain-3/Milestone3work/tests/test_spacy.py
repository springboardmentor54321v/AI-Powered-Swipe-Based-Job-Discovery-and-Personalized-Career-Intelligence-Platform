import spacy

nlp = spacy.load("en_core_web_sm")

text = "Nandhini has experience in Python, SQL, and Django development."
doc = nlp(text)

print("Tokens found:")
for token in doc:
    print(f"  {token.text}")

print("\nNamed entities found:")
for ent in doc.ents:
    print(f"  {ent.text} -> {ent.label_}")