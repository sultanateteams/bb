import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import WLMaterialsTab from "./components/WLMaterialsTab";
import WLArchiveTab from "./components/WLArchiveTab";
import WLSendModal from "./components/WLSendModal";
import WLDetailModal from "./components/WLDetailModal";
import type { WlOp } from "@/lib/mockData";

export default function WLPage() {
  const [activeTab, setActiveTab] = useState("materials");
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedWLRecord, setSelectedWLRecord] = useState<WlOp | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="WL — White Label"
        subtitle="Materiallarni tashqi zavodga jo'natish va qabul qilish"
        showAdd={activeTab === "materials"}
        addLabel="Ishlab chiqarishga jo'natish"
        onAdd={() => setIsSendModalOpen(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="materials">WL Xomashiyolari</TabsTrigger>
          <TabsTrigger value="archive">WL Arxivi</TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <WLMaterialsTab />
        </TabsContent>

        <TabsContent value="archive">
          <WLArchiveTab onDetail={setSelectedWLRecord} />
        </TabsContent>
      </Tabs>

      <WLSendModal open={isSendModalOpen} onOpenChange={setIsSendModalOpen} />
      <WLDetailModal
        record={selectedWLRecord}
        open={!!selectedWLRecord}
        onOpenChange={(open) => !open && setSelectedWLRecord(null)}
      />
    </div>
  );
}