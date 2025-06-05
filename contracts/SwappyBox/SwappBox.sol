// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "./IERC20.sol";
import "./Box.sol";

contract SwappyBox{
    event BoxEvent(address indexed  boxAdd,address indexed initiator, uint index);
    event BidPrice(address bidder, uint BidPrice);
    Box public box;
    struct BidTrack{
        uint bidInitialTime;
        uint bidEndTime;
        uint totalBid;
        uint basePrice;
        uint lastPrice;
        address currentWinner;
        address poolInitiator;
    }

    uint constant SLOPE = 0.3 * 1e18;
    address public tokenForObligation;
  
    mapping(address=>address[]) public boxes;
    mapping(address=>BidTrack) public boxData;
    constructor(address _token){
        tokenForObligation = _token;
    }
    function createYourBox() public {
        Box bx = new Box();
        boxes[msg.sender].push(address(bx));
        emit BoxEvent(address(bx),msg.sender,boxes[msg.sender].length-1);

    }

    function depositToBox(uint _index, uint _deadline,uint _strikeInUSDC) public payable {
        require(_index < boxes[msg.sender].length, "Invalid box index");
        require(msg.value > 0, "deposit must be greater than 0");
        address boxAddress = boxes[msg.sender][_index];
        Box(payable(boxAddress)).deposit{value: msg.value}(_deadline,_strikeInUSDC);
        uint256 basePrice = (msg.value * 10) / 100;
        boxData[boxAddress] = BidTrack(block.timestamp,block.timestamp+3600,0,basePrice,basePrice,msg.sender,msg.sender);
    }

    function obligate(address _contract) public {
        require(boxData[_contract].currentWinner == msg.sender,"you are not bid winner");
        uint amountToTransfer = Box(payable(_contract)).getStrikePriceToPay();
        IERC20(tokenForObligation).transferFrom(msg.sender,boxData[_contract].poolInitiator,amountToTransfer);
        Box(payable(_contract)).withdraw(msg.sender,true);
    }

    function bid(address _contract) public payable{
        require(boxData[_contract].currentWinner != msg.sender,"you already own");
        uint bestPrice = getPrice(_contract);
        uint bidAmount = msg.value;
        if(bestPrice <= bidAmount && boxData[_contract].lastPrice < bidAmount){
            
            uint initiatorFees = (bidAmount * 1)/100;
            uint refund = bidAmount - initiatorFees;
            (bool success,)=payable(boxData[_contract].currentWinner).call{value:refund}(""); 
            require(success,"failed");
            (bool success2,)=payable(boxData[_contract].poolInitiator).call{value:initiatorFees}(""); 
            require(success2,"failed");
            boxData[_contract].currentWinner = msg.sender;
            boxData[_contract].lastPrice = bidAmount;
            boxData[_contract].totalBid++;
            boxData[_contract].bidEndTime = block.timestamp+1500;
        

        }

        // require(boxData[_contract].bidEndTime < block.timestamp);
        // boxData[_contract].totalBid = 0;

        emit BidPrice(msg.sender,bidAmount);
    }
    
    function withdraw(address _contract) public{
        address initiator = boxData[_contract].poolInitiator;
        require(initiator == msg.sender,"you are not initiator");
        Box(payable(_contract)).withdraw(msg.sender,false);

    } 


    function getPrice(address _contract) public view returns(uint256){
        uint demand = boxData[_contract].totalBid;
        return SLOPE * demand + boxData[_contract].basePrice;
    }

    function getBoxData(address _contract) public view returns(BidTrack memory){
        return boxData[_contract];
    }


    function getBalance(address _contractAdd) public view returns(uint){
        return address(_contractAdd).balance;
    }

}

/*
1. strike price for box - done 
2. bidding native coin! - done have to check
3.obliigation, stable coin only allow!. - done have to check
4. events emitting!.
*/

