// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

interface ICraftNFT is IERC721 {
    function getProvenanceHistory(uint256 tokenId) external view returns (Provenance[] memory);
    function addProvenanceEntry(uint256 tokenId, string memory stage, string memory location) external;
    function isEcoFriendly(uint256 tokenId) external view returns (bool);
    function getArtisanData(uint256 tokenId) external view returns (string memory name, string memory location, string memory craftType);
    
    struct Provenance {
        string stage;
        address actor;
        uint256 timestamp;
        string location;
    }
}

/**
 * @title CraftEscrowMarketplace
 * @dev Simple marketplace for CraftNFTs with escrow system
 */
contract CraftEscrowMarketplace is ReentrancyGuard, Ownable, ERC721Holder {
    // Market fee percentage (2.5%)
    uint256 public marketFeePercentage = 250;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    ICraftNFT public craftNFTContract;
    
    enum OrderStatus { Created, Shipped, Received, Completed, Cancelled, Disputed }
    
    struct Listing {
        address artisan;
        uint256 price;
        string shippingInfo;
        bool isActive;
    }
    
    struct Order {
        address buyer;
        address artisan;
        uint256 tokenId;
        uint256 price;
        uint256 createdAt;
        uint256 deliveryDeadline;
        OrderStatus status;
        string trackingInfo;
    }
    
    // Mapping from tokenId to listing details
    mapping(uint256 => Listing) public listings;
    
    // Mapping from orderId to order details
    mapping(uint256 => Order) public orders;
    
    // Order counter
    uint256 private _orderIdCounter;
    
    // Locked funds for ongoing orders
    mapping(uint256 => uint256) public lockedFunds;
    
    // Earnings available for withdrawal
    mapping(address => uint256) public availableEarnings;
    
    // Total marketplace fees collected
    uint256 public totalFeesCollected;
    
    // Events
    event ItemListed(uint256 indexed tokenId, address indexed artisan, uint256 price);
    event ItemUnlisted(uint256 indexed tokenId, address indexed artisan);
    event OrderPlaced(uint256 indexed orderId, uint256 indexed tokenId, address buyer, address artisan);
    event OrderShipped(uint256 indexed orderId, string trackingInfo);
    event OrderReceived(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId, string reason);
    event OrderDisputed(uint256 indexed orderId, string reason);
    event DisputeResolved(uint256 indexed orderId, bool infavorOfBuyer);
    event EarningsWithdrawn(address indexed user, uint256 amount);
    event FeeUpdated(uint256 newFeePercentage);
    
    /**
     * @dev Constructor sets the CraftNFT contract address
     * @param _craftNFTAddress Address of the CraftNFT contract
     */
    constructor(address _craftNFTAddress) Ownable(msg.sender) {
        craftNFTContract = ICraftNFT(_craftNFTAddress);
        _orderIdCounter = 1;
    }
    
    /**
     * @dev Modifier to check that only the artisan of an item can call a function
     */
    modifier onlyArtisan(uint256 tokenId) {
        require(listings[tokenId].artisan == msg.sender, "CraftMarketplace: Not the artisan");
        _;
    }
    
    /**
     * @dev Modifier to check that only the buyer of an order can call a function
     */
    modifier onlyBuyer(uint256 orderId) {
        require(orders[orderId].buyer == msg.sender, "CraftMarketplace: Not the buyer");
        _;
    }
    
    /**
     * @dev List a CraftNFT for sale
     * @param tokenId ID of the token to list
     * @param price Price in wei
     * @param shippingInfo Information about shipping options and costs
     */
    function listItem(uint256 tokenId, uint256 price, string calldata shippingInfo) external {
        require(price > 0, "CraftMarketplace: Price must be greater than zero");
        require(craftNFTContract.ownerOf(tokenId) == msg.sender, "CraftMarketplace: Not the owner");
        
        // Transfer token to marketplace for escrow
        craftNFTContract.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // Create listing
        listings[tokenId] = Listing({
            artisan: msg.sender,
            price: price,
            shippingInfo: shippingInfo,
            isActive: true
        });
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(tokenId, "Listed", "Marketplace") {} catch {}
        
        emit ItemListed(tokenId, msg.sender, price);
    }
    
    /**
     * @dev Remove a listing from the marketplace
     * @param tokenId ID of the token to unlist
     */
    function cancelListing(uint256 tokenId) external onlyArtisan(tokenId) {
        require(listings[tokenId].isActive, "CraftMarketplace: Listing not active");
        
        // Remove listing
        listings[tokenId].isActive = false;
        
        // Return NFT to artisan
        craftNFTContract.safeTransferFrom(address(this), msg.sender, tokenId);
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(tokenId, "Unlisted", "Marketplace") {} catch {}
        
        emit ItemUnlisted(tokenId, msg.sender);
    }
    
    /**
     * @dev Place an order for a listed NFT
     * @param tokenId ID of the token to order
     * @param deliveryDays Number of days allowed for delivery
     */
    function placeOrder(uint256 tokenId, uint16 deliveryDays) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        
        require(listing.isActive, "CraftMarketplace: Item not available for sale");
        require(msg.value >= listing.price, "CraftMarketplace: Insufficient payment");
        require(deliveryDays > 0, "CraftMarketplace: Invalid delivery period");
        
        // Deactivate listing
        listings[tokenId].isActive = false;
        
        // Create new order
        uint256 orderId = _orderIdCounter++;
        orders[orderId] = Order({
            buyer: msg.sender,
            artisan: listing.artisan,
            tokenId: tokenId,
            price: listing.price,
            createdAt: block.timestamp,
            deliveryDeadline: block.timestamp + (deliveryDays * 1 days),
            status: OrderStatus.Created,
            trackingInfo: ""
        });
        
        // Lock funds for this order
        lockedFunds[orderId] = listing.price;
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(tokenId, "Ordered", "Escrow") {} catch {}
        
        // Refund excess payment if any
        if (msg.value > listing.price) {
            payable(msg.sender).transfer(msg.value - listing.price);
        }
        
        emit OrderPlaced(orderId, tokenId, msg.sender, listing.artisan);
    }
    
    /**
     * @dev Artisan marks an order as shipped
     * @param orderId ID of the order
     * @param trackingInfo Shipping tracking information
     */
    function shipOrder(uint256 orderId, string calldata trackingInfo) external nonReentrant {
        Order storage order = orders[orderId];
        
        require(order.artisan == msg.sender, "CraftMarketplace: Not the artisan");
        require(order.status == OrderStatus.Created, "CraftMarketplace: Invalid order status");
        
        // Update order status
        order.status = OrderStatus.Shipped;
        order.trackingInfo = trackingInfo;
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(order.tokenId, "Shipped", "In Transit") {} catch {}
        
        emit OrderShipped(orderId, trackingInfo);
    }
    
    /**
     * @dev Buyer confirms receipt of the physical item
     * @param orderId ID of the order
     */
    function confirmReceipt(uint256 orderId) external onlyBuyer(orderId) nonReentrant {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Shipped, "CraftMarketplace: Order not shipped");
        
        // Update order status
        order.status = OrderStatus.Received;
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(order.tokenId, "Received", "Buyer") {} catch {}
        
        emit OrderReceived(orderId);
    }
    
    /**
     * @dev Complete the order and release funds
     * @param orderId ID of the order
     */
    function completeOrder(uint256 orderId) external onlyBuyer(orderId) nonReentrant {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Received, "CraftMarketplace: Order not received");
        
        // Update order status
        order.status = OrderStatus.Completed;
        
        // Calculate fees
        uint256 marketFee = (order.price * marketFeePercentage) / FEE_DENOMINATOR;
        uint256 artisanAmount = order.price - marketFee;
        
        // Update balances
        totalFeesCollected += marketFee;
        availableEarnings[order.artisan] += artisanAmount;
        
        // Release locked funds
        lockedFunds[orderId] = 0;
        
        // Transfer NFT to buyer
        craftNFTContract.safeTransferFrom(address(this), order.buyer, order.tokenId);
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(order.tokenId, "Ownership Transferred", "Buyer's Wallet") {} catch {}
        
        emit OrderCompleted(orderId);
    }
    
    /**
     * @dev File a dispute for an order
     * @param orderId ID of the order
     * @param reason Reason for the dispute
     */
    function fileDispute(uint256 orderId, string calldata reason) external nonReentrant {
        Order storage order = orders[orderId];
        
        require(msg.sender == order.buyer || msg.sender == order.artisan, "CraftMarketplace: Not involved in order");
        require(order.status != OrderStatus.Completed && order.status != OrderStatus.Cancelled, "CraftMarketplace: Order already finalized");
        
        // Update order status
        order.status = OrderStatus.Disputed;
        
        emit OrderDisputed(orderId, reason);
    }
    
    /**
     * @dev Resolve a dispute (admin only)
     * @param orderId ID of the disputed order
     * @param infavorOfBuyer Whether to resolve in favor of the buyer
     */
    function resolveDispute(uint256 orderId, bool infavorOfBuyer) external onlyOwner nonReentrant {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Disputed, "CraftMarketplace: Order not disputed");
        
        if (infavorOfBuyer) {
            // Return funds to buyer
            payable(order.buyer).transfer(order.price);
            lockedFunds[orderId] = 0;
            
            // Return NFT to artisan
            craftNFTContract.safeTransferFrom(address(this), order.artisan, order.tokenId);
            
            // Add provenance entry
            try craftNFTContract.addProvenanceEntry(order.tokenId, "Dispute Resolved - Returned to Artisan", "Marketplace") {} catch {}
            
            // Mark as cancelled
            order.status = OrderStatus.Cancelled;
        } else {
            // Complete the order in favor of artisan
            uint256 marketFee = (order.price * marketFeePercentage) / FEE_DENOMINATOR;
            uint256 artisanAmount = order.price - marketFee;
            
            totalFeesCollected += marketFee;
            availableEarnings[order.artisan] += artisanAmount;
            lockedFunds[orderId] = 0;
            
            // Transfer NFT to buyer
            craftNFTContract.safeTransferFrom(address(this), order.buyer, order.tokenId);
            
            // Add provenance entry
            try craftNFTContract.addProvenanceEntry(order.tokenId, "Dispute Resolved - Transferred to Buyer", "Marketplace") {} catch {}
            
            // Mark as completed
            order.status = OrderStatus.Completed;
        }
        
        emit DisputeResolved(orderId, infavorOfBuyer);
    }
    
    /**
     * @dev Allow buyer to cancel order if delivery deadline is missed
     * @param orderId ID of the order
     */
    function cancelExpiredOrder(uint256 orderId) external onlyBuyer(orderId) nonReentrant {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Created || order.status == OrderStatus.Shipped, "CraftMarketplace: Cannot cancel order");
        require(block.timestamp > order.deliveryDeadline, "CraftMarketplace: Delivery deadline not passed");
        
        // Update order status
        order.status = OrderStatus.Cancelled;
        
        // Return funds to buyer
        payable(order.buyer).transfer(order.price);
        lockedFunds[orderId] = 0;
        
        // Return NFT to artisan
        craftNFTContract.safeTransferFrom(address(this), order.artisan, order.tokenId);
        
        // Add provenance entry
        try craftNFTContract.addProvenanceEntry(order.tokenId, "Order Cancelled - Delivery Deadline Missed", "Marketplace") {} catch {}
        
        emit OrderCancelled(orderId, "Delivery deadline missed");
    }
    
    /**
     * @dev Withdraw available earnings
     */
    function withdrawEarnings() external nonReentrant {
        uint256 amount = availableEarnings[msg.sender];
        require(amount > 0, "CraftMarketplace: No earnings to withdraw");
        
        // Reset earnings before transfer to prevent reentrancy
        availableEarnings[msg.sender] = 0;
        
        // Transfer earnings
        payable(msg.sender).transfer(amount);
        
        emit EarningsWithdrawn(msg.sender, amount);
    }
    
    /**
     * @dev Withdraw collected marketplace fees (owner only)
     */
    function withdrawMarketplaceFees() external onlyOwner nonReentrant {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "CraftMarketplace: No fees to withdraw");
        
        // Reset fees before transfer to prevent reentrancy
        totalFeesCollected = 0;
        
        // Transfer fees to owner
        payable(owner()).transfer(amount);
    }
    
    /**
     * @dev Update marketplace fee percentage (owner only)
     * @param newFeePercentage New fee percentage (in basis points, e.g. 250 = 2.5%)
     */
    function updateMarketFee(uint256 newFeePercentage) external onlyOwner {
        require(newFeePercentage <= 1000, "CraftMarketplace: Fee cannot exceed 10%");
        marketFeePercentage = newFeePercentage;
        emit FeeUpdated(newFeePercentage);
    }
    
    /**
     * @dev Get all active listings
     * @return tokenIds Array of token IDs
     * @return prices Array of prices
     * @return artisans Array of artisan addresses
     */
    function getActiveListings() 
        external 
        view 
        returns (
            uint256[] memory tokenIds,
            uint256[] memory prices,
            address[] memory artisans
        ) 
    {
        // First, count active listings
        uint256 activeCount = 0;
        uint256 i = 0;
        
        // This is a simplified approach - in production you'd need pagination
        while (i < 1000) {
            if (listings[i].isActive) {
                activeCount++;
            }
            i++;
        }
        
        // Initialize return arrays
        tokenIds = new uint256[](activeCount);
        prices = new uint256[](activeCount);
        artisans = new address[](activeCount);
        
        // Fill arrays with active listings
        uint256 resultIdx = 0;
        i = 0;
        
        while (i < 1000 && resultIdx < activeCount) {
            if (listings[i].isActive) {
                tokenIds[resultIdx] = i;
                prices[resultIdx] = listings[i].price;
                artisans[resultIdx] = listings[i].artisan;
                resultIdx++;
            }
            i++;
        }
        
        return (tokenIds, prices, artisans);
    }
    
    function getOrderDetails(uint256 orderId)
        external
        view
        returns (
            address buyer,
            address artisan,
            uint256 tokenId,
            uint256 price,
            uint256 createdAt,
            uint256 deliveryDeadline,
            OrderStatus status,
            string memory trackingInfo
        )
    {
        Order memory order = orders[orderId];
        return (
            order.buyer,
            order.artisan,
            order.tokenId,
            order.price,
            order.createdAt,
            order.deliveryDeadline,
            order.status,
            order.trackingInfo
        );
    }
    
    /**
     * @dev Get orders for a specific buyer
     * @param buyer Address of the buyer
     * @return orderIds Array of order IDs
     */
    function getBuyerOrders(address buyer)
        external
        view
        returns (uint256[] memory orderIds)
    {
        // Count orders for this buyer
        uint256 count = 0;
        for (uint256 i = 1; i < _orderIdCounter; i++) {
            if (orders[i].buyer == buyer) {
                count++;
            }
        }
        
        // Initialize return array
        orderIds = new uint256[](count);
        
        // Fill array
        uint256 resultIdx = 0;
        for (uint256 i = 1; i < _orderIdCounter && resultIdx < count; i++) {
            if (orders[i].buyer == buyer) {
                orderIds[resultIdx] = i;
                resultIdx++;
            }
        }
        
        return orderIds;
    }
    
    /**
     * @dev Get orders for a specific artisan
     * @param artisan Address of the artisan
     * @return orderIds Array of order IDs
     */
    function getArtisanOrders(address artisan)
        external
        view
        returns (uint256[] memory orderIds)
    {
        // Count orders for this artisan
        uint256 count = 0;
        for (uint256 i = 1; i < _orderIdCounter; i++) {
            if (orders[i].artisan == artisan) {
                count++;
            }
        }
        
        // Initialize return array
        orderIds = new uint256[](count);
        
        // Fill array
        uint256 resultIdx = 0;
        for (uint256 i = 1; i < _orderIdCounter && resultIdx < count; i++) {
            if (orders[i].artisan == artisan) {
                orderIds[resultIdx] = i;
                resultIdx++;
            }
        }
        
        return orderIds;
    }
}