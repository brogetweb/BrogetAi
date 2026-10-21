"use client";

import { useEffect, useState } from "react";
import { listAgents, listCreditReports, listCustomers } from "@/lib/api";

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
