import { AdminListSkeleton } from "@/components/Skeletons";
import { LayoutDashboard } from "lucide-react";

export default function AdminLoading() {
    return <AdminListSkeleton title="Memuat Halaman..." icon={LayoutDashboard} />;
}
