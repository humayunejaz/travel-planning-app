import { DebugEnvPanel } from "@/components/debug-env-panel"

export default function DebugEnvPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8">Environment Variables Debug</h1>
        <DebugEnvPanel />
      </div>
    </div>
  )
}
