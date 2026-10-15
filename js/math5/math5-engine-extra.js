(() => {
  "use strict";

  // Extra exercise types for Matematik 5. Called from populateTask() in
  // math5-engine-generators.js. New field type: "choice" (flervalsfråga),
  // where field.options is the list of alternatives and field.answer the
  // correct option text.

  const root = typeof window !== "undefined" ? window : globalThis;
  const generators = {};

  /* ---------- helpers ---------- */
  const shuffle = (a) => {
    const r = [...a];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
  const modpow = (b, e, m) => {
    let r = 1,
      x = ((b % m) + m) % m;
    while (e > 0) {
      if (e % 2) r = (r * x) % m;
      x = (x * x) % m;
      e = Math.floor(e / 2);
    }
    return r;
  };
  const sub = (n) => String(n).replace(/\d/g, (d) => "₀₁₂₃₄₅₆₇₈₉"[d]);
  const sgn = (n) => (n < 0 ? "− " + -n : "+ " + n);
  const setStr = (a) => (a.length ? "{" + a.join(", ") + "}" : "∅");
  // Adds a numeric field. Non-integer answers get a small tolerance so that
  // decimals rounded to two places are accepted (fractions also work).
  const num = (c, label, answer, extra = {}) =>
    c.t.fields.push(
      c.field(
        label,
        answer,
        "number",
        Number.isInteger(answer) ? extra : { tolerance: 0.006, ...extra },
      ),
    );
  const pickOne = (c, label, correct, wrong) => {
    const wr = [...new Set(wrong)].filter((x) => x !== correct);
    c.t.fields.push(
      c.field(label, correct, "choice", { options: shuffle([correct, ...wr]) }),
    );
  };
  const linear = (a, b) =>
    (a === 1 ? "x" : a === -1 ? "−x" : a + "x") + (b === 0 ? "" : " " + sgn(b));
  const DAYS = ["måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag", "söndag"];

  /* ================= KOMBINATORIK ================= */

  generators["combinatorics.arrangement"] = (c) => {
    const { t, level, rand, pick, factorial: F } = c;
    const P = (n, k) => F(n) / F(n - k);
    const kind = pick(
      level >= 5
        ? ["both", "round2", "evenzero"]
        : level === 4
          ? ["zeroDigits", "apart", "round", "evenDigits"]
          : ["evenDigits", "zeroDigits", "together"],
    );
    const n = rand(5, level >= 4 ? 9 : 7);
    const [p1, p2] = pick([
      ["Alva", "Bosse"],
      ["Hanna", "Jonas"],
      ["Maja", "Elias"],
    ]);
    t.meta = { kind };
    if (kind === "evenDigits") {
      const d = rand(5, 7),
        k = rand(3, Math.min(5, d)),
        evens = Math.floor(d / 2),
        ans = evens * P(d - 1, k - 1);
      t.meta = { kind, d, k };
      t.prompt = `Hur många ${k}-siffriga tal kan bildas av siffrorna ${c.range(d).join(", ")} om varje siffra får användas högst en gång och talet ska vara jämnt?`;
      num(c, "Antal tal", ans);
      t.solution = [
        `Börja med villkoret: sista siffran ska vara jämn. Det finns ${evens} jämna siffror att välja bland.`,
        `De övriga ${k - 1} platserna fylls utan upprepning med de ${d - 1} kvarvarande siffrorna: P(${d - 1},${k - 1}) = ${P(d - 1, k - 1)}.`,
        `${evens} · ${P(d - 1, k - 1)} = ${ans}.`,
      ];
      t.hint = "Fyll den plats som har ett villkor först.";
    }
    if (kind === "zeroDigits") {
      const d = rand(4, 7),
        k = rand(3, Math.min(5, d + 1)),
        ans = d * P(d, k - 1);
      t.meta = { kind, d, k };
      t.prompt = `Hur många ${k}-siffriga tal kan bildas av siffrorna 0–${d} om varje siffra får användas högst en gång? Ett tal får inte börja med 0.`;
      num(c, "Antal tal", ans);
      t.solution = [
        `Första siffran kan väljas på ${d} sätt (alla utom 0).`,
        `Därefter finns ${d} siffror kvar (0 är nu tillåten) för de övriga ${k - 1} platserna: P(${d},${k - 1}) = ${P(d, k - 1)}.`,
        `${d} · ${P(d, k - 1)} = ${ans}.`,
      ];
      t.hint = "Börja med den plats som har begränsningen.";
    }
    if (kind === "together") {
      t.meta = { kind, n };
      t.prompt = `${n} personer ska sitta på rad. ${p1} och ${p2} vill sitta bredvid varandra. Hur många olika ordningar finns?`;
      num(c, "Antal ordningar", 2 * F(n - 1));
      t.solution = [
        `Behandla ${p1} och ${p2} som ett block. Blocket och de övriga ${n - 2} personerna är ${n - 1} objekt: ${n - 1}! ordningar.`,
        `Inne i blocket kan paret byta plats: 2 sätt. Svar: 2 · ${n - 1}! = ${2 * F(n - 1)}.`,
      ];
      t.hint = "Låt de två som ska sitta tillsammans bilda ett enda objekt.";
    }
    if (kind === "apart") {
      t.meta = { kind, n };
      t.prompt = `${n} personer ska sitta på rad. ${p1} och ${p2} vill inte sitta bredvid varandra. Hur många olika ordningar finns?`;
      num(c, "Antal ordningar", F(n) - 2 * F(n - 1));
      t.solution = [
        `Alla ordningar: ${n}! = ${F(n)}.`,
        `Ordningar där de sitter bredvid varandra: 2 · ${n - 1}! = ${2 * F(n - 1)}.`,
        `Komplement: ${F(n)} − ${2 * F(n - 1)} = ${F(n) - 2 * F(n - 1)}.`,
      ];
      t.hint = "Det är ofta enklare att räkna det motsatta och subtrahera.";
    }
    if (kind === "round") {
      t.meta = { kind, n };
      t.prompt = `${n} personer sitter vid ett runt bord. Två placeringar räknas som lika om den ena fås genom att alla flyttar lika många platser runt bordet. Hur många olika placeringar finns?`;
      num(c, "Antal placeringar", F(n - 1));
      t.solution = [
        `Placera en person fast som referens. De övriga ${n - 1} kan ordnas fritt: ${n - 1}! = ${F(n - 1)}.`,
      ];
      t.hint = "Vad händer med antalet om du låser en persons plats?";
    }
    if (kind === "both") {
      t.meta = { kind, n };
      t.prompt = `${n} personer ska sitta på rad. Bestäm antalet ordningar där ${p1} och ${p2} sitter bredvid varandra, och antalet där de inte gör det.`;
      num(c, "Bredvid varandra", 2 * F(n - 1));
      num(c, "Inte bredvid varandra", F(n) - 2 * F(n - 1));
      t.solution = [
        `Bredvid varandra: block + ${n - 2} personer ger ${n - 1}! ordningar, gånger 2 för blockets inre ordning = ${2 * F(n - 1)}.`,
        `Inte bredvid varandra: ${n}! − ${2 * F(n - 1)} = ${F(n) - 2 * F(n - 1)}.`,
      ];
      t.hint = "Räkna först fallet bredvid varandra. Det andra fallet är komplementet.";
    }
    if (kind === "round2") {
      t.meta = { kind, n };
      t.prompt = `${n} personer sitter vid ett runt bord. Rotationer räknas som samma placering. ${p1} och ${p2} vill sitta bredvid varandra. Hur många olika placeringar finns?`;
      num(c, "Antal placeringar", 2 * F(n - 2));
      t.solution = [
        `Låt paret bilda ett block. Blocket och de övriga ${n - 2} personerna är ${n - 1} objekt vid ett runt bord: (${n - 1} − 1)! = ${F(n - 2)}.`,
        `Paret kan byta plats inom blocket: 2 · ${F(n - 2)} = ${2 * F(n - 2)}.`,
      ];
      t.hint = "Kombinera blocktricket med att en plats låses vid runt bord.";
    }
    if (kind === "evenzero") {
      const d = rand(5, 7),
        k = rand(3, 4),
        enz = Math.floor(d / 2),
        a0 = P(d, k - 1),
        a1 = enz * (d - 1) * P(d - 1, k - 2);
      t.meta = { kind, d, k };
      t.prompt = `Hur många jämna ${k}-siffriga tal kan bildas av siffrorna 0–${d} om varje siffra får användas högst en gång? Ett tal får inte börja med 0.`;
      num(c, "Antal tal", a0 + a1);
      t.solution = [
        `Dela upp efter sista siffran, eftersom 0 är speciell.`,
        `Slutar på 0: de övriga ${k - 1} platserna fylls med siffrorna 1–${d}: P(${d},${k - 1}) = ${a0}.`,
        `Slutar på en annan jämn siffra (${enz} st): första siffran kan inte vara 0 eller sista siffran (${d - 1} val), mellanplatserna fylls av ${d - 1} kvarvarande: ${enz} · ${d - 1} · P(${d - 1},${k - 2}) = ${a1}.`,
        `${a0} + ${a1} = ${a0 + a1}.`,
      ];
      t.hint = "Fall: sista siffran är 0, eller sista siffran är en annan jämn siffra.";
    }
  };

  generators["combinatorics.distribution"] = (c) => {
    const { t, level, rand, pick, choose } = c;
    const k = rand(3, level >= 5 ? 6 : 5),
      n = level >= 5 ? rand(2 * k + 1, 2 * k + 6) : rand(k + 2, k + 6),
      [what, who] = pick([
        ["identiska bullar", "barn"],
        ["identiska pennor", "elever"],
        ["lika stora vinstlotter", "personer"],
      ]);
    const free = choose(n + k - 1, k - 1),
      atLeast1 = choose(n - 1, k - 1),
      atLeast2 = choose(n - k - 1, k - 1);
    t.meta = { n, k };
    const stars = `Rita ${n} stjärnor och ${k - 1} streck i en rad. Strecken delar upp stjärnorna i ${k} grupper, en per person.`;
    if (level <= 4) {
      const which = pick(["free", "min1"]);
      if (which === "free") {
        t.prompt = `${n} ${what} ska delas ut till ${k} ${who}. En person kan få hur många som helst, även ingen. Hur många olika fördelningar finns?`;
        num(c, "Antal fördelningar", free);
        t.solution = [
          stars,
          `Antalet sätt att placera strecken bland ${n + k - 1} platser: C(${n + k - 1},${k - 1}) = ${free}.`,
        ];
      } else {
        t.prompt = `${n} ${what} ska delas ut till ${k} ${who}. Alla ska få minst en. Hur många olika fördelningar finns?`;
        num(c, "Antal fördelningar", atLeast1);
        t.solution = [
          `Ge först en var: ${k} används, ${n - k} återstår att fördela fritt.`,
          `${stars.replace(String(n), String(n - k))}`,
          `C(${n - k + k - 1},${k - 1}) = C(${n - 1},${k - 1}) = ${atLeast1}.`,
        ];
      }
      t.hint = "Stjärnor och streck: hur många sätt finns det att placera strecken?";
    } else {
      t.prompt = `${n} ${what} ska delas ut till ${k} ${who}. Bestäm antalet fördelningar om (a) en person kan få hur många som helst, (b) alla ska få minst en, (c) alla ska få minst två.`;
      num(c, "(a) Hur många som helst", free);
      num(c, "(b) Minst en var", atLeast1);
      num(c, "(c) Minst två var", atLeast2);
      t.solution = [
        `(a) C(${n + k - 1},${k - 1}) = ${free}.`,
        `(b) Dela först ut en var, ${n - k} återstår: C(${n - 1},${k - 1}) = ${atLeast1}.`,
        `(c) Dela först ut två var, ${n - 2 * k} återstår: C(${n - k - 1},${k - 1}) = ${atLeast2}.`,
      ];
      t.hint = "Dela först ut det som är obligatoriskt och fördela resten fritt.";
    }
  };

  generators["combinatorics.errorhunt"] = (c) => {
    const { t, level, rand, pick, factorial: F, choose } = c;
    t.reasoning = false;
    const kind = pick(["order", "double", "identical", "complement"]);
    t.meta = { kind };
    if (kind === "order") {
      const n = rand(7, 12),
        k = rand(3, 4),
        wrong = F(n) / F(n - k);
      t.prompt = `Selma ska välja en grupp om ${k} personer bland ${n}. Hon räknar så här: ”Första personen kan väljas på ${n} sätt, nästa på ${n - 1}, och så vidare. Svaret är ${wrong}.” Vad är felet, och vad är rätt svar?`;
      pickOne(
        c,
        "Vad är felet?",
        "Hon har räknat ordnade urval, men ordningen spelar ingen roll i en grupp.",
        [
          "Hon borde ha adderat antalen i stället för att multiplicera.",
          "Hon har glömt att dela med n!.",
          "Uträkningen är korrekt.",
        ],
      );
      num(c, "Rätt antal grupper", choose(n, k));
      t.solution = [
        `${n}·${n - 1}·…·${n - k + 1} = ${wrong} räknar ordnade val: varje grupp räknas ${k}! = ${F(k)} gånger.`,
        `Rätt: C(${n},${k}) = ${wrong}/${F(k)} = ${choose(n, k)}.`,
      ];
      t.hint = "Är grupperna {A,B,C} och {C,A,B} olika eller samma?";
    }
    if (kind === "double") {
      const a = rand(4, 7),
        b = rand(4, 7),
        k = rand(3, 4),
        wrong = a * choose(a + b - 1, k - 1);
      t.prompt = `En grupp om ${k} ska väljas bland ${a} från klass A och ${b} från klass B, med minst en från A. Omar räknar: ”Välj först en från A (${a} sätt), därefter ${k - 1} bland de ${a + b - 1} övriga: ${a} · C(${a + b - 1},${k - 1}) = ${wrong}.” Vad är felet, och vad är rätt svar?`;
      pickOne(
        c,
        "Vad är felet?",
        "Grupper med flera personer från A räknas flera gånger.",
        [
          "Han borde ha adderat i stället för att multiplicera.",
          "Han har glömt att ordningen spelar roll.",
          "Uträkningen är korrekt.",
        ],
      );
      num(c, "Rätt antal grupper", choose(a + b, k) - choose(b, k));
      t.solution = [
        `En grupp med två personer från A, till exempel x och y, räknas både när x väljs först och när y väljs först.`,
        `Rätt: alla grupper minus grupper utan någon från A: C(${a + b},${k}) − C(${b},${k}) = ${choose(a + b, k) - choose(b, k)}.`,
      ];
      t.hint = "Kan samma grupp uppstå på mer än ett sätt i hans metod?";
    }
    if (kind === "identical") {
      const word = pick(["BANAN", "MAMMA", "ANANAS", "KAKA", "LILLA", "STATISTIK"]);
      const counts = {};
      for (const ch of word) counts[ch] = (counts[ch] || 0) + 1;
      const denom = Object.values(counts).reduce((p, v) => p * F(v), 1),
        right = F(word.length) / denom;
      t.prompt = `Hur många olika bokstavsföljder kan bildas med alla bokstäverna i ordet ${word}? Linus svarar ${F(word.length)}, eftersom det finns ${word.length}! sätt att ordna ${word.length} bokstäver. Vad är felet, och vad är rätt svar?`;
      pickOne(
        c,
        "Vad är felet?",
        "Identiska bokstäver kan byta plats utan att följden ändras, så samma följd räknas flera gånger.",
        [
          "Han borde ha använt kombinationer i stället för permutationer.",
          "Han har räknat för få bokstäver.",
          "Uträkningen är korrekt.",
        ],
      );
      num(c, "Rätt antal följder", right);
      t.solution = [
        `Upprepade bokstäver: ${Object.entries(counts)
          .filter(([, v]) => v > 1)
          .map(([k, v]) => `${k} förekommer ${v} gånger`)
          .join(", ")}.`,
        `Dividera med fakulteterna av antalen: ${F(word.length)}/${denom} = ${right}.`,
      ];
      t.hint = "Vad händer med följden om du byter plats på två A?";
    }
    if (kind === "complement") {
      const k = rand(3, 5),
        wrong = 10 ** k - 9 ** (k - 1);
      t.prompt = `En kod har ${k} siffror (0–9, upprepning tillåten). Hur många koder innehåller minst en nolla? Lisa räknar: ”Alla koder: 10^${k}. Koder utan nolla: 9^${k - 1}. Svar: ${wrong}.” Vad är felet, och vad är rätt svar?`;
      pickOne(
        c,
        "Vad är felet?",
        `Koder utan nolla har 9 val på varje av de ${k} platserna, alltså 9^${k}, inte 9^${k - 1}.`,
        [
          "Hon borde ha dragit bort 10^(k−1).",
          "Hon har glömt att ordningen spelar roll.",
          "Uträkningen är korrekt.",
        ],
      );
      num(c, "Rätt antal koder", 10 ** k - 9 ** k);
      t.solution = [
        `Koder utan nolla: varje plats har 9 val (1–9) och det finns ${k} platser: 9^${k} = ${9 ** k}.`,
        `Rätt svar: 10^${k} − 9^${k} = ${10 ** k - 9 ** k}.`,
      ];
      t.hint = "Hur många val har varje plats om ingen siffra får vara 0?";
    }
    void level;
  };

  /* ================= MÄNGDLÄRA ================= */

  generators["sets.venn"] = (c) => {
    const { t, level, rand, pick } = c;
    const th = pick([
      { v: "läser", it: ["engelska", "franska", "tyska"], any: "minst ett språk", none: "inget av språken" },
      { v: "spelar", it: ["fotboll", "handboll", "innebandy"], any: "minst en av sporterna", none: "ingen av sporterna" },
      { v: "dricker", it: ["kaffe", "te", "kakao"], any: "minst en av dryckerna", none: "ingen av dryckerna" },
    ]);
    if (level <= 3) {
      const both = rand(2, 8),
        oa = rand(3, 15),
        ob = rand(3, 15),
        none = rand(0, 8),
        A = oa + both,
        B = ob + both,
        N = oa + ob + both + none;
      t.meta = { N, A, B, both };
      t.prompt = `I en grupp med ${N} personer ${th.v} ${A} ${th.it[0]} och ${B} ${th.it[1]}. ${both} ${th.v} båda. Hur många ${th.v} ${th.any}, och hur många ${th.v} ${th.none}?${level === 3 ? ` Hur många ${th.v} enbart ${th.it[0]}?` : ""}`;
      num(c, "Minst ett", A + B - both);
      num(c, "Inget", none);
      if (level === 3) num(c, "Enbart " + th.it[0], oa);
      t.solution = [
        `|A ∪ B| = |A| + |B| − |A ∩ B| = ${A} + ${B} − ${both} = ${A + B - both}.`,
        `Inget: ${N} − ${A + B - both} = ${none}.`,
        ...(level === 3 ? [`Enbart ${th.it[0]}: ${A} − ${both} = ${oa}.`] : []),
      ];
      t.hint = "Snittet räknas två gånger om du bara adderar |A| och |B|.";
      return;
    }
    const r = {
      a: rand(2, 8), b: rand(2, 8), c: rand(2, 8),
      ab: rand(1, 5), ac: rand(1, 5), bc: rand(1, 5),
      abc: rand(1, 4), none: rand(0, 6),
    };
    const N = Object.values(r).reduce((s, v) => s + v, 0),
      A = r.a + r.ab + r.ac + r.abc,
      B = r.b + r.ab + r.bc + r.abc,
      C = r.c + r.ac + r.bc + r.abc,
      AB = r.ab + r.abc, AC = r.ac + r.abc, BC = r.bc + r.abc, ABC = r.abc;
    t.meta = { regions: r, N };
    t.prompt = `I en grupp med ${N} personer ${th.v} ${A} ${th.it[0]}, ${B} ${th.it[1]} och ${C} ${th.it[2]}. ${AB} ${th.v} både ${th.it[0]} och ${th.it[1]}, ${AC} både ${th.it[0]} och ${th.it[2]}, ${BC} både ${th.it[1]} och ${th.it[2]}, och ${ABC} ${th.v} alla tre. Hur många ${th.v} ${th.any}, och hur många ${th.v} ${th.none}?${level === 5 ? ` Hur många ${th.v} exakt en av de tre, och hur många exakt två?` : ""}`;
    num(c, "Minst en", N - r.none);
    num(c, "Ingen", r.none);
    if (level === 5) {
      num(c, "Exakt en", r.a + r.b + r.c);
      num(c, "Exakt två", r.ab + r.ac + r.bc);
    }
    const union = A + B + C - AB - AC - BC + ABC;
    t.solution = [
      `|A ∪ B ∪ C| = ${A}+${B}+${C} − ${AB} − ${AC} − ${BC} + ${ABC} = ${union}.`,
      `Ingen: ${N} − ${union} = ${r.none}.`,
      ...(level === 5
        ? [
            `Exakt en: summan av mängdernas storlekar − 2·(summan av parvisa snitt) + 3·(trippelsnittet) = ${A + B + C} − ${2 * (AB + AC + BC)} + ${3 * ABC} = ${r.a + r.b + r.c}.`,
            `Exakt två: parvisa snitt minus 3·trippelsnittet = ${AB + AC + BC} − ${3 * ABC} = ${r.ab + r.ac + r.bc}.`,
          ]
        : []),
    ];
    t.hint = "Inklusion–exklusion: addera, subtrahera de parvisa snitten, addera trippelsnittet.";
  };

  const U7 = 7,
    cp = (x) => ~x & U7,
    un = (x, y) => x | y,
    it = (x, y) => x & y,
    df = (x, y) => x & ~y & U7,
    pc = (x) => (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1);
  const LAWS = [
    ["A ∖ B = A ∩ Bᶜ", (A, B) => df(A, B) === it(A, cp(B))],
    ["(A ∩ B)ᶜ = Aᶜ ∪ Bᶜ", (A, B) => cp(it(A, B)) === un(cp(A), cp(B))],
    ["(A ∪ B)ᶜ = Aᶜ ∩ Bᶜ", (A, B) => cp(un(A, B)) === it(cp(A), cp(B))],
    ["A ∪ (A ∩ B) = A", (A, B) => un(A, it(A, B)) === A],
    ["A ∩ (B ∪ C) = (A ∩ B) ∪ (A ∩ C)", (A, B, C) => it(A, un(B, C)) === un(it(A, B), it(A, C))],
    ["A ∪ (B ∩ C) = (A ∪ B) ∩ (A ∪ C)", (A, B, C) => un(A, it(B, C)) === it(un(A, B), un(A, C))],
    ["|A ∪ B| ≤ |A| + |B|", (A, B) => pc(un(A, B)) <= pc(A) + pc(B)],
    ["A ∖ (B ∪ C) = (A ∖ B) ∩ (A ∖ C)", (A, B, C) => df(A, un(B, C)) === it(df(A, B), df(A, C))],
    ["(A ∖ B) ∪ (A ∩ B) = A", (A, B) => un(df(A, B), it(A, B)) === A],
    ["Aᶜ ∖ Bᶜ = B ∖ A", (A, B) => df(cp(A), cp(B)) === df(B, A)],
    ["(A ∪ B)ᶜ = Aᶜ ∪ Bᶜ", (A, B) => cp(un(A, B)) === un(cp(A), cp(B))],
    ["(A ∩ B)ᶜ = Aᶜ ∩ Bᶜ", (A, B) => cp(it(A, B)) === it(cp(A), cp(B))],
    ["A ∖ B = B ∖ A", (A, B) => df(A, B) === df(B, A)],
    ["A ∪ (B ∩ C) = (A ∪ B) ∩ C", (A, B, C) => un(A, it(B, C)) === it(un(A, B), C)],
    ["|A ∪ B| = |A| + |B|", (A, B) => pc(un(A, B)) === pc(A) + pc(B)],
    ["A ∩ (B ∪ C) = (A ∩ B) ∪ C", (A, B, C) => it(A, un(B, C)) === un(it(A, B), C)],
    ["A ∖ (B ∪ C) = (A ∖ B) ∪ (A ∖ C)", (A, B, C) => df(A, un(B, C)) === un(df(A, B), df(A, C))],
    ["A ∩ Bᶜ = Aᶜ ∩ B", (A, B) => it(A, cp(B)) === it(cp(A), B)],
    ["(A ∖ B) ∖ C = A ∖ (B ∖ C)", (A, B, C) => df(df(A, B), C) === df(A, df(B, C))],
    ["A ∪ B = (A ∖ B) ∪ (B ∖ A)", (A, B) => un(A, B) === un(df(A, B), df(B, A))],
    ["(A ∪ B) ∖ B = A", (A, B) => df(un(A, B), B) === A],
  ].map(([text, fn]) => {
    const fails = [];
    for (let A = 0; A < 8; A++)
      for (let B = 0; B < 8; B++)
        for (let C = 0; C < 8; C++) if (!fn(A, B, C)) fails.push([A, B, C]);
    return { text, fn, fails, holds: fails.length === 0 };
  });
  const bitsOf = (x) => [1, 2, 3].filter((_, i) => x & (1 << i));

  generators["sets.laws"] = (c) => {
    const { t, level, pick } = c;
    const good = shuffle(LAWS.filter((l) => l.holds)),
      bad = shuffle(LAWS.filter((l) => !l.holds)),
      inverse = level >= 4;
    const correct = inverse ? bad[0] : good[0],
      others = inverse ? good.slice(0, 3) : bad.slice(0, 3);
    t.meta = { inverse };
    t.prompt = inverse
      ? "Ett av följande samband gäller inte för alla mängder A, B och C. Vilket?"
      : "Ett av följande samband gäller för alla mängder A, B och C. Vilket?";
    pickOne(
      c,
      inverse ? "Sambandet som inte gäller" : "Sambandet som gäller",
      correct.text,
      others.map((o) => o.text),
    );
    const ce = (l) => {
      const [A, B, C] = pick(l.fails);
      return `A = ${setStr(bitsOf(A))}, B = ${setStr(bitsOf(B))}, C = ${setStr(bitsOf(C))}`;
    };
    t.solution = inverse
      ? [
          `${correct.text} gäller inte allmänt. Motexempel: ${ce(correct)}.`,
          `De övriga tre är giltiga mängdlagar (De Morgan, distributiva lagarna, definition av differens med mera).`,
        ]
      : [
          `${correct.text} gäller för alla mängder.`,
          ...others.map((o) => `${o.text} gäller inte. Motexempel: ${ce(o)}.`),
        ];
    t.hint = "Pröva några små mängder, eller resonera om ett godtyckligt element x.";
  };

  /* ================= KONGRUENS ================= */

  generators["congruence.weekday"] = (c) => {
    const { t, level, rand, pick, mod } = c;
    const d = rand(0, 6);
    let N, text, shift, expr, rem;
    if (level >= 4) {
      const b = pick([2, 3, 4, 5, 6]),
        e = rand(level === 4 ? 10 : 20, level === 4 ? 40 : 200),
        back = level === 5 && Math.random() < 0.5;
      N = modpow(b, e, 7);
      rem = N;
      expr = `${b}^${e}`;
      shift = back ? mod(-N, 7) : N;
      text = back
        ? `Idag är det ${DAYS[d]}. Vilken veckodag var det för ${expr} dagar sedan?`
        : `Idag är det ${DAYS[d]}. Vilken veckodag är det om ${expr} dagar?`;
      t.solution = [
        `Beräkna ${expr} modulo 7 genom att reducera efter varje multiplikation (potenserna av ${b} upprepar sig modulo 7): ${expr} ≡ ${N} (mod 7).`,
        back
          ? `${N} dagar bakåt från ${DAYS[d]} blir ${DAYS[mod(d - N, 7)]}.`
          : `${N} dagar framåt från ${DAYS[d]} blir ${DAYS[mod(d + N, 7)]}.`,
      ];
      t.meta = { b, e, back };
    } else {
      const back = level === 3 && Math.random() < 0.5;
      N = level === 2 ? rand(20, 150) : rand(200, 900);
      expr = String(N);
      const r = mod(N, 7);
      rem = r;
      shift = back ? mod(-r, 7) : r;
      text = back
        ? `Idag är det ${DAYS[d]}. Vilken veckodag var det för ${N} dagar sedan?`
        : `Idag är det ${DAYS[d]}. Vilken veckodag är det om ${N} dagar?`;
      t.solution = [
        `${N} = 7 · ${Math.floor(N / 7)} + ${r}, så ${N} ≡ ${r} (mod 7). Hela veckor påverkar inte veckodagen.`,
        back
          ? `${r} dagar bakåt från ${DAYS[d]} blir ${DAYS[mod(d - r, 7)]}.`
          : `${r} dagar framåt från ${DAYS[d]} blir ${DAYS[mod(d + r, 7)]}.`,
      ];
      t.meta = { N, back };
    }
    const answerDay = DAYS[mod(d + shift, 7)];
    t.prompt = text;
    num(c, `${expr} modulo 7`, rem);
    pickOne(c, "Veckodag", answerDay, DAYS.filter((x) => x !== answerDay));
    t.hint = "Hela veckor spelar ingen roll. Räkna resten vid division med 7.";
  };

  generators["congruence.lastdigit"] = (c) => {
    const { t, level, rand, pick } = c;
    const bs = [2, 3, 4, 7, 8, 9, 13, 17, 19, 23];
    const b = pick(bs),
      e = rand(100, level >= 4 ? 4000 : 999);
    const last = (base, exp) => modpow(base, exp, 10);
    let period = 1;
    while (modpow(b, period + 1, 10) !== b % 10) period++;
    const seq = [];
    for (let i = 1; i <= period; i++) seq.push(modpow(b, i, 10));
    t.meta = { b, e };
    if (level <= 3) {
      t.prompt = `Bestäm sista siffran i ${b}^${e}. Ange också hur många steg det tar innan sista siffran i ${b}^k börjar upprepa sig (periodens längd).`;
      num(c, "Periodens längd", period);
      num(c, `Sista siffran i ${b}^${e}`, last(b, e));
    } else {
      const b2 = pick(bs.filter((x) => x !== b)),
        e2 = rand(100, 4000),
        prod = level === 5;
      t.prompt = `Sista siffran i ${b}^k upprepar sig med en viss period. Bestäm periodens längd, sista siffran i ${b}^${e}, och sista siffran i ${prod ? "produkten" : "summan"} ${b}^${e} ${prod ? "·" : "+"} ${b2}^${e2}.`;
      num(c, "Periodens längd", period);
      num(c, `Sista siffran i ${b}^${e}`, last(b, e));
      const l2 = last(b2, e2),
        l1 = last(b, e);
      num(c, prod ? "Sista siffran i produkten" : "Sista siffran i summan", prod ? (l1 * l2) % 10 : (l1 + l2) % 10);
    }
    const posInCycle = ((e - 1) % period) + 1;
    t.solution = [
      `Sista siffran är resten modulo 10. Potenserna ${b}^1, ${b}^2, … har sista siffrorna ${seq.join(", ")}, och sedan upprepas de. Perioden är ${period}.`,
      `${e} ≡ ${posInCycle} (mod ${period}) (som position i perioden), så sista siffran i ${b}^${e} är ${last(b, e)}.`,
      ...(level >= 4
        ? [`Summan/produkten beräknas modulo 10 från de två sista siffrorna.`]
        : []),
    ];
    t.hint = "Skriv upp sista siffran i de första potenserna tills mönstret upprepar sig.";
  };

  generators["congruence.checkdigit"] = (c) => {
    const { t, level, rand, pick } = c;
    const digitsOf = [];
    const yy = rand(40, 99),
      mm = rand(1, 12),
      dd = rand(1, 28),
      nnn = rand(100, 999);
    const two = (n) => String(n).padStart(2, "0");
    const base = `${two(yy)}${two(mm)}${two(dd)}${nnn}`;
    for (const ch of base) digitsOf.push(Number(ch));
    const prods = digitsOf.map((d, i) => d * (i % 2 === 0 ? 2 : 1));
    const parts = prods.map((p) => (p > 9 ? Math.floor(p / 10) + (p % 10) : p));
    const S = parts.reduce((s, v) => s + v, 0),
      K = (10 - (S % 10)) % 10;
    t.meta = { base, K };
    t.prompt = `Svenska personnummer har en kontrollsiffra K sist (ÅÅMMDD-NNNK). För de nio första siffrorna gäller: multiplicera dem växelvis med 2, 1, 2, 1, … (från vänster). Om en produkt har två siffror, addera siffrorna. Summera allt. K väljs så att totalsumman blir en multipel av 10. Bestäm K för det påhittade numret ${base.slice(0, 6)}-${base.slice(6)}?.`;
    num(c, "Summan av alla siffror", S);
    num(c, "Kontrollsiffra K", K);
    t.solution = [
      `Produkter: ${prods.join(", ")}. Efter siffersumma: ${parts.join(", ")}.`,
      `Summan är ${S}. Närmaste multipel av 10 uppåt är ${S + K}, så K = ${K}.`,
    ];
    if (level >= 4) {
      const valid = Math.random() < 0.5,
        shown = valid ? K : (K + rand(1, 9)) % 10;
      t.prompt += ` Avgör därefter om numret ${base.slice(0, 6)}-${base.slice(6)}${shown} är giltigt.`;
      pickOne(c, "Är numret giltigt?", valid ? "Ja" : "Nej", [valid ? "Nej" : "Ja"]);
      t.solution.push(
        valid
          ? `Sista siffran ${shown} är lika med K, så numret är giltigt.`
          : `Sista siffran ${shown} skiljer sig från K = ${K}, så numret är ogiltigt.`,
      );
    }
    t.hint = "Det är en beräkning modulo 10: K ≡ −S (mod 10).";
    void pick;
  };

  /* ================= TALBASER ================= */

  generators["bases.minbase"] = (c) => {
    const { t, level, rand } = c;
    const m = rand(2, level >= 4 ? 15 : 7),
      len = rand(3, 4),
      arr = [rand(1, m)];
    while (arr.length < len) arr.push(rand(0, m));
    if (!arr.includes(m)) arr[rand(1, len - 1)] = m;
    const str = arr.map((x) => x.toString(16).toUpperCase()).join(""),
      b = Math.max(m + 1, 2),
      v = parseInt(str, b);
    t.meta = { str, b };
    t.prompt = `Talet ${str} är skrivet i ett positionssystem med okänd bas. Vilken är den minsta möjliga basen, och vilket tal i bas tio motsvarar ${str} i den basen?${level === 5 ? " Hur mycket större blir talet i bas tio om basen i stället är en större?" : ""}`;
    num(c, "Minsta möjliga bas", b);
    num(c, "Talet i bas tio", v);
    if (level === 5) num(c, "Ökning i bas tio", parseInt(str, b + 1) - v);
    t.solution = [
      `Siffran ${m.toString(16).toUpperCase()} förekommer, och siffror i bas b måste vara mindre än b. Alltså b ≥ ${m + 1}: minsta basen är ${b}.`,
      `${str} (bas ${b}) = ${arr.map((x, i) => `${x} · ${b}^${arr.length - 1 - i}`).join(" + ")} = ${v}.`,
      ...(level === 5
        ? [`I bas ${b + 1}: ${parseInt(str, b + 1)}. Skillnad: ${parseInt(str, b + 1) - v}.`]
        : []),
    ];
    t.hint = "Vilken är den största siffran, och vad säger det om basen?";
  };

  generators["bases.hexcolor"] = (c) => {
    const { t, level, rand } = c;
    const hx = (n) => n.toString(16).toUpperCase().padStart(2, "0");
    if (level <= 3) {
      const r = rand(0, 255), g = rand(0, 255), b = rand(0, 255);
      t.meta = { r, g, b };
      t.prompt = `Webbfärgen #${hx(r)}${hx(g)}${hx(b)} består av tre byte i hexadecimalt: röd, grön och blå (två siffror var). Ange varje kanal som tal i bas tio.`;
      num(c, "Röd", r);
      num(c, "Grön", g);
      num(c, "Blå", b);
      t.solution = [
        `${hx(r)} = ${parseInt(hx(r)[0], 16)}·16 + ${parseInt(hx(r)[1], 16)} = ${r}.`,
        `${hx(g)} = ${parseInt(hx(g)[0], 16)}·16 + ${parseInt(hx(g)[1], 16)} = ${g}.`,
        `${hx(b)} = ${parseInt(hx(b)[0], 16)}·16 + ${parseInt(hx(b)[1], 16)} = ${b}.`,
      ];
      t.hint = "Varje kanal är två hexsiffror: första siffran × 16 + andra.";
    } else if (level === 4) {
      const r = rand(0, 255), g = rand(0, 255), b = rand(0, 255);
      const strip = (s) => s.replace(/^0+(?=.)/, "");
      t.meta = { r, g, b };
      t.prompt = `En färg har RGB-värdena (${r}, ${g}, ${b}). Skriv varje kanal i hexadecimalt (siffror A–F för 10–15). Inledande nolla behöver inte skrivas.`;
      t.fields.push(c.field("Röd (hex)", strip(hx(r)), "digits"));
      t.fields.push(c.field("Grön (hex)", strip(hx(g)), "digits"));
      t.fields.push(c.field("Blå (hex)", strip(hx(b)), "digits"));
      t.solution = [r, g, b].map(
        (v) => `${v} = ${Math.floor(v / 16)}·16 + ${v % 16} → ${hx(v)}.`,
      );
      t.hint = "Dividera med 16: kvoten är första siffran, resten den andra.";
    } else {
      const k = rand(3, 6);
      t.meta = { k };
      t.prompt = `Ett färgsystem använder ${k} bitar per kanal (röd, grön, blå). Hur många olika värden har en kanal, hur många färger kan systemet visa, och hur många av dem är gråtoner (lika värde i alla tre kanaler)?`;
      num(c, "Värden per kanal", 2 ** k);
      num(c, "Antal färger", 2 ** (3 * k));
      num(c, "Antal gråtoner", 2 ** k);
      t.solution = [
        `Varje kanal: 2^${k} = ${2 ** k} värden.`,
        `Produktprincipen för tre kanaler: (2^${k})³ = 2^${3 * k} = ${2 ** (3 * k)}.`,
        `Gråtoner: R = G = B, så bara ett val: ${2 ** k}.`,
      ];
      t.hint = "Använd produktprincipen på de tre kanalerna.";
    }
  };

  generators["bases.bits"] = (c) => {
    const { t, level, rand, pick } = c;
    const b = pick([2, 8, 16]),
      n = rand(1000, level === 5 ? 999999 : 99999);
    let len = 0,
      x = n;
    while (x > 0) {
      len++;
      x = Math.floor(x / b);
    }
    const k = rand(5, 10);
    t.meta = { b, n, k };
    t.prompt = `Hur många siffror krävs för att skriva ${n} (bas tio) i bas ${b}? Vilket är också det största tal, skrivet i bas tio, som ryms med ${k} siffror i bas ${b}?`;
    num(c, "Antal siffror", len);
    num(c, "Största talet med " + k + " siffror", b ** k - 1);
    t.solution = [
      `Ett tal med m siffror i bas ${b} ligger i intervallet ${b}^(m−1) ≤ n < ${b}^m. Här ${b}^${len - 1} = ${b ** (len - 1)} ≤ ${n} < ${b ** len}, så m = ${len}.`,
      `Alla ${k} platser kan ha största siffran ${b - 1}, vilket ger ${b}^${k} − 1 = ${b ** k - 1}.`,
    ];
    t.hint = "Hur stora tal kan skrivas med m siffror? Jämför med potenser av basen.";
  };

  /* ================= TALFÖLJDER ================= */

  generators["sequences.identify"] = (c) => {
    const { t, level, rand, pick } = c;
    const kind = pick(["arith", "geom", "square", "fib", "tri"]);
    const ask = level >= 4 ? 8 : 5;
    let term, label, why;
    if (kind === "arith") {
      const a = rand(-3, 9), d = pick([2, 3, 4, 5, -2, -3]);
      term = (n) => a + (n - 1) * d;
      label = "Aritmetisk";
      why = `Skillnaden mellan grannar är konstant, ${d}. Alltså a${sub(ask)} = ${a} + ${ask - 1}·(${d}) = ${term(ask)}.`;
    }
    if (kind === "geom") {
      const a = rand(1, 4), q = pick([2, 3, -2]);
      term = (n) => a * q ** (n - 1);
      label = "Geometrisk";
      why = `Kvoten mellan grannar är konstant, ${q}. Alltså a${sub(ask)} = ${a}·(${q})^${ask - 1} = ${term(ask)}.`;
    }
    if (kind === "square") {
      const cst = rand(-3, 5);
      term = (n) => n * n + cst;
      label = "Varken aritmetisk eller geometrisk";
      why = `Skillnaderna mellan grannar (3, 5, 7, …) är inte konstanta och kvoterna varierar. Följden är aₙ = n² ${sgn(cst)}, så a${sub(ask)} = ${term(ask)}.`;
    }
    if (kind === "fib") {
      const x = rand(1, 4), y = rand(1, 5), v = [x, y];
      for (let i = 2; i < 10; i++) v.push(v[i - 1] + v[i - 2]);
      term = (n) => v[n - 1];
      label = "Varken aritmetisk eller geometrisk";
      why = `Varje term är summan av de två föregående. Termerna blir ${v.slice(0, ask).join(", ")}, så a${sub(ask)} = ${term(ask)}.`;
    }
    if (kind === "tri") {
      term = (n) => (n * (n + 1)) / 2;
      label = "Varken aritmetisk eller geometrisk";
      why = `Skillnaderna är 2, 3, 4, … (växer med 1 varje gång). Följden är aₙ = n(n+1)/2, så a${sub(ask)} = ${term(ask)}.`;
    }
    const shown = [1, 2, 3, 4].map(term);
    t.meta = { kind };
    t.prompt = `Följden börjar ${shown.join(", ")}, … Avgör vilken sorts talföljd det är och bestäm a${sub(ask)}.`;
    pickOne(c, "Typ av talföljd", label, [
      "Aritmetisk",
      "Geometrisk",
      "Varken aritmetisk eller geometrisk",
    ]);
    num(c, "a" + sub(ask), term(ask));
    t.solution = [why];
    t.hint = "Jämför både skillnaden och kvoten mellan intilliggande termer.";
  };

  generators["sequences.fromTerms"] = (c) => {
    const { t, level, rand, pick } = c;
    const geom = level >= 4 && Math.random() < 0.55;
    if (!geom) {
      const a1 = rand(-5, 10),
        d = pick(level >= 4 ? [2, 3, 4, 5, 6, -2, -3, -4] : [2, 3, 4, 5, 6]),
        p = rand(2, 4),
        r = p + rand(3, 5),
        X = a1 + (p - 1) * d,
        Y = a1 + (r - 1) * d;
      t.meta = { a1, d, p, r };
      t.prompt = `I en aritmetisk talföljd är a${sub(p)} = ${X} och a${sub(r)} = ${Y}. Bestäm differensen d och första termen a₁${level >= 4 ? ", samt summan S₁₀ av de tio första termerna" : ""}.`;
      num(c, "d", d);
      num(c, "a₁", a1);
      if (level >= 4) num(c, "S₁₀", 5 * (2 * a1 + 9 * d));
      t.solution = [
        `Från term ${p} till term ${r} är det ${r - p} steg: ${r - p}d = ${Y} − ${X} = ${Y - X}, så d = ${d}.`,
        `a₁ = a${sub(p)} − ${p - 1}d = ${X} − ${(p - 1) * d} = ${a1}.`,
        ...(level >= 4 ? [`S₁₀ = 10(2a₁ + 9d)/2 = 5·(${2 * a1} + ${9 * d}) = ${5 * (2 * a1 + 9 * d)}.`] : []),
      ];
      t.hint = "Hur många gånger har d lagts till mellan de två givna termerna?";
    } else {
      const a1 = rand(1, 5),
        q = pick([2, 3, -2, -3]),
        gap = q < 0 ? 3 : pick([2, 3]),
        p = rand(2, 3),
        r = p + gap,
        X = a1 * q ** (p - 1),
        Y = a1 * q ** (r - 1);
      t.meta = { a1, q, p, r };
      t.prompt = `I en geometrisk talföljd är a${sub(p)} = ${X} och a${sub(r)} = ${Y}.${q > 0 && gap % 2 === 0 ? " Kvoten är positiv." : ""} Bestäm kvoten q och första termen a₁${level === 5 ? ", samt summan S₆ av de sex första termerna" : ""}.`;
      num(c, "q", q);
      num(c, "a₁", a1);
      if (level === 5) num(c, "S₆", (a1 * (q ** 6 - 1)) / (q - 1));
      t.solution = [
        `Från term ${p} till term ${r} multipliceras med q ${gap} gånger: q^${gap} = ${Y}/${X} = ${q ** gap}, så q = ${q}.`,
        `a₁ = a${sub(p)} / q^${p - 1} = ${X}/${q ** (p - 1)} = ${a1}.`,
        ...(level === 5 ? [`S₆ = a₁(q⁶−1)/(q−1) = ${(a1 * (q ** 6 - 1)) / (q - 1)}.`] : []),
      ];
      t.hint = "Dividera de två termerna: hur många kvoter ligger mellan dem?";
    }
  };

  generators["sequences.quadratic"] = (c) => {
    const { t, level, rand } = c;
    const al = rand(1, 3), be = rand(-3, 5), ga = rand(-3, 5),
      term = (n) => al * n * n + be * n + ga,
      shown = [1, 2, 3, 4, 5].map(term);
    t.meta = { al, be, ga };
    t.prompt = `Talföljden ${shown.join(", ")}, … har formen aₙ = αn² + βn + γ. Bestäm den konstanta andra differensen och a₁₀${level === 5 ? ", samt det minsta n för vilket aₙ > 500" : ""}.`;
    num(c, "Andra differensen", 2 * al);
    num(c, "a₁₀", term(10));
    let n500 = 1;
    while (term(n500) <= 500) n500++;
    if (level === 5) num(c, "Minsta n med aₙ > 500", n500);
    const d1 = shown.slice(1).map((v, i) => v - shown[i]);
    t.solution = [
      `Första differenserna: ${d1.join(", ")}. De ökar med ${2 * al} varje gång, så andra differensen är ${2 * al} = 2α, alltså α = ${al}.`,
      `Första differensen vid n = 1 är 3α + β = ${d1[0]}, så β = ${d1[0]} − ${3 * al} = ${be}. Sedan γ = a₁ − α − β = ${shown[0]} − ${al} − (${be}) = ${ga}.`,
      `Alltså aₙ = ${al}n² ${sgn(be)}n ${sgn(ga)}.`,
      `a₁₀ = ${term(10)}.`,
      ...(level === 5 ? [`a${sub(n500 - 1)} = ${term(n500 - 1)} ≤ 500 och a${sub(n500)} = ${term(n500)} > 500, så n = ${n500}.`] : []),
    ];
    t.hint = "Differenserna mellan termerna bildar själva en aritmetisk följd.";
  };

  generators["sequences.annuity"] = (c) => {
    const { t, level, rand, pick, fmt } = c;
    const p = pick([2, 3, 4, 5, 6]),
      n = rand(5, level === 5 ? 20 : 12),
      B = pick([500, 1000, 1500, 2000, 2500]),
      q = 1 + p / 100,
      start = Math.random() < 0.5,
      val = start ? (B * q * (q ** n - 1)) / (q - 1) : (B * (q ** n - 1)) / (q - 1);
    t.meta = { p, n, B, start };
    t.prompt = `Du sätter in ${B} kr ${start ? "i början" : "i slutet"} av varje år på ett konto med ${p} % årsränta (räntan läggs till i slutet av varje år). Hur mycket finns på kontot direkt efter att räntan lagts till för år ${n}? Svara avrundat till hela kronor.${level === 5 ? " Hur stor del av beloppet är ränta?" : ""}`;
    num(c, "Belopp (kr)", Math.round(val), { tolerance: 0.51 });
    if (level === 5) num(c, "Varav ränta (kr)", Math.round(val - B * n), { tolerance: 1.01 });
    t.solution = [
      `Ränteprocenten ger förändringsfaktorn q = ${fmt(q)}. Insättningarna bildar en geometrisk summa.`,
      start
        ? `Den första insättningen växer i ${n} år: ${B}·q^${n}, den sista i 1 år: ${B}·q. Summa: ${B}·q·(q^${n}−1)/(q−1) ≈ ${Math.round(val)} kr.`
        : `Den första insättningen växer i ${n - 1} år, den sista i 0 år. Summa: ${B}·(q^${n}−1)/(q−1) ≈ ${Math.round(val)} kr.`,
      ...(level === 5 ? [`Insatt totalt: ${B}·${n} = ${B * n} kr. Ränta ≈ ${Math.round(val - B * n)} kr.`] : []),
    ];
    t.hint = "Varje insättning har växt olika länge. Vilken sorts talföljd bildar beloppen?";
  };

  generators["sequences.infinite"] = (c) => {
    const { t, rand, pick } = c;
    const a1 = pick([1, 2, 3, 4, 6, 8, 9, 12]),
      [qn, qd] = pick([[1, 2], [1, 3], [2, 3], [-1, 2], [-1, 3], [1, 4], [3, 4], [-2, 3]]),
      q = qn / qd,
      S = a1 / (1 - q);
    let ab = rand(1, 98);
    if (ab % 11 === 0) ab += 1;
    const s2 = String(ab).padStart(2, "0"),
      g = gcd(ab, 99);
    t.meta = { a1, qn, qd, ab };
    t.prompt = `(a) Bestäm summan av den oändliga geometriska serien ${a1} + ${a1}·(${qn}/${qd}) + ${a1}·(${qn}/${qd})² + … (b) Skriv det periodiska decimaltalet 0,${s2}${s2}${s2}… som ett förkortat bråk.`;
    num(c, "(a) Summan", S);
    t.fields.push(c.field("(b) Täljare", ab / g, "number"));
    t.fields.push(c.field("(b) Nämnare", 99 / g, "number"));
    t.solution = [
      `(a) |q| = ${Math.abs(qn)}/${qd} < 1, så serien konvergerar mot a₁/(1−q) = ${a1}/(1 − ${qn}/${qd}) = ${Number.isInteger(S) ? S : S.toFixed(4)}.`,
      `(b) 0,${s2}${s2}… = ${ab}/100 + ${ab}/100² + … är geometrisk med a₁ = ${ab}/100 och q = 1/100. Summa: (${ab}/100)/(1 − 1/100) = ${ab}/99 = ${ab / g}/${99 / g}.`,
    ];
    t.hint = "En oändlig geometrisk serie har summan a₁/(1−q) när |q| < 1.";
  };

  /* ================= BEVIS ================= */

  const SUMS = [
    { st: "1 + 2 + … + n = n(n+1)/2", term: (i) => i, g: (n) => (n * (n + 1)) / 2, step: "k(k+1)/2 + (k+1) = (k+1)(k+2)/2" },
    { st: "1 + 3 + … + (2n−1) = n²", term: (i) => 2 * i - 1, g: (n) => n * n, step: "k² + (2k+1) = (k+1)²" },
    { st: "1² + 2² + … + n² = n(n+1)(2n+1)/6", term: (i) => i * i, g: (n) => (n * (n + 1) * (2 * n + 1)) / 6, step: "k(k+1)(2k+1)/6 + (k+1)² = (k+1)(k+2)(2k+3)/6" },
    { st: "1·2 + 2·3 + … + n(n+1) = n(n+1)(n+2)/3", term: (i) => i * (i + 1), g: (n) => (n * (n + 1) * (n + 2)) / 3, step: "k(k+1)(k+2)/3 + (k+1)(k+2) = (k+1)(k+2)(k+3)/3" },
    { st: "1 + 2 + 4 + … + 2^(n−1) = 2^n − 1", term: (i) => 2 ** (i - 1), g: (n) => 2 ** n - 1, step: "(2^k − 1) + 2^k = 2·2^k − 1 = 2^(k+1) − 1" },
    { st: "1 + 4 + 7 + … + (3n−2) = n(3n−1)/2", term: (i) => 3 * i - 2, g: (n) => (n * (3 * n - 1)) / 2, step: "k(3k−1)/2 + (3k+1) = (k+1)(3k+2)/2" },
    { st: "1·1! + 2·2! + … + n·n! = (n+1)! − 1", term: (i) => i * [1, 1, 2, 6, 24, 120, 720][i], g: (n) => [1, 1, 2, 6, 24, 120, 720, 5040][n + 1] - 1, step: "((k+1)! − 1) + (k+1)·(k+1)! = (k+2)(k+1)! − 1 = (k+2)! − 1", hard: true },
  ];

  generators["proofs.structure"] = (c) => {
    const { t, level, rand, pick } = c;
    t.reasoning = true;
    const S = pick(level >= 4 ? SUMS : SUMS.filter((s) => !s.hard)),
      r = rand(2, 4);
    t.meta = { st: S.st, r };
    t.prompt = `Du ska bevisa med induktion att ${S.st} för alla heltal n ≥ 1. Fyll i kontrollpunkterna och skriv hela beviset (basfall, antagande, steg, slutsats) under Mellanled.`;
    num(c, "Basfall n=1: vänsterledet", S.term(1));
    num(c, `Termen som läggs till i steget när k=${r}`, S.term(r + 1));
    num(c, `Högerledet för n=${r + 1}`, S.g(r + 1));
    pickOne(c, "Induktionsantagandet är att…", "formeln gäller för n = k", [
      "formeln gäller för alla n",
      "formeln gäller för n = k+1",
      "formeln gäller för n = 1",
    ]);
    if (level >= 3)
      pickOne(
        c,
        "Var används antagandet i steget?",
        "När summan av de k första termerna ersätts med högerledet för n = k.",
        [
          "När n sätts till 1.",
          "När formeln visas gälla för alla n.",
          "Antagandet används inte i steget.",
        ],
      );
    t.solution = [
      `Basfall: vänsterledet är ${S.term(1)} och högerledet är ${S.g(1)}.`,
      `Antag att formeln gäller för n = k.`,
      `Då är summan för n = k+1 lika med högerledet för k plus den nya termen: ${S.step}.`,
      `Formeln gäller för k+1, och med basfallet för alla n ≥ 1.`,
    ];
    t.hint = "Ersätt summan av de k första termerna med högerledet för k och lägg till term k+1.";
  };

  const CLAIMS = [
    { st: "6n + 1 är ett primtal", f: (n) => 6 * n + 1, easy: true },
    { st: "2^n − 1 är ett primtal", f: (n) => 2 ** n - 1, easy: true, from: 2 },
    { st: "n² + n + 17 är ett primtal", f: (n) => n * n + n + 17, easy: true },
    { st: "n² + n + 41 är ett primtal", f: (n) => n * n + n + 41 },
    { st: "n² − n + 41 är ett primtal", f: (n) => n * n - n + 41 },
    { st: "n² − 79n + 1601 är ett primtal", f: (n) => n * n - 79 * n + 1601 },
  ];
  const smallestFactor = (m) => {
    for (let p = 2; p * p <= m; p++) if (m % p === 0) return p;
    return m;
  };

  generators["proofs.counterexample"] = (c) => {
    const { t, level, pick } = c;
    t.reasoning = false;
    const cl = pick(level >= 4 ? CLAIMS.filter((x) => !x.easy) : CLAIMS.filter((x) => x.easy));
    let n = cl.from || 1;
    while (smallestFactor(cl.f(n)) === cl.f(n) && cl.f(n) > 1) n++;
    const v = cl.f(n);
    t.meta = { st: cl.st, n };
    t.prompt = `Påståendet ”${cl.st} för alla heltal n ≥ ${cl.from || 1}” stämmer för många små n. Finns det ett motexempel? Bestäm det minsta n som gör påståendet falskt och den minsta primfaktorn i värdet.`;
    num(c, "Minsta n som ger ett motexempel", n);
    num(c, "Minsta primfaktorn i värdet", smallestFactor(v));
    pickOne(c, "Vad räcker för att visa att ett påstående inte gäller för alla n?", "Ett enda motexempel", [
      "Många exempel som inte stämmer",
      "Att det inte stämmer för n = 1",
      "Ett misslyckat induktionssteg",
    ]);
    t.solution = [
      `Pröva n = ${cl.from || 1}, ${(cl.from || 1) + 1}, … tills värdet inte är ett primtal.`,
      `För n = ${n} är värdet ${v} = ${smallestFactor(v)} · ${v / smallestFactor(v)}, alltså inget primtal.`,
      `Ett enda motexempel räcker för att motbevisa ett allmänt påstående. Många lyckade exempel bevisar däremot ingenting.`,
    ];
    t.hint = "Beräkna värdet för n = 1, 2, 3, … och undersök om det är ett primtal.";
  };

  const INEQ = [
    { st: "2^n > n²", l: (n) => 2 ** n, r: (n) => n * n, step: "Antag 2^k > k² för k ≥ 5. Då är 2^(k+1) > 2k², och 2k² ≥ (k+1)² när k ≥ 3 eftersom k² ≥ 2k + 1." },
    { st: "2^n ≥ 2n + 1", l: (n) => 2 ** n, r: (n) => 2 * n + 1, step: "Antag 2^k ≥ 2k + 1. Då är 2^(k+1) ≥ 4k + 2 ≥ 2k + 3 = 2(k+1) + 1, eftersom 2k ≥ 1." },
    { st: "n! > 2^n", l: (n) => [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800][n], r: (n) => 2 ** n, step: "Antag k! > 2^k för k ≥ 4. Då (k+1)! = (k+1)·k! > (k+1)·2^k > 2·2^k = 2^(k+1) eftersom k + 1 > 2." },
    { st: "3^n > n³", l: (n) => 3 ** n, r: (n) => n ** 3, step: "Antag 3^k > k³. Då 3^(k+1) > 3k³, och (k+1)³ = k³(1 + 1/k)³ ≤ k³·(4/3)³ < 3k³ för k ≥ 3." },
    { st: "n² ≥ 4n", l: (n) => n * n, r: (n) => 4 * n, step: "Antag k² ≥ 4k. Då (k+1)² = k² + 2k + 1 ≥ 4k + 2k + 1 ≥ 4k + 4 = 4(k+1), eftersom 2k + 1 ≥ 4 för k ≥ 2." },
    { st: "n² > 2n + 1", l: (n) => n * n, r: (n) => 2 * n + 1, step: "Antag k² > 2k + 1. Då (k+1)² = k² + 2k + 1 > 4k + 2 ≥ 2k + 3 = 2(k+1) + 1, eftersom 2k ≥ 1." },
    { st: "2^n > n³", l: (n) => 2 ** n, r: (n) => n ** 3, step: "Antag 2^k > k³. Då 2^(k+1) > 2k³, och (k+1)³ = k³(1 + 1/k)³ ≤ k³·(5/4)³ < 2k³ för k ≥ 4.", hard: true },
  ];

  generators["proofs.inequality"] = (c) => {
    const { t, level, pick } = c;
    t.reasoning = true;
    const S = pick(level === 5 ? INEQ : INEQ.filter((x) => !x.hard));
    let n0 = 1;
    const holds = (n) => (/≥/.test(S.st) ? S.l(n) >= S.r(n) : S.l(n) > S.r(n));
    for (let n = 1; n <= 10; n++) if (!holds(n)) n0 = n + 1;
    t.meta = { st: S.st, n0 };
    t.prompt = `Du ska bevisa med induktion att ${S.st} för alla heltal n från ett visst startvärde. Bestäm det minsta n₀ från vilket olikheten gäller för alla n ≥ n₀ (det är ditt basfall), och kontrollera basfallet. Skriv sedan beviset under Mellanled.`;
    num(c, "Minsta n₀ (basfall)", n0);
    num(c, `Vänsterledet för n = ${n0}`, S.l(n0));
    num(c, `Högerledet för n = ${n0}`, S.r(n0));
    if (level === 5) num(c, `Vänsterledet för n = ${n0 + 1}`, S.l(n0 + 1));
    t.solution = [
      `Pröva n = 1, 2, 3, …: olikheten är falsk för n = ${n0 - 1 || "–"} (om n₀ > 1) och sann från n = ${n0}. Basfall: ${S.l(n0)} ${/≥/.test(S.st) ? "≥" : ">"} ${S.r(n0)}.`,
      S.step,
      `Basfallet och steget ger att olikheten gäller för alla n ≥ ${n0}.`,
    ];
    t.hint = "Beräkna båda sidor för n = 1, 2, 3, … tills olikheten börjar gälla för gott.";
  };

  generators["proofs.flawed"] = (c) => {
    const { t, rand, pick } = c;
    t.reasoning = false;
    const kind = pick(["horses", "constant", "baseless"]);
    t.meta = { kind };
    if (kind === "horses") {
      t.context = [
        "Påstående: I varje flock med n hästar har alla hästar samma färg.",
        "Basfall: n = 1. En flock med en häst är enfärgad.",
        "Steg: Antag att varje flock med k hästar är enfärgad. Ta en flock med k+1 hästar. Ta bort en häst: de k kvarvarande är enfärgade. Sätt tillbaka den och ta i stället bort en annan häst: de k kvarvarande är enfärgade. De två grupperna delar hästar, så alla k+1 har samma färg.",
      ];
      t.prompt = "Beviset ”visar” att alla hästar i världen har samma färg. Något är fel. Vad?";
      pickOne(c, "Var ligger felet?", "Steget fungerar inte för k = 1: de två grupperna delar då ingen häst.", [
        "Basfallet n = 1 är fel.",
        "Induktionsantagandet får inte användas i steget.",
        "Induktion kan inte användas för påståenden om hästar.",
      ]);
      num(c, "För vilket k fungerar steget inte?", 1);
      t.solution = [
        "För k = 1 består flocken av två hästar. Efter att ha tagit bort en häst återstår en enda, och en annan häst om vi tar bort den andra. De två grupperna om en häst vardera delar ingen häst.",
        "Då kan man inte dra slutsatsen att de har samma färg. Steget P(1) ⇒ P(2) är falskt, så induktionen fungerar inte.",
      ];
    }
    if (kind === "constant") {
      const cst = rand(1, 5);
      t.context = [
        `Påstående: 1 + 2 + … + n = n(n+1)/2 + ${cst} för alla n ≥ 1.`,
        `Steg: Antag att formeln gäller för n = k. Då är 1 + … + k + (k+1) = k(k+1)/2 + ${cst} + (k+1) = (k+1)(k+2)/2 + ${cst}. Alltså gäller formeln för k+1.`,
      ];
      t.prompt = "Stegets algebra stämmer, men påståendet är ändå falskt. Vad saknas i beviset?";
      pickOne(c, "Vad är fel?", "Basfallet stämmer inte: vid n = 1 är VL ≠ HL.", [
        "Induktionssteget har ett räknefel.",
        "Man får inte lägga till en konstant i högerledet.",
        "Induktionsantagandet saknas.",
      ]);
      num(c, "VL − HL vid n = 1", -cst);
      t.solution = [
        `Steget P(k) ⇒ P(k+1) är korrekt, men utan ett fungerande basfall startar induktionen aldrig.`,
        `Vid n = 1 är vänsterledet 1 och högerledet 1·2/2 + ${cst} = ${1 + cst}. Skillnaden är ${-cst}.`,
      ];
    }
    if (kind === "baseless") {
      t.context = [
        "Påstående: n = n + 1 för alla heltal n ≥ 1.",
        "Steg: Antag att k = k + 1. Addera 1 till båda sidor: k + 1 = k + 2. Alltså gäller påståendet även för k + 1.",
      ];
      t.prompt = "Beviset ”visar” att n = n + 1. Vad är det som inte stämmer?";
      pickOne(c, "Vad är fel?", "Basfall saknas, och påståendet är falskt redan för n = 1 (1 ≠ 2).", [
        "Induktionssteget är felaktigt: man får inte addera 1 på båda sidor.",
        "Påståendet är sant men beviset är otydligt.",
        "Induktion fungerar bara för summor.",
      ]);
      num(c, "VL − HL vid n = 1", -1);
      t.solution = [
        "Steget är logiskt korrekt: om k = k + 1 så är också k + 1 = k + 2.",
        "Men utan basfall vet vi aldrig att påståendet gäller för något n. Vid n = 1 är 1 = 2 falskt, och skillnaden VL − HL är −1.",
      ];
    }
    t.hint = "Ett induktionsbevis behöver både ett fungerande basfall och ett fungerande steg för alla k.";
  };

  /* ================= DIFFERENTIALEKVATIONER ================= */

  const ode = (a, b) =>
    `y′ = ${a === 1 ? "" : a === -1 ? "−" : a}y${b === 0 ? "" : " " + sgn(b)}`;

  generators["differential.match"] = (c) => {
    const { t, level, rand, pick } = c;
    const k = pick(level === 2 ? [-3, -2, -1] : [-3, -2, -1, 1, 2, 3]),
      L = level === 2 ? 0 : pick([-4, -3, -2, 2, 3, 4, 5]),
      C = pick([-3, -2, 2, 3, 4]);
    const fn = `y(x) = ${L === 0 ? "" : L + " " + (C < 0 ? "− " + -C : "+ " + C) + "·"}${L === 0 ? C + "·" : ""}e^(${k}x)`.replace("= +", "=");
    t.meta = { k, L, C };
    t.prompt = `Funktionen ${fn} är en lösning till en differentialekvation på formen y′ = a·y + b. Vilken?`;
    const right = ode(k, -k * L),
      pool = [...new Set([ode(k, k * L), ode(k, 0), ode(-k, k * L), ode(k * C, 0), ode(k, -L), ode(-k, -k * L)])].filter((w) => w !== right);
    pickOne(c, "Differentialekvationen", right, pool.slice(0, 3));
    if (k < 0) num(c, "Värdet y närmar sig när x → ∞", L);
    else num(c, "y(0)", L + C);
    t.solution = [
      `Derivera: y′ = ${C * k}·e^(${k}x). Eftersom y − ${L} = ${C}·e^(${k}x) är y′ = ${k}·(y − ${L}) = ${k}y ${sgn(-k * L)}.`,
      k < 0
        ? `När x → ∞ går e^(${k}x) mot 0, så y → ${L}.`
        : `Vid x = 0 är e⁰ = 1, så y(0) = ${L} + ${C} = ${L + C}.`,
    ];
    t.hint = "Derivera funktionen och försök skriva y′ med hjälp av y.";
    void rand;
  };

  generators["differential.separable"] = (c) => {
    const { t, level, rand, pick } = c;
    const y0 = rand(2, 9);
    const form = level === 5 ? pick(["x2", "inv"]) : pick(["x1", "inv"]);
    t.meta = { form, y0 };
    if (form === "x1") {
      const k = pick([2, 4, 6, -2, -4]);
      t.prompt = `Lös y′ = ${k}x·y med y(0) = ${y0}. Svara på formen y = C·e^(a·x²) med C och a.`;
      num(c, "C", y0);
      num(c, "a", k / 2);
      t.solution = [
        `Separera: dy/y = ${k}x dx. Integrera: ln|y| = ${k / 2}x² + konstant.`,
        `y = C·e^(${k / 2}x²). Villkoret y(0) = ${y0} ger C = ${y0}.`,
      ];
      t.hint = "Samla y på ena sidan och x på den andra, och integrera båda sidor.";
    }
    if (form === "x2") {
      const k = pick([3, 6, -3, -6]);
      t.prompt = `Lös y′ = ${k}x²·y med y(0) = ${y0}. Svara på formen y = C·e^(b·x³) med C och b.`;
      num(c, "C", y0);
      num(c, "b", k / 3);
      t.solution = [
        `Separera: dy/y = ${k}x² dx. Integrera: ln|y| = ${k / 3}x³ + konstant.`,
        `y = C·e^(${k / 3}x³). Villkoret y(0) = ${y0} ger C = ${y0}.`,
      ];
      t.hint = "Integrera x² med avseende på x: ∫x² dx = x³/3.";
    }
    if (form === "inv") {
      const k = rand(2, 4);
      t.prompt = `Lös y′ = (${k}/x)·y för x > 0 med y(1) = ${y0}. Svara på formen y = C·x^p med C och p.`;
      num(c, "C", y0);
      num(c, "p", k);
      t.solution = [
        `Separera: dy/y = ${k}/x dx. Integrera: ln|y| = ${k}·ln x + konstant, så y = C·x^${k}.`,
        `y(1) = C = ${y0}.`,
      ];
      t.hint = "Integralen av 1/x är ln x.";
    }
  };

  generators["differential.qualitative"] = (c) => {
    const { t, level, rand, pick } = c;
    const a = pick([-3, -2, -1, 1, 2, 3]),
      L = rand(2, 9),
      above = Math.random() < 0.5,
      y0 = level === 4 ? (above ? L + rand(1, 3) : L - rand(1, 2)) : above ? L + rand(1, 3) : L - rand(1, 2);
    t.meta = { a, L, y0 };
    t.prompt = `Betrakta ${ode(a, -a * L)} med y(0) = ${y0}. Bestäm jämviktsvärdet och avgör hur lösningen beter sig när x → ∞.`;
    num(c, "Jämviktsvärdet", L);
    const approach = `y närmar sig ${L}`,
      grow = "y växer obegränsat",
      shrink = "y avtar obegränsat",
      stay = `y är konstant ${y0}`;
    const answer = a < 0 ? approach : y0 > L ? grow : shrink;
    pickOne(c, "Beteende när x → ∞", answer, [approach, grow, shrink, stay]);
    t.solution = [
      `Jämvikt: y′ = 0 ger ${a}y ${sgn(-a * L)} = 0, så y = ${L}.`,
      a < 0
        ? `Lösningen är y = ${L} + C·e^(${a}x) med a < 0, så avvikelsen från ${L} dör ut: y → ${L}.`
        : `Lösningen är y = ${L} + C·e^(${a}x) med a > 0, så avvikelsen från ${L} växer. Eftersom y(0) = ${y0} ${y0 > L ? "> " + L + " blir C > 0 och y växer obegränsat" : "< " + L + " blir C < 0 och y avtar obegränsat"}.`,
    ];
    t.hint = "Skriv om y′ som a(y − L). Vilket tecken har a?";
  };

  generators["differential.oscillation"] = (c) => {
    const { t, rand, pick } = c;
    const w = pick([1, 2, 3, 4]),
      A = rand(1, 6),
      B = rand(1, 5);
    t.meta = { w, A, B };
    t.prompt = `Lös y″ + ${w * w}y = 0 med y(0) = ${A} och y′(0) = ${B * w}. Skriv lösningen som y = A·cos(ωx) + B·sin(ωx). Ange ω, A och B, samt periodtiden T = c·π.`;
    num(c, "ω", w);
    num(c, "A", A);
    num(c, "B", B);
    num(c, "c i T = c·π", 2 / w);
    t.solution = [
      `Karakteristisk ekvation: r² + ${w * w} = 0, så r = ±${w}i. Lösningen är y = A·cos(${w}x) + B·sin(${w}x).`,
      `y(0) = A = ${A}. Derivatan är y′ = −${w}A·sin(${w}x) + ${w}B·cos(${w}x), så y′(0) = ${w}B = ${B * w} ger B = ${B}.`,
      `Periodtiden är T = 2π/ω = 2π/${w}, alltså c = ${2 / w}.`,
    ];
    t.hint = "Komplexa rötter r = ±iω ger lösningar med cos(ωx) och sin(ωx).";
  };

  /* ================= DERIVATA OCH INTEGRALER ================= */

  generators["calculus.chain"] = (c) => {
    const { t, level, rand, pick, fmt } = c;
    const kind = pick(
      level <= 2 ? ["lin"] : level === 3 ? ["lin", "quad"] : ["quad", "sqrt", "prod"],
    );
    let fx, fp, f0, label;
    const x0 = rand(1, 3);
    if (kind === "lin") {
      const a = pick([2, 3, 4, 5, -2, -3]), b = rand(-4, 6), n = rand(3, 5);
      label = `f(x) = (${linear(a, b)})^${n}`;
      f0 = (a * x0 + b) ** n;
      fp = n * a * (a * x0 + b) ** (n - 1);
      t.solution = [
        `Kedjeregeln: f′(x) = ${n}·(${linear(a, b)})^${n - 1} · ${a}.`,
        `f′(${x0}) = ${n}·${a * x0 + b}^${n - 1}·${a} = ${fp}.`,
      ];
    }
    if (kind === "quad") {
      const cc = rand(1, 4), n = rand(2, 4);
      label = `f(x) = (x² + ${cc})^${n}`;
      f0 = (x0 * x0 + cc) ** n;
      fp = n * 2 * x0 * (x0 * x0 + cc) ** (n - 1);
      t.solution = [
        `Kedjeregeln: f′(x) = ${n}·(x² + ${cc})^${n - 1} · 2x.`,
        `f′(${x0}) = ${n}·${x0 * x0 + cc}^${n - 1}·${2 * x0} = ${fp}.`,
      ];
    }
    if (kind === "sqrt") {
      const m = rand(3, 13), xx = rand(1, m - 1), cc = m * m - xx * xx;
      label = `f(x) = √(x² + ${cc})`;
      f0 = m;
      fp = xx / m;
      t.meta = { m, xx, cc };
      t.prompt = `Bestäm f′(${xx}) för ${label}, samt tangentens skärning m med y-axeln i punkten x = ${xx} (tangenten y = kx + m).`;
      num(c, `f′(${xx})`, fp);
      num(c, "m i tangenten y = kx + m", f0 - fp * xx);
      t.solution = [
        `f(x) = (x² + ${cc})^(1/2), så f′(x) = ½(x² + ${cc})^(−1/2)·2x = x/√(x² + ${cc}).`,
        `f(${xx}) = √${xx * xx + cc} = ${m}, f′(${xx}) = ${xx}/${m}.`,
        `Tangent: y = ${fmt(fp)}·(x − ${xx}) + ${m}, så m = ${m} − ${xx}·${xx}/${m} = ${fmt(f0 - fp * xx)}.`,
      ];
      t.hint = "Skriv kvadratroten som en potens med exponent 1/2 och använd kedjeregeln.";
      return;
    }
    if (kind === "prod") {
      const cc = rand(1, 4), n = rand(2, 3);
      label = `f(x) = x·(x² + ${cc})^${n}`;
      f0 = x0 * (x0 * x0 + cc) ** n;
      fp = (x0 * x0 + cc) ** n + 2 * n * x0 * x0 * (x0 * x0 + cc) ** (n - 1);
      t.solution = [
        `Produktregeln och kedjeregeln: f′(x) = (x² + ${cc})^${n} + x·${n}(x² + ${cc})^${n - 1}·2x.`,
        `f′(${x0}) = ${(x0 * x0 + cc) ** n} + ${2 * n * x0 * x0 * (x0 * x0 + cc) ** (n - 1)} = ${fp}.`,
      ];
    }
    t.meta = { kind, x0, label, fp, f0 };
    t.prompt = `Bestäm f′(${x0}) för ${label}${level >= 3 ? `, samt m i tangentens ekvation y = kx + m i punkten x = ${x0}` : ""}.`;
    num(c, `f′(${x0})`, fp);
    if (level >= 3) {
      num(c, "m i tangenten y = kx + m", f0 - fp * x0);
      t.solution.push(`Tangenten genom (${x0}, ${f0}) har lutning ${fp}, så m = ${f0} − ${fp}·${x0} = ${f0 - fp * x0}.`);
    }
    t.hint = "Derivera ytterfunktionen och multiplicera med derivatan av innerfunktionen.";
  };

  generators["calculus.quotient"] = (c) => {
    const { t, level, rand, pick } = c;
    if (Math.random() < 0.5) {
      const s = rand(1, 4), x0 = rand(1, 4),
        num0 = s * s - x0 * x0,
        den0 = (x0 * x0 + s * s) ** 2;
      t.meta = { form: "x/(x^2+s^2)", s, x0 };
      t.prompt = `f(x) = x/(x² + ${s * s}). Bestäm f′(${x0}) och den positiva punkt där f′(x) = 0${level === 5 ? ", samt funktionsvärdet i den punkten" : ""}.`;
      num(c, `f′(${x0})`, num0 / den0);
      num(c, "Positiv stationär punkt", s);
      if (level === 5) num(c, "f i den punkten", 1 / (2 * s));
      t.solution = [
        `Kvotregeln: f′(x) = ((x² + ${s * s}) − x·2x)/(x² + ${s * s})² = (${s * s} − x²)/(x² + ${s * s})².`,
        `f′(${x0}) = ${num0}/${den0}.`,
        `f′(x) = 0 när ${s * s} − x² = 0, alltså x = ${s}.`,
        ...(level === 5 ? [`f(${s}) = ${s}/${2 * s * s} = 1/${2 * s}.`] : []),
      ];
    } else {
      const cc = rand(1, 4), x0 = rand(1, 4), n0 = x0 * x0 + 2 * cc * x0, d0 = (x0 + cc) ** 2;
      t.meta = { form: "x^2/(x+c)", cc, x0 };
      t.prompt = `f(x) = x²/(x + ${cc}). Bestäm f′(${x0}) och den punkt x ≠ 0 där f′(x) = 0.`;
      num(c, `f′(${x0})`, n0 / d0);
      num(c, "Punkten x ≠ 0", -2 * cc);
      t.solution = [
        `Kvotregeln: f′(x) = (2x(x + ${cc}) − x²)/(x + ${cc})² = (x² + ${2 * cc}x)/(x + ${cc})².`,
        `f′(${x0}) = ${n0}/${d0}.`,
        `Täljaren x(x + ${2 * cc}) = 0 ger x = 0 eller x = ${-2 * cc}.`,
      ];
    }
    t.hint = "Kvotregeln: (u/v)′ = (u′v − uv′)/v².";
    void pick;
  };

  generators["calculus.accumulate"] = (c) => {
    const { t, level, rand, fmt } = c;
    if (level <= 4) {
      const a = rand(2, 9), b = rand(1, 5) * 2, T = rand(3, 10);
      const total = a * T + (b * T * T) / 2;
      t.meta = { a, b, T };
      t.prompt = `Vatten rinner in i en tank med hastigheten r(t) = ${a} + ${b}t liter per minut. Hur många liter har runnit in efter ${T} minuter?${level === 4 ? " Vad är medelflödet under tiden?" : ""}`;
      num(c, "Liter efter " + T + " min", total);
      if (level === 4) num(c, "Medelflöde (liter/min)", total / T);
      t.solution = [
        `Mängden är integralen av flödet: ∫ från 0 till ${T} av (${a} + ${b}t) dt = [${a}t + ${b / 2}t²] = ${a * T} + ${(b * T * T) / 2} = ${total}.`,
        ...(level === 4 ? [`Medelflödet är ${total}/${T} = ${fmt(total / T)} liter per minut.`] : []),
      ];
      t.hint = "Mängden som ackumuleras är integralen av hastigheten över tidsintervallet.";
    } else {
      const bb = rand(1, 3), tstar = rand(2, 6), a = bb * tstar;
      t.meta = { a, bb, tstar };
      t.prompt = `En tank fylls och töms samtidigt. Nettoflödet är r(t) = ${a} − ${bb}t liter per minut. Mängden i tanken är störst när nettoflödet byter tecken. Bestäm den tidpunkten och hur många liter tanken har ökat med fram till dess.`;
      num(c, "Tidpunkt (min)", tstar);
      num(c, "Största ökning (liter)", a * tstar - (bb * tstar * tstar) / 2);
      t.solution = [
        `r(t) = 0 när ${a} − ${bb}t = 0, alltså t = ${tstar}. Före dess ökar mängden, efter dess minskar den.`,
        `Ökningen är ∫ från 0 till ${tstar} av (${a} − ${bb}t) dt = [${a}t − ${bb / 2}t²] = ${a * tstar} − ${(bb * tstar * tstar) / 2} = ${a * tstar - (bb * tstar * tstar) / 2}.`,
      ];
      t.hint = "När ändras tecknet på nettoflödet? Integrera sedan fram till den tidpunkten.";
    }
  };

  generators["calculus.substitution"] = (c) => {
    const { t, level, rand, pick, fmt } = c;
    const form = level === 4 ? "poly" : pick(["poly", "exp", "ln"]);
    t.meta = { form };
    if (form === "poly") {
      const n = rand(2, 4), cc = rand(1, 3), p = rand(1, 2);
      const val = ((p * p + cc) ** (n + 1) - cc ** (n + 1)) / (2 * (n + 1));
      t.prompt = `Beräkna ∫ från 0 till ${p} av x·(x² + ${cc})^${n} dx med substitutionen u = x² + ${cc}. Ange först faktorn A i den primitiva funktionen F(x) = A·(x² + ${cc})^${n + 1}, och sedan integralens värde.`;
      num(c, "A", 1 / (2 * (n + 1)));
      num(c, "Integralens värde", val);
      t.solution = [
        `u = x² + ${cc} ger du = 2x dx, så x dx = du/2. ∫ u^${n} · du/2 = u^${n + 1}/${2 * (n + 1)}.`,
        `F(x) = (x² + ${cc})^${n + 1}/${2 * (n + 1)}, så A = 1/${2 * (n + 1)}.`,
        `Värde: (${p * p + cc}^${n + 1} − ${cc}^${n + 1})/${2 * (n + 1)} = ${fmt(val)}.`,
      ];
    }
    if (form === "exp") {
      const k = rand(2, 6), p = rand(1, 2);
      t.prompt = `Beräkna ∫ från 0 till ${p} av ${k}x·e^(x²) dx. Svaret kan skrivas A·(e^${p * p} − 1). Bestäm A.`;
      num(c, "A", k / 2);
      t.solution = [
        `u = x² ger du = 2x dx. ∫ ${k}x·e^(x²) dx = ${k / 2}·∫ e^u du = ${k / 2}·e^(x²).`,
        `Från 0 till ${p}: ${k / 2}(e^${p * p} − e⁰) = ${k / 2}(e^${p * p} − 1), så A = ${k / 2}.`,
      ];
    }
    if (form === "ln") {
      const k = rand(1, 3) * 2, cc = rand(1, 4), p = rand(1, 3);
      t.prompt = `Beräkna ∫ från 0 till ${p} av ${k}x/(x² + ${cc}) dx. Svaret kan skrivas A·ln((${p * p + cc})/${cc}). Bestäm A.`;
      num(c, "A", k / 2);
      t.solution = [
        `u = x² + ${cc} ger du = 2x dx. ∫ ${k}x/(x² + ${cc}) dx = ${k / 2}·∫ du/u = ${k / 2}·ln(x² + ${cc}).`,
        `Från 0 till ${p}: ${k / 2}(ln ${p * p + cc} − ln ${cc}) = ${k / 2}·ln(${p * p + cc}/${cc}), så A = ${k / 2}.`,
      ];
    }
    t.hint = "Låt u vara den inre funktionen. Då bör derivatan av u finnas som faktor i integranden.";
  };

  generators["calculus.volume"] = (c) => {
    const { t, level, rand, pick, fmt } = c;
    const forms =
      level === 4 ? ["cone", "root"] : ["parab", "shift", "sphere"];
    const form = pick(forms);
    t.meta = { form };
    let ans;
    if (form === "cone") {
      const a = rand(1, 4), b = rand(2, 5);
      ans = (a * a * b ** 3) / 3;
      t.prompt = `Området mellan y = ${a === 1 ? "" : a}x, x-axeln och linjen x = ${b} roteras kring x-axeln. Volymen kan skrivas V = c·π. Bestäm c.`;
      t.solution = [`V = π∫ från 0 till ${b} av (${a}x)² dx = π·${a * a}·[x³/3] = π·${a * a}·${b ** 3}/3 = ${fmt(ans)}π.`];
    }
    if (form === "root") {
      const b = rand(2, 9);
      ans = (b * b) / 2;
      t.prompt = `Området mellan y = √x, x-axeln och linjen x = ${b} roteras kring x-axeln. Volymen kan skrivas V = c·π. Bestäm c.`;
      t.solution = [`V = π∫ från 0 till ${b} av (√x)² dx = π∫ x dx = π·${b}²/2 = ${fmt(ans)}π.`];
    }
    if (form === "parab") {
      const b = rand(1, 3);
      ans = b ** 5 / 5;
      t.prompt = `Området mellan y = x², x-axeln och linjen x = ${b} roteras kring x-axeln. Volymen kan skrivas V = c·π. Bestäm c.`;
      t.solution = [`V = π∫ från 0 till ${b} av (x²)² dx = π·[x⁵/5] = π·${b ** 5}/5 = ${fmt(ans)}π.`];
    }
    if (form === "shift") {
      const cc = rand(1, 3), b = rand(1, 3);
      ans = ((b + cc) ** 3 - cc ** 3) / 3;
      t.prompt = `Området mellan y = x + ${cc}, x-axeln, y-axeln och linjen x = ${b} roteras kring x-axeln. Volymen kan skrivas V = c·π. Bestäm c.`;
      t.solution = [`V = π∫ från 0 till ${b} av (x + ${cc})² dx = π·[(x + ${cc})³/3] = π·(${(b + cc) ** 3} − ${cc ** 3})/3 = ${fmt(ans)}π.`];
    }
    if (form === "sphere") {
      const r = rand(2, 5);
      ans = (2 * r ** 3) / 3;
      t.prompt = `Halvcirkeln y = √(${r * r} − x²) för 0 ≤ x ≤ ${r} roteras kring x-axeln. Det ger en halvklot. Volymen kan skrivas V = c·π. Bestäm c.`;
      t.solution = [`V = π∫ från 0 till ${r} av (${r * r} − x²) dx = π·[${r * r}x − x³/3] = π·(${r ** 3} − ${r ** 3}/3) = ${fmt(ans)}π.`];
    }
    num(c, "c", ans);
    t.hint = "Rotationsvolym kring x-axeln: V = π∫ (f(x))² dx.";
    void level;
  };

  /* ---------- entry points ---------- */
  root.Math5ExtraGenerators = {
    has: (category, type) => !!generators[category + "." + type],
    populate: (context) => {
      generators[context.category + "." + context.type](context);
      return context.t;
    },
    _generators: generators,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.Math5ExtraGenerators;
  }
})();
