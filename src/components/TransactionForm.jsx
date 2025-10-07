import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TransactionForm({ onAdd }) {
  const [date, setDate] = useState('');
  const [debitAccount, setDebitAccount] = useState('');
  const [creditAccount, setCreditAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newTransaction = {
      date,
      debit: debitAccount,
      credit: creditAccount,
      amount: Number(amount),
      memo,
    };

    // Supabaseに登録
    const { data, error } = await supabase.from('transactions').insert([newTransaction]).select();

    if (error) {
      console.error('登録エラー:', error.message);
      alert('登録に失敗しました: ' + error.message);
    } else {
      // 成功時に親へ通知（画面一覧を更新）
      if (onAdd && data && data.length > 0) onAdd(data[0]);

      // 入力フォームをクリア
      setDate('');
      setDebitAccount('');
      setCreditAccount('');
      setAmount('');
      setMemo('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 shadow rounded space-y-3">
      <div>
        <label className="block font-medium">日付</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-medium">借方科目</label>
        <input
          type="text"
          value={debitAccount}
          onChange={(e) => setDebitAccount(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-medium">貸方科目</label>
        <input
          type="text"
          value={creditAccount}
          onChange={(e) => setCreditAccount(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-medium">金額</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
      </div>
      <div>
        <label className="block font-medium">メモ</label>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? '登録中...' : '追加'}
      </button>
    </form>
  );
}
