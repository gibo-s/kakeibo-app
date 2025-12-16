"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { label: "収支入力", href: "/" },
    { label: "科目管理", href: "/accounts" },
    { label: "損益計算書（P/L）", href: "/pl" },
    { label: "貸借対照表（B/S）", href: "/balance-sheet" },
    { label: "予算管理", href: "/budget" },
  ];

  return (
    <>
      {/* ヘッダー（ハンバーガー） */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center px-4 z-50">
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded hover:bg-gray-100"
          aria-label="メニューを開く"
        >
          {/* ハンバーガーアイコン */}
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </div>
        </button>

        <h1 className="ml-4 font-semibold text-lg">家計簿アプリ</h1>
      </header>

      {/* オーバーレイ */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* サイドメニュー */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b">
          <span className="font-semibold">メニュー</span>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-800"
            aria-label="メニューを閉じる"
          >
            ✕
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                  block px-3 py-2 rounded
                  ${isActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "hover:bg-gray-100"}
                `}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* ヘッダー分の余白 */}
      <div className="h-14" />
    </>
  );
}
