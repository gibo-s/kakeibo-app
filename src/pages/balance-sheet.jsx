"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import BalanceSheetTable from "@/components/BalanceSheetTable";
import dayjs from "dayjs";

export default function BalanceSheetPage() {
  const [balances, setBalances] = useState([]);
  const [targetMonth, setTargetMonth] = useState(dayjs().format("YYYY-MM"));

  useEffect(() => {
    fetchBalances();
  }, [targetMonth]);

  async function fetchBalances() {
    const startDate = dayjs(targetMonth).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(targetMonth).endOf("month").format("YYYY-MM-DD");

    // 取引データと科目をJOINして取得
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        date,
        amount,
        debit:debit_id (id, name, classification),
        credit:credit_id (id, name, classification)
      `)
      .gte("date", startDate)
      .lte("date", endDate);

    if (error) {
      console.error("データ取得エラー:", error);
      return;
    }

    // 集計ロジック
    const balanceMap = {};

    data.forEach((t) => {
      // 借方：資産＋増、負債−減
      if (t.debit?.classification === "資産") {
        balanceMap[t.debit.name] = (balanceMap[t.debit.name] || 0) + t.amount;
      } else if (t.debit?.classification === "負債") {
        balanceMap[t.debit.name] = (balanceMap[t.debit.name] || 0) - t.amount;
      }

      // 貸方：資産−減、負債＋増
      if (t.credit?.classification === "資産") {
        balanceMap[t.credit.name] = (balanceMap[t.credit.name] || 0) - t.amount;
      } else if (t.credit?.classification === "負債") {
        balanceMap[t.credit.name] = (balanceMap[t.credit.name] || 0) + t.amount;
      }
    });

    const balancesArray = Object.entries(balanceMap).map(([name, amount]) => {
      // 科目のカテゴリを取引データから取得
      const classification =
        data.find(
          (t) => t.debit?.name === name)?.debit?.classification ||
        data.find(
          (t) => t.credit?.name === name)?.credit?.classification ||
        "不明";

      return { name, amount, classification };
    });

    setBalances(balancesArray);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">貸借対照表</h1>

      <div className="mb-4">
        <label className="mr-2">対象月：</label>
        <input
          type="month"
          value={targetMonth}
          onChange={(e) => setTargetMonth(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <BalanceSheetTable balances={balances} />
    </div>
  );
}
