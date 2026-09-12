"""
test_alt_route.py
Quick script to test the alt-route feature and see the decision summary clearly.
"""
import json
from src.routing.alt_route import suggest_safer_route

result = suggest_safer_route("Kukatpally, Hyderabad", "Ameerpet, Hyderabad")

with open("alt_route_output.json", "w") as f:
    json.dump(result, f, indent=2, default=str)

print("\n--- ALT ROUTE DECISION SUMMARY ---")
print(f"Alternate available: {result.get('alternate_available')}")
if result.get("alternate_available"):
    print(f"Should suggest alternate: {result.get('should_suggest_alternate')}")
    print(f"Primary route risk: {result.get('primary_risk')}")
    print(f"Alternate route risk: {result.get('alternate_risk')}")
    print(f"Extra time for alternate: {result.get('extra_time_minutes')} minutes")
else:
    print(f"Reason: {result.get('reason')}")
print("\nFull details saved to alt_route_output.json")