// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Escrow.sol";

/**
 * @title EscrowFactory
 * @notice Factory for creating Escrow contracts.
 *         Emits an event for easy off-chain indexing.
 *
 * Design decision: using a factory keeps deployment straightforward
 * and allows the backend to batch-create escrows without managing
 * raw bytecode or constructor arguments.
 */
contract EscrowFactory is Ownable {
    event EscrowCreated(
        address indexed escrowAddress,
        address indexed depositor,
        address indexed beneficiary,
        uint256 amount
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @notice Deploy a new Escrow and fund it in a single transaction.
     * @param beneficiary  Address that will receive the escrowed funds.
     * @param arbitrator   Address that can arbitrate disputes.
     * @param deadline     Unix timestamp deadline for self-refund.
     * @return escrow      Address of the newly deployed Escrow contract.
     */
    function createEscrow(
        address beneficiary,
        address arbitrator,
        uint256 deadline
    ) external payable returns (address escrow) {
        Escrow e = new Escrow{value: msg.value}(beneficiary, arbitrator, deadline);
        escrow = address(e);
        emit EscrowCreated(escrow, msg.sender, beneficiary, msg.value);
    }
}
