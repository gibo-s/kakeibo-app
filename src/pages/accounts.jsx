"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import AccountForm from "../components/AccountForm";
import AccountTable from "../components/AccountTable";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase.from("accounts").select("*").order("name", { ascending: true });
    if (error) {
      console.error(error);
      alert("科目の取得に失敗しました");
      return;
    }
    setAccounts(data || []);
  };

  const handleSaved = (acc) => {
    setAccounts((prev) => {
      const exists = prev.find((p) => p.id === acc.id);
      if (exists) return prev.map((p) => (p.id === acc.id ? acc : p));
      return [...prev, acc].sort((a, b) => a.name.localeCompare(b.name));
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (acc) => {
    setEditing(acc);
    setShowForm(true);
  };

  const handleDelete = async (acc) => {
    // 参照チェック（transactions テーブルに debit_id または credit_id として残っていないか）
    try {
      const { data: debitTx, error: e1 } = await supabase
        .from("transactions")
        .select("id")
        .eq("debit_id", acc.id)
        .limit(1);

      const { data: creditTx, error: e2 } = await supabase
        .from("transactions")
        .select("id")
        .eq("credit_id", acc.id)
        .limit(1);

      if (e1 || e2) throw e1 || e2;

      if ((debitTx && debitTx.length > 0) || (creditTx && creditTx.length > 0)) {
        const ok = confirm(
          "この科目を参照する取引が存在します。削除すると取引の科目はそのまま残り不整合が発生します。本当に削除しますか？"
        );
        if (!ok) return;
      }

      const { error } = await supabase.from("accounts").delete().eq("id", acc.id);
      if (error) {
        console.error(error);
        alert("削除に失敗しました");
        return;
      }
      setAccounts((prev) => prev.filter((p) => p.id !== acc.id));
    } catch (err) {
      console.error(err);
      alert("削除処理でエラーが発生しました");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">科目管理</h1>

      <p className="mb-4 text-sm text-gray-600">
        分類は固定: <strong>資産 / 負債 / 収入 / 費用</strong>（この分類自体の追加・編集・削除は不可）
      </p>

      <div className="mb-4">
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          科目を追加
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <AccountForm
            initial={editing}
            onSaved={handleSaved}
            onCancel={() => {
              setEditing(null);
              setShowForm(false);
            }}
          />
        </div>
      )}

      <AccountTable accounts={accounts} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}
