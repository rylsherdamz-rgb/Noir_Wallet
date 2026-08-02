//! Integer money. No floating point anywhere in this service's money path.
//!
//! The previous code carried three mutually incompatible conventions —
//! `amount_cents * 1000` on the way in, `amount_stroops / 10` on the way out,
//! and `/ 10_000_000` for balances — plus `as_f64()` parsing of PDAX amounts.
//! At most one of those could have been right.
//!
//! One convention now: **integer minor units, with an explicit scale**.
//!
//! * PHP is scale 2 (centavos). `150000` is ₱1,500.00.
//! * Stellar assets are scale 7 (stroops). `10_000_000` is 1.0000000.
//!
//! Conversion to and from the decimal strings PDAX exchanges happens only at
//! the edge, through the two functions here.

use crate::errors::{PaymentError, Result};

/// PHP centavos.
pub const PHP_SCALE: u32 = 2;

/// Stellar's fixed 7 decimal places, for both native XLM and Stellar-issued
/// USDC.
pub const CRYPTO_SCALE: u32 = 7;

/// Render integer minor units as the decimal string PDAX expects.
///
/// `to_decimal_string(150000, 2)` is `"1500.00"`.
pub fn to_decimal_string(minor: i64, scale: u32) -> String {
    let divisor = 10i128.pow(scale);
    let sign = if minor < 0 { "-" } else { "" };
    // `unsigned_abs` via i128 rather than `abs`, so i64::MIN does not panic.
    let abs = (minor as i128).unsigned_abs();
    let whole = abs / divisor as u128;
    let frac = abs % divisor as u128;
    format!("{sign}{whole}.{frac:0width$}", width = scale as usize)
}

/// Parse a decimal string from a PDAX response into integer minor units.
///
/// Rejects anything it cannot represent exactly rather than rounding silently:
/// more fractional digits than `scale` is an error, not a truncation. That is
/// the whole point of not using `as_f64().unwrap_or(0.0)`, which turned both a
/// malformed response and a genuine zero into the same `0.0`.
pub fn parse_decimal(input: &str, scale: u32) -> Result<i64> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err(PaymentError::InvalidPayload(
            "Empty amount string".to_string(),
        ));
    }

    let (negative, digits) = match trimmed.strip_prefix('-') {
        Some(rest) => (true, rest),
        None => (false, trimmed.strip_prefix('+').unwrap_or(trimmed)),
    };

    let (whole_str, frac_str) = match digits.split_once('.') {
        Some((w, f)) => (w, f),
        None => (digits, ""),
    };

    if whole_str.is_empty() && frac_str.is_empty() {
        return Err(PaymentError::InvalidPayload(format!(
            "Malformed amount: {input}"
        )));
    }
    if !whole_str.bytes().all(|b| b.is_ascii_digit())
        || !frac_str.bytes().all(|b| b.is_ascii_digit())
    {
        return Err(PaymentError::InvalidPayload(format!(
            "Non-numeric amount: {input}"
        )));
    }
    if frac_str.len() > scale as usize {
        return Err(PaymentError::InvalidPayload(format!(
            "Amount {input} has more than {scale} decimal places"
        )));
    }

    let whole: i128 = if whole_str.is_empty() {
        0
    } else {
        whole_str
            .parse()
            .map_err(|_| PaymentError::InvalidPayload(format!("Amount out of range: {input}")))?
    };

    let mut frac: i128 = 0;
    if !frac_str.is_empty() {
        frac = frac_str
            .parse()
            .map_err(|_| PaymentError::InvalidPayload(format!("Amount out of range: {input}")))?;
        // Right-pad, so "1.5" at scale 2 is 50 centavos rather than 5.
        frac *= 10i128.pow(scale - frac_str.len() as u32);
    }

    let divisor = 10i128.pow(scale);
    let total = whole
        .checked_mul(divisor)
        .and_then(|w| w.checked_add(frac))
        .ok_or_else(|| PaymentError::InvalidPayload(format!("Amount overflows: {input}")))?;

    let signed = if negative { -total } else { total };
    i64::try_from(signed)
        .map_err(|_| PaymentError::InvalidPayload(format!("Amount out of i64 range: {input}")))
}

