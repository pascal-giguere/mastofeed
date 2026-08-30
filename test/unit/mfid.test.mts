import {
  decodeMFID,
  encodeMFID,
  extractUrlFromTootContent,
  extractMFIDFromUrl,
  extractMFIDFromTootContent,
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

  it("extracts an MFID from toot content when it is in the href", () => {
    expect(
      extractMFIDFromTootContent(
        '<p>Title</p><p><a href="https://www.example.com/test?utm=foo&amp;mfid=Mzc1YzBjODBlMzVmM2M1NDk0NDc4Y2FiNzM0M2ZhMTM%3D" target="_blank" rel="nofollow noopener noreferrer"><span class="ellipsis">example.com/test</span></a></p>',
      ),
    ).toEqual("375c0c80e35f3c5494478cab7343fa13");
  });

  it("extracts an MFID left as unlinked text after a ']' URL terminator", () => {
    const content =
      '<p>Sur la route aux États-Unis de Trump : des Américains forcés à vivre dans leur voiture </p><p>«  En Indiana, il est maintenant interdit de camper ou de dormir à long terme sur une propriété publique.  »</p><p><a href="https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6" target="_blank" rel="nofollow noopener" translate="no"><span class="invisible">https://</span><span class="ellipsis">ici.radio-canada.ca/en-bref/1-</span><span class="invisible">10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6</span></a>]?mfid=aHR0cHM6Ly9pY2kucmFkaW8tY2FuYWRhLmNhL2VuLWJyZWYvMS0xMDc0NTUxMC9jb3V0LXZpZS1mb3JjZS1hLXZpdnJlLWRhbnMtbGV1ci12b2l0dXJlLXN1ci1yb3V0ZS1hdXgtZXRhdHMtdW5pcy10cnVtcC0yLTZd</p>';

    expect(extractUrlFromTootContent(content)).toEqual(
      "https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6",
    );
    expect(() =>
      extractMFIDFromUrl(
        "https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6",
      ),
    ).toThrow("Failed to extract MFID from URL");

    expect(extractMFIDFromTootContent(content)).toEqual(
      "https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6]",
    );
  });

  it("encodes ']' in the path so Mastodon autolinking keeps mfid in the href", () => {
    const guid =
      "https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6]";
    expect(addMFIDToUrl(guid, guid)).toEqual(
      "https://ici.radio-canada.ca/en-bref/1-10745510/cout-vie-force-a-vivre-dans-leur-voiture-sur-route-aux-etats-unis-trump-2-6%5D?mfid=aHR0cHM6Ly9pY2kucmFkaW8tY2FuYWRhLmNhL2VuLWJyZWYvMS0xMDc0NTUxMC9jb3V0LXZpZS1mb3JjZS1hLXZpdnJlLWRhbnMtbGV1ci12b2l0dXJlLXN1ci1yb3V0ZS1hdXgtZXRhdHMtdW5pcy10cnVtcC0yLTZd",
    );
  });

  it("encodes other Mastodon path-ending punctuation so mfid stays in the href", () => {
    expect(addMFIDToUrl("https://www.example.com/story!", "id")).toEqual(
      "https://www.example.com/story%21?mfid=aWQ%3D",
    );
    expect(addMFIDToUrl("https://www.example.com/story.", "id")).toEqual(
      "https://www.example.com/story%2E?mfid=aWQ%3D",
    );
    expect(addMFIDToUrl("https://www.example.com/story)", "id")).toEqual(
      "https://www.example.com/story%29?mfid=aWQ%3D",
    );
    expect(addMFIDToUrl("https://www.example.com/story']", "id")).toEqual(
      "https://www.example.com/story%27%5D?mfid=aWQ%3D",
    );
  });

  it("leaves balanced parentheses and normal file extensions unencoded", () => {
    expect(addMFIDToUrl("https://en.wikipedia.org/wiki/Primer_(film)", "id")).toEqual(
      "https://en.wikipedia.org/wiki/Primer_(film)?mfid=aWQ%3D",
    );
    expect(addMFIDToUrl("https://en.wikipedia.org/wiki/Foo_(bar_(baz))", "id")).toEqual(
      "https://en.wikipedia.org/wiki/Foo_(bar_(baz))?mfid=aWQ%3D",
    );
    expect(addMFIDToUrl("https://www.example.com/index.html", "id")).toEqual(
      "https://www.example.com/index.html?mfid=aWQ%3D",
    );
  });
});
