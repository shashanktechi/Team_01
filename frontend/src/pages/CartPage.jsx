import React from 'react';
import { useNavigate } from 'react-router';
import { X, Home, Clock, Plus, Minus, ChevronRight, Tag, Info, Wallet, ArrowRight } from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();

  const cartItems = [
    {
      id: 1,
      name: 'Fresh Organic Spinach',
      size: '250g',
      price: '₹45',
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT1Luhd9ggpFl-b3echWAmFnm_DPr5gT2tCmsP1g_jZRFCSdKie3ND42wib1xjPlr4co6QR-K0GRnFbGuN6FAnu-Tezf3XYiktgzw4Rat4ieI1gV40SOEs7R9DiT_mou-rjhK4ZJVyOO1e2gQ9-oZYvmRIhvposxVvaSIWIoltioBWIog937Bltgp2L3hjh7oKAMI0clblWJzScQvAnY7RR9o4SSEYO7FkTQ3Xr4h2bAuSOXPGgawx'
    },
    {
      id: 2,
      name: 'Oatly Barista Edition Oat Milk',
      size: '1L',
      price: '₹280',
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRH5UkI7u37eJqMtaieN5OHBiMHX0tSV22ANqWiSOXodNq-MJF3UjX_LfWPZpn0vKpC_b5cQwIYJ6CaNP_lk9itFcahzU7mxsa9oEuLi-xnEOSk1YZUEfcOVy_sy_-DW8qRqDDnfbebge3DVVok4tZ6wIre7PRkeHPH6PduxaUNXlNZKnFek-W35jiMAmJ2u2tKo7k-yHGFcB0_WsrjS7C58tZSa3QAtFVLkYgynaqL-p8fWDcn-Ml'
    },
    {
      id: 3,
      name: 'Cherry Tomatoes',
      size: '200g',
      price: '₹80',
      quantity: 2,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAoD60VJ8flx1yvvW7P1PcSMQQPKqkc0vWj18MENF008t2rD6S43EqvAA1fkjCW1kFX7YLkKIGyhpVSFYt79iR8oka-vVmagsDHkg4NMWueyQkBnp0CR34_pLFFwmKTG3vT0YH2VBSVYlcPFCeyKSJfdPz8vJIJ1pWBkMBtvr4-u3n-i0zICnefA-sKRxiNQ63FvswGe-inH2ZrgH6S4E4NN8cZbnObgfLAJpDnHWFeBkg3cbDMVDw5'
    }
  ];

  const suggestions = [
    { id: 4, name: 'Sourdough Loaf', price: '₹120', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNQJCGEcRCy9IQM0Ikrgw9HxzhmHB_NpDwPVPIjRoRgBBxebYPiJ7FeNw680pcxBvuYHSko3weXA335HzvtGutMLd6w7TX4sK8et_EAfUzUVYM8AzuEMaePpAU9UE2R4Nd5PXaI2pSd8vWxak6j12tbxy1Y1fJIoHtfRYTuADfc6q92c31X2kZ6ygKuZuj6zLOkqJvOMJww-nJDsK4IkcXL12-NQnmVAZQjKnvi0JO524oZH2RDjZc' },
    { id: 5, name: 'Peanut Butter', price: '₹350', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQCUmFIaHyv-d3sBs21WFzhfsawhAVppLtsMe_UZV-JDD8B9MYrDBhPtl0tQxWBU61yyUnhTlVNovaKncViyg3yqIw9-Shf3lXI4i_2a5HOWbbnVMi_rsD3jKJr7M4Yqr-EZu02swpmHyiNOXW9y4BdQBuDrP-ZR1bdqbgfYBuD2q3P9QD6NDgug4mxZul4M020QF6K6UpDGpBVe12_F2LhZPK_YOglZ6RbhkprgtK1AJC5dhuauAT' }
  ];

  return (
    <div className="bg-surface-dim font-body-md text-on-surface antialiased min-h-screen">
      <div className="max-w-[480px] mx-auto bg-surface-container-lowest h-full min-h-screen flex flex-col shadow-lg relative">
        <div className="px-margin-mobile py-4 flex justify-between items-center shrink-0 border-b border-surface-variant sticky top-0 bg-surface-container-lowest z-10">
          <h2 className="font-headline-md text-headline-md text-on-surface">My Cart (3 Items)</h2>
          <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-variant/50 transition-colors">
            <X className="h-6 w-6 text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
          {/* Delivery Address */}
          <div className="mx-margin-mobile mt-4 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <Home className="h-6 w-6 text-primary" />
                <div className="text-left">
                  <span className="font-label-md text-label-md text-on-surface block">Delivering to Home</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block truncate w-48">123 Emerald Street, Block B, Apt 4G</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>

          {/* Estimated Delivery */}
          <div className="mx-margin-mobile mt-4 flex items-center gap-2 text-primary-container bg-primary-container/10 p-3 rounded-lg">
            <Clock className="h-5 w-5" />
            <span className="font-headline-sm text-headline-sm">Delivery in 12 mins</span>
          </div>

          {/* Cart Items */}
          <div className="mt-4 px-margin-mobile flex flex-col gap-4">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-start gap-4 p-3 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant">
                <img className="w-16 h-16 object-cover rounded-lg bg-surface-container" alt={item.name} src={item.image} />
                <div className="flex-1">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface line-clamp-2">{item.name}</h3>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block mt-0.5">{item.size}</span>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-price-sm text-price-sm text-on-surface">{item.price}</span>
                    <div className="flex items-center border border-outline-variant rounded-lg bg-surface-container-lowest overflow-hidden h-8">
                      <button className="w-8 h-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/50 active:scale-95 transition-all">
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-label-md text-label-md text-primary">{item.quantity}</span>
                      <button className="w-8 h-full flex items-center justify-center text-primary hover:bg-surface-variant/50 active:scale-95 transition-all">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Suggested Add-ons */}
          <div className="mt-8">
            <div className="px-margin-mobile flex justify-between items-end mb-3">
              <h3 className="font-headline-md text-headline-md text-on-surface">Missed something?</h3>
            </div>
            <div className="flex overflow-x-auto hide-scrollbar gap-3 px-margin-mobile pb-4">
              {suggestions.map(sug => (
                <div key={sug.id} className="w-32 shrink-0 bg-surface rounded-xl p-2 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant flex flex-col">
                  <img className="w-full h-24 object-cover rounded-lg bg-surface-container mb-2" alt={sug.name} src={sug.image} />
                  <span className="font-label-md text-label-md text-on-surface line-clamp-2 h-8">{sug.name}</span>
                  <div className="mt-2 flex justify-between items-center w-full">
                    <span className="font-price-sm text-price-sm text-on-surface">{sug.price}</span>
                    <button className="w-7 h-7 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center active:scale-90 transition-transform">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coupons */}
          <div className="mx-margin-mobile mt-2 mb-6">
            <button className="w-full flex items-center justify-between p-3 border border-outline-variant border-dashed rounded-xl bg-surface-bright hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-secondary-container" />
                <span className="font-headline-sm text-headline-sm text-on-surface">Apply Coupon</span>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant" />
            </button>
          </div>

          {/* Bill Summary */}
          <div className="mx-margin-mobile bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant p-4">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-3 border-b border-surface-variant pb-2">Bill Details</h3>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-body-md text-body-md text-on-surface-variant">Item Total</span>
              <span className="font-body-md text-body-md text-on-surface">₹485</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1">
                Delivery Fee <Info className="h-3.5 w-3.5" />
              </span>
              <div className="flex items-center gap-2">
                <span className="font-body-md text-body-md text-on-surface-variant line-through">₹40</span>
                <span className="font-label-md text-label-md text-primary bg-primary-container/10 px-1.5 py-0.5 rounded text-primary-container">FREE</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="font-body-md text-body-md text-primary">Coupon Discount (WELCOME)</span>
              <span className="font-body-md text-body-md text-primary">-₹35</span>
            </div>
            <div className="border-t border-surface-variant mt-3 pt-3 flex justify-between items-center">
              <span className="font-headline-md text-headline-md text-on-surface">Grand Total</span>
              <span className="font-price-lg text-price-lg text-on-surface">₹450</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mx-margin-mobile mt-4 mb-8 bg-surface rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.05)] border border-surface-variant overflow-hidden">
            <button className="w-full px-4 py-3 flex items-center justify-between bg-surface-container-low hover:bg-surface-container transition-colors">
              <div className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-on-surface" />
                <div className="text-left">
                  <span className="font-label-md text-label-md text-on-surface block">Pay via</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant block">GPay / UPI</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-on-surface-variant rotate-90" />
            </button>
          </div>
        </div>

        {/* Sticky Bottom Bar */}
        <div className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-surface-variant p-margin-mobile shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-20">
          <button onClick={() => navigate('/track')} className="w-full bg-primary hover:bg-primary-container text-on-primary font-headline-sm text-headline-sm py-3 px-4 rounded-xl flex justify-between items-center transition-all active:scale-[0.98] shadow-md">
            <div className="flex flex-col text-left">
              <span className="font-price-lg text-price-lg leading-tight">₹450</span>
              <span className="font-label-md text-label-md opacity-90 font-normal">TOTAL</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Proceed to Pay</span>
              <ArrowRight className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
