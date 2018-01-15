import test from 'ava';
import godefer from '../index';

const { sleep } = require('../utils');

test('if async main function throw', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function() {
      step.push(2); // even main function throw an error, it still going on
    });
    step.push(3);

    throw new Error('async main throw error');
  });

  try {
    await main();
    t.fail('it should reject');
  } catch (err) {
    t.deepEqual(err.message, 'async main throw error');
  }

  t.deepEqual(step, [1, 3, 2]);
});

test('if async main function throw but async defer run success', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(async () => {
      step.push(2); // even main function throw an error, it still going on
      await sleep(1000);
    });
    step.push(3);

    throw new Error('async main throw error and async defer ok');
  });

  try {
    await main();
    t.fail('it should reject');
  } catch (err) {
    t.deepEqual(err.message, 'async main throw error and async defer ok');
  }

  t.deepEqual(step, [1, 3, 2]);
});
