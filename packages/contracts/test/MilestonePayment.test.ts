import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { MilestonePayment } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('MilestonePayment', () => {
  async function deployMilestoneFixture() {
    const [depositor, beneficiary, other]: HardhatEthersSigner[] =
      await ethers.getSigners();

    const titles  = ['Design', 'Development', 'QA'];
    const amounts = [
      ethers.parseEther('1.0'),
      ethers.parseEther('2.0'),
      ethers.parseEther('0.5'),
    ];
    const total = amounts.reduce((a, b) => a + b, 0n);

    const MilestonePayment = await ethers.getContractFactory('MilestonePayment');
    const contract = (await MilestonePayment.connect(depositor).deploy(
      beneficiary.address,
      titles,
      amounts,
      { value: total },
    )) as unknown as MilestonePayment;

    return { contract, depositor, beneficiary, other, titles, amounts, total };
  }

  it('should deploy with correct milestone count and balance', async () => {
    const { contract, total } = await loadFixture(deployMilestoneFixture);
    expect(await contract.milestoneCount()).to.equal(3);
    expect(await ethers.provider.getBalance(await contract.getAddress())).to.equal(total);
  });

  it('should release milestone payment to beneficiary', async () => {
    const { contract, depositor, beneficiary, amounts } =
      await loadFixture(deployMilestoneFixture);

    await expect(contract.connect(depositor).completeMilestone(0)).to.changeEtherBalances(
      [contract, beneficiary],
      [-amounts[0], amounts[0]],
    );
  });

  it('should revert when completing a milestone twice', async () => {
    const { contract, depositor } = await loadFixture(deployMilestoneFixture);
    await contract.connect(depositor).completeMilestone(0);
    await expect(
      contract.connect(depositor).completeMilestone(0),
    ).to.be.revertedWithCustomError(contract, 'MilestoneAlreadyCompleted');
  });

  it('should refund remaining balance on cancel', async () => {
    const { contract, depositor, total } = await loadFixture(deployMilestoneFixture);
    await expect(contract.connect(depositor).cancel()).to.changeEtherBalances(
      [contract, depositor],
      [-total, total],
    );
    expect(await contract.cancelled()).to.be.true;
  });

  it('should refund only remaining balance after partial completion', async () => {
    const { contract, depositor, amounts } = await loadFixture(deployMilestoneFixture);
    // Complete first milestone – pay out amounts[0]
    await contract.connect(depositor).completeMilestone(0);

    const remaining = amounts[1] + amounts[2];
    await expect(contract.connect(depositor).cancel()).to.changeEtherBalances(
      [contract, depositor],
      [-remaining, remaining],
    );
  });

  it('should revert when non-depositor tries to complete a milestone', async () => {
    const { contract, other } = await loadFixture(deployMilestoneFixture);
    await expect(
      contract.connect(other).completeMilestone(0),
    ).to.be.revertedWithCustomError(contract, 'NotDepositor');
  });
});
