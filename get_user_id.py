
import psycopg2
conn = psycopg2.connect('postgresql://neondb_owner:npg_QjveaCY3fGb4@ep-jolly-mouse-aihvxmyi-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require')
cur = conn.cursor()
cur.execute("SELECT id, email FROM users WHERE email = 'hackminor@live.com.mx'")
print(cur.fetchone())
cur.close()
conn.close()
