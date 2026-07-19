import React from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, MessageSquare, MapPin, CheckCircle2, Clock, Package } from 'lucide-react';

export function TrackOrderPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-dim font-body-md text-on-surface antialiased min-h-screen pb-6">
      <div className="max-w-[480px] mx-auto bg-background min-h-screen flex flex-col shadow-lg">
        {/* Header */}
        <header className="bg-primary text-on-primary px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="font-headline-md text-headline-md">Track Order</h1>
            <p className="font-label-md text-label-md opacity-90">Order #QC-84729</p>
          </div>
        </header>

        {/* Map Area (Mock) */}
        <div className="w-full h-64 bg-surface-variant relative flex items-center justify-center overflow-hidden">
          {/* Mock Map Image */}
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=12.9716,77.5946&zoom=14&size=600x400&maptype=roadmap&style=feature:all|element:labels.text.fill|color:0x333333&style=feature:water|element:geometry|color:0x006c4a&sensor=false')] opacity-30 bg-cover bg-center mix-blend-multiply"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary flex flex-col items-center animate-bounce">
            <MapPin className="h-8 w-8" fill="currentColor" />
            <div className="w-4 h-1 bg-black/20 rounded-[100%] mt-1 shadow-sm"></div>
          </div>

          {/* Delivery ETA */}
          <div className="absolute top-4 left-4 right-4 bg-surface rounded-xl shadow-md p-4 flex items-center justify-between border border-surface-variant">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface">Arriving in 12 mins</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Your order is on the way!</span>
            </div>
            <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-margin-mobile flex flex-col gap-4">
          {/* Delivery Agent Info */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=11" alt="Delivery Agent" className="w-12 h-12 rounded-full border-2 border-primary" />
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Ramesh K.</h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Delivery Partner • 4.8★</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
                <MessageSquare className="h-5 w-5" />
              </button>
              <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-primary-container transition-colors">
                <Phone className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-4">Order Status</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-[11px] top-3 bottom-3 w-[2px] bg-surface-container-highest"></div>
              
              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Order Confirmed</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">10:45 AM</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface">Order Packed</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">10:50 AM</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0 border-2 border-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-bold">Out for Delivery</span>
                  <span className="font-body-sm text-body-sm text-primary">Arriving by 11:05 AM</span>
                </div>
              </div>

              <div className="flex gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface-container-highest flex items-center justify-center shrink-0">
                </div>
                <div className="flex flex-col opacity-50">
                  <span className="font-label-md text-label-md text-on-surface">Delivered</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Summary */}
          <div className="bg-surface rounded-xl shadow-sm border border-surface-variant p-4 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-surface-container rounded-lg flex items-center justify-center text-on-surface-variant">
                 <Package className="h-6 w-6" />
               </div>
               <div>
                 <span className="font-label-md text-label-md text-on-surface block">3 Items</span>
                 <span className="font-body-sm text-body-sm text-on-surface-variant block">Paid via UPI • ₹450</span>
               </div>
             </div>
             <button className="text-primary font-label-md text-label-md hover:underline">
               Details
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
