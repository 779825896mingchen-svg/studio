
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock, ExternalLink, Mail, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-headline font-bold text-primary">Restaurant Information</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto italic">
            "Imperial tradition served daily in the heart of Clayton."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Cards */}
          <div className="lg:col-span-2 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <MapPin className="w-5 h-5" /> Our Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <p className="font-bold text-xl">123 Imperial Street</p>
                    <p className="text-muted-foreground">Clayton, CA 94517</p>
                  </div>
                  <div className="h-48 bg-muted rounded-2xl relative overflow-hidden group">
                    <Image 
                      src="https://picsum.photos/seed/map/600/400" 
                      alt="Map Location" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Button variant="secondary" size="sm" className="rounded-full">Open in Maps</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-3xl overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Clock className="w-5 h-5" /> Royal Service Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Monday</span>
                    <span className="text-muted-foreground">11:00 AM - 9:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Tuesday</span>
                    <span className="text-muted-foreground">11:00 AM - 9:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Wednesday</span>
                    <span className="text-muted-foreground">11:00 AM - 9:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span className="font-medium">Thursday</span>
                    <span className="text-muted-foreground">11:00 AM - 9:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2 text-primary font-bold">
                    <span>Friday</span>
                    <span>11:00 AM - 10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2 text-primary font-bold">
                    <span>Saturday</span>
                    <span>11:00 AM - 10:30 PM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Sunday</span>
                    <span className="text-muted-foreground">12:00 PM - 9:00 PM</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-primary/20 bg-primary/5 rounded-3xl overflow-hidden">
              <CardContent className="p-12 text-center space-y-8">
                <h3 className="text-3xl font-headline font-bold text-primary">Delivery Partners</h3>
                <p className="text-lg text-muted-foreground">
                  Order through our official delivery partners for convenient home dining.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <a href="https://www.doordash.com/store/emperor's-choice-chinese-restaurant-clayton-555783/721362/" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-[#FF3008] hover:bg-[#FF3008]/90 text-white px-8 py-8 text-xl rounded-2xl shadow-xl shadow-[#FF3008]/20">
                      DoorDash <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                  <a href="https://www.ubereats.com/store/emperors-choice-chinese/LSvUUpr3XReBK4G-QPLLuw" target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-[#06C167] hover:bg-[#06C167]/90 text-white px-8 py-8 text-xl rounded-2xl shadow-xl shadow-[#06C167]/20">
                      UberEats <ExternalLink className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Contact */}
          <div className="space-y-8">
            <Card className="bg-card border-border/60 rounded-3xl p-8 space-y-8 shadow-lg">
              <div className="space-y-2">
                <h3 className="font-headline font-bold text-2xl">Contact Us</h3>
                <p className="text-muted-foreground text-sm">Our royal staff is here to help.</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-muted rounded-2xl">
                  <Phone className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Direct Line</p>
                    <p className="text-xl font-bold">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-muted rounded-2xl">
                  <Mail className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Inquiries</p>
                    <p className="font-medium">hello@emperorschoice.com</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-bold flex items-center gap-2">
                  <Info className="w-4 h-4 text-secondary" /> Ordering Info
                </h4>
                <ul className="text-sm space-y-3 text-muted-foreground">
                  <li className="flex gap-2"><span>•</span> Standard pickup time: 15-25 minutes.</li>
                  <li className="flex gap-2"><span>•</span> We accept all major credit cards.</li>
                  <li className="flex gap-2"><span>•</span> Large party orders require 24h notice.</li>
                  <li className="flex gap-2"><span>•</span> Custom spice levels available for most dishes.</li>
                </ul>
              </div>
            </Card>
            
            <div className="relative h-64 rounded-3xl overflow-hidden shadow-2xl">
              <Image 
                src="https://picsum.photos/seed/restaurant-ext/600/800" 
                alt="Emperor's Choice Entrance" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-6 text-white">
                <p className="font-headline font-bold text-xl">Visit the Palace</p>
                <p className="text-sm opacity-80">Free parking in rear lot.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
