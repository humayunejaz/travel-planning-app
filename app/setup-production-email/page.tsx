"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, AlertCircle, ExternalLink, Copy, Mail, Globe, Settings } from "lucide-react"

export default function SetupProductionEmail() {
  const [domain, setDomain] = useState("")
  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState("")

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(""), 2000)
  }

  const steps = [
    {
      title: "Choose Your Domain",
      description: "Decide which domain you'll use for sending emails",
      icon: Globe,
    },
    {
      title: "Add Domain to Resend",
      description: "Register your domain in the Resend dashboard",
      icon: Settings,
    },
    {
      title: "Configure DNS Records",
      description: "Add verification records to your domain's DNS",
      icon: CheckCircle,
    },
    {
      title: "Update Your Code",
      description: "Change the 'from' address in your application",
      icon: Mail,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🚀 Setup Production Email with Resend</h1>
          <p className="text-gray-600">Send emails to anyone by verifying your domain</p>
        </div>

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
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${step > index + 1 ? "bg-green-500" : "bg-gray-300"}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step 1: Choose Domain */}
        {step === 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Step 1: Choose Your Domain
              </CardTitle>
              <CardDescription>
                You need a domain to send emails from. This can be your website domain or a subdomain.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You need to own a domain and have access to its DNS settings.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter your domain:</label>
                  <Input
                    placeholder="example.com or mail.example.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Domain Options:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>
                      • <strong>Main domain:</strong> example.com (emails from noreply@example.com)
                    </li>
                    <li>
                      • <strong>Subdomain:</strong> mail.example.com (emails from hello@mail.example.com)
                    </li>
                    <li>
                      • <strong>Recommended:</strong> Use a subdomain for better organization
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Don't Have a Domain?</h4>
                  <p className="text-sm text-yellow-800 mb-2">You can buy one from:</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">Namecheap</Badge>
                    <Badge variant="outline">GoDaddy</Badge>
                    <Badge variant="outline">Cloudflare</Badge>
                    <Badge variant="outline">Google Domains</Badge>
                  </div>
                </div>

                <Button onClick={() => setStep(2)} disabled={!domain} className="w-full">
                  Continue with {domain || "your domain"} →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Add Domain to Resend */}
        {step === 2 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Step 2: Add Domain to Resend
              </CardTitle>
              <CardDescription>Register your domain in the Resend dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Your Domain: {domain}</h4>
                <p className="text-sm text-blue-800">We'll add this domain to your Resend account</p>
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
                      <p className="font-medium">Enter your domain</p>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-gray-200 px-2 py-1 rounded text-sm">{domain}</code>
                        <Button variant="outline" size="sm" onClick={() => copyToClipboard(domain, "domain")}>
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
                      <p className="text-sm text-gray-600">Resend will show you DNS records to add</p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    After adding the domain, Resend will show you DNS records. Keep that page open - you'll need those
                    records in the next step!
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

        {/* Step 3: Configure DNS */}
        {step === 3 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Step 3: Configure DNS Records
              </CardTitle>
              <CardDescription>Add the DNS records that Resend provided to your domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> You should see DNS records in your Resend dashboard now. If not, go back
                  and complete Step 2 first.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">What DNS Records Look Like:</h4>
                  <div className="text-sm text-yellow-800 space-y-2">
                    <div className="bg-white p-2 rounded border">
                      <strong>Type:</strong> TXT
                      <br />
                      <strong>Name:</strong> @ or {domain}
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
                  <h4 className="font-semibold">How to Add DNS Records:</h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Go to your domain provider</p>
                        <p className="text-sm text-gray-600">Where you bought your domain (Namecheap, GoDaddy, etc.)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Find DNS Management</p>
                        <p className="text-sm text-gray-600">Look for "DNS", "DNS Management", or "Advanced DNS"</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Add each DNS record</p>
                        <p className="text-sm text-gray-600">Copy the Type, Name, and Value exactly from Resend</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                        4
                      </div>
                      <div>
                        <p className="font-medium">Wait for verification</p>
                        <p className="text-sm text-gray-600">
                          DNS changes can take up to 24 hours (usually much faster)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Need Help with Your DNS Provider?</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>
                      • <strong>Namecheap:</strong> Domain List → Manage → Advanced DNS
                    </p>
                    <p>
                      • <strong>GoDaddy:</strong> My Products → Domain → DNS
                    </p>
                    <p>
                      • <strong>Cloudflare:</strong> Dashboard → DNS → Records
                    </p>
                    <p>
                      • <strong>Google Domains:</strong> My domains → DNS
                    </p>
                  </div>
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
                <Mail className="w-5 h-5" />
                Step 4: Update Your Code
              </CardTitle>
              <CardDescription>
                Change the 'from' address in your application to use your verified domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Once your domain is verified in Resend (green checkmark), you can update your code.
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
                    <code className="text-sm text-green-800">from: "TravelPlan &lt;noreply@{domain}&gt;"</code>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2"
                      onClick={() => copyToClipboard(`from: "TravelPlan <noreply@${domain}>"`, "code")}
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
                    Find the line with <code>from: "TravelPlan &lt;onboarding@resend.dev&gt;"</code> and replace it with
                    the new code above.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Wait for Verification</h4>
                  <p className="text-sm text-yellow-800">
                    Don't update your code until you see a green checkmark next to your domain in the Resend dashboard.
                    This means DNS verification is complete.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">After Updating:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>You can send emails to any email address</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Collaborators will receive invitations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Emails will come from your domain</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Better email deliverability</span>
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

        {/* Summary Card */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">🎉 Production Email Setup</CardTitle>
            <CardDescription className="text-green-700">
              Once complete, you'll be able to send emails to anyone!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-green-800 mb-2">What You'll Get:</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Send to any email address</li>
                  <li>• Professional email appearance</li>
                  <li>• Better deliverability</li>
                  <li>• No testing limitations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-green-800 mb-2">Timeline:</h4>
                <ul className="space-y-1 text-green-700">
                  <li>• Domain setup: 5 minutes</li>
                  <li>• DNS propagation: 1-24 hours</li>
                  <li>• Code update: 1 minute</li>
                  <li>• Total: Usually under 2 hours</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
