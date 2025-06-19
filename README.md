# 🌀 SwappyBox

SwappyBox is a fun and experimental take on financial options combined with dynamic auctions and gamified speculation. Think of it as a tradeable right to buy cryptos at a fixed price (strike price), but with a twist — the right itself can be bid on and swapped by others, and only the final holder can exercise it. Intermediate holders can profit by just flipping their position!

---
## What is SwappyBox?

SwappyBox is a decentralized protocol where:

- **Initiators** lock cryptos and define a **strike price** (USD value).
- This creates a **"Box"** — a tradable contract that grants the right to buy that cryptos at the strike price before a deadline.
- The **Box** can be bought and sold — but only at a higher price than the last bid or the AMM-estimated demand price.
- **Each new bidder pays a higher price**, and the **previous holder profits** from the difference.
- The **final holder** at expiration can choose to exercise the option or let it expire.

---

## Why SwappyBox?

Traditional options are rigid, slightly centralized, and not fun to use. SwappyBox brings (note it not option but similar to option):

- **Open access** to earn from speculation.
- **Game-like bidding** wars and box sniping.
- **Dynamic ownership** — box moves only when someone outbids the current holder.
- **Pool initiators earn passive income**: 0.5% fee from each bid transaction.

---

##  What Problem Does It Solve?

- **Barrier to options trading** is high — SwappyBox makes it accessible and interactive.
- **Speculation is dry** — we add a **fun twist**, letting users trade positions, not just assets.
- **Lack of incentivized dynamic pricing** — our AMM logic ensures demand affects pricing, reducing sniping and underbidding.

---

## Features

- Anyone can create a box by locking cryptos with a strike price and expiry.
- Boxes are bid-on and swapped dynamically using price escalation or AMM estimates.
- Initiators earn **0.5% fee** on every bid transaction.
- Traders profit when others outbid them.
- AMM adjusts floor price based on demand (active bidders and time).
- Final holder can choose to **exercise** or **let it expire** (no refund if not exercised).

---

## Example Flow

1. **Alice** creates a SwappyBox with:
   - 1 crypto(WND) deposit
   - Strike Price: $2000 (assume 1 WND = $2000 like ETH)
   - Expiry: 7 days

2. **Bob** buys the box for **$10** (1% of Crypto(WND) value).

3. **Charlie** bids **$20**:
   - Box moves to Charlie.
   - Bob makes **$10 profit**.

4. More bidders enter — demand rises.

5. **AMM sets new price floor at $50** due to high activity.

6. **Dave** tries bidding **$30** → **rejected**.

7. **Eve** bids **$55** → **accepted**, box moves to her.

8. On expiry:
   - Eve pays $2000 → receives 1 WND.
   - Or does nothing → box expires, Eve loses $55.

---

## Incentives Summary

| Role | Incentive |
|------|-----------|
| Pool Initiator | Earns 0.5% of every bid transaction as fee |
| Traders | Profit when someone else outbids them |
| Final Holder | Can buy WND at strike price if market favors it |

---

## What We Have Covered

SwappyBox is already feature-rich with the following components implemented:

   - ETH-based SwappyBox creation with strike price and expiry.

   - Dynamic box bidding — only higher bids accepted.

   - Profit logic for traders (margin from new bids).

   - Demand-based AMM pricing floor to avoid underbidding.

   - Pool initiator fees — 0.5% from every bid transaction.

   - Final holder right to exercise or let expire.

   - Smart contract factory for deploying multiple boxes.

## Future Enhancements

SwappyBox is just the beginning. Planned features include:

   - ERC20 Support
    Let initiators use any ERC20 token (e.g., USDC, DAI, WETH) as deposit, not just ETH.

   - Flexible Event Emitting
    Improved and granular event logs for better integration with frontends, analytics, and The Graph.

   - Real-time Bid Sharing
    Push latest bids to a frontend in real-time via WebSocket or events → frontend bridge → notify all bidders instantly.

   - Integrating Obligation & withdraw with contract which is already
    implemented



## 🧪 Try It Out

---



##  Disclaimer

SwappyBox is an experimental and gamified protocol. It's not meant for real financial trading — play responsibly and DYOR.

---



