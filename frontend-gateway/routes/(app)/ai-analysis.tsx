import { Head } from "$fresh/runtime.ts";
import AIAnalysisDashboard from "../../islands/ai-feedback/AIAnalysisDashboard.tsx";

export default function AIAnalysisPage() {
  return (
    <>
      <Head>
        <title>AI Analysis - Real-time Pattern Detection | Muse</title>
        <meta
          name="description"
          content="Experience real-time AI analysis with pattern detection, blueprint matching, and intelligent recommendations"
        />
      </Head>
      <AIAnalysisDashboard />
    </>
  );
}
