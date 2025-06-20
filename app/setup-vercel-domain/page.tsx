"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Globe, Zap, ArrowRight } from "lucide-react"

export default function SetupVercelDomain() {
  const [vercelDomain, setVercelDomain] = useState("")
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  // Try to detect current domain
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentDomain = window.location.hostname
      if (currentDomain.includes("vercel.app")) {
        setVercelDomain(currentDomain)
      }
    }
  }, [])

  const steps = [
    { title: "Find Your Vercel Domain", icon: Globe },
    { title: "Add Domain to Resend", icon: Zap },
    { title: "Configure DNS in Vercel", icon: CheckCircle },
    { title: "Update Your Code", icon: ArrowRight },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Setup Email with Vercel Domain</h1>
          <p className="text-gray-600">Use your free Vercel domain for production email sending</p>
        </div>

        {/* Auto-detected domain */}
        {vercelDomain && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Globe className="h-4 w-4" />
            <AlertDescription>
              <strong>Auto-detected your domain:</strong> {vercelDomain}
              <Button variant="outline" size="sm" className="ml-2" onClick={() => setStep(2)}>
                Use This Domain →
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon
              const isActive = step === index + 1
              const isCompleted = step > index + 1

              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-green-500 border-green-500 text-white"
                        : isActive
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "bg-gray-200 border-gray-300 text-gray-500"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${step > index + 1 ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Find Vercel Domain */}
        {step === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Step 1: Find Your Vercel Domain
              </CardTitle>
              <CardDescription>Every Vercel deployment gets a free domain ending in .vercel.app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">🎯 Your Vercel Domain Options:</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <div>
                    <strong>Current domain:</strong> {vercelDomain || "Not detected (deploy first)"}
                  </div>
                  <div>
                    <strong>Format:</strong> your-app-name.vercel.app
                  </div>
                  <div>
                    <strong>Example:</strong> travel-planner-abc123.vercel.app
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter your Vercel domain:</label>
                  <Input
                    placeholder="your-app-name.vercel.app"
                    value={vercelDomain}
                    onChange={(e) => setVercelDomain(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Don't have a Vercel domain yet?</h4>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <p>1. Push your code to GitHub</p>
                    <p>2. Connect GitHub to Vercel</p>
                    <p>3. Deploy your app</p>
                    <p>4. Get your free .vercel.app domain</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => window.open("https://vercel.com/new", "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Deploy on Vercel
                  </Button>
                </div>

                <Button onClick={() => setStep(2)} disabled={!vercelDomain} className="w-full">
                  Continue with {vercelDomain || "your domain"} →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add to Resend */}
        {step === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Step 2: Add Domain to Resend
              </CardTitle>
              <CardDescription>Register your Vercel domain in Resend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Your Vercel Domain: {vercelDomain}</h4>
                <p className="text-sm text-green-800">We'll add this to your Resend account</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Follow these steps:</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Go to Resend Domains</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open("https://resend.com/domains", "_blank")}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Resend Domains
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Click "Add Domain"</p>
                      <p className="text-sm text-gray-600">Look for the blue "Add Domain" button</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Enter your Vercel domain</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-gray-200 px-2 py-1 rounded text-sm">{vercelDomain}</code>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(vercelDomain, "domain")}>
                          <Copy className="w-4 h-4" />
                          {copied === "domain" ? "Copied!" : "Copy"}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Click "Add Domain"</p>
                      <p className="text-sm text-gray-600">Resend will show you DNS records</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    After adding the domain, Resend will show you DNS records. Keep that page open - you'll need those
                    records for the next step!
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    ← Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    I've Added the Domain →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Configure DNS in Vercel */}
        {step === 3 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Step 3: Configure DNS in Vercel
              </CardTitle>
              <CardDescription>Add the DNS records from Resend to your Vercel project settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Great news!</strong> Since you're using Vercel, DNS setup is much easier than other providers.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">What DNS Records Look Like:</h4>
                  <div className="text-sm text-blue-800 space-y-2">
                    <div className="bg-white p-2 rounded border">
                      <strong>Type:</strong> TXT
                      <br />
                      <strong>Name:</strong> @ or {vercelDomain}
                      <br />
                      <strong>Value:</strong> v=spf1 include:_spf.resend.com ~all
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <strong>Type:</strong> CNAME
                      <br />
                      <strong>Name:</strong> resend._domainkey
                      <br />
                      <strong>Value:</strong> resend._domainkey.resend.com
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">How to Add DNS Records in Vercel:</h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Go to Vercel Dashboard</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => window.open("https://vercel.com/dashboard", "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open Vercel Dashboard
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Select your project</p>
                        <p className="text-sm text-gray-600">Find your travel planning app project</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Go to Settings → Domains</p>
                        <p className="text-sm text-gray-600">Find your {vercelDomain} domain</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Click "Manage DNS Records"</p>
                        <p className="text-sm text-gray-600">Add the TXT and CNAME records from Resend</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚡ Vercel DNS is Fast!</h4>
                  <p className="text-sm text-yellow-800">
                    Unlike other providers, Vercel DNS changes usually take effect within minutes, not hours.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    ← Back
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    I've Added DNS Records →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Update Code */}
        {step === 4 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Step 4: Update Your Code
              </CardTitle>
              <CardDescription>Change the 'from' address to use your verified Vercel domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Once your domain shows verified in Resend (green checkmark), update your code.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Current Code (Testing Mode):</h4>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <code className="text-sm">from: "TravelPlan &lt;onboarding@resend.dev&gt;"</code>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">New Code (Production Mode):</h4>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <code className="text-sm text-green-800">from: "TravelPlan &lt;noreply@{vercelDomain}&gt;"</code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyToClipboard(`from: "TravelPlan <noreply@${vercelDomain}>"`, "code")}
                    >
                      <Copy className="w-4 h-4" />
                      {copied === "code" ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">File to Update:</h4>
                  <p className="text-sm text-blue-800 mb-2">
                    <code>app/api/send-invitation/route.ts</code>
                  </p>
                  <p className="text-sm text-blue-800">
                    Find line 65 with <code>const fromAddress = "TravelPlan &lt;onboarding@resend.dev&gt;"</code> and
                    replace it.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">🎉 After Updating:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Send emails to any email address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Emails come from your Vercel domain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Professional email appearance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>No more testing limitations</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>
                    ← Back
                  </Button>
                  <Button onClick={() => window.open("https://resend.com/domains", "_blank")} className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check Domain Status in Resend
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🚀 Vercel Domain Email Setup</CardTitle>
            <CardDescription className="text-green-700">
              Using your free Vercel domain for production email sending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">✅ Benefits:</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Free domain (no cost)</li>
                  <li>• Fast DNS propagation</li>
                  <li>• Easy Vercel integration</li>
                  <li>• Professional appearance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">⏱️ Timeline:</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Setup: 10 minutes</li>
                  <li>• DNS verification: 5-30 minutes</li>
                  <li>• Code update: 2 minutes</li>
                  <li>• Total: Usually under 1 hour</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
