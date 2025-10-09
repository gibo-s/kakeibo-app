"use client";

import React from "react";

export default function BalanceSheetTable({ balances }) {
  if (!balances || balances.length === 0) {
    return <p className="text-gray-500 mt-4">データがありません。</p>;
  }

  const assets = balances.filter((b) => b.classification === "資産");
  const liabilities = balances.filter((b) => b.classification === "負債");

  const totalAssets = assets.reduce((sum, b) => sum + b.amount, 0);
  const totalLiabilities = liabilities.reduce((sum, b) => sum + b.amount, 0);

  return (
    <div className="mt-6">
      <table className="w-full border-collapse border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border p-2 w-1/2">資産の部</th>
            <th className="border p-2 w-1/2">負債の部</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.max(assets.length, liabilities.length) }).map(
            (_, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border p-2">
                  {assets[i]?.name || ""}
                  {assets[i] ? (
                    <span className="float-right">{assets[i].amount.toLocaleString()}</span>
                  ) : null}
                </td>
                <td className="border p-2">
                  {liabilities[i]?.name || ""}
                  {liabilities[i] ? (
                    <span className="float-right">
                      {liabilities[i].amount.toLocaleString()}
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          )}
          <tr className="font-bold bg-gray-50">
            <td className="border p-2">
              合計
              <span className="float-right">{totalAssets.toLocaleString()}</span>
            </td>
            <td className="border p-2">
              合計
              <span className="float-right">{totalLiabilities.toLocaleString()}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
