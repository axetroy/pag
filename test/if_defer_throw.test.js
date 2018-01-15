import test from 'ava';
import godefer from '../index';

test('if defer function throw', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function() {
      step.push(2); // even defer function throw an error, it still going on
    });
    step.push(3);
    defer(function() {
      throw new Error('defer error');
    });
  });

  try {
    await main();
  } catch (err) {
    t.deepEqual(err.message, 'defer error');
  }

  t.deepEqual(step, [1, 3, 2]);
});

test('if defer function throw in async main function', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function() {
      step.push(2); // even defer function throw an error, it still going on
    });
    step.push(3);
    defer(function() {
      throw new Error('defer error');
    });
  });

  try {
    await main();
    t.fail(err.message);
  } catch (err) {
    t.deepEqual(err.message, 'defer error');
  }

  t.deepEqual(step, [1, 3, 2]);
});

test('if async defer function throw in main function', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function step2() {
      step.push(2); // even async defer function throw an error, it still going on
    });
    step.push(3);
    defer(async function stepthrow() {
      throw new Error('async defer error');
    });
    defer(function step4() {
      step.push(4);
    });
  });

  try {
    await main();
  } catch (err) {
    t.deepEqual(err.message, 'async defer error');
  }

  t.deepEqual(step, [1, 3, 4, 2]);
});

test('if async defer function throw in main function', async t => {
  const step = [];
  const main = godefer(async function(defer) {
    step.push(1);
    defer(function step2() {
      step.push(2); // even async defer function throw an error, it still going on
    });
    step.push(3);
    defer(async function stepthrow() {
      throw new Error('async defer error');
    });
    defer(function step4() {
      step.push(4);
    });
  });

  try {
    await main();
  } catch (err) {
    t.deepEqual(err.message, 'async defer error');
  }

  t.deepEqual(step, [1, 3, 4, 2]);
});
