import { AppLayout } from "@/components/layout/app-layout";
import { PageContainer } from "@/components/layout/page-container";
import { ComingSoon } from "@/components/coming-soon";

export default function PortfolioPage() {
  return (
    <AppLayout>
      <PageContainer title="Portfolio">
        <ComingSoon title="Portfolio" />
      </PageContainer>
    </AppLayout>
  );
}
