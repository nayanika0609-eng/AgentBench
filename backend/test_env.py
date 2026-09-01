from dotenv import load_dotenv
import os

loaded = load_dotenv()

print("Loaded:", loaded)
print("DATABASE_URL:", repr(os.getenv("DATABASE_URL")))