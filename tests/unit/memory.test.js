const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory/index');


describe('memory', () => {

  //readFragment
  test('read a fragment', async () => {
    const data = { fragment: 'fragment 1', id: '1', ownerId: 'a' };
    await writeFragment(data);
    const result = await readFragment('a', '1');
    expect(result).toBe(data);
  });

  //writFragment
  test('write a fragment', async () => {
    const data = { fragment: 'fragment 1', id: '1', ownerId: 'a' };
    const result = await writeFragment(data);
    expect(result).toBe(undefined);
  });


  test('read the fragment data', async () => {
    const data = 'fragment 1';
    await writeFragmentData('a', '1', data);
    const result = await readFragmentData('a', '1');
    expect(result).toBe(data);
  });
  test('write the fragment data', async () => {
    const data = 'fragment 1';
    const result = await writeFragmentData('a', '1', data);
    expect(result).toBe(undefined);
  });



});
