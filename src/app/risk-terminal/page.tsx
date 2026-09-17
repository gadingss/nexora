import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { ComingSoon } from "@/components/coming-soon";

export default function RiskTerminalPage() {
  return (
    <AppLayout>
      <PageContainer title="Risk Terminal">
        <ComingSoon title="Risk Terminal" />
      </PageContainer>
    </AppLayout>
  );
}