/// Pull a decimal amount out of a PDAX JSON response. PDAX is inconsistent
/// about whether a numeric field arrives as a JSON string or a JSON number, so
/// both are accepted — but a JSON number is rendered through its own
/// serializer rather than through `as_f64`, to avoid a binary-float round trip.
pub fn parse_json_amount(value: &serde_json::Value, scale: u32) -> Result<i64> {
    match value {
        serde_json::Value::String(s) => parse_decimal(s, scale),
        serde_json::Value::Number(n) => parse_decimal(&n.to_string(), scale),
        serde_json::Value::Null => Err(PaymentError::PdaxApiError(
            "Expected an amount, found null".to_string(),
        )),
        other => Err(PaymentError::PdaxApiError(format!(
            "Expected an amount, found {other}"
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn renders_php_centavos() {
        assert_eq!(to_decimal_string(150_000, PHP_SCALE), "1500.00");
        assert_eq!(to_decimal_string(1, PHP_SCALE), "0.01");
        assert_eq!(to_decimal_string(0, PHP_SCALE), "0.00");
        assert_eq!(to_decimal_string(-2550, PHP_SCALE), "-25.50");
    }

    #[test]
    fn renders_stellar_stroops() {
        assert_eq!(to_decimal_string(10_000_000, CRYPTO_SCALE), "1.0000000");
        assert_eq!(to_decimal_string(1, CRYPTO_SCALE), "0.0000001");
        assert_eq!(to_decimal_string(25_500_000, CRYPTO_SCALE), "2.5500000");
    }

    #[test]
    fn parses_decimal_strings() {
        assert_eq!(parse_decimal("1500.00", PHP_SCALE).unwrap(), 150_000);
        assert_eq!(parse_decimal("1500", PHP_SCALE).unwrap(), 150_000);
        assert_eq!(parse_decimal("0.01", PHP_SCALE).unwrap(), 1);
        assert_eq!(parse_decimal("-25.50", PHP_SCALE).unwrap(), -2550);
        assert_eq!(parse_decimal("  12.34  ", PHP_SCALE).unwrap(), 1234);
    }

    #[test]
    fn right_pads_short_fractions() {
        // "1.5" is one peso fifty, not one peso five centavos.
        assert_eq!(parse_decimal("1.5", PHP_SCALE).unwrap(), 150);
        assert_eq!(parse_decimal("1.5", CRYPTO_SCALE).unwrap(), 15_000_000);
    }

    #[test]
    fn round_trips() {
        for minor in [0i64, 1, 99, 150_000, 123_456_789] {
            let s = to_decimal_string(minor, CRYPTO_SCALE);
            assert_eq!(parse_decimal(&s, CRYPTO_SCALE).unwrap(), minor);
        }
    }

    #[test]
    fn rejects_excess_precision_instead_of_truncating() {
        // Silently dropping a centavo is how money goes missing.
        assert!(parse_decimal("1.005", PHP_SCALE).is_err());
        assert!(parse_decimal("0.00000001", CRYPTO_SCALE).is_err());
    }

    #[test]
    fn rejects_garbage() {
        assert!(parse_decimal("", PHP_SCALE).is_err());
        assert!(parse_decimal("abc", PHP_SCALE).is_err());
        assert!(parse_decimal("1.2.3", PHP_SCALE).is_err());
        assert!(parse_decimal("1,500.00", PHP_SCALE).is_err());
        assert!(parse_decimal(".", PHP_SCALE).is_err());
    }

    #[test]
    fn rejects_overflow_rather_than_wrapping() {
        assert!(parse_decimal("99999999999999999999", PHP_SCALE).is_err());
    }

    #[test]
    fn json_amounts_accept_string_or_number() {
        let obj = serde_json::json!({ "s": "12.34", "n": 12.34, "z": null });
        assert_eq!(parse_json_amount(&obj["s"], PHP_SCALE).unwrap(), 1234);
        assert_eq!(parse_json_amount(&obj["n"], PHP_SCALE).unwrap(), 1234);
        // A missing amount is an error, never a silent zero.
        assert!(parse_json_amount(&obj["z"], PHP_SCALE).is_err());
        assert!(parse_json_amount(&obj["missing"], PHP_SCALE).is_err());
    }
}
