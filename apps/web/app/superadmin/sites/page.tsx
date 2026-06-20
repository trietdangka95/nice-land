import { SitesTable } from "@/components/sites-table";
import { sites } from "@/lib/data";

export default function SitesPage() {
  return <SitesTable sites={sites} />;
}
