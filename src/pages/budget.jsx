"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "../lib/supabaseClient";
import BudgetForm from "../components/BudgetForm";
import BudgetTable from "../components/BudgetTable";
import SideMenu from "../components/SideMenu";

export default function BudgetPage() {
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));
  const [accounts, setAccounts] = useState([]);     // 全科目（accounts テーブル）
  const [budgets, setBudgets] = useState([]);       // budgets レコード（raw）
  const [transactions, setTransactions] = useState([]); // 当月のトランザクション（joined）
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);     // 編集対象（budgetレコード）
  const [showForm, setShowForm] = useState(false);

  // accounts -> budgets -> transactions の順に取得
  useEffect(() => {
    fetchAll();
  }, [month]);

  async function fetchAll() {
    setLoading(true);
    try {
      // 1) accounts を取得（全件）
      const { data: accData, error: accErr } = await supabase.from("accounts").select("*").order("name", { ascending: true });
      if (accErr) { console.error("accounts取得エラー:", accErr); setAccounts([]); }
      else setAccounts(accData || []);

      // 2) budgets を取得（当月）
      const { data: budData, error: budErr } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", month)
        .order("account_id", { ascending: true })
        .order("item", { ascending: true });
      if (budErr) { console.error("budgets取得エラー:", budErr); setBudgets([]); }
      else {
        // attach account object if available
        const attached = (budData || []).map(b => ({
          ...b,
          account: (accData || []).find(a => String(a.id) === String(b.account_id)) || null
        }));
        setBudgets(attached);
      }

      // 3) transactions（当月）を取得して、借方/貸方の科目情報を含める
      const start = dayjs(month).startOf("month").format("YYYY-MM-DD");
      const end = dayjs(month).endOf("month").format("YYYY-MM-DD");

      const { data: txData, error: txErr } = await supabase
        .from("transactions")
        .select(`
          id, date, amount, memo,
          debit_account:debit_id ( id, name, classification ),
          credit_account:credit_id ( id, name, classification )
        `)
        .gte("date", start)
        .lte("date", end)
        .order("date", { ascending: true });

      if (txErr) { console.error("transactions取得エラー:", txErr); setTransactions([]); }
      else setTransactions(txData || []);
    } catch (err) {
      console.error("fetchAllでのエラー:", err);
    } finally {
      setLoading(false);
    }
  }

  // 追加（BudgetForm から呼ばれる）
  const handleAdd = async ({ account_id, item, amount }) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([{ month, account_id, item, amount: Number(amount) }])
        .select()
        .single();
      if (error) throw error;
      // attach account object
      const accountObj = accounts.find(a => String(a.id) === String(data.account_id)) || null;
      setBudgets(prev => [...prev, { ...data, account: accountObj }]);
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("予算追加エラー:", err);
      alert("予算の追加に失敗しました");
    }
  };

  // 更新（BudgetForm から呼ばれる）
  const handleUpdate = async ({ id, account_id, item, amount }) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .update({ account_id, item, amount: Number(amount) })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      const accountObj = accounts.find(a => String(a.id) === String(data.account_id)) || null;
      setBudgets(prev => prev.map(b => (b.id === data.id ? { ...data, account: accountObj } : b)));
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("予算更新エラー:", err);
      alert("更新に失敗しました");
    }
  };

  // 削除
  const handleDelete = async (budget) => {
    if (!confirm("この予算を削除しますか？")) return;
    try {
      const { error } = await supabase.from("budgets").delete().eq("id", budget.id);
      if (error) throw error;
      setBudgets(prev => prev.filter(b => b.id !== budget.id));
    } catch (err) {
      console.error("削除エラー:", err);
      alert("削除に失敗しました");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <SideMenu />
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">予算管理</h1>
        <div>
          <label className="text-sm mr-2">対象月</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { setEditing(null); setShowForm(s => !s); }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "フォームを閉じる" : "予算を追加"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <BudgetForm
            month={month}
            accounts={accounts}
            initial={editing}
            onSave={editing ? handleUpdate : handleAdd}
            onCancel={() => { setEditing(null); setShowForm(false); }}
          />
        </div>
      )}

      <div>
        <BudgetTable
          budgets={budgets}
          transactions={transactions}
          onEdit={(b) => { setEditing(b); setShowForm(true); }}
          onDelete={handleDelete}
        />
      </div>

      {loading && <p className="text-sm text-gray-500 mt-4">読み込み中...</p>}
    </div>
  );
}
