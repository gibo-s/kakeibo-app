"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const CLASSIFICATIONS = ["資産", "負債", "収入", "費用"];

export default function AccountForm({ initial = null, onSaved, onCancel }) {
  const [name, setName] = useState("");
  const [classification, setClassification] = useState(CLASSIFICATIONS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initial) {
      setName(initial.name || "");
      setClassification(initial.classification || CLASSIFICATIONS[0]);
    } else {
      setName("");
      setClassification(CLASSIFICATIONS[0]);
    }
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("科目名を入力してください");
      return;
    }
    if (!CLASSIFICATIONS.includes(classification)) {
      alert("分類が不正です");
      return;
    }

    setLoading(true);
    try {
      if (initial) {
        const { data, error } = await supabase
          .from("accounts")
          .update({ name: name.trim(), classification })
          .eq("id", initial.id)
          .select();
        if (error) throw error;
        onSaved?.(data[0]);
      } else {
        const { data, error } = await supabase
          .from("accounts")
          .insert([{ name: name.trim(), classification }])
          .select();
        if (error) throw error;
        onSaved?.(data[0]);
      }
    } catch (err) {
      console.error(err);
      alert("保存に失敗しました: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-3">
      <div>
        <label className="block text-sm font-medium">科目名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="例: 現金"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">分類（固定）</label>
        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className="border p-2 rounded w-full bg-white"
        >
          {CLASSIFICATIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {loading ? "保存中..." : initial ? "更新" : "追加"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            キャンセル
          </button>
        )}
      </div>
    </form>
  );
}
