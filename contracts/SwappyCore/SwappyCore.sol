// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;
import "./ICore.sol";

/**
 * @title CoretimeMarketMock
 * @dev Simulates coretime buying/selling/renewal using a linear pricing model.
 */
contract CoretimeMarketMock {
    struct Region {
        address owner;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePaid;
        bool active;
    }

    uint256 public regionCounter;
    mapping(uint256 => Region) public regions;

    uint256 public basePrice = 0.01 ether;
    uint256 public priceStep = 0.005 ether; // Increases per region bought
    uint256 public regionDuration = 1 hours;
    uint256 public regionsSold;
    uint8 public maxRegion = 86;

    event Purchased(address indexed who, uint256 regionId, uint256 price, uint256 duration);
    event Renewable(uint256 regionId, uint256 price, uint256 begin);
    event Renewed(address indexed who, uint256 oldRegionId, uint256 newRegionId, uint256 price, uint256 duration);
    event Transferred(uint256 regionId, address from, address to);

    modifier onlyOwner(uint256 regionId) {
        require(msg.sender == regions[regionId].owner, "Not region owner");
        _;
    }

    function getCurrentPrice() public view returns (uint256) {
        return basePrice + (regionsSold * priceStep);
    }

    function buyRegion() external payable returns (uint256) {
        uint256 price = getCurrentPrice();
        require(msg.value >= price, "Insufficient payment");
        require(regionsSold < maxRegion, "Max region reached");

        uint256 regionId = regionCounter++;
        uint256 start = block.timestamp;
        uint256 end = start + regionDuration;

        regions[regionId] = Region({
            owner: msg.sender,
            startTime: start,
            endTime: end,
            pricePaid: price,
            active: true
        });

        regionsSold++;
        emit Purchased(msg.sender, regionId, price, regionDuration);
        emit Renewable(regionId, getCurrentPrice(), end); // renewable after expiry
        return regionId;
    }

    function renewRegion(uint256 regionId) external payable onlyOwner(regionId) {
        require(block.timestamp >= regions[regionId].endTime, "Too early to renew");
        require(regions[regionId].active, "Region inactive");

        uint256 newPrice = getCurrentPrice();
        require(msg.value >= newPrice, "Insufficient renewal price");

        uint256 newRegionId = regionCounter++;
        uint256 start = block.timestamp;
        uint256 end = start + regionDuration;

        regions[newRegionId] = Region({
            owner: msg.sender,
            startTime: start,
            endTime: end,
            pricePaid: newPrice,
            active: true
        });

        regions[regionId].active = false;
        regionsSold++;

        emit Renewed(msg.sender, regionId, newRegionId, newPrice, regionDuration);
    }

    function transferRegion(uint256 regionId, address newOwner) external onlyOwner(regionId) {
        require(block.timestamp >= regions[regionId].startTime, "Too early to transfer");
        regions[regionId].owner = newOwner;
        emit Transferred(regionId, msg.sender, newOwner);
    }

    function isRegionActive(uint256 regionId) external view returns (bool) {
        Region memory r = regions[regionId];
        return r.active && block.timestamp >= r.startTime && block.timestamp <= r.endTime;
    }

    function expireRegion(uint256 regionId) external {
        Region storage r = regions[regionId];
        require(r.active, "Already inactive");
        if (block.timestamp > r.endTime) {
            r.active = false;
        }
    }

    function getRegion(uint256 regionId) external view returns (
        address owner,
        uint256 startTime,
        uint256 endTime,
        uint256 price,
        bool active
    ) {
        Region memory r = regions[regionId];
        return (r.owner, r.startTime, r.endTime, r.pricePaid, r.active);
    }

    // Withdraw contract balance (for mock only)
    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }
}

contract SwappyCore{
    event BoxEvent(address indexed  boxAdd,address indexed initiator, uint index);
    event BidPrice(address bidder, uint BidPrice);
    event Transferred(uint coreId, address from, address to);
    address public market;
        struct BidTrack{
            uint bidInitialTime;
            uint bidEndTime;
            uint totalBid;
            uint basePrice;
            uint lastPrice;
            address currentWinner;
            address poolInitiator;
            uint coreStartTime;
            uint coreEndTime;
            bool isObligated;
        }

        
        mapping(uint=>BidTrack) public secondaryData;
        uint constant SLOPE = 0.3 * 1e18;

    constructor (address _market)
    {
        market = _market;
            }

    /**
     * @dev Returns the core contract.
     */
    /*
        function getCore() external view returns (ICore){
            return address(core);
        }*/

    modifier onlyOwner() {
        require(msg.sender == market, "Not owner");
        _;
    }

    event BidPlaced(address indexed bidder, uint time, uint amount, string poolName) ;
    
    struct Market{
        address owner;
        mapping (uint => bool) isBought;
        mapping (uint => bool) isSold;
    }

    function createSecondaryMarket(uint regionId,uint bidEndTime, uint basePricePercentage) public {
         (address _owner,uint256 _startTime,uint256 _endTime,uint256 _price,bool _active)= ICore(market).getRegion(regionId);
         require(_active == true,"The region is not active");
         require(_owner == address(this),"Contract is not the of this region market");
         uint256 basePrice = (_price * basePricePercentage) / 100;
         secondaryData[regionId] = BidTrack(block.timestamp,block.timestamp+bidEndTime,0,basePrice,basePrice,msg.sender,msg.sender,_startTime,_endTime,false);

    }


        function bid(uint _coreId) public payable{
        require(secondaryData[_coreId].currentWinner != msg.sender,"you already own");
        uint bestPrice = getPrice(_coreId);
        uint bidAmount = msg.value;
        if(bestPrice <= bidAmount && secondaryData[_coreId].lastPrice < bidAmount){
            
            uint initiatorFees = (bidAmount * 1)/100;
            uint refund = bidAmount - initiatorFees;
            (bool success,)=payable(secondaryData[_coreId].currentWinner).call{value:refund}(""); 
            require(success,"failed");
            (bool success2,)=payable(secondaryData[_coreId].poolInitiator).call{value:initiatorFees}(""); 
            require(success2,"failed");
            secondaryData[_coreId].currentWinner = msg.sender;
            secondaryData[_coreId].lastPrice = bidAmount;
            secondaryData[_coreId].totalBid++;
            secondaryData[_coreId].bidEndTime = block.timestamp+1500;
        

        }

        // require(boxData[_contract].bidEndTime < block.timestamp);
        // boxData[_contract].totalBid = 0;

        emit BidPrice(msg.sender,bidAmount);
    }

        mapping(uint => bool) public isObligated;

    function obligate(uint coreId) public {
        BidTrack storage bidTrack = secondaryData[coreId];
        require(bidTrack.currentWinner == msg.sender, "You are not the bid winner");
        require(block.timestamp > bidTrack.bidEndTime, "Bidding not ended");
        require(!isObligated[coreId], "Already obligated");

        // Transfer region ownership via CoretimeMarketMock
        CoretimeMarketMock(market).transferRegion(coreId, msg.sender);

        secondaryData[coreId].isObligated = true;

        emit Transferred(coreId, bidTrack.poolInitiator, msg.sender);
    }


    function getPrice(uint coreId) public view returns(uint256){
        uint demand = secondaryData[coreId].totalBid;
        return SLOPE * demand + secondaryData[coreId].basePrice;
    }



}