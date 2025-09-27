import json
import random
from datetime import datetime, timedelta

# --- Configuration based on your plan ---
DATASET_SIZE = 5000
FEELING_WEIGHTS = {
    "bored": 0.4,
    "fatigued": 0.3,
    "neutral": 0.3
}
RELAPSE_BIAS = {
    "fatigued": 0.60, # 60% chance of relapse if fatigued
    "bored": 0.30,    # 30% chance of relapse if bored
    "neutral": 0.20   # 20% chance of relapse if neutral
}
# --- End Configuration ---

events = []

# Get the list of feelings from the weights dictionary
feelings = list(FEELING_WEIGHTS.keys())
weights = list(FEELING_WEIGHTS.values())

for i in range(1, DATASET_SIZE + 1):
    # 1. Generate a random timestamp within the last 30 days
    random_days_ago = random.randint(0, 30)
    random_hour = random.randint(0, 23)
    timestamp = datetime.now() - timedelta(days=random_days_ago, hours=random_hour)

    # 2. Randomize feeling based on weighted probabilities
    chosen_feeling = random.choices(feelings, weights=weights, k=1)[0]

    # 3. Assign outcome with bias based on the chosen feeling
    outcome = "resisted" # Default outcome
    if random.random() < RELAPSE_BIAS[chosen_feeling]:
        outcome = "relapsed"

    # 4. Generate other data points
    intensity = max(1, min(5, int(random.normalvariate(3, 1)))) # Normal distribution around 3
    current_streak = 0 if outcome == "relapsed" else random.randint(1, 50)
    longest_streak = random.randint(current_streak, 100) # Longest streak must be >= current

    # 5. Assemble the JSON object
    event = {
        "event_id": str(i),
        "timestamp": timestamp.isoformat() + "Z",
        "urge": {
            "outcome": outcome,
            "feeling": chosen_feeling,
            "intensity": intensity
        },
        "streak": {
            "current_streak_days": current_streak,
            "longest_streak_days": longest_streak
        },
        "meta": {
            "location_context": "home" # Example static value
        }
    }
    events.append(event)

# Prepare the final JSON structure
final_data = {
    "user_id": "synthetic_user_01",
    "events": events
}

# 6. Write the data to a file
with open("synthetic_data.json", "w") as f:
    json.dump(final_data, f, indent=2)

print(f"Successfully generated {DATASET_SIZE} events in 'synthetic_data.json'")