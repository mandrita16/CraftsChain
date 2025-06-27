"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ShoppingBag, Bell } from "lucide-react";
import Navbar from "@/components/navbar";
import { useAccount, usePublicClient } from "wagmi";
import { ethers } from "ethers";

// Contract addresses
const CRAFT_NFT_ADDRESS = "0x7dE9da95ec835baF710F3Bca82ed399311293cb8";
const CRAFT_MARKETPLACE_ADDRESS = "0x586a3cB7d060d1D3082B451fc18067E5A71eB9B6";

// ABI snippets for the functions we need
const marketplaceABI = [
  {
    name: "getActiveListings",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "tokenIds", type: "uint256[]" },
      { name: "prices", type: "uint256[]" },
      { name: "artisans", type: "address[]" }
    ]
  }
];

// NFT contract ABI with alternative functions
const nftABI = [
  {
    name: "craftArtisan",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "isEcoFriendly",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    name: "getProvenanceHistory",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      { 
        name: "", 
        type: "tuple[]",
        components: [
          { name: "stage", type: "string" },
          { name: "actor", type: "address" },
          { name: "timestamp", type: "uint256" },
          { name: "location", type: "string" }
        ]
      }
    ]
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }]
  }
];

// Helper function to convert IPFS URI to HTTPS URL
const ipfsToHttps = (ipfsUri) => {
  if (!ipfsUri) return null;
  // Replace ipfs:// with https://ipfs.io/ipfs/
  return ipfsUri.replace('ipfs://', 'https://ipfs.io/ipfs/');
};

// Helper function to fetch data from IPFS
const fetchFromIpfs = async (ipfsUri) => {
  try {
    if (!ipfsUri) return null;
    const httpUrl = ipfsToHttps(ipfsUri);
    const response = await fetch(httpUrl);
    return await response.json();
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return null;
  }
};

