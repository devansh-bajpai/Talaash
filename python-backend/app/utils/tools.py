params = ["name", "age", "place", "crime_type"]
def dictToString(d):
    """"Returns a semicolon separated string made from the dictionary having keys from params list"""
    
    value = ""
    for p in params:
        value = value + f"{p}:{d.get(p)};"
    return value