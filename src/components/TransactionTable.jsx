"use client";

export default function TransactionTable({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <p className="text-gray-500 mt-4">まだ取引は登録されていません。</p>
    );
  }

  return (
    <table className="w-full border-collapse border mt-4 text-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="border p-2">日付</th>
          <th className="border p-2">借方科目</th>
          <th className="border p-2">貸方科目</th>
          <th className="border p-2">金額</th>
          <th className="border p-2">メモ</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((t, index) => (
          <tr key={index} className="hover:bg-gray-50">
            <td className="border p-2">{t.date}</td>
            <td className="border p-2">{t.debit}</td>
            <td className="border p-2">{t.credit}</td>
            <td className="border p-2 text-right">
              {t.amount.toLocaleString()}
            </td>
            <td className="border p-2">{t.memo}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
