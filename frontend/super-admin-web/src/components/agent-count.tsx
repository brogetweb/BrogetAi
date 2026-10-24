"use client";

import { useEffect, useState } from "react";
import { houseWallet, listAgents, listCreditReports, listCustomers } from "@/lib/api";

export function AgentCount() {
  const [count, setCount] = useState("—");

  useEffect(() => {
    let active = true;
    listAgents()
      .then((rows) => {
        if (active) setCount(String(rows.length));
      })
      .catch(() => {
        if (active) setCount("0");
      });
    return () => {
      active = false;
    };
  }, []);

  return count;
}

export function CustomerCount() {
  return <LiveCount load={listCustomers} />;
}

export function CreditCount() {
  return <LiveCount load={listCreditReports} />;
}

export function HouseWalletCard() {
  const [balance, setBalance] = useState("—");

  useEffect(() => {
    let active = true;
    houseWallet()
      .then((row) => {
        if (active) setBalance(inr(row.balance));
      })
      .catch(() => {
        if (active) setBalance("—");
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="rounded-3xl border border-[#e6ebf5] bg-white p-5">
      <p className="text-xs font-extrabold tracking-[0.12em] text-[#8b95a7]">BROGET WALLET</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight">{balance}</p>
      <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-[#5c677a]">Each credit check collects ₹61.36 from that agent’s wallet into this wallet. Money an agent adds stays in the agent wallet until a check runs.</p>
    </section>
  );
}

function inr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

function LiveCount({ load }: { load: () => Promise<unknown[]> }) {
  const [count, setCount] = useState("—");

  useEffect(() => {
    let active = true;
    load()
      .then((rows) => {
        if (active) setCount(String(rows.length));
      })
      .catch(() => {
        if (active) setCount("0");
      });
    return () => {
      active = false;
    };
  }, [load]);

  return count;
}
