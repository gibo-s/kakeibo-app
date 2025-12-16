"use client";

import React from "react";

/**
 * props:
 * - budgets: [{id, month, account_id, item, amount, account?}]
 * - transactions: [{id, date, amount, debit_account: {id,name,category,...}, credit_account: {...}}]
 * - onEdit(budget)
 * - onDelete(budget)
 *
 * 表示ロジック：
 * - budgets を account_id ごとにグループ化（account が埋まっていれば account.name を表示）
 * - transactions から account_id ごとの実績合計を算出（費用は借方、収入は貸方を使用）
 * - 各項目の実績は「科目合計実績 × (項目の予算 / 科目予算合計)」で按分
 */

export default function BudgetTable({ budgets = [], transactions = [], onEdit, onDelete }) {
  // map: account_id -> category actual total
  const accountActual = {};
  transactions.forEach((t) => {
    const debit = t.debit_account;
    const credit = t.credit_account;

    // 費用は借方で集計（支出）
    if (debit && (debit.category === "費用" || debit.type === "費用" || debit.classification === "費用")) {
      accountActual[debit.id] = (accountActual[debit.id] || 0) + Number(t.amount);
    }
    // 収入は貸方で集計
    if (credit && (credit.category === "収入" || credit.type === "収入" || credit.classification === "収入")) {
      accountActual[credit.id] = (accountActual[credit.id] || 0) + Number(t.amount);
    }
    // ※ 他の区分（資産／負債等）については要件に応じてロジック拡張可能
  });

  // group budgets by account_id
  const groups = {};
  budgets.forEach(b => {
    const key = b.account_id || "unknown";
    if (!groups[key]) groups[key] = { account: b.account || null, items: [] };
    groups[key].items.push(b);
  });

  const combinedList = Object.entries(groups).map(([accountId, { account, items }]) => {
    const accountName = account ? account.name : (items[0]?.account_id || "不明");
    const categoryLabel = account ? (account.category || account.type || account.classification || "") : "";
    const categoryBudget = items.reduce((s, it) => s + Number(it.amount), 0);
    const categoryActual = accountActual[accountId] || 0;
    return { accountId, accountName, categoryLabel, items, categoryBudget, categoryActual };
  });

  // For display ordering, sort by accountName
  combinedList.sort((a,b) => String(a.accountName).localeCompare(String(b.accountName)));

  const totalBudget = combinedList.reduce((s, g) => s + Number(g.categoryBudget), 0);
  const totalActual = combinedList.reduce((s, g) => s + Number(g.categoryActual), 0);

  return (
    <div className="bg-white rounded shadow p-4">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">カテゴリ</th>
            <th className="border p-2 text-left">項目</th>
            <th className="border p-2 text-right">予算</th>
            <th className="border p-2 text-right">実績（按分）</th>
            <th className="border p-2 text-right">進捗</th>
            <th className="border p-2 text-left">操作</th>
          </tr>
        </thead>

        <tbody>
          {combinedList.length === 0 && (
            <tr>
              <td colSpan="6" className="p-4 text-center text-gray-500">今月の予算が設定されていません。</td>
            </tr>
          )}

          {combinedList.map((g) => (
            <React.Fragment key={g.accountId}>
              {/* カテゴリ見出し行 */}
              <tr className="bg-gray-50">
                <td className="border p-2 font-medium">{g.accountName}{g.categoryLabel ? ` (${g.categoryLabel})` : ""}</td>
                <td className="border p-2 text-sm italic">（内訳）</td>
                <td className="border p-2 text-right font-medium">{Number(g.categoryBudget).toLocaleString()}</td>
                <td className="border p-2 text-right font-medium">{Number(g.categoryActual).toLocaleString()}</td>
                <td className="border p-2 text-right font-medium">
                  {g.categoryBudget > 0 ? Math.round((g.categoryActual / g.categoryBudget) * 10000) / 100 : 0}%
                </td>
                <td className="border p-2"></td>
              </tr>

              {/* 項目ごと */}
              {g.items.map((it) => {
                const ratio = g.categoryBudget > 0 ? (Number(it.amount) / g.categoryBudget) : 0;
                const allocatedActual = Math.round((g.categoryActual * ratio) * 100) / 100; // 小数は2桁に丸め
                const progress = it.amount > 0 ? Math.round((allocatedActual / Number(it.amount)) * 10000) / 100 : 0;
                const over = allocatedActual > Number(it.amount);
                return (
                  <tr key={it.id} className={over ? "bg-red-50" : ""}>
                    <td className="border p-2"></td>
                    <td className="border p-2">{it.item}</td>
                    <td className="border p-2 text-right">{Number(it.amount).toLocaleString()}</td>
                    <td className="border p-2 text-right">{allocatedActual.toLocaleString()}</td>
                    <td className="border p-2 text-right">{progress}% {over && "⚠️"}</td>
                    <td className="border p-2">
                      <button onClick={() => onEdit && onEdit(it)} className="text-blue-600 mr-3">編集</button>
                      <button onClick={() => onDelete && onDelete(it)} className="text-red-600">削除</button>
                    </td>
                  </tr>
                );
              })}
            </React.Fragment>
          ))}

          {/* 全体合計行 */}
          <tr className="bg-gray-100 font-bold">
            <td className="border p-2">合計</td>
            <td className="border p-2"></td>
            <td className="border p-2 text-right">{Number(totalBudget).toLocaleString()}</td>
            <td className="border p-2 text-right">{Number(totalActual).toLocaleString()}</td>
            <td className="border p-2 text-right">
              {totalBudget > 0 ? Math.round((totalActual / totalBudget) * 10000) / 100 : 0}%
            </td>
            <td className="border p-2"></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
