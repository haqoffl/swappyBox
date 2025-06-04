// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Box {
    uint256 public deadline;
    uint256 public initialTime;
    address payable public owner;
    bool public isContractFunded;
    bool public isWithdraw = false;
    uint public strikePrice;

    event Deposited(address indexed from, uint256 amount, uint256 deadline);
    event Withdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    function deposit(uint256 _durationInSeconds,uint _strikeInUSDC) external payable {
        require(!isContractFunded, "Contract already funded");
        require(msg.value > 0, "Must send ETH");
        require(_durationInSeconds > 0, "Invalid duration");

        owner = payable(msg.sender);
        initialTime = block.timestamp;
        deadline = block.timestamp + _durationInSeconds;
        isContractFunded = true;
        strikePrice = _strikeInUSDC;
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

        function getStrikePriceToPay() public view returns(uint){
            return strikePrice;
        }

    // Fallback to receive ETH
    receive() external payable {}
}
