from django.test import TestCase
from .validators import (
    validate_email_answer,
    validate_phone_answer,
    validate_url_answer,
    validate_number_answer,
    validate_address_answer,
    validate_contact_info_answer
)


class EmailValidatorTests(TestCase):
    """Tests for email validation"""

    def test_valid_email(self):
        """Test that valid email addresses pass validation"""
        is_valid, error = validate_email_answer("user@example.com")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_email_with_subdomain(self):
        """Test email with subdomain"""
        is_valid, error = validate_email_answer("user@mail.example.com")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_email_with_plus(self):
        """Test email with plus addressing"""
        is_valid, error = validate_email_answer("user+tag@example.com")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_invalid_email_no_at(self):
        """Test that email without @ symbol fails"""
        is_valid, error = validate_email_answer("userexample.com")
        self.assertFalse(is_valid)
        self.assertIsNotNone(error)

    def test_invalid_email_no_domain(self):
        """Test that email without domain fails"""
        is_valid, error = validate_email_answer("user@")
        self.assertFalse(is_valid)
        self.assertIsNotNone(error)

    def test_empty_email(self):
        """Test that empty email fails"""
        is_valid, error = validate_email_answer("")
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_none_email(self):
        """Test that None email fails"""
        is_valid, error = validate_email_answer(None)
        self.assertFalse(is_valid)

    def test_email_with_whitespace(self):
        """Test that email with surrounding whitespace is accepted (stripped)"""
        is_valid, error = validate_email_answer("  user@example.com  ")
        self.assertTrue(is_valid)

    def test_email_not_string(self):
        """Test that non-string email fails"""
        is_valid, error = validate_email_answer(12345)
        self.assertFalse(is_valid)
        self.assertIn("string", error.lower())


class PhoneValidatorTests(TestCase):
    """Tests for phone number validation"""

    def test_valid_international_phone(self):
        """Test valid international phone number"""
        is_valid, error = validate_phone_answer("+14155552671")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_phone_with_country_code(self):
        """Test phone with country code"""
        is_valid, error = validate_phone_answer("+12025551234")
        self.assertTrue(is_valid)

    def test_invalid_phone_letters(self):
        """Test that phone with letters fails"""
        is_valid, error = validate_phone_answer("abc123")
        self.assertFalse(is_valid)

    def test_empty_phone(self):
        """Test that empty phone fails"""
        is_valid, error = validate_phone_answer("")
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_none_phone(self):
        """Test that None phone fails"""
        is_valid, error = validate_phone_answer(None)
        self.assertFalse(is_valid)

    def test_phone_not_string(self):
        """Test that non-string phone fails"""
        is_valid, error = validate_phone_answer(1234567890)
        self.assertFalse(is_valid)
        self.assertIn("string", error.lower())

    def test_phone_with_whitespace(self):
        """Test phone with surrounding whitespace"""
        is_valid, error = validate_phone_answer("  +14155552671  ")
        self.assertTrue(is_valid)

    def test_very_short_phone(self):
        """Test that very short phone number fails"""
        is_valid, error = validate_phone_answer("+123")
        self.assertFalse(is_valid)


