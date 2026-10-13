# Node Description Batch 81 of 84

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

- "src_db_repository_record_withdrawal": ".record_withdrawal()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L309 | neighbors=[Repository]
- "src_db_repository_revoke_all_sessions_for_wallet": ".revoke_all_sessions_for_wallet()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L137 | neighbors=[Repository]
- "src_db_repository_revoke_session": ".revoke_session()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L125 | neighbors=[Repository]
- "src_db_repository_set_order_status": ".set_order_status()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L328 | neighbors=[Repository]
- "src_db_repository_upsert_user": ".upsert_user()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L152 | neighbors=[Repository]
- "src_db_repository_wallet_for_session": ".wallet_for_session()" | kind=code-symbol | source=unused/pdax-backend/src/db.rs:L110 | neighbors=[Repository]
- "src_demoshell_ease": "EASE" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L41 | neighbors=[DemoShell.tsx]
- "src_demoshell_ease_out": "EASE_OUT" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L42 | neighbors=[DemoShell.tsx]
- "src_demoshell_phoneshell": "PhoneShell()" | kind=code-symbol | source=promotion/src/DemoShell.tsx:L446 | neighbors=[DemoShell.tsx]
- "src_errors_internal_detail_never_reaches_the_caller": "internal_detail_never_reaches_the_caller()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L125 | neighbors=[errors.rs]
- "src_errors_status_codes_match_the_failure_kind": "status_codes_match_the_failure_kind()" | kind=code-symbol | source=unused/pdax-backend/src/errors.rs:L136 | neighbors=[errors.rs]
- "src_get_audio_duration_getaudioduration": "getAudioDuration()" | kind=code-symbol | source=promotion/src/get-audio-duration.ts:L4 | neighbors=[get-audio-duration.ts]
- "src_lib_agentregistry_check_payment": ".check_payment()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L149 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_get_agent": ".get_agent()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L123 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_get_policy": ".get_policy()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L128 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_initialize": ".initialize()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L60 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_is_auth": ".is_auth()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L137 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_is_expired": ".is_expired()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L169 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_register_agent": ".register_agent()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L75 | neighbors=[AgentRegistry]
- "src_lib_agentregistry_revoke_agent": ".revoke_agent()" | kind=code-symbol | source=backend/contracts/agent_registry/src/lib.rs:L109 | neighbors=[AgentRegistry]
- "src_lib_deviceregistry_get_agent": ".get_agent()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L160 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_get_device": ".get_device()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L135 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_get_owner": ".get_owner()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L167 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_initialize": ".initialize()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L50 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_is_authorized": ".is_authorized()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L153 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_register": ".register()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L59 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_revoke": ".revoke()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L84 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_wallet_device_at": ".wallet_device_at()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L147 | neighbors=[DeviceRegistry]
- "src_lib_deviceregistry_wallet_device_count": ".wallet_device_count()" | kind=code-symbol | source=backend/contracts/device_registry/src/lib.rs:L141 | neighbors=[DeviceRegistry]
- "src_lib_error": "Error" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L37 | neighbors=[lib.rs]
- "src_lib_paymentescrow_authorize": ".authorize()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L128 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_balance_of": ".balance_of()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L354 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_claim": ".claim()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L203 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_defund_escrow": ".defund_escrow()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L249 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_fund_escrow": ".fund_escrow()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L105 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_initialize": ".initialize()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L94 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_pending_balance": ".pending_balance()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L361 | neighbors=[PaymentEscrow]
- "src_lib_paymentescrow_sweep_on_revoke": ".sweep_on_revoke()" | kind=code-symbol | source=backend/contracts/payment_escrow/src/lib.rs:L300 | neighbors=[PaymentEscrow]
- "src_main_main": "main()" | kind=code-symbol | source=unused/pdax-backend/src/main.rs:L31 | neighbors=[main.rs]
- "src_metrics_metricscollector_new": ".new()" | kind=code-symbol | source=unused/pdax-backend/src/metrics.rs:L38 | neighbors=[MetricsCollector]

## Instructions

Write a single JSON object mapping each node id to a one-sentence description
to: /home/richie/Projects/Noir_Wallet/.graphify/description-instructions/batch-080.json

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
