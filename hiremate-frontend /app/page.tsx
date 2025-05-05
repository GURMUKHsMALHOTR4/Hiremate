import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="absolute inset-0 grid-pattern -z-10"></div>
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full">
                <span className="font-bold text-white text-lg">H</span>
                <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-purple-600/50 to-blue-500/50 blur-sm -z-10"></div>
              </div>
            </div>
            <div className="font-bold text-2xl bg-gradient-to-r from-purple-400 via-primary to-blue-400 bg-clip-text text-transparent">
              Hiremate
            </div>
          </Link>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost" className="hover:bg-primary/10">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="relative overflow-hidden group">
                <span className="relative z-10">Register</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in">
                <h2 className="text-5xl font-bold tracking-tight leading-tight">
                  Find your <span className="gradient-text">perfect match</span> in the job market
                </h2>
                <p className="text-xl text-muted-foreground">
                  Hiremate connects talented professionals with companies looking for their skills using advanced
                  matching algorithms.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/register">
                    <Button size="lg" className="glow">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary">
                      Sign In
                    </Button>
                  </Link>
                </div>
                <div className="pt-4 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-medium"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Join <span className="text-foreground font-medium">2,000+</span> professionals already on Hiremate
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-30"></div>
                <Card className="relative bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 lg:p-8">
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">Why choose Hiremate?</h3>
                        <p className="text-muted-foreground">Our platform offers several advantages</p>
                      </div>

                      <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                          <div className="rounded-full p-2 bg-primary/10 text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-sparkles"
                            >
                              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                              <path d="M5 3v4" />
                              <path d="M19 17v4" />
                              <path d="M3 5h4" />
                              <path d="M17 19h4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">AI-Powered Matching</h4>
                            <p className="text-sm text-muted-foreground">
                              Our algorithm finds the perfect job matches for your unique skills and preferences
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="rounded-full p-2 bg-primary/10 text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-shield-check"
                            >
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                              <path d="m9 12 2 2 4-4" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Secure Platform</h4>
                            <p className="text-sm text-muted-foreground">
                              Your data is protected with industry-standard security and encryption
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 items-start">
                          <div className="rounded-full p-2 bg-primary/10 text-primary">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="lucide lucide-zap"
                            >
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium">Fast Process</h4>
                            <p className="text-sm text-muted-foreground">
                              Get hired quickly with our streamlined application process and direct employer connections
                            </p>
                          </div>
                        </div>
                      </div>

                      <Link href="/register" className="block">
                        <Button className="w-full">Create an Account</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl font-bold">How Hiremate Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform simplifies the job search and hiring process with these easy steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-user-plus"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" x2="19" y1="8" y2="14" />
                      <line x1="22" x2="16" y1="11" y2="11" />
                    </svg>
                  ),
                  title: "Create Your Profile",
                  description:
                    "Sign up and build your professional profile with your skills, experience, and preferences.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  ),
                  title: "Discover Opportunities",
                  description:
                    "Browse through job listings tailored to your profile or let our AI find matches for you.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-message-square"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                  title: "Connect & Apply",
                  description: "Apply to positions with a single click and communicate directly with employers.",
                },
              ].map((feature, index) => (
                <Card key={index} className="card-hover border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-70"></div>
                  <div className="relative h-16 w-16 rounded-full bg-card flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-quote text-primary"
                    >
                      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
                      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
                    </svg>
                  </div>
                </div>
              </div>

              <blockquote className="text-2xl font-medium leading-relaxed">
                "Hiremate completely transformed my job search. Within two weeks of creating my profile, I received
                three interview offers from companies that perfectly matched my skills and career goals."
              </blockquote>

              <div className="flex flex-col items-center">
                <p className="font-semibold">Alex Morgan</p>
                <p className="text-sm text-muted-foreground">Senior Developer at TechCorp</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 gradient-bg">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">Ready to find your perfect job match?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of professionals who have already found their dream jobs through Hiremate.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="glow">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-primary/50 hover:border-primary">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
                  <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-500 rounded-full">
                    <span className="font-bold text-white text-lg">H</span>
                    <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-purple-600/50 to-blue-500/50 blur-sm -z-10"></div>
                  </div>
                </div>
                <div className="font-bold text-xl bg-gradient-to-r from-purple-400 via-primary to-blue-400 bg-clip-text text-transparent">
                  Hiremate
                </div>
              </Link>
              <p className="text-sm text-muted-foreground">
                Connecting talented professionals with their dream jobs through AI-powered matching.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "For Job Seekers", "For Employers"],
              },
              {
                title: "Resources",
                links: ["Blog", "Career Advice", "Help Center", "Success Stories"],
              },
              {
                title: "Company",
                links: ["About Us", "Contact", "Privacy Policy", "Terms of Service"],
              },
            ].map((column, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-medium">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2025 Hiremate. All rights reserved.</p>
            <div className="flex gap-4">
              {["Twitter", "LinkedIn", "Facebook", "Instagram"].map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