class URLValidatorTests(TestCase):
    """Tests for URL validation"""

    def test_valid_https_url(self):
        """Test valid HTTPS URL"""
        is_valid, error = validate_url_answer("https://example.com")
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_http_url(self):
        """Test valid HTTP URL"""
        is_valid, error = validate_url_answer("http://example.com")
        self.assertTrue(is_valid)

    def test_valid_url_with_path(self):
        """Test URL with path"""
        is_valid, error = validate_url_answer("https://example.com/path/to/page")
        self.assertTrue(is_valid)

    def test_valid_url_with_query(self):
        """Test URL with query parameters"""
        is_valid, error = validate_url_answer("https://example.com?param=value")
        self.assertTrue(is_valid)

    def test_invalid_url_no_scheme(self):
        """Test that URL without scheme fails"""
        is_valid, error = validate_url_answer("example.com")
        self.assertFalse(is_valid)

    def test_invalid_url_ftp(self):
        """Test that FTP scheme is not allowed"""
        is_valid, error = validate_url_answer("ftp://example.com")
        self.assertFalse(is_valid)

    def test_empty_url(self):
        """Test that empty URL fails"""
        is_valid, error = validate_url_answer("")
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_none_url(self):
        """Test that None URL fails"""
        is_valid, error = validate_url_answer(None)
        self.assertFalse(is_valid)

    def test_url_not_string(self):
        """Test that non-string URL fails"""
        is_valid, error = validate_url_answer(12345)
        self.assertFalse(is_valid)

    def test_url_with_whitespace(self):
        """Test URL with surrounding whitespace"""
        is_valid, error = validate_url_answer("  https://example.com  ")
        self.assertTrue(is_valid)


class NumberValidatorTests(TestCase):
    """Tests for number validation"""

    def test_valid_integer(self):
        """Test valid integer"""
        is_valid, error = validate_number_answer(42)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_float(self):
        """Test valid float"""
        is_valid, error = validate_number_answer(3.14)
        self.assertTrue(is_valid)

    def test_valid_negative_number(self):
        """Test valid negative number"""
        is_valid, error = validate_number_answer(-10)
        self.assertTrue(is_valid)

    def test_valid_zero(self):
        """Test that zero is valid"""
        is_valid, error = validate_number_answer(0)
        self.assertTrue(is_valid)

    def test_valid_string_number(self):
        """Test that string representation of number is valid"""
        is_valid, error = validate_number_answer("42")
        self.assertTrue(is_valid)

    def test_invalid_string(self):
        """Test that non-numeric string fails"""
        is_valid, error = validate_number_answer("not a number")
        self.assertFalse(is_valid)
        self.assertIn("valid number", error.lower())

    def test_none_number(self):
        """Test that None fails"""
        is_valid, error = validate_number_answer(None)
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_nan_value(self):
        """Test that NaN fails"""
        is_valid, error = validate_number_answer(float('nan'))
        self.assertFalse(is_valid)
        self.assertIn("finite", error.lower())

    def test_infinity_value(self):
        """Test that Infinity fails"""
        is_valid, error = validate_number_answer(float('inf'))
        self.assertFalse(is_valid)
        self.assertIn("finite", error.lower())

    def test_min_value_constraint(self):
        """Test that number below minimum fails"""
        is_valid, error = validate_number_answer(5, min_value=10)
        self.assertFalse(is_valid)
        self.assertIn("at least 10", error)

    def test_max_value_constraint(self):
        """Test that number above maximum fails"""
        is_valid, error = validate_number_answer(100, max_value=50)
        self.assertFalse(is_valid)
        self.assertIn("at most 50", error)

    def test_within_range(self):
        """Test number within min/max range"""
        is_valid, error = validate_number_answer(25, min_value=10, max_value=50)
        self.assertTrue(is_valid)


