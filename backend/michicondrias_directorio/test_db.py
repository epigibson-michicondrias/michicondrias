import pg8000.native

try:
    conn = pg8000.native.Connection(
        user="user", 
        password="password", 
        host="localhost", 
        database="michicondrias_db"
    )
    print("SUCCESS")
except Exception as e:
    import traceback
    traceback.print_exc()
