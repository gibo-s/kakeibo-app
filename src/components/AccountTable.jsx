"use client";
import React from "react";

export default function AccountTable({ accounts = [], onEdit, onDelete }) {
  if (!accounts || accounts.length === 0) {
    return <p className="text-gray-500">科目がまだ登録されていません。</p>;
  }

  return (
    <table className="min-w-full border-collapse border">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">科目名</th>
          <th className="border p-2 text-left">分類</th>
          <th className="border p-2 text-left">作成日</th>
          <th className="border p-2 text-left">操作</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((acc) => (
          <tr key={acc.id} className="hover:bg-gray-50">
            <td className="border p-2">{acc.name}</td>
            <td className="border p-2">{acc.classification}</td>
            <td className="border p-2 text-sm">
              {acc.created_at ? new Date(acc.created_at).toLocaleString() : "-"}
            </td>
            <td className="border p-2">
              <button onClick={() => onEdit(acc)} className="mr-2 text-sm text-blue-600">
                編集
              </button>
              <button onClick={() => onDelete(acc)} className="text-sm text-red-600">
                削除
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
