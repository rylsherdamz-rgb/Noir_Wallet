# Node Description Batch 58 of 84

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

- "src_demoshell_lightbg": "LightBG()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L73 | neighbors=[TitleScenes.tsx, DemoShell.tsx]
- "src_demoshell_phonestage": "PhoneStage()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L402 | neighbors=[WalkthroughScenes.tsx, DemoShell.tsx]
- "src_demoshell_progressbar": "ProgressBar()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L532 | neighbors=[DemoShell.tsx, NoirDemo.tsx]
- "src_demoshell_usefloat": "useFloat()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L249 | neighbors=[TitleScenes.tsx, DemoShell.tsx]
- "src_errors_errorresponse": "ErrorResponse" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L41 | neighbors=[errors.rs, String]
- "src_errors_paymenterror_error_type": ".error_type()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L48 | neighbors=[PaymentError, .error_response()]
- "src_errors_paymenterror_public_message": ".public_message()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L65 | neighbors=[PaymentError, .error_response()]
- "src_errors_paymenterror_status_code": ".status_code()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L103 | neighbors=[PaymentError, .error_response()]
- "src_lib_agentpolicy": "AgentPolicy" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L18 | neighbors=[lib.rs, Address]
- "src_lib_agentrevevent": "AgentRevEvent" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L53 | neighbors=[lib.rs, BytesN]
- "src_lib_claimevent": "ClaimEvent" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L70 | neighbors=[lib.rs, Address]
- "src_lib_defundevent": "DefundEvent" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L78 | neighbors=[lib.rs, BytesN]
- "src_lib_deviceinfo": "DeviceInfo" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L13 | neighbors=[lib.rs, Address]
- "src_lib_fundevent": "FundEvent" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L52 | neighbors=[lib.rs, BytesN]
- "src_lib_payment": "Payment" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L28 | neighbors=[lib.rs, BytesN]
- "src_lib_revokeevent": "RevokeEvent" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L30 | neighbors=[lib.rs, BytesN]
- "src_lib_sweepevent": "SweepEvent" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L86 | neighbors=[lib.rs, BytesN]
- "src_models_authenticatedwallet": "AuthenticatedWallet" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L21 | neighbors=[models.rs, String]
- "src_models_cashrequest": "CashRequest" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L129 | neighbors=[models.rs, String]
- "src_models_challengerequest": "ChallengeRequest" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L27 | neighbors=[models.rs, String]
- "src_models_challengeresponse": "ChallengeResponse" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L34 | neighbors=[models.rs, String]
- "src_models_cryptoasset_parse": ".parse()" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L78 | neighbors=[CryptoAsset, .as_str()]
- "src_models_cryptoasset_trade_code": ".trade_code()" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L89 | neighbors=[CryptoAsset, .as_str()]
- "src_models_quoterequest": "QuoteRequest" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L119 | neighbors=[models.rs, String]
- "src_models_sessionresponse": "SessionResponse" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L51 | neighbors=[models.rs, String]
- "src_models_verifyrequest": "VerifyRequest" | kind=code-symbol | source=unused/pdax-backend/src/models.rs:L42 | neighbors=[models.rs, String]
- "src_money_parse_decimal": "parse_decimal()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L44 | neighbors=[money.rs, parse_json_amount()]
- "src_money_parse_json_amount": "parse_json_amount()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L112 | neighbors=[money.rs, parse_decimal()]
- "src_money_round_trips": "round_trips()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L161 | neighbors=[money.rs, to_decimal_string()]
- "src_money_to_decimal_string": "to_decimal_string()" | kind=code-symbol | source=unused/pdax-backend/src/money.rs:L28 | neighbors=[money.rs, round_trips()]
- "src_noirdemo_demo_audio_files": "DEMO_AUDIO_FILES" | kind=code-symbol | source=promotion/src/NoirDemo.tsx:L47 | neighbors=[NoirDemo.tsx, Root.tsx]
- "src_noirdemo_noirdemo": "NoirDemo()" | kind=code-symbol | source=promotion/src/NoirDemo.tsx:L51 | neighbors=[NoirDemo.tsx, Root.tsx]
- "src_noirdemo_noirdemopropsschema": "NoirDemoPropsSchema" | kind=code-symbol | source=promotion/src/NoirDemo.tsx:L26 | neighbors=[NoirDemo.tsx, Root.tsx]
- "src_noirpromo_noirpromo": "NoirPromo()" | kind=code-symbol | source=promotion/src/NoirPromo.tsx:L32 | neighbors=[NoirPromo.tsx, Root.tsx]
- "src_noirpromo_noirpromopropsschema": "NoirPromoPropsSchema" | kind=code-symbol | source=promotion/src/NoirPromo.tsx:L10 | neighbors=[NoirPromo.tsx, Root.tsx]
- "src_pdax_pdaxerrorbody": "PdaxErrorBody" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L345 | neighbors=[pdax.rs, String]
- "src_pdax_pdaxsession_from_refresh": ".from_refresh()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L431 | neighbors=[.refresh(), PdaxSession]
- "src_pdax_pdaxsession_is_expired": ".is_expired()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L450 | neighbors=[.current_session(), PdaxSession]
- "src_pdax_pdaxsimpleerrorbody": "PdaxSimpleErrorBody" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L365 | neighbors=[pdax.rs, String]
- "src_pdax_session_expiry_tracks_expiry_seconds": "session_expiry_tracks_expiry_seconds()" | kind=code-symbol | source=unused/pdax-backend/src/pdax.rs:L1273 | neighbors=[pdax.rs, .from_tokens()]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-057.json

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
