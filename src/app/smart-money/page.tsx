import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { ComingSoon } from "@/components/coming-soon";

export default function SmartMoneyPage() {
  return (
    <AppLayout>
      <PageContainer title="Smart Money">
        <ComingSoon title="Smart Money" />
      </PageContainer>
    </AppLayout>
  );
}
