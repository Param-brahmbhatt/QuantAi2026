"""
Custom validators for Survey question types
Validation functions return (is_valid, error_message) tuple
"""

from django.core.validators import EmailValidator, URLValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from phone_field import PhoneNumber
import re
import math


def validate_email_answer(value):
    """
    Validate email address format using Django's EmailValidator

    Args:
        value: The input value to validate (should be string)

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_email_answer("user@example.com")
        (True, None)
        >>> validate_email_answer("invalid-email")
        (False, "Enter a valid email address")
    """
    if not value:
        return False, "Email address is required"

    if not isinstance(value, str):
        return False, "Email must be a string"

    validator = EmailValidator(message="Enter a valid email address")
    try:
        validator(value.strip())
        return True, None
    except DjangoValidationError as e:
        return False, str(e.message)


def validate_phone_answer(value):
    """
    Validate phone number using django-phone-field library

    Args:
        value: The input value to validate (string phone number)

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_phone_answer("+14155552671")
        (True, None)
        >>> validate_phone_answer("abc123")
        (False, "Invalid phone number format")
    """
    if not value:
        return False, "Phone number is required"

    if not isinstance(value, str):
        return False, "Phone number must be a string"

    try:
        # PhoneNumber class from phone_field validates format
        phone = PhoneNumber(value.strip())
        if not phone.is_standard:
            return False, "Invalid phone number format"
        return True, None
    except Exception as e:
        return False, f"Invalid phone number: {str(e)}"


def validate_url_answer(value):
    """
    Validate URL format using Django's URLValidator

    Args:
        value: The input value to validate (string URL)

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_url_answer("https://example.com")
        (True, None)
        >>> validate_url_answer("example.com")
        (False, "Enter a valid URL...")
    """
    if not value:
        return False, "URL is required"

    if not isinstance(value, str):
        return False, "URL must be a string"

    # URLValidator accepts http, https schemes
    validator = URLValidator(
        schemes=['http', 'https'],
        message="Enter a valid URL (must start with http:// or https://)"
    )

    try:
        validator(value.strip())
        return True, None
    except DjangoValidationError as e:
        return False, str(e.message)


def validate_number_answer(value, min_value=None, max_value=None):
    """
    Validate numeric input with optional range constraints

    Args:
        value: The input value to validate (should be numeric)
        min_value: Optional minimum allowed value
        max_value: Optional maximum allowed value

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_number_answer(42)
        (True, None)
        >>> validate_number_answer("not a number")
        (False, "Value must be a valid number")
        >>> validate_number_answer(5, min_value=10)
        (False, "Number must be at least 10")
    """
    if value is None:
        return False, "Number is required"

    # Try to convert to float for validation
    try:
        num = float(value)
    except (TypeError, ValueError):
        return False, "Value must be a valid number"

    # Check if it's a valid number (not NaN or Infinity)
    if math.isnan(num) or math.isinf(num):
        return False, "Value must be a finite number"

    # Range validation (for future use when Question model has config)
    if min_value is not None and num < min_value:
        return False, f"Number must be at least {min_value}"

    if max_value is not None and num > max_value:
        return False, f"Number must be at most {max_value}"

    return True, None


def validate_address_answer(value):
    """
    Validate address JSON structure
    Expected format: {
        "street": "string",
        "city": "string",
        "state": "string",
        "zip": "string",
        "country": "string"
    }

    Args:
        value: The input value to validate (should be dict/JSON)

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_address_answer({"street": "123 Main St", "city": "Springfield",
        ...                           "state": "IL", "zip": "62701", "country": "USA"})
        (True, None)
        >>> validate_address_answer({"street": "123 Main St"})
        (False, "Missing required address fields: ...")
    """
    if not value:
        return False, "Address is required"

    if not isinstance(value, dict):
        return False, "Address must be a JSON object"

    # Required fields
    required_fields = ['street', 'city', 'state', 'zip', 'country']

    # Check all required fields present
    missing_fields = [field for field in required_fields if field not in value]
    if missing_fields:
        return False, f"Missing required address fields: {', '.join(missing_fields)}"

    # Validate each field is non-empty string
    for field in required_fields:
        if not isinstance(value[field], str) or not value[field].strip():
            return False, f"Address field '{field}' must be a non-empty string"

    # Optional: Validate ZIP code format (basic check)
    zip_code = value['zip'].strip()
    if not re.match(r'^[A-Za-z0-9\s\-]{3,10}$', zip_code):
        return False, "Invalid ZIP/postal code format"

    return True, None


def validate_contact_info_answer(value):
    """
    Validate contact information JSON structure with sub-field validation
    Expected format: {
        "name": "string",
        "email": "string (valid email)",
        "phone": "string (valid phone)"
    }

    Args:
        value: The input value to validate (should be dict/JSON)

    Returns:
        tuple: (is_valid, error_message)

    Examples:
        >>> validate_contact_info_answer({"name": "John Doe", "email": "john@example.com",
        ...                                "phone": "+1234567890"})
        (True, None)
        >>> validate_contact_info_answer({"name": "John", "email": "invalid", "phone": "+123"})
        (False, "Contact email invalid: ...")
    """
    if not value:
        return False, "Contact information is required"

    if not isinstance(value, dict):
        return False, "Contact information must be a JSON object"

    # Required fields
    required_fields = ['name', 'email', 'phone']

    # Check all required fields present
    missing_fields = [field for field in required_fields if field not in value]
    if missing_fields:
        return False, f"Missing required contact fields: {', '.join(missing_fields)}"

    # Validate name (non-empty string)
    if not isinstance(value['name'], str) or not value['name'].strip():
        return False, "Contact name must be a non-empty string"

    # Validate email using email validator
    email_valid, email_error = validate_email_answer(value['email'])
    if not email_valid:
        return False, f"Contact email invalid: {email_error}"

    # Validate phone using phone validator
    phone_valid, phone_error = validate_phone_answer(value['phone'])
    if not phone_valid:
        return False, f"Contact phone invalid: {phone_error}"

    return True, None