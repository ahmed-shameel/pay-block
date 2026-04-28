import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers';
import { Escrow } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('Escrow', () => {
  // ── Fixture ──────────────────────────────────────────────────

  async function deployEscrowFixture() {
    const [depositor, beneficiary, arbitrator, other]: HardhatEthersSigner[] =
      await ethers.getSigners();

    const ONE_WEEK = 7 * 24 * 60 * 60;
    const deadline = (await time.latest()) + ONE_WEEK;
    const amount = ethers.parseEther('1.0');

    const Escrow = await ethers.getContractFactory('Escrow');
    const escrow = (await Escrow.connect(depositor).deploy(
      beneficiary.address,
      arbitrator.address,
      deadline,
      { value: amount },
    )) as unknown as Escrow;

    return { escrow, depositor, beneficiary, arbitrator, other, amount, deadline };
  }

  // ── Deployment ───────────────────────────────────────────────

  describe('Deployment', () => {
    it('should set correct parties and amount', async () => {
      const { escrow, depositor, beneficiary, arbitrator, amount } =
        await loadFixture(deployEscrowFixture);

      expect(await escrow.depositor()).to.equal(depositor.address);
      expect(await escrow.beneficiary()).to.equal(beneficiary.address);
      expect(await escrow.arbitrator()).to.equal(arbitrator.address);
      expect(await escrow.amount()).to.equal(amount);
    });

    it('should start in AWAITING_DELIVERY state', async () => {
      const { escrow } = await loadFixture(deployEscrowFixture);
      expect(await escrow.state()).to.equal(0); // State.AWAITING_DELIVERY
    });

    it('should revert if deployed with zero value', async () => {
      const [depositor, beneficiary, arbitrator] = await ethers.getSigners();
      const deadline = (await time.latest()) + 3600;
      const Escrow = await ethers.getContractFactory('Escrow');

      // Deploy with value: 0 – the factory reference is used to look up the
      // custom error definition without needing a separate deployed instance.
      await expect(
        Escrow.connect(depositor).deploy(
          beneficiary.address,
          arbitrator.address,
          deadline,
          { value: 0 },
        ),
      ).to.be.revertedWithCustomError(Escrow, 'InsufficientDeposit');
    });
  });

  // ── Release ──────────────────────────────────────────────────

  describe('release', () => {
    it('should transfer funds to beneficiary when called by depositor', async () => {
      const { escrow, depositor, beneficiary, amount } =
        await loadFixture(deployEscrowFixture);

      await expect(escrow.connect(depositor).release()).to.changeEtherBalances(
        [escrow, beneficiary],
        [-amount, amount],
      );
      expect(await escrow.state()).to.equal(1); // State.COMPLETE
    });

    it('should transfer funds to beneficiary when called by arbitrator', async () => {
      const { escrow, arbitrator, beneficiary, amount } =
        await loadFixture(deployEscrowFixture);

      await expect(escrow.connect(arbitrator).release()).to.changeEtherBalances(
        [escrow, beneficiary],
        [-amount, amount],
      );
    });

    it('should revert when called by an unrelated address', async () => {
      const { escrow, other } = await loadFixture(deployEscrowFixture);
      await expect(escrow.connect(other).release()).to.be.revertedWithCustomError(
        escrow,
        'NotDepositorOrArbitrator',
      );
    });
  });

  // ── Refund ───────────────────────────────────────────────────

  describe('refund', () => {
    it('should refund depositor when arbitrator calls refund', async () => {
      const { escrow, depositor, arbitrator, amount } =
        await loadFixture(deployEscrowFixture);

      await expect(escrow.connect(arbitrator).refund()).to.changeEtherBalances(
        [escrow, depositor],
        [-amount, amount],
      );
      expect(await escrow.state()).to.equal(2); // State.REFUNDED
    });

    it('should refund depositor after deadline passes', async () => {
      const { escrow, depositor, deadline, amount } =
        await loadFixture(deployEscrowFixture);

      await time.increaseTo(deadline);

      await expect(escrow.connect(depositor).refund()).to.changeEtherBalances(
        [escrow, depositor],
        [-amount, amount],
      );
    });

    it('should revert when depositor calls before deadline', async () => {
      const { escrow, depositor } = await loadFixture(deployEscrowFixture);
      await expect(escrow.connect(depositor).refund()).to.be.revertedWithCustomError(
        escrow,
        'DeadlineNotReached',
      );
    });
  });

  // ── Dispute ──────────────────────────────────────────────────

  describe('dispute', () => {
    it('should move state to DISPUTED when depositor raises dispute', async () => {
      const { escrow, depositor } = await loadFixture(deployEscrowFixture);
      await escrow.connect(depositor).dispute();
      expect(await escrow.state()).to.equal(3); // State.DISPUTED
    });

    it('should allow arbitrator to release after dispute', async () => {
      const { escrow, depositor, arbitrator, beneficiary, amount } =
        await loadFixture(deployEscrowFixture);

      await escrow.connect(depositor).dispute();
      await expect(escrow.connect(arbitrator).release()).to.changeEtherBalances(
        [escrow, beneficiary],
        [-amount, amount],
      );
    });

    it('should revert when non-depositor raises dispute', async () => {
      const { escrow, other } = await loadFixture(deployEscrowFixture);
      await expect(escrow.connect(other).dispute()).to.be.revertedWithCustomError(
        escrow,
        'NotDepositor',
      );
    });
  });
});