class AddressValidatorTests(TestCase):
    """Tests for address validation"""

    def test_valid_address(self):
        """Test valid complete address"""
        address = {
            "street": "123 Main St",
            "city": "Springfield",
            "state": "IL",
            "zip": "62701",
            "country": "USA"
        }
        is_valid, error = validate_address_answer(address)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_valid_international_address(self):
        """Test valid international address"""
        address = {
            "street": "10 Downing Street",
            "city": "London",
            "state": "England",
            "zip": "SW1A 2AA",
            "country": "United Kingdom"
        }
        is_valid, error = validate_address_answer(address)
        self.assertTrue(is_valid)

    def test_missing_field(self):
        """Test address with missing field"""
        address = {
            "street": "123 Main St",
            "city": "Springfield",
            # Missing state, zip, country
        }
        is_valid, error = validate_address_answer(address)
        self.assertFalse(is_valid)
        self.assertIn("Missing required", error)

    def test_empty_field(self):
        """Test address with empty field"""
        address = {
            "street": "",
            "city": "Springfield",
            "state": "IL",
            "zip": "62701",
            "country": "USA"
        }
        is_valid, error = validate_address_answer(address)
        self.assertFalse(is_valid)
        self.assertIn("non-empty string", error)

    def test_whitespace_only_field(self):
        """Test address with whitespace-only field"""
        address = {
            "street": "   ",
            "city": "Springfield",
            "state": "IL",
            "zip": "62701",
            "country": "USA"
        }
        is_valid, error = validate_address_answer(address)
        self.assertFalse(is_valid)

    def test_none_address(self):
        """Test that None address fails"""
        is_valid, error = validate_address_answer(None)
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_not_dict(self):
        """Test that non-dict address fails"""
        is_valid, error = validate_address_answer("123 Main St")
        self.assertFalse(is_valid)
        self.assertIn("JSON object", error)

    def test_invalid_zip_format(self):
        """Test address with invalid ZIP format"""
        address = {
            "street": "123 Main St",
            "city": "Springfield",
            "state": "IL",
            "zip": "!@#$%",
            "country": "USA"
        }
        is_valid, error = validate_address_answer(address)
        self.assertFalse(is_valid)
        self.assertIn("ZIP", error)

    def test_non_string_field(self):
        """Test address with non-string field"""
        address = {
            "street": 123,  # Should be string
            "city": "Springfield",
            "state": "IL",
            "zip": "62701",
            "country": "USA"
        }
        is_valid, error = validate_address_answer(address)
        self.assertFalse(is_valid)


class ContactInfoValidatorTests(TestCase):
    """Tests for contact info validation"""

    def test_valid_contact_info(self):
        """Test valid complete contact info"""
        contact = {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+14155552671"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertTrue(is_valid)
        self.assertIsNone(error)

    def test_invalid_email_in_contact(self):
        """Test contact info with invalid email"""
        contact = {
            "name": "John Doe",
            "email": "invalid-email",
            "phone": "+1234567890"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        self.assertIn("email invalid", error.lower())

    def test_invalid_phone_in_contact(self):
        """Test contact info with invalid phone"""
        contact = {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "abc"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        self.assertIn("phone invalid", error.lower())

    def test_empty_name(self):
        """Test contact info with empty name"""
        contact = {
            "name": "",
            "email": "john@example.com",
            "phone": "+1234567890"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        self.assertIn("name", error.lower())

    def test_whitespace_only_name(self):
        """Test contact info with whitespace-only name"""
        contact = {
            "name": "   ",
            "email": "john@example.com",
            "phone": "+1234567890"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)

    def test_missing_field(self):
        """Test contact info with missing field"""
        contact = {
            "name": "John Doe",
            "email": "john@example.com"
            # Missing phone
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        self.assertIn("Missing required", error)

    def test_none_contact_info(self):
        """Test that None contact info fails"""
        is_valid, error = validate_contact_info_answer(None)
        self.assertFalse(is_valid)
        self.assertIn("required", error.lower())

    def test_not_dict(self):
        """Test that non-dict contact info fails"""
        is_valid, error = validate_contact_info_answer("John Doe")
        self.assertFalse(is_valid)
        self.assertIn("JSON object", error)

    def test_non_string_name(self):
        """Test contact info with non-string name"""
        contact = {
            "name": 123,  # Should be string
            "email": "john@example.com",
            "phone": "+1234567890"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        self.assertIn("name", error.lower())

    def test_all_fields_invalid(self):
        """Test contact info with all fields invalid"""
        contact = {
            "name": "",
            "email": "invalid",
            "phone": "abc"
        }
        is_valid, error = validate_contact_info_answer(contact)
        self.assertFalse(is_valid)
        # Should fail on name first (checked before email/phone)
        self.assertIn("name", error.lower())