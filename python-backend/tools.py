params = [
    "type", "location", "time", "date", "injuries", "deathcount",
    "weapons", "clues", "witness_count", "motive", "victim_type", "suspect_type"
]

def dictToString(d):
    """"Returns a semicolon separated string made from the dictionary having keys from params list"""
    
    value = ""
    for p in params:
        value = value + f"{p}:{d.get(p)};"
    return value