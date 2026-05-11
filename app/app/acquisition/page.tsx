import { AcquisitionStageBoard } from '../../components/acquisition-stage-board';
import { FunnelStageMetrics } from '../../components/funnel-stage-metrics';
import { Sidebar } from '../../components/sidebar';
import { Topbar } from '../../components/topbar';

export default function AcquisitionPage() {
  return (
    <main className="min-h-screen bg-[#f5f2ec] text-stone-900">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <Sidebar />
        <div className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 xl:px-8">
          <div className="flex flex-col gap-6">
            <Topbar
              eyebrow="Acquisition"
              title="Webinar acquisition funnel"
              subtitle="Map each stage from paid traffic to registration, nurture, attendance, and conversion output."
            />
            <FunnelStageMetrics />
            <AcquisitionStageBoard />
          </div>
        </div>
      </div>
    </main>
  );
}
