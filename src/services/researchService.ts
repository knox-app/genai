import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ResearchStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export async function performDeepResearch(
  topic: string,
  onProgress: (steps: ResearchStep[], currentStep: string) => void
) {
  const steps: ResearchStep[] = [
    { id: 'plan', label: 'Developing research plan', status: 'pending' },
    { id: 'search', label: 'Searching the web', status: 'pending' },
    { id: 'analyze', label: 'Analyzing findings', status: 'pending' },
    { id: 'synthesize', label: 'Synthesizing final report', status: 'pending' },
  ];

  const updateStep = (id: string, status: ResearchStep['status']) => {
    const step = steps.find(s => s.id === id);
    if (step) step.status = status;
    onProgress([...steps], id);
  };

  try {
    // Step 1: Plan
    updateStep('plan', 'running');
    const planResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `I want to perform deep research on the topic: "${topic}". 
      First, create a detailed research outline with 5-7 key areas to investigate. 
      Format the output as a simple list of topics.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    const plan = planResponse.text;
    updateStep('plan', 'completed');

    // Step 2: Search & Analyze (Combined for efficiency in this demo, but could be iterative)
    updateStep('search', 'running');
    const researchResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Perform deep research on "${topic}" based on this plan:
      ${plan}
      
      Use Google Search to find the latest and most relevant information. 
      Provide a detailed analysis of each point in the plan.`,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    const findings = researchResponse.text;
    updateStep('search', 'completed');

    // Step 3: Analyze
    updateStep('analyze', 'running');
    // In a real "deep" research, we might do more specific queries here.
    // For now, we'll simulate the analysis phase as it's already partly done by the model.
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    updateStep('analyze', 'completed');

    // Step 4: Synthesize
    updateStep('synthesize', 'running');
    const finalReportResponse = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Synthesize a comprehensive, professional research report on "${topic}".
      Use the following research findings:
      ${findings}
      
      The report should include:
      1. Executive Summary
      2. Detailed Findings (organized by sections)
      3. Current Trends & Data
      4. Future Outlook
      5. Conclusion
      6. References (list the sources found during research)
      
      Format the report in clean Markdown.`,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    updateStep('synthesize', 'completed');

    return finalReportResponse.text;
  } catch (error) {
    console.error("Research failed:", error);
    steps.forEach(s => { if (s.status === 'running') s.status = 'error'; });
    onProgress([...steps], 'error');
    throw error;
  }
}
