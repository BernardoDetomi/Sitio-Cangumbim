import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { RoomDetails } from '@/components/RoomDetails';
import { Amenities } from '@/components/Amenities';
import { Gallery } from '@/components/Gallery';
import { LocalTips } from '@/components/LocalTips';
import { BookingCalendar } from '@/components/BookingCalendar';
import { Reviews } from '@/components/Reviews';
import { Footer } from '@/components/Footer';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

export default function Home() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-stone-50 selection:bg-green-200 selection:text-green-900">
      <Header />
      <Hero />
      <About />
      <RoomDetails />
      <Amenities />
      <Gallery />
      <LocalTips />
      <BookingCalendar />
      <Reviews />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
