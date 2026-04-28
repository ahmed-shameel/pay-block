// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PaymentRegistry
 * @notice Stores immutable payment proofs (keccak-256 hashes) on-chain.
 *         The backend calls `anchorProof` after a successful Stripe payment
 *         so that the proof can later be publicly verified.
 *
 * Design decisions:
 *  - Only the trusted backend wallet (owner) can anchor proofs to prevent spam.
 *  - Proof data is a bytes32 hash, not raw PII – privacy-preserving.
 *  - Anyone can call `verifyProof`, making verification fully public.
 */
contract PaymentRegistry is Ownable {
    // ── State ───────────────────────────────────────────────────

    /// paymentId hash → block number when the proof was anchored
    mapping(bytes32 => uint256) private _proofs;

    // ── Events ──────────────────────────────────────────────────

    event ProofAnchored(bytes32 indexed paymentId, uint256 blockNumber);

    // ── Errors ──────────────────────────────────────────────────

    error ProofAlreadyExists(bytes32 paymentId);

    // ── Constructor ─────────────────────────────────────────────

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ── Write ────────────────────────────────────────────────────

    /**
     * @notice Anchor a payment proof on-chain.
     * @param paymentId  keccak256 hash of the off-chain payment UUID.
     *                   Compute with: ethers.id(paymentUUID) in the backend.
     */
    function anchorProof(bytes32 paymentId) external onlyOwner {
        if (_proofs[paymentId] != 0) revert ProofAlreadyExists(paymentId);
        _proofs[paymentId] = block.number;
        emit ProofAnchored(paymentId, block.number);
    }

    // ── Read ─────────────────────────────────────────────────────

    /**
     * @notice Check whether a payment proof has been anchored.
     * @param paymentId  keccak256 hash of the payment UUID.
     * @return True when the proof exists.
     */
    function verifyProof(bytes32 paymentId) external view returns (bool) {
        return _proofs[paymentId] != 0;
    }

    /**
     * @notice Returns the block number at which the proof was anchored,
     *         or 0 if it does not exist.
     */
    function getProofBlock(bytes32 paymentId) external view returns (uint256) {
        return _proofs[paymentId];
    }
}
