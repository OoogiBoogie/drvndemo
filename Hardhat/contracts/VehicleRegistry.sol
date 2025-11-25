// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IERC6551Registry {
    function createAccount(
        address implementation,
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external returns (address account);

    function account(
        address implementation,
        bytes32 salt,
        uint256 chainId,
        address tokenContract,
        uint256 tokenId
    ) external view returns (address account);
}

contract VehicleRegistry is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    IERC20 public usdcToken;
    address public treasury;
    uint256 public registrationFee = 50 * 10**6; // 50 USDC (assuming 6 decimals)

    // ERC6551 Config
    address public registry6551;
    address public implementation6551;

    mapping(bytes32 => bool) public vinHashes; // Prevent duplicate VINs
    mapping(uint256 => address) public vehicleTBA; // Token ID -> TBA Address

    event VehicleRegistered(uint256 indexed tokenId, address indexed owner, string vinHash, address tba);
    event RegistrationFeeUpdated(uint256 newFee);
    event TreasuryUpdated(address newTreasury);

    constructor(
        address _usdcToken,
        address _treasury,
        address _registry6551,
        address _implementation6551
    ) ERC721("DRVN Registered Vehicle", "DRVN-VHCL") {
        usdcToken = IERC20(_usdcToken);
        treasury = _treasury;
        registry6551 = _registry6551;
        implementation6551 = _implementation6551;
    }

    function registerVehicle(
        address to,
        string memory tokenURI,
        string memory vin
    ) external returns (uint256) {
        bytes32 vinHash = keccak256(abi.encodePacked(vin));
        require(!vinHashes[vinHash], "Vehicle already registered");
        
        // Collect Registration Fee
        require(usdcToken.transferFrom(msg.sender, treasury, registrationFee), "Fee transfer failed");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(to, newItemId);
        _setTokenURI(newItemId, tokenURI);

        vinHashes[vinHash] = true;

        // Create Token Bound Account (TBA)
        address tba = IERC6551Registry(registry6551).createAccount(
            implementation6551,
            bytes32(0), // salt
            block.chainid,
            address(this),
            newItemId
        );

        vehicleTBA[newItemId] = tba;

        emit VehicleRegistered(newItemId, to, vin, tba);

        return newItemId;
    }

    function setRegistrationFee(uint256 _fee) external onlyOwner {
        registrationFee = _fee;
        emit RegistrationFeeUpdated(_fee);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function getVehicleTBA(uint256 tokenId) external view returns (address) {
        return vehicleTBA[tokenId];
    }
}
