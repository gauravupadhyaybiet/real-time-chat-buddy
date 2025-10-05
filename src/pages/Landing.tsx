import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Bot, Volume2, Sparkles, Zap, Shield, ArrowRight, Star, Users, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Gemini Chat AI
            </span>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
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
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Experience the Future of{" "}
            <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              AI Conversations
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chat with Google's most advanced AI model featuring natural conversations, voice synthesis, and intelligent responses.
          </p>
          
          <div className="flex flex-col gap-4 items-center pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-6">
                  Start Chatting
                  <MessageSquare className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/ai-chat">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  Try AI Chat
                  <Bot className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chats">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-teal-50 hover:bg-teal-100 border-teal-200">
                  Real-time Chat
                  <MessageCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/status">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-green-50 hover:bg-green-100 border-green-200">
                  Status Updates
                  <Users className="ml-2 h-5 w-5" />
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
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need for intelligent AI conversations
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced AI</h3>
              <p className="text-muted-foreground">
                Powered by Google's Gemini AI for intelligent, context-aware conversations
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Volume2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Synthesis</h3>
              <p className="text-muted-foreground">
                Natural-sounding speech with ElevenLabs premium voice technology
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-card to-card/50">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground">
                Your API keys are stored locally and never sent to our servers
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30 rounded-2xl mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-semibold">Set API Keys</h3>
            <p className="text-muted-foreground">
              Add your Google Gemini and ElevenLabs API keys for full functionality
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-semibold">Start Chatting</h3>
            <p className="text-muted-foreground">
              Ask questions, get help, or have natural conversations with AI
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-semibold">Listen & Learn</h3>
            <p className="text-muted-foreground">
              Hear responses with natural voice synthesis or read the text
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Experience AI?</h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of users already having intelligent conversations with AI
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-lg px-8 py-6">
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