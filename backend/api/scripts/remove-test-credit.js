/**
 * One-off: removes whatever is left of the free test credit from agent wallets.
 *
 * Recharged money is kept. Spending is treated as having used the test credit first, so:
 *   test left = test credit - (credit checks + withdrawals), never below 0 or above the balance.
 *
 * Safe to run twice: each test entry is marked as removed and is not processed again.
 *
 *   Preview:  node --env-file=.env scripts/remove-test-credit.js
 *   Apply:    node --env-file=.env scripts/remove-test-credit.js --apply
 */
const mongoose = require('mongoose');

const apply = process.argv.includes('--apply');
const rupees = (paise) => (paise / 100).toFixed(2);

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await mongoose.connect(process.env.MONGODB_URI);
  const agents = mongoose.connection.db.collection('agents');
  const entries = mongoose.connection.db.collection('wallet_entries');

  const tests = await entries.find({ kind: 'topup', status: 'success', requestId: /^TEST/ }).toArray();
  const rows = [];
  let totalRemoved = 0;

  for (const test of tests) {
    const agent = await agents.findOne({ _id: new mongoose.Types.ObjectId(test.agentId) });
    if (!agent) {
      rows.push({ agent: test.agentId, result: 'agent not found, skipped' });
      continue;
    }
    const spentRows = await entries
      .find({
        agentId: test.agentId,
        $or: [
          { kind: 'usage', status: 'success' },
          { kind: 'withdraw', status: { $in: ['success', 'pending'] } },
        ],
      })
      .toArray();
    const spent = spentRows.reduce((sum, row) => sum + row.amountPaise, 0);
    const balance = agent.walletBalancePaise ?? 0;
    const remove = Math.max(0, Math.min(test.amountPaise - spent, balance));

    let result = 'preview';
    if (apply) {
      const claimed = await entries.updateOne(
        { _id: test._id, status: 'success' },
        { $set: { status: 'failed', note: `Test balance removed (Rs ${rupees(remove)})` } },
      );
      if (!claimed.modifiedCount) {
        result = 'already processed';
      } else {
        const paid = await agents.updateOne({ _id: agent._id, walletBalancePaise: balance }, { $inc: { walletBalancePaise: -remove } });
        if (paid.matchedCount) {
          result = 'removed';
          totalRemoved += remove;
        } else {
          await entries.updateOne({ _id: test._id }, { $set: { status: 'success', note: test.note } });
          result = 'balance changed during run, rerun';
        }
      }
    } else {
      totalRemoved += remove;
    }

    rows.push({
      agent: agent.code || test.agentId,
      name: agent.name,
      balance: rupees(balance),
      spent: rupees(spent),
      remove: rupees(remove),
      after: rupees(balance - remove),
      result,
    });
  }

  console.table(rows);
  const noEntry = await agents.countDocuments({ testCreditApplied: true });
  console.log(`Test entries: ${tests.length} | Agents flagged with test credit: ${noEntry}`);
  console.log(`${apply ? 'REMOVED' : 'WOULD REMOVE'}: Rs ${rupees(totalRemoved)}${apply ? '' : ' (preview only, pass --apply to change data)'}`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