// Map token ID ranges to craft types - we'll still use this as fallback
const craftTypeMapping = {
  ranges: [
    [1, 100, "jute"],
    [101, 200, "terracotta"],
    [201, 300, "handloom"],
    [301, 400, "bamboo"],
    [401, 500, "kantha"],
    [501, 600, "clay"]
  ],
  default: "handloom",
  
  getCraftType(tokenId) {
    const id = Number(tokenId);
    const range = this.ranges.find(([start, end]) => id >= start && id <= end);
    return range ? range[2] : this.default;
  },
  
  getDisplayName(tokenId, craftType) {
    const prefixes = {
      "jute": "Jute Craft",
      "terracotta": "Terracotta Art",
      "handloom": "Handloom Saree",
      "bamboo": "Bamboo Creation",
      "kantha": "Kantha Embroidery",
      "clay": "Clay Pottery",
      "woodworking": "Wood Carving"
    };
    
    return `${prefixes[craftType] || "Craft"} #${tokenId}`;
  }
};

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [listedNFTs, setListedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const categories = [
    { id: "all", name: "All Products" },
    { id: "jute", name: "Jute Crafts" },
    { id: "terracotta", name: "Terracotta" },
    { id: "handloom", name: "Handloom Sarees" },
    { id: "bamboo", name: "Bamboo Crafts" },
    { id: "kantha", name: "Kantha Embroidery" },
    { id: "clay", name: "Clay Pottery" },
    { id: "woodworking", name: "Wood Carving" },
    { id: "other", name: "Other"}
  ];

  const headerStyle = {
    backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(https://images.pexels.com/photos/3330009/pexels-photo-3330009.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };

  // Function to extract artist name from provenance data
  const extractArtistFromProvenance = (provenance) => {
    // Try to find "Created" stage, which would likely have the artisan info
    const createdStage = provenance.find(entry => entry.stage.toLowerCase().includes("created"));
    
    // Format the address for display if found, or return a placeholder
    if (createdStage) {
      const addr = createdStage.actor;
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }
    
    // Fallback if not found
    return "Unknown Artisan";
  };

  // Function to extract location from provenance data
  const extractLocationFromProvenance = (provenance) => {
    // Try to find latest provenance entry with location data
    const lastEntryWithLocation = [...provenance].reverse().find(entry => entry.location && entry.location.length > 0);
    
    if (lastEntryWithLocation) {
      return lastEntryWithLocation.location;
    }
    
    return "Unknown Location";
  };

  useEffect(() => {
    async function fetchListedNFTs() {
      try {
        setIsLoading(true);
        
        // Fetch active listings using wagmi's publicClient
        const activeListingsData = await publicClient.readContract({
          address: CRAFT_MARKETPLACE_ADDRESS,
          abi: marketplaceABI,
          functionName: 'getActiveListings'
        });
        
        if (!activeListingsData) {
          console.error("Failed to fetch listings");
          setIsLoading(false);
          return;
        }
        
        // Destructure the returned arrays from getActiveListings
        const [tokenIds, prices, artisans] = activeListingsData;
        
        // Process each NFT to get additional data from the NFT contract
        const nftsWithDetailsPromises = tokenIds.map(async (tokenId, index) => {
          try {
            // Get token URI from contract
            const tokenURI = await publicClient.readContract({
              address: CRAFT_NFT_ADDRESS,
              abi: nftABI,
              functionName: 'tokenURI',
              args: [tokenId]
            });
            
            // Fetch metadata from IPFS
            const metadata = await fetchFromIpfs(tokenURI);
            
            // If we couldn't fetch metadata, use fallback
            if (!metadata) {
              const craftType = craftTypeMapping.getCraftType(tokenId);
              const displayName = craftTypeMapping.getDisplayName(tokenId, craftType);
              
              // Get eco status
              const isEco = await publicClient.readContract({
                address: CRAFT_NFT_ADDRESS,
                abi: nftABI,
                functionName: 'isEcoFriendly',
                args: [tokenId]
              });
              
              // Get provenance history for artist name and location
              const provenanceHistory = await publicClient.readContract({
                address: CRAFT_NFT_ADDRESS,
                abi: nftABI,
                functionName: 'getProvenanceHistory',
                args: [tokenId]
              });
              
              // Extract artist name and location from provenance
              const artistName = extractArtistFromProvenance(provenanceHistory);
              const location = extractLocationFromProvenance(provenanceHistory);
              
              // Format price from wei to ETH
              const formattedPrice = ethers.formatEther(prices[index]);
              
              // Create a placeholder image URL
              const imageUrl = `/api/placeholder/300/300`;
              
              return {
                id: tokenId.toString(),
                name: displayName,
                category: craftType,
                artist: artistName,
                price: `${formattedPrice} ETH`,
                rawPrice: prices[index],
                artisanAddress: artisans[index],
                image: imageUrl,
                location: location,
                isEcoFriendly: isEco,
                description: "A beautiful handcrafted item"
              };
            }
            
            // Extract data from metadata
            const craftType = metadata.attributes?.find(attr => attr.trait_type === "Craft Type")?.value || craftTypeMapping.getCraftType(tokenId);
            const location = metadata.attributes?.find(attr => attr.trait_type === "Location")?.value || "Unknown Location";
            const isEcoFriendly = metadata.attributes?.find(attr => attr.trait_type === "Eco Friendly")?.value === "Yes";
            
            // Get the image URL
            const imageUrl = metadata.image ? ipfsToHttps(metadata.image) : `/api/placeholder/300/300`;
            
            // Format price from wei to ETH
            const formattedPrice = ethers.formatEther(prices[index]);
            
            // Get artist name either from metadata or from contract
            let artistName = "Unknown Artist";
            if (metadata.artist) {
              artistName = metadata.artist;
            } else {
              // Get provenance history for artist name if not in metadata
              const provenanceHistory = await publicClient.readContract({
                address: CRAFT_NFT_ADDRESS,
                abi: nftABI,
                functionName: 'getProvenanceHistory',
                args: [tokenId]
              });
              
              artistName = extractArtistFromProvenance(provenanceHistory);
            }
            
            return {
              id: tokenId.toString(),
              name: metadata.name || craftTypeMapping.getDisplayName(tokenId, craftType),
              category: craftType.toLowerCase(),
              artist: artistName,
              price: `${formattedPrice} ETH`,
              rawPrice: prices[index],
              artisanAddress: artisans[index],
              image: imageUrl,
              location: location,
              isEcoFriendly: isEcoFriendly,
              description: metadata.description || "A beautiful handcrafted item"
            };
          } catch (err) {
            console.error(`Error processing data for token ${tokenId}:`, err);
            return null;
          }
        });
        
        // Wait for all the promises to resolve
        const nftsWithDetails = await Promise.all(nftsWithDetailsPromises);
        
        // Filter out any nulls from failed processing
        const validNFTs = nftsWithDetails.filter(nft => nft !== null);
        setListedNFTs(validNFTs);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching listings:", err);
        setIsLoading(false);
      }
    }

    // Only fetch if we have a client
    if (publicClient) {
      fetchListedNFTs();
    }
  }, [publicClient]);
  console.log(listedNFTs);
  
  // Filter products based on active category
  const filteredNFTs = activeCategory === "all" 
    ? listedNFTs 
    : listedNFTs.filter((nft) => nft.category === activeCategory);
  console.log(filteredNFTs);
  

  // Group NFTs by category (for the "all" view)
  const getNFTsByCategory = (categoryName) => {
    return listedNFTs.filter(nft => nft.category === categoryName);
  };

  // The NFT Card component
  const NFTCard = ({ nft }) => (
    <div className="bg-[#1a1f2c] rounded-lg overflow-hidden hover:shadow-lg hover:shadow-cyan-400/10 transition-all">
      <div className="relative group">
        <div className="w-full aspect-square relative">
          <Image
            src={nft.image}
            alt={nft.name}
            layout="fill"
            objectFit="cover"
            className="group-hover:opacity-90 transition-opacity"
            unoptimized={nft.image.startsWith('https://ipfs.io')} // Don't optimize IPFS images
          />
        </div>
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <button className="bg-cyan-400 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4" />
            <span>Quick View</span>
          </button>
        </div>
        {nft.isEcoFriendly && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            Eco-friendly
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{nft.name}</h3>
        <p className="text-gray-400 text-sm mb-1">by {nft.artist}</p>
        <p className="text-gray-500 text-xs mb-2">from {nft.location}</p>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="font-bold">{nft.price}</p>
          </div>
          <Link href={`/nft/${nft.id}`} className="bg-gradient-to-r from-cyan-400 to-red-600 hover:bg-[#e78418] text-white text-sm px-4 py-1 rounded-full transition-colors">
            View NFT
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0e17] text-white">
      <Navbar />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Page Title */}
        <div className="text-center mb-12 p-10 rounded-[20px]" style={headerStyle}>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Handcrafted Products</h1>
          <p className="text-white max-w-2xl mx-auto">
            Each product is unique, handcrafted by skilled artisans and authenticated on the blockchain.
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-full transition-colors ${
                activeCategory === category.id
                  ? "bg-gradient-to-r from-cyan-400 to-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        )}

        {/* No NFTs Found */}
        {!isLoading && listedNFTs.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-400">No NFTs currently listed on the marketplace</h3>
            <p className="mt-2 text-gray-500">Check back later or list your own craft NFTs!</p>
          </div>
        )}

        {/* Featured Collections - Only shown on "all" view */}
        {!isLoading && activeCategory === "all" && listedNFTs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Featured Collections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#1a1f2c] to-[#0d1117] rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-400/10 transition-all">
                <h3 className="text-xl font-bold mb-2">Bengal Heritage</h3>
                <p className="text-gray-400 mb-4">Traditional crafts with centuries of history</p>
                <Link href="#" className="text-cyan-400 hover:underline">
                  Explore collection →
                </Link>
              </div>
              <div className="bg-gradient-to-br from-[#1a1f2c] to-[#0d1117] rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-400/10 transition-all">
                <h3 className="text-xl font-bold mb-2">Modern Fusion</h3>
                <p className="text-gray-400 mb-4">Contemporary designs with traditional techniques</p>
                <Link href="#" className="text-cyan-400 hover:underline">
                  Explore collection →
                </Link>
              </div>
              <div className="bg-gradient-to-br from-[#1a1f2c] to-[#0d1117] rounded-xl p-6 hover:shadow-lg hover:shadow-cyan-400/10 transition-all">
                <h3 className="text-xl font-bold mb-2">Artisan Spotlight</h3>
                <p className="text-gray-400 mb-4">Featuring this month's celebrated creators</p>
                <Link href="#" className="text-cyan-400 hover:underline">
                  Explore collection →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Products by Category - When viewing "all" */}
        {!isLoading && activeCategory === "all" && listedNFTs.length > 0 && (
          <>
            {/* Display each category section if it has items */}
            {categories.slice(1).map(category => {
              const categoryNFTs = getNFTsByCategory(category.id);
              if (categoryNFTs.length === 0) return null;
              
              return (
                <div key={category.id} className="mb-16">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{category.name}</h2>
                    <button 
                      onClick={() => setActiveCategory(category.id)}
                      className="text-cyan-400 hover:underline"
                    >
                      View All →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryNFTs.slice(0, 4).map((nft) => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Products when filtered by category */}
        {!isLoading && activeCategory !== "all" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.length > 0 ? (
              filteredNFTs.map((nft) => (
                <NFTCard key={nft.id} nft={nft} />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-400">No products found in this category</p>
              </div>
            )}
          </div>
        )}

        {/* Load More Button - Only show when viewing all products and there are more than 8 products */}
        {!isLoading && activeCategory === "all" && listedNFTs.length > 8 && (
          <div className="text-center mt-12">
            <button className="border border-cyan-400 text-cyan-400 hover:bg-gradient-to-r from-cyan-400 to-red-600 hover:text-white px-6 py-2 rounded-full transition-colors">
              Load More
            </button>
          </div>
        )}
      </main>

      {/* Footer section */}
      <footer className="bg-[#0d1117] border-t border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-gradient-to-r from-cyan-400 to-red-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xl">
                  C
                </div>
                <span className="text-xl font-bold">CraftsChain</span>
              </div>
              <p className="text-gray-400 mb-6">
                Connecting traditional craftsmanship with blockchain technology to create a transparent, fair
                marketplace.
              </p>
              <div className="flex space-x-3">
                <Link
                  href="#"
                  className="bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="bg-gray-800 rounded-full w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Marketplace</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-cyan-400">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-cyan-400">
                    Handloom Sarees
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-cyan-400">
                    Terracotta
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-cyan-400">
                    Jute Crafts
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-cyan-400">
                    Bamboo Products
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </footer>
      </div>
  )};