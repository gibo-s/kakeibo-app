import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import TransactionForm from '../components/TransactionForm';
import TransactionTable from '../components/TransactionTable';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // 初回ロード時にデータ取得
  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    const { data, error } = await supabase.from("accounts").select().order("name");
    if (!error && data) setAccounts(data);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        date,
        amount,
        memo,
        debit:debit_id (id, name),
        credit:credit_id (id, name)
      `)
      .order('date', { ascending: false });
    
    if (error){
      console.error('取得エラー:', error.message);
      return;
    } 

    // 表示用データを整形
    const formatted = data.map((t) => ({
      id: t.id,
      date: t.date,
      debit: t.debit?.name || "不明",
      credit: t.credit?.name || "不明",
      amount: t.amount,
      memo: t.memo,
    }));

     setTransactions(formatted);
  };

  // フォーム追加時に一覧にも反映
  const handleAdd = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">複式簿記 家計簿</h1>
      <TransactionForm accounts={accounts} onAdd={handleAdd} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
