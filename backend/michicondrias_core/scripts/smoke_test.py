import requests
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(name, url, method="GET"):
    print(f"Testing {name}...")
    start = time.perf_counter()
    try:
        if method == "GET":
            response = requests.get(url)
        else:
            response = requests.post(url)
        
        duration = time.perf_counter() - start
        process_time = response.headers.get("X-Process-Time", "N/A")
        print(f"  Status: {response.status_code}")
        print(f"  Total Duration: {duration:.4f}s")
        print(f"  Server Process Time: {process_time}s")
        return response.status_code == 200 or response.status_code == 401 # 401 is fine for smoke test if no auth
    except Exception as e:
        print(f"  Error: {e}")
        return False

if __name__ == "__main__":
    # Wait a second for server reload if needed
    time.sleep(1)
    
    results = [
        test_endpoint("Root", "http://localhost:8000/"),
        test_endpoint("Users List (Admin required)", f"{BASE_URL}/users/"),
        test_endpoint("Me (Auth required)", f"{BASE_URL}/users/me"),
    ]
    
    if all(results):
        print("\nSmoke test PASSED (endpoints are reachable)")
    else:
        print("\nSmoke test FAILED (some endpoints had issues)")
