
import { Button } from "@/components/ui/button";
import { UserSearch } from "@/components/UserSearch";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import ProgressReport from "@/components/progress/ProgressReport";
import StatsDisplay from "@/components/progress/StatsDisplay";

const ProgressPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadReport = async () => {
    if (!reportRef.current) return;
    
    toast.info("Generating your report...");
    
    try {
      const contentElement = reportRef.current;
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        backgroundColor: "#000000",
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('progress-report.pdf');
      
      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 md:space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">📈 Progress Check</h1>
            <p className="text-gray-400">"Life goes on" - and so does your growth!</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={handleDownloadReport}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>

        {/* Content to be included in the report */}
        <ProgressReport ref={reportRef} />

        {/* User Search Component - Not included in the report */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <UserSearch />
          </div>
        </div>
        
        {/* Additional Stats */}
        <StatsDisplay />
      </motion.div>
    </div>
  );
};

export default ProgressPage;
