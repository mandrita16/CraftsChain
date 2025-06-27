import DashboardLayout from "./(components)/dashboard-layout"
import WelcomeSection from "./(components)/welcome-section"
import CraftItemsSection from "./(components)/craft-items-section"
import IdentitySection from "./(components)/identity-section"
import EcoTokenSection from "./(components)/eco-token-section"
import DaoSection from "./(components)/dao-section"
import AnalyticsSection from "./(components)/analytics-section"

export default function ArtisanDashboardPage() {
  return (
    <DashboardLayout>
      <WelcomeSection />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <CraftItemsSection />
          <IdentitySection />
        </div>
        <div className="space-y-6">
          <EcoTokenSection />
          <DaoSection />
          <AnalyticsSection />
        </div>
      </div>
    </DashboardLayout>
  )
}
