// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Escrow
 * @notice A simple escrow contract where a depositor locks funds
 *         that can be released to a beneficiary or refunded to the
 *         depositor by an arbitrator (or the depositor themselves
 *         before the deadline).
 *
 * Design decisions:
 *  - The contract holds exactly one payment to keep logic simple and auditable.
 *  - ReentrancyGuard prevents re-entrancy on release / refund.
 *  - The arbitrator address defaults to the deployer (can be a multi-sig).
 *  - A deadline allows the depositor to reclaim funds if the beneficiary
 *    never delivers; prevents funds being locked forever.
 */
contract Escrow is ReentrancyGuard {
    // ── State ───────────────────────────────────────────────────

    address public immutable depositor;
    address public immutable beneficiary;
    address public immutable arbitrator;

    uint256 public immutable amount;
    uint256 public immutable deadline;

    enum State { AWAITING_DELIVERY, COMPLETE, REFUNDED, DISPUTED }
    State public state;

    // ── Events ──────────────────────────────────────────────────

    event FundsDeposited(address indexed depositor, uint256 amount);
    event FundsReleased(address indexed beneficiary, uint256 amount);
    event FundsRefunded(address indexed depositor, uint256 amount);
    event DisputeRaised(address indexed raisedBy);

    // ── Errors ──────────────────────────────────────────────────

    error NotDepositor();
    error NotArbitrator();
    error NotDepositorOrArbitrator();
    error InvalidState(State current, State expected);
    error InsufficientDeposit(uint256 sent, uint256 required);
    error DeadlineNotReached();
    error DeadlineExpired();
    error TransferFailed();

    // ── Constructor ─────────────────────────────────────────────

    /**
     * @param _beneficiary  Address that will receive funds on release.
     * @param _arbitrator   Address that can arbitrate disputes.
     * @param _deadline     Unix timestamp after which the depositor can
     *                      self-refund without arbitrator approval.
     */
    constructor(
        address _beneficiary,
        address _arbitrator,
        uint256 _deadline
    ) payable {
        if (msg.value == 0) revert InsufficientDeposit(msg.value, 1);
        if (_deadline <= block.timestamp) revert DeadlineExpired();

        depositor   = msg.sender;
        beneficiary = _beneficiary;
        arbitrator  = _arbitrator;
        amount      = msg.value;
        deadline    = _deadline;
        state       = State.AWAITING_DELIVERY;

        emit FundsDeposited(msg.sender, msg.value);
    }

    // ── Core actions ────────────────────────────────────────────

    /**
     * @notice Release funds to the beneficiary.
     *         Can be called by the depositor (confirms delivery) or
     *         the arbitrator (resolves dispute in beneficiary's favour).
     */
    function release() external nonReentrant {
        if (msg.sender != depositor && msg.sender != arbitrator) {
            revert NotDepositorOrArbitrator();
        }
        if (state != State.AWAITING_DELIVERY && state != State.DISPUTED) {
            revert InvalidState(state, State.AWAITING_DELIVERY);
        }

        state = State.COMPLETE;
        emit FundsReleased(beneficiary, amount);

        (bool ok,) = beneficiary.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /**
     * @notice Refund the depositor.
     *         - Arbitrator can refund at any time (e.g. after a dispute).
     *         - Depositor can self-refund only after the deadline passes.
     */
    function refund() external nonReentrant {
        bool isArbitrator = msg.sender == arbitrator;
        bool isDepositorAfterDeadline =
            msg.sender == depositor && block.timestamp >= deadline;

        if (!isArbitrator && !isDepositorAfterDeadline) {
            if (msg.sender != depositor) revert NotDepositor();
            revert DeadlineNotReached();
        }
        if (state != State.AWAITING_DELIVERY && state != State.DISPUTED) {
            revert InvalidState(state, State.AWAITING_DELIVERY);
        }

        state = State.REFUNDED;
        emit FundsRefunded(depositor, amount);

        (bool ok,) = depositor.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    /**
     * @notice Raise a dispute so the arbitrator can mediate.
     *         Only the depositor can raise a dispute.
     */
    function dispute() external {
        if (msg.sender != depositor) revert NotDepositor();
        if (state != State.AWAITING_DELIVERY) {
            revert InvalidState(state, State.AWAITING_DELIVERY);
        }

        state = State.DISPUTED;
        emit DisputeRaised(msg.sender);
    }

    // ── View helpers ─────────────────────────────────────────────

    function isExpired() external view returns (bool) {
        return block.timestamp >= deadline;
    }
}
