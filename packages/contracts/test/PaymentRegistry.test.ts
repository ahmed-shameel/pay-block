import { expect } from 'chai';
import { ethers } from 'hardhat';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { PaymentRegistry } from '../typechain-types';
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

describe('PaymentRegistry', () => {
  async function deployRegistryFixture() {
    const [owner, other]: HardhatEthersSigner[] = await ethers.getSigners();
    const Registry = await ethers.getContractFactory('PaymentRegistry');
    const registry = (await Registry.deploy(owner.address)) as unknown as PaymentRegistry;
    return { registry, owner, other };
  }

  it('should allow owner to anchor a proof', async () => {
    const { registry, owner } = await loadFixture(deployRegistryFixture);

    const paymentId = ethers.id('payment-uuid-1234');
    await expect(registry.connect(owner).anchorProof(paymentId))
      .to.emit(registry, 'ProofAnchored')
      .withArgs(paymentId, await ethers.provider.getBlockNumber().then((n) => n + 1));

    expect(await registry.verifyProof(paymentId)).to.be.true;
  });

  it('should revert when non-owner tries to anchor a proof', async () => {
    const { registry, other } = await loadFixture(deployRegistryFixture);
    const paymentId = ethers.id('payment-uuid-5678');
    await expect(registry.connect(other).anchorProof(paymentId)).to.be.reverted;
  });

  it('should revert when anchoring a duplicate proof', async () => {
    const { registry, owner } = await loadFixture(deployRegistryFixture);
    const paymentId = ethers.id('payment-uuid-9999');
    await registry.connect(owner).anchorProof(paymentId);
    await expect(
      registry.connect(owner).anchorProof(paymentId),
    ).to.be.revertedWithCustomError(registry, 'ProofAlreadyExists');
  });

  it('should return false for an unanchored payment', async () => {
    const { registry } = await loadFixture(deployRegistryFixture);
    const unknown = ethers.id('no-such-payment');
    expect(await registry.verifyProof(unknown)).to.be.false;
  });
});
