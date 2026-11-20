// Design Ref: §3.5 — 관리자 화면(`/admin`): 작성자만 사용한다. 검색에 나오지 않게 한다.
import type { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자</h1>
      <AdminPanel />
    </div>
  );
}
