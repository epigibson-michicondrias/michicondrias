import os

import psycopg2
conn = psycopg2.connect(os.environ["DATABASE_URL"])
cur = conn.cursor()
cur.execute("SELECT id, email FROM users WHERE email = 'hackminor@live.com.mx'")
print(cur.fetchone())
cur.close()
conn.close()
