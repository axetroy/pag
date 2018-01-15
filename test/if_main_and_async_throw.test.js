import test from 'ava';
import godefer from '../index';

test('If main function and defer function throw', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function() {
      step.push(2);
    });
    defer(function() {
      throw new Error('defer error');
    });
    step.push(3);

    throw new Error('main error');
  });

  try {
    await main();
  } catch (err) {
    t.deepEqual(err.message, 'main error');
  }

  t.deepEqual(step, [1, 3, 2]);
});
