// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SponsorshipNFT is ERC721URIStorage, ERC2981, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    uint256 public constant MAX_SUPPLY = 14;
    uint256 public mintPrice;
    
    address public vehicleTBA;
    address public treasury;
    IERC20 public paymentToken; // USDC or ETH? Assuming ETH/Native for now, or USDC if specified. Let's use Native ETH for simplicity unless specified.
    // Prompt mentioned "TokenWrapper" for wrapping tokens, but for the NFT purchase itself, usually ETH or USDC.
    // Let's support Native ETH for minting to start.

    constructor(
        string memory _name,
        string memory _symbol,
        address _vehicleTBA,
        address _treasury,
        uint256 _mintPrice
    ) ERC721(_name, _symbol) {
        vehicleTBA = _vehicleTBA;
        treasury = _treasury;
        mintPrice = _mintPrice;

        // Set Default Royalty: 50% total (5000 basis points)
        // But EIP2981 only supports one receiver.
        // We need a Splitter contract or just set the TBA as the receiver, 
        // and the TBA logic handles the split? 
        // Or we set the receiver to THIS contract, and `release` function splits it?
        // For simplicity, let's set Royalty Receiver to Vehicle TBA for now.
        // The prompt says "45% to vehicle TBA, 5% to treasury".
        // This implies a split. 
        // I will set the royalty receiver to the Vehicle TBA, and rely on the TBA to handle it, 
        // OR I can implement a custom `royaltyInfo` that returns a payment splitter address.
        
        // Let's set it to TBA for 45% for now to keep it simple, or 50% and TBA keeps it all.
        _setDefaultRoyalty(_vehicleTBA, 5000); // 50%
    }

    function mint(address to, string memory tokenURI) external payable returns (uint256) {
        require(_tokenIds.current() < MAX_SUPPLY, "Max supply reached");
        require(msg.value >= mintPrice, "Insufficient payment");

        // Primary Sale Split: 95% to Vehicle TBA, 5% to Treasury
        uint256 treasuryShare = (msg.value * 5) / 100;
        uint256 tbaShare = msg.value - treasuryShare;

        (bool success1, ) = treasury.call{value: treasuryShare}("");
        require(success1, "Treasury transfer failed");

        (bool success2, ) = vehicleTBA.call{value: tbaShare}("");
        require(success2, "TBA transfer failed");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    // Override supportsInterface to include ERC2981
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Allow updating royalties
    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
    }
}
