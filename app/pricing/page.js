import { Suspense } from 'react'
import Pricing from "@/components/Pricing";
import Header from "@/components/Header";


export default function PricingPage() {
  return (
<>
<div className='dotted-grid'>
      <Suspense>
        <Header />
      </Suspense>
      <Pricing />
</div>
</>
  )
}
