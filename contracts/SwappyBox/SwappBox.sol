// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;


contract Box{
    uint public deadline;
    uint public initialTime;
    bool public  isContractFunded;
    address payable public owner;

    function deposit(uint _deadline) payable public{
        require(isContractFunded == false,"contract already funded");
        initialTime = block.timestamp;
        deadline = _deadline;
        isContractFunded = true;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(owner == msg.sender,"you are not owner");
        uint256 amount = address(this).balance;
        (bool success,) = owner.call{value:amount}("");
        require(success,"withdraw failed!");

    }

    function changeOwner(address _newOwner)public {
        owner = payable(_newOwner);
    }
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
    }

  
    mapping(address=>address[]) public boxes;
    mapping(address=>BidTrack) public boxData;
    function createYourBox() public {
        Box bx = new Box();
        boxes[msg.sender].push(address(bx));

    }

    function depositToBox(uint _index, uint _deadline) public payable {
        require(_index < boxes[msg.sender].length, "Invalid box index");

        address boxAddress = boxes[msg.sender][_index];
        Box(boxAddress).deposit{value: msg.value}(_deadline);
    }

    function withdraw() public{

    }

    function bid() public{

    }

    function getPrice() public{

    }

    

}

