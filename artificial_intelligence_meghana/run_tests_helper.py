import subprocess
res = subprocess.run(['venv/Scripts/python', '-m', 'unittest', 'tests/test_day2_intern4.py', '-v'], capture_output=True, text=True)
with open('test_err.txt', 'w') as f:
    f.write(res.stderr)
print("Done")
