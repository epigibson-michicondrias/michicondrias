
import requests
import json

BASE_URL = "https://kowly51wia.execute-api.us-east-1.amazonaws.com"

def find_milanesillo():
    try:
        url = f"{BASE_URL}/adopciones/api/v1/adopciones/pets/"
        print(f"Fetching listings from: {url}")
        res = requests.get(url)
        res.raise_for_status()
        listings = res.json()
        
        print(f"Total listings: {len(listings)}")
        for l in listings:
            if "Milane" in l.get("name", ""):
                print(f"FOUND MILANESILLO!")
                print(json.dumps(l, indent=2))
                listing_id = l["id"]
                
                # Now check if it's in mascotas service
                m_url = f"{BASE_URL}/mascotas/api/v1/pets/adopted-from/{listing_id}"
                print(f"\nChecking mascotas service: {m_url}")
                m_res = requests.get(m_url)
                if m_res.status_code == 200:
                    print("SUCCESS: Pet record found in mascotas service!")
                    print(json.dumps(m_res.json(), indent=2))
                else:
                    print(f"FAILED: Mascotas service returned {m_res.status_code}")
                    print(m_res.text)
                return

        print("Milanesillo listing not found.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    find_milanesillo()
