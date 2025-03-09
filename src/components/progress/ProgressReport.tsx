
import { forwardRef } from "react";
import WeeklyChart from "./WeeklyChart";
import SubjectDistribution from "./SubjectDistribution";
import MoodJourney from "./MoodJourney";
import SkillsProgress from "./SkillsProgress";
import AchievementSection from "./AchievementSection";

interface ProgressReportProps {
  ref: React.Ref<HTMLDivElement>;
}

const ProgressReport = forwardRef<HTMLDivElement, Omit<ProgressReportProps, 'ref'>>(
  (props, ref) => {
    return (
      <div ref={ref}>
        {/* Weekly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <WeeklyChart />
          <SubjectDistribution />
        </div>

        {/* Mood Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <MoodJourney />
        </div>

        {/* Skills Progress */}
        <div className="mt-6">
          <SkillsProgress />
        </div>

        {/* Achievement Cards */}
        <div className="mt-6">
          <AchievementSection />
        </div>
      </div>
    );
  }
);

ProgressReport.displayName = "ProgressReport";

export default ProgressReport;
