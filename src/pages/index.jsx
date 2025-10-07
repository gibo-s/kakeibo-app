import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

export default function Home() {
  const [transactions, setTransactions] = useState([]);

  // 初回ロード時にデータ取得
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select().order('date', { ascending: false });
    if (error) console.error('取得エラー:', error.message);
    else setTransactions(data);
  };

  // フォーム追加時に一覧にも反映
  const handleAdd = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">複式簿記 家計簿</h1>
      <TransactionForm onAdd={handleAdd} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
