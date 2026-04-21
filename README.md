# SafeBridge: Intent-Aware Bridging for Interwoven Rollups

## What it is

SafeBridge is a single-screen bridging workstation for Initia that evaluates transfer feasibility before the user opens the bridge flow.

The current MVP is focused on one core job:

- validate a selected bridge intent with live signals
- show a confidence score before execution
- open a validated route in Interwoven Bridge

## Current MVP Scope

SafeBridge is a pre-execution feasibility layer, not a downstream settlement tracker.

The MVP covers:

- wallet connection through `@initia/interwovenkit-react`
- source and destination RPC probing
- latency measurement
- live route discovery
- destination readiness checks
- confidence scoring
- validated Interwoven Bridge handoff
- handoff-stage feedback and recovery guidance

The MVP does not yet cover:

- downstream settlement tracking after the bridge modal opens
- full finality monitoring after the bridge flow continues outside SafeBridge
- full lifecycle classification for every downstream bridge outcome
- deployment on a Minitia rollup

## What is real in this MVP

- real wallet connection via InterwovenKit
- real source RPC reachability checks
- real destination RPC reachability checks
- real latency measurement
- real live rollup catalog loading from Initia registry
- real route availability checks through live route discovery
- real destination readiness checks against live endpoints
- real Interwoven Bridge handoff after validation

## Current limitations

- SafeBridge currently tracks the validation phase and the bridge handoff phase inside the app.
- After the Interwoven Bridge modal opens, downstream settlement is not yet synced back into the SafeBridge UI.
- Recovery guidance is strongest around validation failures and wallet or handoff-stage failures.
- Some handoff details depend on what the wallet and bridge flow expose back to the app.

## Why this is Initia-native

SafeBridge is built around Initia’s Interwoven flow rather than a generic token transfer UI.

It uses:

- `@initia/interwovenkit-react` for wallet connection and bridge handoff
- Initia testnet RPC and registry endpoints for live validation signals
- live route discovery for real bridge-path feasibility checks

## Stack

- Next.js
- Material UI (MUI)
- `@initia/interwovenkit-react`
- `@tanstack/react-query`
- `wagmi`
- `viem`

## Setup

Install dependencies:

```bash
npm install
```

## Run locally

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

## Live deployment

- App URL: [https://initia-safebridge.netlify.app/](https://initia-safebridge.netlify.app/)
- Demo video: [https://youtu.be/tCHTP_DsuKg](https://youtu.be/tCHTP_DsuKg)

## Demo flow

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Click `Connect Wallet`.
4. Complete the InterwovenKit flow with Keplr Wallet.
5. Choose source, destination, asset, and amount.
6. Click `Run Validation`.
7. Review:
   - source and destination RPC latency
   - route availability
   - destination readiness
   - amount sanity
8. If confidence is `medium` or `high`, click `Execute via Interwoven Bridge`.
9. SafeBridge opens the validated route in Interwoven Bridge.
10. Review the handoff state, route details, and readiness guidance in the SafeBridge UI.

## Wallet testing with Keplr Wallet

SafeBridge uses InterwovenKit as the wallet integration layer.

The current MVP has been tested with Keplr on Initia testnet.

Current development chain:

- Network: Initia Testnet
- Chain id: `initiation-2`

Expected behavior:

- disconnected state shows `Connect Wallet`
- connected state shows a shortened wallet address
- `Disconnect` clears the active wallet session from the app
- Keplr should appear as the primary wallet path for manual testing

## Validation behavior

Validation returns a normalized result with:

- `confidence`
- `checks`
- `summary`
- `metadata`

Current live checks:

- source RPC reachability
- destination RPC reachability
- latency measurement for both endpoints
- live route discovery
- live destination readiness checks
- amount sanity policy

Latency thresholds:

- `pass`: under `400ms`
- `warn`: `400ms` to under `1200ms`
- `fail`: timeout, unreachable endpoint, or severe latency

Confidence rules:

- any hard RPC failure downgrades validation to `low`
- warning-level latency contributes to `medium`
- a failed live route check or destination readiness check forces `low`
- amount policy can also force `low`

## Future work

- downstream bridge settlement tracking after handoff
- stronger handoff status syncing back into SafeBridge
- deeper failure mapping after the bridge flow continues outside the app
- liquidity-aware route hints
- richer execution telemetry for repeated operator workflows
