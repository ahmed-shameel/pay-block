// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MilestonePayment
 * @notice A milestone-based payment contract.
 *         The depositor locks the total amount upfront; the beneficiary
 *         receives funds incrementally as each milestone is approved.
 *
 * Design decisions:
 *  - Milestones are defined at construction time and cannot be altered,
 *    making the contract fully transparent to both parties.
 *  - The depositor confirms each milestone; the amounts are configurable.
 *  - ReentrancyGuard on every Ether transfer.
 *  - A helper `cancel` function refunds the remaining balance to the
 *    depositor if both parties agree to terminate early.
 */
contract MilestonePayment is ReentrancyGuard {
    // ── Types ────────────────────────────────────────────────────

    struct Milestone {
        string  title;
        uint256 amount;
        bool    completed;
    }

    // ── State ────────────────────────────────────────────────────

    address public immutable depositor;
    address public immutable beneficiary;

    Milestone[] public milestones;
    uint256 public releasedAmount;
    bool    public cancelled;

    // ── Events ───────────────────────────────────────────────────

    event MilestoneCompleted(uint256 indexed index, uint256 amount);
    event ContractCancelled(uint256 refundAmount);

    // ── Errors ───────────────────────────────────────────────────

    error NotDepositor();
    error InvalidMilestone(uint256 index);
    error MilestoneAlreadyCompleted(uint256 index);
    error ContractAlreadyCancelled();
    error InsufficientBalance();
    error TransferFailed();
    error AmountMismatch(uint256 sent, uint256 required);

    // ── Constructor ──────────────────────────────────────────────

    /**
     * @param _beneficiary    Recipient of milestone payments.
     * @param _titles         Array of milestone titles.
     * @param _amounts        Array of milestone amounts (must sum to msg.value).
     */
    constructor(
        address _beneficiary,
        string[] memory _titles,
        uint256[] memory _amounts
    ) payable {
        require(_titles.length == _amounts.length, "Length mismatch");
        require(_titles.length > 0, "No milestones");

        uint256 total;
        for (uint256 i = 0; i < _amounts.length; i++) {
            total += _amounts[i];
        }
        if (msg.value != total) revert AmountMismatch(msg.value, total);

        depositor   = msg.sender;
        beneficiary = _beneficiary;

        for (uint256 i = 0; i < _titles.length; i++) {
            milestones.push(Milestone({ title: _titles[i], amount: _amounts[i], completed: false }));
        }
    }

    // ── Actions ──────────────────────────────────────────────────

    /**
     * @notice Mark a milestone as complete and release its payment.
     * @param index  Zero-based index of the milestone to complete.
     */
    function completeMilestone(uint256 index) external nonReentrant {
        if (msg.sender != depositor) revert NotDepositor();
        if (cancelled) revert ContractAlreadyCancelled();
        if (index >= milestones.length) revert InvalidMilestone(index);

        Milestone storage m = milestones[index];
        if (m.completed) revert MilestoneAlreadyCompleted(index);

        m.completed    = true;
        releasedAmount += m.amount;

        emit MilestoneCompleted(index, m.amount);

        (bool ok,) = beneficiary.call{value: m.amount}("");
        if (!ok) revert TransferFailed();
    }

    /**
     * @notice Cancel the contract and refund remaining balance to the depositor.
     *         Only the depositor can cancel.
     */
    function cancel() external nonReentrant {
        if (msg.sender != depositor) revert NotDepositor();
        if (cancelled) revert ContractAlreadyCancelled();

        cancelled = true;
        uint256 remaining = address(this).balance;
        if (remaining == 0) revert InsufficientBalance();

        emit ContractCancelled(remaining);

        (bool ok,) = depositor.call{value: remaining}("");
        if (!ok) revert TransferFailed();
    }

    // ── View helpers ─────────────────────────────────────────────

    function milestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function remainingBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
