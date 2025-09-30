import { InteractiveGlobe } from "@/components/app/InteractiveGlobe";

/**
 * Have I Been To - Interactive Globe
 * Main app page showing a 3D globe where users can mark visited countries
 */
export default function AppPage() {
  return (
    <div className="flex-1 h-full min-h-[calc(100vh-64px)]">
      <InteractiveGlobe />
    </div>
  );
}

