"""
Country and State Utilities

This module provides comprehensive country and state data using the pycountry library.
Includes functions to list all countries and fetch states/subdivisions for a specific country.
"""

import pycountry


def list_countries():
    """
    Get all countries with their ISO codes and names.
    
    Returns:
        list: List of dictionaries containing country code and name
    """
    countries = []
    for country in pycountry.countries:
        countries.append({
            "code": country.alpha_2,  # Two-letter ISO code (e.g., "IN")
            "name": country.name,
        })
    # Sort by name for better UX
    return sorted(countries, key=lambda x: x["name"])


def list_states(country_code):
    """
    Get all states/subdivisions for a specific country.
    
    Args:
        country_code (str): Two-letter ISO country code (e.g., "IN", "US")
    
    Returns:
        list: List of dictionaries containing state code and name.
              Returns empty list if country has no subdivisions.
    """
    states = []
    try:
        # Get subdivisions for this country
        subdivisions = pycountry.subdivisions.get(country_code=country_code)
        
        for subdivision in subdivisions:
            # Only add first-level subdivisions (states, provinces, regions)
            # Skip second-level subdivisions (counties, districts, etc.)
            if subdivision.parent_code is None:
                states.append({
                    "code": subdivision.code,
                    "name": subdivision.name,
                })
        
        # Sort by name for better UX
        return sorted(states, key=lambda x: x["name"])
    except (KeyError, LookupError):
        # Country code not found or has no subdivisions
        return []


def validate_country(country_code_or_name):
    """
    Validate and normalize a country input (code or name).
    
    Args:
        country_code_or_name (str): Country code or country name
    
    Returns:
        dict: Dictionary with 'code' and 'name' if valid
        None: If invalid country
    """
    try:
        # Try to find by alpha_2 code
        country = pycountry.countries.get(alpha_2=country_code_or_name.upper())
        if country:
            return {"code": country.alpha_2, "name": country.name}
        
        # Try to find by name
        country = pycountry.countries.get(name=country_code_or_name)
        if country:
            return {"code": country.alpha_2, "name": country.name}
        
        # Try fuzzy search
        search_results = pycountry.countries.search_fuzzy(country_code_or_name)
        if search_results:
            country = search_results[0]
            return {"code": country.alpha_2, "name": country.name}
            
    except (KeyError, LookupError):
        pass
    
    return None


def validate_state(state_code_or_name, country_code):
    """
    Validate and normalize a state/subdivision input.
    
    Args:
        state_code_or_name (str): State code or state name
        country_code (str): Two-letter ISO country code
    
    Returns:
        dict: Dictionary with 'code' and 'name' if valid
        None: If invalid state
    """
    import unicodedata
    
    def normalize_string(s):
        """Normalize string by removing diacritics for comparison."""
        # Normalize to NFD (decomposed form) and remove combining characters
        return ''.join(
            c for c in unicodedata.normalize('NFD', s)
            if unicodedata.category(c) != 'Mn'
        ).lower()
    
    try:
        # Get subdivisions for this country
        subdivisions = pycountry.subdivisions.get(country_code=country_code)
        
        # Normalize input for comparison
        normalized_input = normalize_string(state_code_or_name)
        
        for subdivision in subdivisions:
            # Match by code (exact match)
            if subdivision.code.upper() == state_code_or_name.upper():
                return {"code": subdivision.code, "name": subdivision.name}
            
            # Match by name (normalized comparison to handle diacritics)
            if normalize_string(subdivision.name) == normalized_input:
                return {"code": subdivision.code, "name": subdivision.name}
        
    except (KeyError, LookupError):
        pass
    
    return None
