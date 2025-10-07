import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TransactionForm({ accounts = [], onAdd }) {
  const [date, setDate] = useState('');
  const [debitId, setDebitId] = useState('');
  const [creditId, setCreditId] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

    // 科目一覧をSupabaseから取得
    useEffect(() => {
      const fetchAccounts = async () => {
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .order('category', { ascending: true });

        if (error) {
          console.error('科目の取得に失敗しました:', error);
        } else {
          setAccounts(data);
        }
      };

      fetchAccounts();
    }, []);

  // 収支データをSupabaseに登録
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const newTransaction = {
      date,
      debit_id: debitId,
      credit_id: creditId,
      amount: Number(amount),
      memo,
    };

    const { data, error } = await supabase.from('transactions').insert([newTransaction]).select();

    if (error) {
      console.error('登録エラー:', error.message);
      alert('登録に失敗しました: ' + error.message);
    } else {
      // 成功時に親へ通知（画面一覧を更新）
      if (onAdd && data && data.length > 0) onAdd(data[0]);

      // 入力フォームをクリア
      setDate('');
      setDebitId('');
      setCreditId('');
      setAmount('');
      setMemo('');
    }

    setLoading(false);
  };

  // カテゴリごとにグループ化
  const groupedAccounts = accounts.reduce((acc, account) => {
    if (!acc[account.classification]) acc[account.classification] = [];
    acc[account.classification].push(account);
    return acc;
  }, {});


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
        <select
          value={debitId}
          onChange={(e) => setDebitId(e.target.value)}
          required
          className="border p-2 rounded w-full"
        >
          <option value="">選択してください</option>
          {Object.entries(groupedAccounts).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      <div>
        <label className="block font-medium">貸方科目</label>
        <select
          value={creditId}
          onChange={(e) => setCreditId(e.target.value)}
          required
          className="border p-2 rounded w-full"
        >
          <option value="">選択してください</option>
          {Object.entries(groupedAccounts).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {items.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
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
