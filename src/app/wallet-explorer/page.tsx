import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { ComingSoon } from "@/components/coming-soon";

export default function WalletExplorerPage() {
  return (
    <AppLayout>
      <PageContainer title="Wallet Explorer">
        <ComingSoon title="Wallet Explorer" />
      </PageContainer>
    </AppLayout>
  );
}
