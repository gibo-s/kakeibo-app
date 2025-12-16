"use client";

import PLTable from "@/components/PLTable";
import SideMenu from "../components/SideMenu";

export default function PLPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <SideMenu />
      
      <h1 className="text-xl font-bold mb-4">損益計算書</h1>
      <PLTable />
    </div>
  );
}
