import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Clock, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="text-center mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-bold">
            Emperor&apos;s Choice
          </p>
          <h1 className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tight">
            Restaurant Information
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Imperial tradition served daily in the heart of Clayton.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12 items-start">
          {/* Left side: Location */}
          <div className="space-y-8">
            <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden flex flex-col">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                  <MapPin className="w-5 h-5 shrink-0" /> Our Location
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-6 flex-1 flex flex-col">
                <div className="space-y-2">
                  <p className="font-bold text-xl">10125 US-70 BUS</p>
                  <p className="text-muted-foreground">Clayton, NC 27520</p>
                </div>

                <div className="h-48 bg-muted rounded-2xl relative overflow-hidden group">
                  <Image
                    src="https://picsum.photos/seed/map/600/400"
                    alt="Map Location"
                    fill
                    unoptimized
                    loading="lazy"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button variant="secondary" size="sm" className="rounded-full" asChild>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=10125+US-70+BUS,+Clayton,+NC+27520"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Get Directions
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle: Hours + Delivery */}
          <div className="space-y-8">
            <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden flex flex-col">
              <CardHeader className="bg-primary/5 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary text-lg">
                  <Clock className="w-5 h-5 shrink-0" /> Service Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-4 flex-1">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Monday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Tuesday</span>
                  <span className="text-muted-foreground">11:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Wednesday</span>
                  <span className="text-muted-foreground">11:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-medium">Thursday</span>
                  <span className="text-muted-foreground">11:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 text-primary font-bold">
                  <span>Friday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2 text-primary font-bold">
                  <span>Saturday</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Sunday</span>
                  <span className="text-muted-foreground">12:00 PM - 9:00 PM</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center space-y-6 md:space-y-8">
                <h3 className="text-2xl md:text-3xl font-headline font-bold text-primary">
                  Delivery Partners
                </h3>
                <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
                  Order through our official delivery partners for convenient home dining.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                  <a
                    href="https://www.doordash.com/store/emperor's-choice-chinese-restaurant-clayton-555783/1534229/?pickup=false"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-[#FF3008] hover:bg-[#FF3008]/90 text-white px-8 py-8 text-xl rounded-2xl shadow-xl shadow-[#FF3008]/20">
                      DoorDash <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <a
                    href="https://www.ubereats.com/store/emperors-choice-chinese/LSvUUpr3XReBK4G-QPLLuw"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="lg" className="bg-[#06C167] hover:bg-[#06C167]/90 text-white px-8 py-8 text-xl rounded-2xl shadow-xl shadow-[#06C167]/20">
                      UberEats <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right side: Contact */}
          <div className="w-full">
            <Card className="bg-card border-border/60 rounded-3xl overflow-hidden shadow-lg">
              <CardContent className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div className="space-y-1">
                  <h3 className="font-headline font-bold text-xl md:text-2xl">Contact Us</h3>
                  <p className="text-muted-foreground text-sm">
                    Reach out for pickup questions, large orders, or special requests.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-muted/80 rounded-2xl">
                    <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Direct Line
                      </p>
                      <p className="text-lg font-bold">(919) 359-2288</p>
                    </div>
                  </div>

                  <Button asChild variant="secondary" className="w-full rounded-2xl">
                    <a href="tel:+19193592288">Call (919) 359-2288</a>
                  </Button>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-bold flex items-center gap-2 text-sm">
                    <Info className="w-4 h-4 text-secondary shrink-0" /> Ordering Info
                  </h4>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex gap-2">• Standard pickup time: 10–15 minutes.</li>
                    <li className="flex gap-2">• We accept all major credit cards and digital wallets.</li>
                  </ul>
                </div>

                <Button asChild className="w-full bg-primary hover:bg-primary/90 rounded-2xl">
                  <a href="/menu">Browse the Menu</a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
