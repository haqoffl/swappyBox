// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;



contract Box {
    uint256 public deadline;
    uint256 public initialTime;
    address payable public owner;
    bool public isContractFunded;
    bool public isWithdraw = false;

    event Deposited(address indexed from, uint256 amount, uint256 deadline);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function deposit(uint256 _durationInSeconds) external payable {
        require(!isContractFunded, "Contract already funded");
        require(msg.value > 0, "Must send ETH");
        require(_durationInSeconds > 0, "Invalid duration");

        owner = payable(msg.sender);
        initialTime = block.timestamp;
        deadline = block.timestamp + _durationInSeconds;
        isContractFunded = true;

        emit Deposited(msg.sender, msg.value, deadline);
    }

    function withdraw(address _to, bool isObligation) external onlyOwner {
        require(block.timestamp >= deadline, "Deadline not yet reached");

        uint256 amount = address(this).balance;
        require(amount > 0 && isWithdraw==false, "No funds to withdraw");
        
        if(isObligation == true){
            (bool success, ) = payable(_to).call{value: amount}("");
            require(success, "Withdraw failed");
            isWithdraw = true;
            emit Withdrawn(owner, amount);
        }else{
            uint extendDeadline = deadline+(3600 *24);
            require(extendDeadline < block.timestamp);
            (bool success, ) = payable(_to).call{value: amount}("");
            require(success, "Withdraw failed");
            isWithdraw = true;
            emit Withdrawn(owner, amount);

        }


    }

    // Fallback to receive ETH
    receive() external payable {}
}

contract SwappyBox{

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
  
    mapping(address=>address[]) public boxes;
    mapping(address=>BidTrack) public boxData;
    function createYourBox() public {
        Box bx = new Box();
        boxes[msg.sender].push(address(bx));

    }

    function depositToBox(uint _index, uint _deadline) public payable {
        require(_index < boxes[msg.sender].length, "Invalid box index");
        require(msg.value > 0, "deposit must be greater than 0");
        address boxAddress = boxes[msg.sender][_index];
        Box(payable(boxAddress)).deposit{value: msg.value}(_deadline);
        uint256 basePrice = (msg.value * 10) / 100;
        boxData[boxAddress] = BidTrack(block.timestamp,block.timestamp+3600,0,basePrice,basePrice,msg.sender,msg.sender);
    }

    function obligate(address _contract) public payable{
        require(boxData[_contract].currentWinner == msg.sender,"you are not bid winner");
        uint depositedAmount = address(_contract).balance;
        uint paidBidAmount = boxData[_contract].basePrice;
        uint amountToTransfer = depositedAmount - paidBidAmount;
        require(amountToTransfer == msg.value,"obligation reverted");
        (bool success,)=payable(boxData[_contract].poolInitiator).call{value:amountToTransfer}(""); 
        require(success,"failed");
        Box(payable(_contract)).withdraw(msg.sender,true);
    }

    function bid(address _contract,uint bidAmount) public payable{
        require(boxData[_contract].currentWinner != msg.sender,"you already own");
        uint bestPrice = getPrice(_contract);
        if(bestPrice <= bidAmount && boxData[_contract].lastPrice < bidAmount){
            require(msg.value == bidAmount);
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

        require(boxData[_contract].bidEndTime < block.timestamp);
        boxData[_contract].totalBid = 0;
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