import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Volume2, Sparkles, Zap, Shield, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">
              Gemini Chat AI
            </span>
          </div>
          <Link to="/ai-chat">
            <Button className="bg-primary hover:bg-primary/90">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <Badge variant="outline" className="mb-4">
            <Sparkles className="mr-2 h-3 w-3" />
            Powered by Google Gemini AI
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Experience the Future of{" "}
            <span className="text-primary">
              AI Conversations
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chat with Google's most advanced AI model featuring natural conversations, voice synthesis, and intelligent responses.
          </p>
          
          <div className="flex flex-col gap-4 items-center pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/ai-chat">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
                  Start Chatting
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span>Trusted by thousands of users</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for intelligent AI conversations
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Advanced AI</h3>
              <p className="text-muted-foreground">
                Powered by Google's Gemini AI for intelligent, context-aware conversations
              </p>
            </CardContent>
          </Card>
          
          <Card className="border shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Voice Synthesis</h3>
              <p className="text-muted-foreground">
                Natural-sounding speech with built-in voice technology
              </p>
            </CardContent>
          </Card>
          
          <Card className="border shadow-lg hover:shadow-xl transition-shadow bg-card">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your data is stored securely with industry-standard encryption
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-2xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold text-foreground">Create Account</h3>
            <p className="text-muted-foreground">
              Sign up to access AI chat with voice and text capabilities
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold text-foreground">Start Chatting</h3>
            <p className="text-muted-foreground">
              Ask questions, get help, or have natural conversations with AI
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-semibold text-foreground">Explore Features</h3>
            <p className="text-muted-foreground">
              Use voice or text input to interact with AI naturally
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold text-foreground">Ready to Experience AI?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of users already having intelligent conversations with AI
          </p>
          <Link to="/ai-chat">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-6">
              Start Your Journey
              <Zap className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Gemini Chat AI. Built with modern AI technology.</p>
        </div>
      </footer>
    </div>
  );
}