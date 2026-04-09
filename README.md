# SafeBridge

SafeBridge is a single-screen bridging workstation for validating transfer readiness before execution on Initia-connected routes.

## Features

- InterwovenKit wallet connection with OKX Wallet support
- Single-screen transfer workstation with route, validation, and execution panels
- Hybrid validation engine:
  - live RPC probing for source and destination endpoints
  - real latency measurement
  - deterministic route, destination, and amount scoring
- Confidence scoring with structured pass, warn, and fail signals
- Real-first execution path with explicit fallback simulation
- Transaction lifecycle view with hash, chain label, and execution mode
- Recovery guidance for blocked or failed execution states

## Stack

- Next.js (pages router)
- React
- Material UI (MUI)
- `@initia/interwovenkit-react`
- `@tanstack/react-query`
- `wagmi`
- `viem`
- JavaScript only
- npm only

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

## Testing the app

1. Start the app with `npm run dev`.
2. Open `http://localhost:3000`.
3. Click `Connect Wallet`.
4. Complete the InterwovenKit flow with OKX Wallet.
5. Choose source, destination, asset, and amount.
6. Click `Run Validation`.
7. Review:
   - source and destination RPC latency
   - route availability
   - destination readiness
   - amount sanity
8. If confidence is `medium` or `high`, click `Execute via Interwoven Bridge`.
9. Review the execution lifecycle, transaction details, and outcome.

## Wallet testing with OKX Wallet

SafeBridge uses InterwovenKit as the wallet integration layer.

Current development chain:

- Network: Initia Testnet
- Chain id: `initiation-2`

Expected behavior:

- disconnected state shows `Connect Wallet`
- connected state shows a shortened wallet address
- `Disconnect` clears the active wallet session from the app

## Live RPC probing

SafeBridge includes live RPC probing as part of validation.

Current live checks:

- source RPC reachability
- destination RPC reachability
- latency measurement for both endpoints
- pass / warn / fail classification based on timing and response behavior

Latency thresholds:

- `pass`: under `400ms`
- `warn`: `400ms` to under `1200ms`
- `fail`: timeout, unreachable endpoint, or severe latency

This signal is combined with deterministic checks for:

- route availability
- destination readiness
- amount sanity

## Validation behavior

Validation returns a normalized result with:

- `confidence`
- `checks`
- `summary`
- `metadata`

Confidence rules:

- any hard RPC failure downgrades validation to `low`
- warning-level latency contributes to `medium`
- deterministic route or amount failures can also force `low`

## What is real

- wallet connection
- source RPC probing
- destination RPC probing
- latency measurement
- execution submission attempt through the connected wallet when the route supports it

## What is still hybrid or simulated

- some route support logic
- some destination readiness scoring
- fallback execution outcomes when the real path is not available

## Folder structure

```text
initia-safebridge-app/
├── .initia/
│   └── submission.json
├── components/
├── lib/
├── pages/
├── public/
├── styles/
├── next.config.js
├── package.json
└── README.md
```

## Initia submission metadata

The repository includes `.initia/submission.json` for submission metadata tracking.

Replace these values before final submission:

- `repo_url`
- `commit_sha`
- `rollup_chain_id`
- `deployed_address`
- `deploy_tx_hash`
- `demo_video_url`

Where each value comes from:

- Commit SHA: `git rev-parse HEAD`
- Rollup chain id: deployment output or config
- Deployed address: contract or app deployment output
- Deploy tx hash: deployment logs or explorer record
- Demo video URL: uploaded demo link
