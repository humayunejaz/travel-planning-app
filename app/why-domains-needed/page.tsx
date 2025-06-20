"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Mail, AlertTriangle, CheckCircle, XCircle, Users, Building, Zap, Eye, Lock } from "lucide-react"

export default function WhyDomainsNeeded() {
  const [activeExample, setActiveExample] = useState("with-domain")

  const emailExamples = {
    "without-domain": {
      from: "onboarding@resend.dev",
      description: "Using Resend's shared domain",
      issues: [
        "Shared with thousands of other apps",
        "No control over reputation",
        "Looks unprofessional",
        "Limited to testing only",
        "Can't customize sender name properly",
      ],
    },
    "with-domain": {
      from: "noreply@yourtravelapp.com",
      description: "Using your own domain",
      benefits: [
        "Professional appearance",
        "Full control over reputation",
        "Builds trust with recipients",
        "Can send to anyone",
        "Customizable sender identity",
      ],
    },
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🤔 Why Do I Need a Domain for Email?</h1>
          <p className="text-gray-600">Understanding email domains and why they matter</p>
        </div>

        {/* Quick Answer */}
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <strong>Quick Answer:</strong> Domains prove you're a legitimate sender, not a spammer. Email services like
            Resend require them to protect their reputation and ensure your emails actually get delivered.
          </AlertDescription>
        </Alert>

        {/* Visual Comparison */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📧 Email Comparison: With vs Without Domain</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeExample} onValueChange={setActiveExample}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="without-domain">Without Your Domain</TabsTrigger>
                <TabsTrigger value="with-domain">With Your Domain</TabsTrigger>
              </TabsList>

              <TabsContent value="without-domain" className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Testing Mode Only</span>
                  </div>

                  <div className="bg-white p-3 rounded border mb-3">
                    <div className="text-sm text-gray-600 mb-1">From:</div>
                    <div className="font-mono text-sm">{emailExamples["without-domain"].from}</div>
                    <div className="text-xs text-gray-500 mt-1">{emailExamples["without-domain"].description}</div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-red-800 mb-2">❌ Issues:</h4>
                    <ul className="space-y-1">
                      {emailExamples["without-domain"].issues.map((issue, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-red-700">
                          <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="with-domain" className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-green-800">Production Ready</span>
                  </div>

                  <div className="bg-white p-3 rounded border mb-3">
                    <div className="text-sm text-gray-600 mb-1">From:</div>
                    <div className="font-mono text-sm">{emailExamples["with-domain"].from}</div>
                    <div className="text-xs text-gray-500 mt-1">{emailExamples["with-domain"].description}</div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">✅ Benefits:</h4>
                    <ul className="space-y-1">
                      {emailExamples["with-domain"].benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* The Real Reasons */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Spam Prevention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Email providers fight spam by requiring domain ownership. If you own a domain, you're less likely to be
                a spammer.
              </p>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">🚨 The Problem:</h4>
                <p className="text-sm text-yellow-700">
                  Free domains like .vercel.app can be created instantly by anyone, making them perfect for spam
                  operations.
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ The Solution:</h4>
                <p className="text-sm text-green-700">
                  Paid domains require identity verification and payment, making spammers think twice.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600" />
                Email Deliverability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Gmail, Outlook, and other email providers are more likely to deliver emails from verified domains.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Your domain = Higher trust score</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Shared domain = Lower trust score</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free domain = Often blocked</span>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Emails from shared domains often end up in spam folders
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-green-600" />
                Professional Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">Which email would you trust more from a travel planning app?</p>

              <div className="space-y-2">
                <div className="bg-red-50 p-2 rounded text-sm">
                  <span className="text-red-600">❌</span> onboarding@resend.dev
                </div>
                <div className="bg-green-50 p-2 rounded text-sm">
                  <span className="text-green-600">✅</span> hello@yourtravelapp.com
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Your domain makes your app look legitimate and trustworthy to users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-600" />
                Service Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Professional email services have strict requirements to maintain their reputation.
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Resend
                  </Badge>
                  <span>Requires domain verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    SendGrid
                  </Badge>
                  <span>Requires domain verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Mailgun
                  </Badge>
                  <span>Requires domain verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    AWS SES
                  </Badge>
                  <span>Requires domain verification</span>
                </div>
              </div>

              <p className="text-xs text-gray-500">This is industry standard - not just Resend being difficult!</p>
            </CardContent>
          </Card>
        </div>

        {/* Real World Example */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🌍 Real World Analogy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🏠 Sending Mail Without a Domain:</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Like trying to send mail from "123 Main Street" without proving you actually live there.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Post office is suspicious</li>
                  <li>• Mail might not be delivered</li>
                  <li>• Recipients don't trust it</li>
                  <li>• Looks unprofessional</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-blue-800 mb-2">🏢 Sending Mail With a Domain:</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Like having a verified business address with your name on the building.
                </p>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>• Post office trusts you</li>
                  <li>• Mail gets delivered reliably</li>
                  <li>• Recipients recognize your brand</li>
                  <li>• Looks professional and legitimate</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What Happens Without Domain */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚫 What Happens If You Don't Have a Domain?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <Users className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-red-800 mb-1">Limited Audience</h4>
                  <p className="text-sm text-red-600">Can only email yourself</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-red-800 mb-1">Spam Folder</h4>
                  <p className="text-sm text-red-600">Emails often blocked</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-red-800 mb-1">No Production</h4>
                  <p className="text-sm text-red-600">Can't launch to real users</p>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Bottom line:</strong> Without a domain, your collaboration feature won't work for real users.
                  You can build and test everything, but you can't actually invite collaborators.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Your Options Summary */}
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Your Options Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🧪 Keep Testing</h4>
                <p className="text-sm text-gray-600 mb-2">Continue with your Gmail</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Free</li>
                  <li>• Works for development</li>
                  <li>• Can't invite others</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                <h4 className="font-semibold text-green-800 mb-2">💰 Buy Cheap Domain</h4>
                <p className="text-sm text-gray-600 mb-2">$0.99-8.88/year</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Professional</li>
                  <li>• Works everywhere</li>
                  <li>• Can invite anyone</li>
                </ul>
                <Badge className="mt-2 bg-green-600">Recommended</Badge>
              </div>

              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">🤝 Borrow Domain</h4>
                <p className="text-sm text-gray-600 mb-2">Ask friend/family</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Free to you</li>
                  <li>• Professional appearance</li>
                  <li>• Depends on others</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
