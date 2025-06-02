// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

interface IBOX {
    function deposit(uint256 _durationInSeconds, uint _strikeInUSDC) external payable;

    function withdraw(address _to, bool isObligation) external;

    function owner() external view returns (address);

    function deadline() external view returns (uint256);

    function initialTime() external view returns (uint256);

    function isContractFunded() external view returns (bool);

    function isWithdraw() external view returns (bool);

    function strikePrice() external view returns (uint);
}
