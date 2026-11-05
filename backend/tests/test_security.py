import os
import unittest
from unittest.mock import Mock, patch


os.environ.setdefault("TOKEN_SECRET", "test-token-secret-that-is-long-enough")
os.environ.setdefault("SUPABASE_URL", "https://example.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")

from app.services import auth_services, lender_services


class TokenSecretTests(unittest.TestCase):
    def test_weak_token_secret_is_rejected(self):
        with self.assertRaises(RuntimeError):
            auth_services._validate_token_secret("dev-secret-change-me")

    def test_long_token_secret_is_accepted(self):
        self.assertEqual(
            auth_services._validate_token_secret("x" * 32),
            "x" * 32,
        )

    def test_tampered_token_is_rejected(self):
        token = auth_services.create_token("user-1", "borrower")
        body, signature = token.split(".")
        forged = f"{body}.{signature[:-1]}x"
        self.assertIsNone(auth_services.verify_token(forged))


class LenderAuthorizationTests(unittest.TestCase):
    @patch.object(lender_services, "supabase")
    def test_missing_lender_borrower_relationship_is_forbidden(self, supabase):
        response = Mock(data=[])
        supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.in_.return_value.limit.return_value.execute.return_value = response

        with self.assertRaisesRegex(Exception, "Not authorized"):
            lender_services._verify_lender_borrower_relationship("lender-1", "borrower-1")

    @patch.object(lender_services, "supabase")
    def test_requested_relationship_is_allowed(self, supabase):
        response = Mock(data=[{"id": "loan-1"}])
        supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.in_.return_value.limit.return_value.execute.return_value = response

        lender_services._verify_lender_borrower_relationship("lender-1", "borrower-1")


if __name__ == "__main__":
    unittest.main()
