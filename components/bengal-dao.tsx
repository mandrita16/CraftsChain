import { ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function() {
    return (
        <section id="dao" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <Badge className="bg-white text-black hover:bg-gray-800">Decentralized Governance</Badge>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Bengal Artisan DAO</h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A community-governed platform where artisans collectively make decisions on product highlights, fund
                  allocations, and verification of new members.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                    <span>Vote on community decisions and fund allocations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                    <span>Verify new artisan members joining the platform</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                    <span>Participate in selecting featured products for promotion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="h-5 w-5 text-black flex-shrink-0 mt-0.5" />
                    <span>Earn rewards for active participation in governance</span>
                  </li>
                </ul>
                <Button className="bg-white text-black hover:bg-gray-800">Join the DAO</Button>
              </div>
              <div className="flex justify-center">
                <div className="w-full max-w-[500px] aspect-video bg-gray-100 border border-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 text-sm">DAO Governance Visualization</p>
                </div>
              </div>
            </div>
          </div>
        </section>
    )
}