# Node Description Batch 82 of 84

Graphify is running in assistant/skill mode (no API key). You are the host
assistant (Claude Code / Codex / Gemini CLI). Read the prompt below and write
your JSON answer to the answer file.

## Prompt

You are documenting nodes in a knowledge graph.
For each entry below, write ONE concise factual plain-language sentence
describing what it is or does. Use only the provided context.
For a code symbol (kind=code-symbol — a function, class, or constant),
describe what the function/symbol does based on its name, source location
and neighbors — e.g. "Resolves the configured ontology profile from graphify.yaml.".
Write every description in English (en). Do not switch languages.
No marketing language.
Respond ONLY with a JSON object mapping each node id (as a string) to its
one-sentence description — no prose, no markdown fences.

- "src_metrics_metricscollector_record_auth_failure": ".record_auth_failure()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L70 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_auth_success": ".record_auth_success()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L66 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_conversion_failed": ".record_conversion_failed()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L50 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_conversion_placed": ".record_conversion_placed()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L46 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_conversion_requested": ".record_conversion_requested()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L42 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_idempotency_hit": ".record_idempotency_hit()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L78 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_rate_limit_rejection": ".record_rate_limit_rejection()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L74 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_webhook_accepted": ".record_webhook_accepted()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L58 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_webhook_rejected": ".record_webhook_rejected()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L62 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_record_withdrawal_initiated": ".record_withdrawal_initiated()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L54 | neighbors=[MetricsCollector]
- "src_metrics_metricscollector_snapshot": ".snapshot()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L82 | neighbors=[MetricsCollector]
- "src_metrics_metricssnapshot": "MetricsSnapshot" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L24 | neighbors=[metrics.rs]
- "src_models_cryptoasset_withdraw_code": ".withdraw_code()" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L99 | neighbors=[CryptoAsset]
- "src_models_okresponse": "OkResponse" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L58 | neighbors=[models.rs]
- "src_models_orderresponse_from_order": ".from_order()" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L174 | neighbors=[OrderResponse]
- "src_money_json_amounts_accept_string_or_number": "json_amounts_accept_string_or_number()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L190 | neighbors=[money.rs]
- "src_money_parses_decimal_strings": "parses_decimal_strings()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L145 | neighbors=[money.rs]
- "src_money_rejects_excess_precision_instead_of_truncating": "rejects_excess_precision_instead_of_truncating()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L169 | neighbors=[money.rs]
- "src_money_rejects_garbage": "rejects_garbage()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L176 | neighbors=[money.rs]
- "src_money_rejects_overflow_rather_than_wrapping": "rejects_overflow_rather_than_wrapping()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L185 | neighbors=[money.rs]
- "src_money_renders_php_centavos": "renders_php_centavos()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L130 | neighbors=[money.rs]
- "src_money_renders_stellar_stroops": "renders_stellar_stroops()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L138 | neighbors=[money.rs]
- "src_money_right_pads_short_fractions": "right_pads_short_fractions()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L154 | neighbors=[money.rs]
- "src_noirdemo_demo_scenes": "DEMO_SCENES" | kind=code-symbol | source=promotion/src/NoirDemo.tsx:L31 | neighbors=[NoirDemo.tsx]
- "src_noirpromo_scene_audio_files": "SCENE_AUDIO_FILES" | kind=code-symbol | source=promotion/src/NoirPromo.tsx:L14 | neighbors=[NoirPromo.tsx]
- "src_noirpromo_scenes": "scenes" | kind=code-symbol | source=promotion/src/NoirPromo.tsx:L23 | neighbors=[NoirPromo.tsx]
- "src_pdax_code_to_string": "code_to_string()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L354 | neighbors=[pdax.rs]
- "src_pdax_firmquoterequest": "FirmQuoteRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L30 | neighbors=[pdax.rs]
- "src_pdax_loginrequest": "LoginRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L9 | neighbors=[pdax.rs]
- "src_pdax_otprequest": "OtpRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L22 | neighbors=[pdax.rs]
- "src_pdax_parses_login_response_with_mfa_challenge": "parses_login_response_with_mfa_challenge()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1254 | neighbors=[pdax.rs]
- "src_pdax_parses_login_response_without_mfa": "parses_login_response_without_mfa()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1230 | neighbors=[pdax.rs]
- "src_pdax_pdaxclient_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L465 | neighbors=[PdaxClient]
- "src_pdax_pdaxclient_seed_refresh_token": ".seed_refresh_token()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L567 | neighbors=[PdaxClient]
- "src_pdax_pdaxclient_verify_webhook_signature": ".verify_webhook_signature()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1188 | neighbors=[PdaxClient]
- "src_pdax_placeorderrequest": "PlaceOrderRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L38 | neighbors=[pdax.rs]
- "src_pdax_refreshtokenrequest": "RefreshTokenRequest" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L15 | neighbors=[pdax.rs]
- "src_root_calculatedemometadata": "calculateDemoMetadata()" | kind=code-symbol | source=promotion/src/Root.tsx:L23 | neighbors=[Root.tsx]
- "src_root_calculatemetadata": "calculateMetadata()" | kind=code-symbol | source=promo/src/Root.tsx:L22 | neighbors=[Root.tsx]
- "src_root_demo_fallback_seconds": "DEMO_FALLBACK_SECONDS" | kind=code-symbol | source=promotion/src/Root.tsx:L11 | neighbors=[Root.tsx]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-081.json

Keep each description factual and concise (one sentence). No markdown, no prose
outside the JSON object. It is acceptable to omit a node if context is
insufficient — but include every node you can ground confidently.

Example answer format:
```json
{
  "node_id_1": "Resolves the configured ontology profile from graphify.yaml.",
  "node_id_2": "Colonel James Barclay, an antagonist in The Crooked Man."
}
```
