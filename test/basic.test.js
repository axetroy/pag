import test from 'ava';
import godefer from '../index';

test('Basic use', async t => {
  const step = [];
  const main = godefer(async defer => {
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  await main();

  t.deepEqual(step, [1, 3, 2]);
});

test('If constructor throw an error', async t => {
  const func = godefer(function() {
    throw new Error(`Test error`);
  });

  try {
    await func();
    t.fail('It should fail');
  } catch (err) {
    t.deepEqual(err.message, 'Test error');
  }
});

test('If constructor and defer throw an error', async t => {
  const func = godefer(function(defer) {

    defer(function() {
      throw new Error('defer error');
    });

    throw new Error(`constructor error`);
  });

  try {
    await func();
    t.fail('It should fail');
  } catch (err) {
    t.deepEqual(err.message, 'constructor error');
  }
});

test('What ever constructor is, it always return a promise', async t => {
  const ret = godefer(function() {})();

  t.true(typeof ret.then === 'function');
});

test('Make sure argument pass', async t => {
  const step = [];
  const main = godefer(async (argv1, argv2, defer) => {
    t.deepEqual(argv1, 'a');
    t.deepEqual(argv2, 'b');
    step.push(1);
    defer(function() {
      step.push(2);
    });
    step.push(3);
  });

  await main('a', 'b');

  t.deepEqual(step, [1, 3, 2]);
});

test('err fist in defer argument', async t => {
  const step = [];
  const main = godefer(async defer => {
    step.push(1);
    defer(function(err, res) {
      t.deepEqual(err, null);
      t.deepEqual(res, 'hello');
      step.push(2);
    });
    step.push(3);

    return 'hello';
  });

  await main();

  t.deepEqual(step, [1, 3, 2]);
});
