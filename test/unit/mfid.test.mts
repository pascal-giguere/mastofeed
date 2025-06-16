import {
  decodeMFID,
  encodeMFID,
  extractUrlFromTootContent,
  extractMFIDFromUrl,
  addMFIDToUrl,
} from "../../src/utils/mfid.mjs";

describe("Mastofeed identifier (MFID)", () => {
  it("encodes an MFID", () => {
    expect(encodeMFID("375c0c80e35f3c5494478cab7343fa13")).toEqual("Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=");
  });

  it("decodes an MFID", () => {
    expect(decodeMFID("Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM=")).toEqual("375c0c80e35f3c5494478cab7343fa13");
  });

  it("extracts an URL from a toot's content", () => {
    expect(
      extractUrlFromTootContent(
        '<p>BLOCS SANITAIRES DANS LES ÉCOLES <br />Drainville exige le maintien de toilettes non mixtes</p><p>Bernard Drainville a tranché : il interdit aux écoles du Québec de convertir des blocs sanitaires entiers, actuellement dédiés pour filles et garçons, en toilettes mixtes. Il propose en contrepartie un compromis qu’il juge « très raisonnable et très acceptable » pour accommoder les personnes non binaires : que des toilettes individuelles et fermées soie…</p><p>Hugo Pilon-Larose — Actualités<br /><a href="https://www.lapresse.ca/actualites/education/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="ellipsis">lapresse.ca/actualites/educati</span><span class="invisible">on/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=</span></a></p>',
      ),
    ).toEqual(
      "https://www.lapresse.ca/actualites/education/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=",
    );
  });

  it("extracts an URL and decodes HTML entities from a toot's content (see issue #1)", () => {
    expect(
      extractUrlFromTootContent(
        '<p>BLOCS SANITAIRES DANS LES ÉCOLES <br />Drainville exige le maintien de toilettes non mixtes</p><p>Hugo Pilon-Larose — Actualités<br /><a href="https://github.com/cdzombak/gallerygen/tree/main?tab=readme-ov-file&amp;mfid=aHR0cHM6Ly9naXRodWIuY29tL2Nkem9tYmFrL2dhbGxlcnlnZW4vdHJlZS9tYWluP3RhYj1yZWFkbWUtb3YtZmlsZQ%3D%3D" target="_blank" rel="nofollow noopener noreferrer" translate="no"><span class="invisible">https://www.</span><span class="ellipsis">lapresse.ca/actualites/educati</span><span class="invisible">on/2023-09-12/blocs-sanitaires-dans-les-ecoles/drainville-exige-le-maintien-de-toilettes-non-mixtes.php?mfid=MDE1MzZiOWY0NWY3M2EzZWI0OGEwM2UzMTBjMDBjMWU=</span></a></p>',
      ),
    ).toEqual(
      "https://github.com/cdzombak/gallerygen/tree/main?tab=readme-ov-file&mfid=aHR0cHM6Ly9naXRodWIuY29tL2Nkem9tYmFrL2dhbGxlcnlnZW4vdHJlZS9tYWluP3RhYj1yZWFkbWUtb3YtZmlsZQ%3D%3D",
    );
  });


  it("adds an MFID to a URL", () => {
    expect(addMFIDToUrl("https://www.example.com/test?utm=foo", "375c0c80e35f3c5494478cab7343fa13")).toEqual(
      "https://www.example.com/test?utm=foo&mfid=Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM%3D",
    );
  });

  it("extracts an MFID from a URL", () => {
    expect(
      extractMFIDFromUrl("https://www.example.com/test?utm=foo&mfid=Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM%3D"),
    ).toEqual("375c0c80e35f3c5494478cab7343fa13");
  });

  it("extracts an MFID from URL (see issue #1)", () => {
    const res = extractMFIDFromUrl("https://github.com/cdzombak/gallerygen/tree/main?tab=readme-ov-file&mfid=aHR0cHM6Ly9naXRodWIuY29tL2Nkem9tYmFrL2dhbGxlcnlnZW4vdHJlZS9tYWluP3RhYj1yZWFkbWUtb3YtZmlsZQ%3D%3D");
    expect(res).toEqual("https://github.com/cdzombak/gallerygen/tree/main?tab=readme-ov-file");
  });
});
