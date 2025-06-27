import { Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

export default function MeetOurArtisans() {
    return (
        <section id="artisans" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Meet Our Artisans</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Skilled craftspeople with verified on-chain identities, preserving Bengal's rich cultural heritage.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Ruma Devi",
                  craft: "Textile Weaver",
                  location: "Bishnupur, West Bengal",
                  verified: true,
                },
                {
                  name: "Anand Kumar",
                  craft: "Terracotta Artist",
                  location: "Panchmura, West Bengal",
                  verified: true,
                },
                {
                  name: "Sanjay Mondal",
                  craft: "Woodwork Artisan",
                  location: "Darjeeling, West Bengal",
                  verified: true,
                },
              ].map((artisan, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-3 p-6 border border-gray-700 rounded-lg"
                >
                  <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                    <p className="text-gray-500 text-xs">Artisan Photo</p>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg">{artisan.name}</h3>
                    <p className="text-sm text-gray-500">{artisan.craft}</p>
                    <p className="text-xs text-gray-500">{artisan.location}</p>
                  </div>
                  {artisan.verified && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" /> Verified Identity
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="hover:bg-red">
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
    )
}