// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./SponsorshipNFT.sol";

contract TokenWrapper is Ownable {
    IERC20 public crToken;
    IERC20 public bstrToken;
    address public treasury;

    uint256 public crTokenRequired;
    uint256 public bstrTokenRequired;

    event SponsorshipCollectionCreated(address indexed collection, address indexed vehicleTBA, address indexed creator);
    event RequirementsUpdated(uint256 crAmount, uint256 bstrAmount);

    constructor(
        address _crToken,
        address _bstrToken,
        address _treasury,
        uint256 _crTokenRequired,
        uint256 _bstrTokenRequired
    ) {
        crToken = IERC20(_crToken);
        bstrToken = IERC20(_bstrToken);
        treasury = _treasury;
        crTokenRequired = _crTokenRequired;
        bstrTokenRequired = _bstrTokenRequired;
    }

    function createSponsorshipCollection(
        string memory name,
        string memory symbol,
        address vehicleTBA,
        uint256 mintPrice
    ) external returns (address) {
        // Escrow Tokens
        require(crToken.transferFrom(msg.sender, address(this), crTokenRequired), "CR Token transfer failed");
        require(bstrToken.transferFrom(msg.sender, address(this), bstrTokenRequired), "BSTR Token transfer failed");

        // Deploy Sponsorship NFT
        SponsorshipNFT newCollection = new SponsorshipNFT(
            name,
            symbol,
            vehicleTBA,
            treasury,
            mintPrice
        );

        // Transfer ownership of the collection to the vehicle TBA (so the car owns its sponsorship contract)
        // OR transfer to the msg.sender (the user).
        // Usually the user manages it.
        newCollection.transferOwnership(msg.sender);

        emit SponsorshipCollectionCreated(address(newCollection), vehicleTBA, msg.sender);

        return address(newCollection);
    }

    function updateRequirements(uint256 _crAmount, uint256 _bstrAmount) external onlyOwner {
        crTokenRequired = _crAmount;
        bstrTokenRequired = _bstrAmount;
        emit RequirementsUpdated(_crAmount, _bstrAmount);
    }

    // Allow owner to withdraw escrowed tokens (if they are fees) or if logic changes
    function withdrawTokens(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
}
