import { decodeMFID, encodeMFID, extractMFIDFromUrl } from '../../src/utils/mfid';

describe('Mastofeed identifier (MFID)', () => {
  it('encodes an MFID', () => {
    expect(encodeMFID('375c0c80e35f3c5494478cab7343fa13')).toEqual('Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=');
  });

  it('decodes an MFID', () => {
    expect(decodeMFID('Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=')).toEqual('375c0c80e35f3c5494478cab7343fa13');
  });

  it('extracts an MFID from an URL', () => {
    expect(
      extractMFIDFromUrl('https://www.example.com/test?mfid=Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=&oid=abc'),
    ).toEqual('375c0c80e35f3c5494478cab7343fa13');
  });
});
