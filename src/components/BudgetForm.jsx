"use client";

import { useEffect, useState } from "react";

/**
 * props:
 * - month: "YYYY-MM"
 * - accounts: [{id, name, category/type/classification...}]
 * - initial: optional budget record for edit {id, month, account_id, item, amount}
 * - onSave: function(budgetData)  // for add: {account_id, item, amount}; for update include id
 * - onCancel: optional
 */
export default function BudgetForm({ month, accounts = [], initial = null, onSave, onCancel }) {
  const [accountId, setAccountId] = useState(initial?.account_id || "");
  const [item, setItem] = useState(initial?.item || "");
  const [amount, setAmount] = useState(initial?.amount ? String(initial.amount) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setAccountId(initial.account_id);
      setItem(initial.item);
      setAmount(String(initial.amount));
    } else {
      setAccountId("");
      setItem("");
      setAmount("");
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountId || !item.trim() || Number(amount) <= 0) {
      alert("科目・項目名・金額を正しく入力してください");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        id: initial?.id,
        account_id: accountId,
        item: item.trim(),
        amount: Number(amount),
      };
      await onSave(payload);
    } catch (err) {
      console.error(err);
      alert("保存でエラーが発生しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium">対象月</label>
          <input type="month" value={month} readOnly className="border rounded p-2 w-full bg-gray-50" />
        </div>

        <div>
          <label className="block text-sm font-medium">科目（カテゴリ）</label>
          <select
            value={accountId || ""}
            onChange={(e) => setAccountId(e.target.value)}
            className="border rounded p-2 w-full bg-white"
            required
          >
            <option value="">科目を選択</option>
            {accounts.map((a) => {
              const label = (a.category || a.type || a.classification || a.name) ? `${a.name} ${a.category ? `(${a.category})` : ""}` : a.name;
              return <option key={a.id} value={a.id}>{label}</option>;
            })}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">項目名</label>
          <input
            value={item}
            onChange={(e) => setItem(e.target.value)}
            placeholder="例: 外食"
            className="border rounded p-2 w-full"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">金額</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          className="border rounded p-2 w-48"
          required
        />
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
          {saving ? "保存中..." : initial ? "更新" : "追加"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="bg-gray-200 px-4 py-2 rounded">
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
