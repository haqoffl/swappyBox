// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ICore {
    struct Region {
        address owner;
        uint256 startTime;
        uint256 endTime;
        uint256 pricePaid;
        bool active;
    }

    event Purchased(address indexed who, uint256 regionId, uint256 price, uint256 duration);
    event Renewable(uint256 regionId, uint256 price, uint256 begin);
    event Renewed(address indexed who, uint256 oldRegionId, uint256 newRegionId, uint256 price, uint256 duration);
    event Transferred(uint256 regionId, address from, address to);

    function getCurrentPrice() external view returns (uint256);
    function buyRegion() external payable returns (uint256);
    function renewRegion(uint256 regionId) external payable;
    function transferRegion(uint256 regionId, address newOwner) external;
    function isRegionActive(uint256 regionId) external view returns (bool);
    function expireRegion(uint256 regionId) external;
    function getRegion(uint256 regionId) external view returns (
        address owner,
        uint256 startTime,
        uint256 endTime,
        uint256 price,
        bool active
    );
    function withdraw() external;
}
