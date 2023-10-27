import { decodeMFID, encodeMFID, extractUrlFromTootContent, extractMFIDFromUrl } from '../../src/utils/mfid';

describe('Mastofeed identifier (MFID)', () => {
  it('encodes an MFID', () => {
    expect(encodeMFID('375c0c80e35f3c5494478cab7343fa13')).toEqual('Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=');
  });

  it('decodes an MFID', () => {
    expect(decodeMFID('Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=')).toEqual('375c0c80e35f3c5494478cab7343fa13');
  });

  it("extracts an URL from a toot's content", () => {
    expect(
      extractUrlFromTootContent(
        '<p>BLOCS SANITAIRES DANS LES ÉCOLES <br />Drainville exige le maintien de toilettes non mixtes</p><p>Bernard Drainville a tranché : il interdit aux écoles du Québec de convertir des blocs sanitaires entiers, actuellement dédiés pour filles et garçons, en toilettes mixtes. Il propose en contrepartie un compromis qu’il juge « très raisonnable et très acceptable » pour accommoder les personnes non binaires : que des toilettes individuelles et fermées soie…</p><p>Hugo Pilon-Larose — Actualités<br /><a href="https://www.lapresse.ca/actualites/education/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="ellipsis">lapresse.ca/actualites/educati</span><span class="invisible">on/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=</span></a></p>',
      ),
    ).toEqual(
      'https://www.lapresse.ca/actualites/education/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=',
    );
  });

  it('extracts an MFID from an URL', () => {
    expect(
      extractMFIDFromUrl('https://www.example.com/test?mfid=Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=&oid=abc'),
    ).toEqual('375c0c80e35f3c5494478cab7343fa13');
  });
});
