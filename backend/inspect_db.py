import sqlite3

conn = sqlite3.connect("ladli_v2.db")
cur = conn.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
tables = [r[0] for r in cur.fetchall()]
print("TABLES:", tables)

for t in tables:
    print(f"\n--- {t} ---")
    cur.execute(f"PRAGMA table_info({t})")
    for row in cur.fetchall():
        print(row)

# Also check alembic_version
try:
    cur.execute("SELECT * FROM alembic_version")
    print("\nALEMBIC VERSION:", cur.fetchall())
except Exception as e:
    print("\nalembic_version table error:", e)

conn.close()
