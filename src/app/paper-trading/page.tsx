import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { ComingSoon } from "@/components/coming-soon";

export default function PaperTradingPage() {
  return (
    <AppLayout>
      <PageContainer title="Paper Trading">
        <ComingSoon title="Paper Trading" />
      </PageContainer>
    </AppLayout>
  );
}
