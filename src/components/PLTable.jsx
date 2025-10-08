"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";

export default function PLTable() {
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [monthOptions, setMonthOptions] = useState([]);

  // 取引データを取得して集計
  const fetchData = async (targetMonth) => {
    const startDate = dayjs(targetMonth).startOf("month").format("YYYY-MM-DD");
    const endDate = dayjs(targetMonth).endOf("month").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        date,
        amount,
        debit:debit_id ( id, name, classification ),
        credit:credit_id ( id, name, classification )
      `)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("取引取得エラー:", error);
      return;
    }

    const incomeItems = [];
    const expenseItems = [];

    data.forEach((t) => {
      if (t.credit?.classification === "収入") {
        incomeItems.push({
          name: t.credit.name,
          amount: t.amount,
        });
      }
      if (t.debit?.classification === "費用") {
        expenseItems.push({
          name: t.debit.name,
          amount: t.amount,
        });
      }
    });

    const revenueMap = {};
    incomeItems.forEach((i) => {
      revenueMap[i.name] = (revenueMap[i.name] || 0) + i.amount;
    });

    const expenseMap = {};
    expenseItems.forEach((e) => {
      expenseMap[e.name] = (expenseMap[e.name] || 0) + e.amount;
    });

    const revenueList = Object.entries(revenueMap).map(([name, amount]) => ({
      name,
      amount,
    }));
    const expenseList = Object.entries(expenseMap).map(([name, amount]) => ({
      name,
      amount,
    }));

    setRevenues(revenueList);
    setExpenses(expenseList);
    setTotalRevenue(
      revenueList.reduce((sum, r) => sum + Number(r.amount), 0)
    );
    setTotalExpense(
      expenseList.reduce((sum, e) => sum + Number(e.amount), 0)
    );
  };

  // 月選択肢を生成（例：直近12ヶ月）
  useEffect(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(dayjs().subtract(i, "month").format("YYYY-MM"));
    }
    setMonthOptions(months.reverse());
  }, []);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const netIncome = totalRevenue - totalExpense;

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">損益計算書（{selectedMonth}）</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="month" className="text-sm text-gray-600">
            対象月：
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-1 rounded text-sm"
          >
            {monthOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 収入 */}
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="bg-green-100">
            <th className="text-left p-2 border">収入の部</th>
            <th className="text-right p-2 border w-32">金額</th>
          </tr>
        </thead>
        <tbody>
          {revenues.length > 0 ? (
            revenues.map((r, i) => (
              <tr key={i}>
                <td className="border p-2">{r.name}</td>
                <td className="border p-2 text-right">
                  {r.amount.toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-gray-500 p-2 text-center">
                収入データがありません
              </td>
            </tr>
          )}
          <tr className="font-bold bg-gray-50">
            <td className="border p-2 text-right">収入合計</td>
            <td className="border p-2 text-right">
              {totalRevenue.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 費用 */}
      <table className="w-full text-sm border-collapse mb-6">
        <thead>
          <tr className="bg-red-100">
            <th className="text-left p-2 border">費用の部</th>
            <th className="text-right p-2 border w-32">金額</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length > 0 ? (
            expenses.map((e, i) => (
              <tr key={i}>
                <td className="border p-2">{e.name}</td>
                <td className="border p-2 text-right">
                  {e.amount.toLocaleString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="text-gray-500 p-2 text-center">
                費用データがありません
              </td>
            </tr>
          )}
          <tr className="font-bold bg-gray-50">
            <td className="border p-2 text-right">費用合計</td>
            <td className="border p-2 text-right">
              {totalExpense.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* 当期純利益 */}
      <div className="text-right font-bold text-lg">
        当期純利益：{" "}
        <span
          className={
            netIncome >= 0 ? "text-green-700" : "text-red-700"
          }
        >
          {netIncome.toLocaleString()} 円
        </span>
      </div>
    </div>
  );
}
