
import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Star, MapPin, ExternalLink, LogIn, UserPlus } from 'lucide-react';
import { HeroSlideshow } from '@/components/home/HeroSlideshow';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <HeroSlideshow className="absolute inset-0 z-0" intervalMs={5000} />
        
        <div className="container relative z-10 px-4 text-center space-y-8 max-w-4xl mx-auto">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge className="bg-secondary text-secondary-foreground px-4 py-1 mb-4 rounded-full font-bold tracking-widest text-xs uppercase">
              The Best Chinese Cuisine in Clayton
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold text-white tracking-tight">
              A Royal Feast for Your <span className="text-secondary">Senses</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 font-body max-w-2xl mx-auto leading-relaxed">
              Experience authentic flavors crafted with imperial tradition and modern passion.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Link href="/menu">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-7 text-xl rounded-xl shadow-xl shadow-primary/30 group">
                Browse Full Menu
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/info">
              <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 px-8 py-7 text-xl rounded-xl">
                Location & Hours
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="py-24 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl font-headline font-bold mb-6 text-primary">Imperial Quality in Every Dish</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From our signature General Tso to delicate hand-made dim sum, Emperor's Choice brings the heart of Chinese tradition to Clayton. We use only the freshest ingredients and time-honored wok techniques.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-6 bg-background rounded-2xl shadow-sm border border-border text-center">
                <Clock className="w-8 h-8 text-secondary mb-3" />
                <span className="font-bold text-xl">15-20m</span>
                <span className="text-xs text-muted-foreground">Pickup Ready</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-background rounded-2xl shadow-sm border border-border text-center">
                <Star className="w-8 h-8 text-secondary mb-3" />
                <span className="font-bold text-xl">4.8 / 5</span>
                <span className="text-xs text-muted-foreground">Google Reviews</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <Image
                src="https://picsum.photos/seed/chicken/600/400"
                alt="Chef's Specials"
                fill
                unoptimized
                loading="lazy"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                data-ai-hint="chinese dish"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-headline font-bold text-white mb-2">Chef's Specials</h3>
                <p className="text-white/70 text-sm mb-4">Our most celebrated and unique creations.</p>
                <Link href="/menu?cat=Chef's Specials">
                  <Button variant="secondary" size="sm" className="w-fit">Explore</Button>
                </Link>
              </div>
            </div>
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <Image
                src="https://picsum.photos/seed/dimsum/600/400"
                alt="Dim Sum"
                fill
                unoptimized
                loading="lazy"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                data-ai-hint="dim sum"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-headline font-bold text-white mb-2">Dim Sum Corner</h3>
                <p className="text-white/70 text-sm mb-4">Delicate steamed and fried delicacies.</p>
                <Link href="/menu?cat=Appetizers">
                  <Button variant="secondary" size="sm" className="w-fit">Explore</Button>
                </Link>
              </div>
            </div>
            <div className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
              <Image
                src="https://picsum.photos/seed/friedrice/600/400"
                alt="Fast Favorites"
                fill
                unoptimized
                loading="lazy"
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                data-ai-hint="fried rice"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <h3 className="text-2xl font-headline font-bold text-white mb-2">Wok Classics</h3>
                <p className="text-white/70 text-sm mb-4">The ultimate comfort food essentials.</p>
                <Link href="/menu?cat=Rice & Noodles">
                  <Button variant="secondary" size="sm" className="w-fit">Explore</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 外卖 和 地址 和 营业时间 */}
      <section className="py-24 container mx-auto px-4">
        <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-6 max-w-xl">
            <h2 className="text-4xl md:text-5xl font-headline font-bold">Can't Make it to Us?</h2>
            <p className="text-xl text-primary-foreground/80 leading-relaxed">
              We've partnered with the best delivery services to bring Emperor's Choice right to your door.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href="https://www.doordash.com/store/emperor's-choice-chinese-restaurant-clayton-555783/1534229/?pickup=false" target="_blank" rel="noopener noreferrer">
                <Button className="bg-white text-[#FF3008] hover:bg-white/90 font-bold px-6 py-6 rounded-xl">
                  Order on DoorDash <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a href="https://www.ubereats.com/store/emperors-choice-chinese/LSvUUpr3XReBK4G-QPLLuw" target="_blank" rel="noopener noreferrer">
                <Button className="bg-[#06C167] text-white hover:bg-[#06C167]/90 font-bold px-6 py-6 rounded-xl">
                  Order on UberEats <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-auto bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 space-y-6 min-w-[320px]">
            <div className="flex items-center gap-4">
              <MapPin className="text-secondary w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Clayton Location</p>
                <p className="text-sm opacity-80">10125 US-70 BUS, Clayton, NC 27520</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="text-secondary w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold">Opening Hours</p>
                <p className="text-sm opacity-80">Mon: Closed</p>
                <p className="text-sm opacity-80">Tue-Thu: 11:00 AM - 9:00 PM</p>
                <p className="text-sm opacity-80">Fri-Sat: 11:00 AM - 10:00 PM</p>
                <p className="text-sm opacity-80">Sun: 12:00 PM - 9:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer removed (per latest design request) */}
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}>
      {children}
    </span>
  );
}
