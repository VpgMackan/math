(() => {
  "use strict";

  const root = typeof window !== "undefined" ? window : globalThis;

  function populateTask(context) {
    const {
      t,
      category,
      type,
      level,
      field,
      rand,
      pick,
      factorial,
      choose,
      mod,
      fmt,
      setText,
      range,
    } = context;
    if (root.Math5ExtraGenerators?.has(category, type))
      return root.Math5ExtraGenerators.populate(context);
    const f = (label, answer, kind, extra) =>
      t.fields.push(field(label, answer, kind, extra));
    const max = [4, 7, 10, 14, 18][level - 1];
    if (category === "combinatorics") {
      const n = rand(5, max + 3),
        k = rand(2, Math.min(5, n - 1));
      if (type === "product") {
        const a = rand(2, max),
          b = rand(2, level === 1 ? 3 : 6),
          c = level === 1 ? 1 : rand(2, 5);
        const sc = pick([
          [`En meny har ${a} förrätter, ${b} huvudrätter och ${c} efterrätter. Hur många menyer kan väljas med exakt en av varje?`, "Antal menyer"],
          [`Ett cykellås har tre hjul med ${a}, ${b} respektive ${c} olika lägen. Hur många olika koder går det att ställa in?`, "Antal koder"],
          [`En butik säljer jackor i ${a} modeller, ${b} färger och ${c} storlekar. Hur många olika varianter finns?`, "Antal varianter"],
          [`En dator konfigureras med ett av ${a} chassin, ett av ${b} grafikkort och ett av ${c} minnesstorlekar. Hur många konfigurationer finns?`, "Antal konfigurationer"],
        ]);
        t.prompt = sc[0];
        f(sc[1], a * b * c);
        t.solution = [
          `Valen kombineras oberoende: ${a} · ${b} · ${c} = ${a * b * c}.`,
        ];
        if (level === 1) {
          const x = pick([
            ["tröjor", "byxor", "tröja"],
            ["glassorter", "strössel", "glassort"],
            ["pizzabottnar", "såser", "pizzabotten"],
          ]);
          t.prompt = `Du har ${a} olika ${x[0]} och ${b} olika ${x[1]}. Hur många kombinationer med en av varje kan du välja?`;
          t.fields[0].label = "Antal kombinationer";
          t.solution = [
            `Varje ${x[2]} kan kombineras med ${b} ${x[1]}. ${a} · ${b} = ${a * b}.`,
          ];
        }
        t.hint = "Hur många val har du i vart och ett av stegen?";
      }
      if (type === "permutation") {
        const sc = pick([
          [`${n} olika deltagare tävlar om ${k} olika placeringar. Ingen deltagare kan ta mer än en placering. Hur många resultatlistor är möjliga?`, "Antal resultatlistor"],
          [`En förening med ${n} medlemmar ska välja ${k} olika funktionärer, till exempel ordförande och kassör. Ingen kan ha två poster. På hur många sätt kan posterna fördelas?`, "Antal fördelningar"],
          [`En kod består av ${k} olika bokstäver valda bland ${n} olika bokstäver, och ordningen har betydelse. Hur många koder finns?`, "Antal koder"],
        ]);
        t.prompt = sc[0];
        f(sc[1], factorial(n) / factorial(n - k));
        t.solution = [
          `Ordningen spelar roll. P(${n},${k}) = ${n}!/(${n - k})! = ${factorial(n) / factorial(n - k)}.`,
        ];
        t.hint =
          "Fyll den första placeringen, sedan den andra. Antalet kvarvarande personer minskar.";
      }
      if (type === "combination") {
        const sc = pick([
          [`Välj en grupp med ${k} personer bland ${n} personer. Roller och ordning spelar ingen roll. Hur många grupper finns?`, "Antal grupper"],
          [`Ett lag på ${k} spelare ska väljas bland ${n} spelare. Ingen position är bestämd i förväg. Hur många olika lag kan bildas?`, "Antal lag"],
          [`På en pizza ska du välja ${k} olika pålägg bland ${n} möjliga. Hur många pizzor med olika pålägg kan du få?`, "Antal pizzor"],
        ]);
        t.prompt = sc[0];
        f(sc[1], choose(n, k));
        t.solution = [
          `C(${n},${k}) = ${n}!/(${k}! · ${n - k}!) = ${choose(n, k)}.`,
        ];
        t.hint =
          "Hur många gånger räknas samma grupp om du först räknar ordnade urval?";
      }
      if (type === "repeated") {
        const a = rand(2, 4),
          b = rand(2, 4),
          c = level === 1 ? 1 : rand(1, 3),
          total = a + b + c,
          answer =
            factorial(total) / factorial(a) / factorial(b) / factorial(c);
        t.prompt = `Hur många olika teckenföljder kan bildas av ${a} stycken A, ${b} stycken B och ${c} stycken C? Alla tecken ska användas.`;
        f("Antal teckenföljder", answer);
        t.solution = [
          `Börja med ${total}! permutationer. Identiska tecken får ingen egen ordning. Dividera med ${a}! · ${b}! · ${c}!: ${answer}.`,
        ];
        t.hint = "Vilka omordningar av tecken ger samma teckenföljd?";
      }
      if (type === "binomial") {
        const exponent = rand(4, level >= 4 ? 10 : 7),
          power = rand(1, exponent - 1),
          a = rand(1, 3),
          answer = choose(exponent, power) * a ** (exponent - power);
        t.prompt = `Bestäm koefficienten framför x^${power} i (${a} + x)^${exponent}.`;
        f("Koefficient", answer);
        t.solution = [
          `Välj ${power} av ${exponent} faktorer som ger x. Koefficienten är C(${exponent},${power}) · ${a}^${exponent - power} = ${answer}.`,
        ];
        t.hint =
          "Välj vilka faktorer som bidrar med x; de övriga bidrar med konstanten.";
      }
      if (type === "restricted") {
        const a = rand(4, 7),
          b = rand(4, 7),
          size = rand(3, 5),
          min = rand(1, 2);
        let answer = 0;
        const terms = [];
        for (let j = min; j <= Math.min(a, size); j++) {
          answer += choose(a, j) * choose(b, size - j);
          terms.push(`C(${a},${j}) · C(${b},${size - j})`);
        }
        t.prompt = `En grupp med ${size} personer väljs bland ${a} från klass A och ${b} från klass B. Minst ${min} måste komma från A. Hur många grupper kan bildas?`;
        f("Antal grupper", answer);
        t.solution = [
          `Dela upp i fall efter antalet från A. Fallen är disjunkta.`,
          terms.join(" + ") + ` = ${answer}.`,
        ];
        t.hint =
          "Räkna varje tillåtet antal personer från A separat och summera.";
      }
    }
    if (category === "sets") {
      const u = range(
          level === 1 ? 5 : level === 2 ? 8 : level === 3 ? 12 : 16,
        ),
        a = u.filter(() => Math.random() < 0.55),
        b = u.filter(() => Math.random() < 0.5);
      t.context = [
        `U = ${setText(u)}`,
        `A = ${setText(a)}`,
        `B = ${setText(b)}`,
      ];
      let answer, expr;
      if (type === "union") {
        answer = u.filter((x) => a.includes(x) || b.includes(x));
        expr = "A ∪ B";
        t.hint = "Ta med element som finns i A, B eller båda.";
      }
      if (type === "intersection") {
        answer = a.filter((x) => b.includes(x));
        expr = "A ∩ B";
        t.hint = "Ett element ska finnas i båda mängderna.";
      }
      if (type === "difference") {
        answer = a.filter((x) => !b.includes(x));
        expr = "A ∖ B";
        t.hint = "Börja med A och ta bort alla element som också finns i B.";
      }
      if (type === "complement") {
        answer = u.filter((x) => !a.includes(x));
        expr = "Aᶜ";
        t.hint = "Komplementet tas i förhållande till universalmängden U.";
      }
      if (type === "demorgan") {
        answer = u.filter((x) => !a.includes(x) && !b.includes(x));
        expr = "(A ∪ B)ᶜ";
        t.hint = "De Morgans lag: (A ∪ B)ᶜ = Aᶜ ∩ Bᶜ.";
      }
      if (answer) {
        t.prompt = `Bestäm ${expr}.`;
        f(expr, answer, "set");
        t.solution = [`${expr} = ${setText(answer)}.`];
      }
      if (type === "cardinality") {
        const intersection = a.filter((x) => b.includes(x)).length,
          union = new Set([...a, ...b]).size;
        t.context = [
          `|A| = ${a.length}`,
          `|B| = ${b.length}`,
          `|A ∩ B| = ${intersection}`,
        ];
        t.prompt = "Bestäm antalet element i A ∪ B.";
        f("|A ∪ B|", union);
        t.solution = [
          `|A ∪ B| = ${a.length} + ${b.length} − ${intersection} = ${union}. Snittet räknades annars två gånger.`,
        ];
        t.hint = "Varför behöver det gemensamma snittet subtraheras?";
      }
      if (type === "subsets") {
        const n = rand(3, level >= 4 ? 12 : 7);
        t.context = [];
        t.prompt = `En mängd har ${n} element. Hur många delmängder har den? Hur många av dem har exakt två element?`;
        f("Alla delmängder, inklusive ∅", 2 ** n);
        f("Delmängder med två element", choose(n, 2));
        t.solution = [
          `Varje element tas med eller inte: 2^${n} = ${2 ** n}.`,
          `Två element väljs utan ordning: C(${n},2) = ${choose(n, 2)}.`,
        ];
        t.hint = "Varje element har två möjliga statusar: med eller inte med.";
      }
      t.setData = { u, a, b };
    }
    if (category === "congruence") {
      const m = rand(3, level >= 4 ? 17 : 11),
        a = rand(level === 1 ? 1 : -40, max * 10);
      if (type === "remainder") {
        t.prompt = `Bestäm den minsta icke-negativa resten för ${a} modulo ${m}.`;
        f("Rest, 0 ≤ r < " + m, mod(a, m));
        t.solution = [
          `${a} = ${Math.floor(a / m)} · ${m} + ${mod(a, m)}. Alltså ${a} ≡ ${mod(a, m)} (mod ${m}).`,
        ];
        t.hint =
          "Skriv talet som en heltalsmultipel av modulen plus en rest mellan 0 och m−1.";
      }
      if (type === "power") {
        const base = rand(2, 9),
          exp = rand(3, level >= 4 ? 30 : 10);
        let ans = 1;
        for (let i = 0; i < exp; i++) ans = mod(ans * base, m);
        t.prompt = `Beräkna ${base}^${exp} modulo ${m}. Ange minsta icke-negativa rest.`;
        f("Rest", ans);
        t.solution = [
          `Reducera modulo ${m} efter varje multiplikation, eller använd upprepad kvadrering. ${base}^${exp} ≡ ${ans} (mod ${m}).`,
        ];
        t.hint =
          "Du behöver inte räkna ut hela potensen. Reducera små delpotenser modulo m.";
      }
      if (type === "equation") {
        const coefficient = rand(2, 9),
          rhs = rand(0, m - 1),
          answers = range(m)
            .map((x) => x - 1)
            .filter((x) => mod(coefficient * x, m) === rhs);
        t.prompt = `Lös ${coefficient}x ≡ ${rhs} (mod ${m}) för 0 ≤ x < ${m}. Ange alla lösningar som en mängd.`;
        f("Lösningsmängd", answers, "set");
        t.solution = [
          `Pröva restklasserna 0 till ${m - 1} eller använd delbarhet. Lösningsmängden är ${setText(answers)}.`,
        ];
        t.hint =
          "En kongruensekvation kan ha flera lösningar eller ingen. Undersök alla restklasser.";
      }
      if (type === "inverse") {
        const prime = pick([5, 7, 11, 13]),
          coefficient = rand(2, prime - 1),
          ans = range(prime - 1).find((x) => mod(coefficient * x, prime) === 1);
        t.prompt = `Bestäm den multiplikativa inversen till ${coefficient} modulo ${prime}. Ange x med 1 ≤ x < ${prime}.`;
        f("Invers x", ans);
        t.solution = [
          `${coefficient} · ${ans} = ${coefficient * ans} ≡ 1 (mod ${prime}).`,
        ];
        t.hint = "Sök x så att ax lämnar resten 1 vid division med modulen.";
      }
    }
    if (category === "bases") {
      const base = pick(
          level === 1 ? [2] : level === 2 ? [2, 5] : [2, 3, 5, 8, 16],
        ),
        n = rand(
          level === 1 ? 2 : 12,
          level === 1 ? 7 : level === 2 ? 60 : level === 3 ? 255 : 1023,
        ),
        digits = n.toString(base).toUpperCase();
      if (type === "toDecimal") {
        t.prompt = `Talet ${digits} är skrivet i bas ${base}. Skriv talet i bas tio.`;
        f("Tal i bas tio", n);
        t.solution = [
          digits
            .split("")
            .map(
              (d, i) =>
                `${parseInt(d, base)} · ${base}^${digits.length - 1 - i}`,
            )
            .join(" + ") + ` = ${n}.`,
        ];
        t.hint = "Multiplicera varje siffra med sitt platsvärde.";
      }
      if (type === "fromDecimal") {
        t.prompt = `Skriv ${n} (bas tio) i bas ${base}.`;
        f("Tal i bas " + base, digits, "digits");
        t.solution = [
          `Dividera upprepat med ${base} och läs resterna baklänges: ${digits}.`,
        ];
        t.hint = "Resten vid division med basen ger den sista siffran.";
      }
      if (type === "between") {
        const other = pick([2, 3, 5, 8, 16].filter((x) => x !== base));
        t.prompt = `Omvandla ${digits} från bas ${base} till bas ${other}.`;
        f("Tal i bas " + other, n.toString(other).toUpperCase(), "digits");
        t.solution = [
          `${digits} (bas ${base}) = ${n} (bas tio) = ${n.toString(other).toUpperCase()} (bas ${other}).`,
        ];
        t.hint = "Använd bas tio som mellanled.";
      }
    }
    if (category === "sequences") {
      const a = rand(1, 6),
        n = rand(level === 1 ? 3 : 4, level === 1 ? 3 : level >= 4 ? 10 : 7),
        d = rand(2, level >= 4 ? 8 : 5),
        q = rand(2, 3);
      if (type === "arithmetic") {
        t.prompt = `a₁ = ${a} och aₙ₊₁ = aₙ + ${d}. Bestäm a₂, a₃ och a${n}.`;
        f("a₂", a + d);
        f("a₃", a + 2 * d);
        f("a" + n, a + (n - 1) * d);
        t.solution = [
          `aₙ = ${a} + (n−1) · ${d}. Därför a₂=${a + d}, a₃=${a + 2 * d} och a${n}=${a + (n - 1) * d}.`,
        ];
        t.hint = "Det finns n−1 ökningar från första till n:te termen.";
      }
      if (type === "geometric") {
        t.prompt = `a₁ = ${a} och aₙ₊₁ = ${q}aₙ. Bestäm a₂, a₃ och a${n}.`;
        f("a₂", a * q);
        f("a₃", a * q * q);
        f("a" + n, a * q ** (n - 1));
        t.solution = [
          `aₙ = ${a} · ${q}^(n−1). Alltså a${n} = ${a * q ** (n - 1)}.`,
        ];
        t.hint = "Antalet multiplikationer från första termen är n−1.";
      }
      if (type === "recurrence") {
        const b = rand(1, 5),
          values = [a];
        for (let i = 1; i < n; i++) values.push(q * values.at(-1) + b);
        t.prompt = `a₁ = ${a}, aₙ₊₁ = ${q}aₙ + ${b}. Bestäm a₂, a₃ och a${n}.`;
        f("a₂", values[1]);
        f("a₃", values[2]);
        f("a" + n, values.at(-1));
        t.solution = [`Upprepa rekursionen: ${values.join(", ")}.`];
        t.hint = "Använd det nyss beräknade värdet som indata i nästa steg.";
      }
      if (type === "second") {
        const b = rand(1, 5),
          values = [a, b];
        for (let i = 2; i < n; i++) values.push(values.at(-1) + values.at(-2));
        t.prompt = `a₁ = ${a}, a₂ = ${b} och aₙ = aₙ₋₁ + aₙ₋₂ för n ≥ 3. Bestäm a₃ och a${n}.`;
        f("a₃", values[2]);
        f("a" + n, values.at(-1));
        t.solution = [
          `Varje term är summan av de två föregående: ${values.join(", ")}.`,
        ];
        t.hint = "Du behöver behålla två föregående termer i varje steg.";
      }
      if (type === "sum") {
        t.prompt = `En geometrisk talföljd har a₁ = ${a} och kvoten q = ${q}. Bestäm summan av de första ${n} termerna.`;
        f("Summa", (a * (q ** n - 1)) / (q - 1));
        t.solution = [
          `S${n} = ${a}(${q}^${n}−1)/(${q}−1) = ${(a * (q ** n - 1)) / (q - 1)}.`,
        ];
        t.hint = "Jämför summan S med qS och subtrahera.";
      }
    }
    if (category === "proofs") {
      t.reasoning = true;
      if (type === "sum") {
        t.prompt =
          "Bevisa med induktion att 1+2+…+n = n(n+1)/2 för alla heltal n ≥ 1. Fyll även i kontrollpunkterna nedan.";
        f("Basfall n=1: värdet på båda sidor", 1);
        f("I steget k→k+1: talet som läggs till när k=4", 5);
        t.solution = [
          "Basfall: 1 = 1·2/2.",
          "Antag att 1+…+k=k(k+1)/2.",
          "Då 1+…+k+(k+1)=k(k+1)/2+2(k+1)/2=(k+1)(k+2)/2.",
          "Formeln gäller för k+1, och därmed för alla heltal n≥1.",
        ];
        t.hint =
          "Använd antagandet på den gamla summan och lägg till den nya termen k+1.";
      }
      if (type === "odd") {
        t.prompt =
          "Bevisa med induktion att 1+3+…+(2n−1)=n² för n ≥ 1. Fyll även i kontrollpunkterna.";
        f("Basfall n=1", 1);
        f("Nästa term när k=5", 11);
        t.solution = [
          "Basfall: 1=1².",
          "Antag att summan till 2k−1 är k². Nästa term är 2(k+1)−1=2k+1.",
          "Den nya summan blir k²+2k+1=(k+1)². Induktionssteget är visat.",
        ];
        t.hint = "Vilken term kommer efter 2k−1? Använd kvadreringsregeln.";
      }
      if (type === "divisibility") {
        const b = pick([3, 4, 5, 6]),
          m = b - 1;
        t.prompt = `Bevisa med induktion att ${m} delar ${b}ⁿ−1 för alla heltal n ≥ 1.`;
        f("Basfall: " + b + "¹−1", b - 1);
        f("Rest för basfallet modulo " + m, 0);
        t.solution = [
          `Basfall: ${b}−1=${m}, delbart med ${m}.`,
          `Antag att ${b}^k−1 är delbart med ${m}.`,
          `${b}^(k+1)−1 = ${b}(${b}^k−1)+(${b}−1). Båda termerna är delbara med ${m}.`,
          `Påståendet gäller därför för alla n≥1.`,
        ];
        t.hint = "Skriv nästa potens minus ett som b(b^k−1)+(b−1).";
      }
      if (type === "contradiction") {
        t.prompt =
          "Bevisa med motsägelse att √2 är irrationellt. Anta att √2=p/q i förkortad form med positiva heltal p och q. Skriv ett sammanhängande bevis i dina mellanled.";
        f("I p² = c·q²: bestäm c", 2);
        f("Om p=2r blir q² = d·r²: bestäm d", 2);
        t.solution = [
          "Antag att √2=p/q i förkortad form. Då p²=2q².",
          "p² är jämnt, så p är jämnt. Sätt p=2r. Då 4r²=2q² och q²=2r².",
          "Alltså är även q jämnt. Då är både p och q delbara med 2, i motsägelse med att bråket var förkortat.",
          "Antagandet är falskt; √2 är irrationellt.",
        ];
        t.hint = "Visa att både täljare och nämnare måste vara jämna.";
      }
    }
    if (category === "differential") {
      const initial = rand(2, 9),
        k = pick([-3, -2, -1, 1, 2, 3]);
      if (type === "exponential") {
        t.prompt = `Lös y′ = ${k}y med y(0) = ${initial}. Skriv lösningen i formen y(x)=C·e^(r·x) genom att ange C och r.`;
        f("C", initial);
        f("r", k);
        t.solution = [
          `Allmän lösning: y=Ce^(${k}x). Startvillkoret ger C=${initial}.`,
          `y(x)=${initial}e^(${k}x).`,
        ];
        t.hint = "Derivatan av Ce^(kx) är kCe^(kx). Vad ger x=0?";
      }
      if (type === "linear") {
        const L = rand(2, 8),
          b = -k * L;
        t.prompt = `Lös y′ = ${k}y ${b < 0 ? "− " + -b : "+ " + b} med y(0) = ${initial}. Använd formen y(x)=L+C·e^(r·x).`;
        f("L, jämviktsvärdet", L);
        f("C", initial - L);
        f("r", k);
        t.solution = [
          `Jämvikt: 0=${k}L+(${b}), så L=${L}.`,
          `y=${L}+Ce^(${k}x). Vid x=0: ${initial}=${L}+C, alltså C=${initial - L}.`,
        ];
        t.hint = "Bestäm först den konstanta lösning där y′=0.";
      }
      if (type === "euler") {
        const h = pick([0.1, 0.2, 0.5]),
          b = rand(1, 4),
          count = level === 1 ? 2 : 3,
          values = [initial];
        for (let i = 0; i < count; i++)
          values.push(values.at(-1) + h * (k * values.at(-1) + b));
        t.prompt = `Använd Eulers metod på y′=${k}y+${b}, y(0)=${initial}, med steglängd h=${fmt(h)}. Beräkna y vid varje steg. Avrunda till tre decimaler.`;
        for (let i = 1; i <= count; i++)
          f("y vid x=" + fmt(i * h), values[i], "number", {
            tolerance: 0.00051,
          });
        t.solution = [
          `yₙ₊₁=yₙ+${fmt(h)}(${k}yₙ+${b}).`,
          ...values
            .slice(1)
            .map((v, i) => `x=${fmt((i + 1) * h)}: y≈${fmt(v)}.`),
        ];
        t.hint = "Använd lutningen vid början av varje steg, inte vid slutet.";
      }
      if (type === "secondOrder") {
        const r1 = rand(-4, -1),
          r2 = rand(1, 3),
          C1 = rand(1, 4),
          C2 = rand(1, 4),
          a = -(r1 + r2),
          b = r1 * r2;
        t.prompt = `Lös y″ + (${a})y′ + (${b})y = 0, y(0)=${C1 + C2}, y′(0)=${r1 * C1 + r2 * C2}. Använd y=C₁e^(r₁x)+C₂e^(r₂x), med r₁<r₂.`;
        f("r₁", r1);
        f("r₂", r2);
        f("C₁", C1);
        f("C₂", C2);
        t.solution = [
          `Karakteristisk ekvation: r²+(${a})r+(${b})=0, med rötter ${r1} och ${r2}.`,
          `C₁+C₂=${C1 + C2}, ${r1}C₁+${r2}C₂=${r1 * C1 + r2 * C2}. Lösning: C₁=${C1}, C₂=${C2}.`,
        ];
        t.hint =
          "Bestäm först rötterna i den karakteristiska ekvationen, sedan konstanterna från startvillkoren.";
      }
      if (type === "verify") {
        const C = rand(2, 7);
        t.prompt = `Funktionen y(x)=${C}e^(${k}x) ska uppfylla y′=a·y. Bestäm a och y(0), och motivera med derivering i dina mellanled.`;
        f("a", k);
        f("y(0)", C);
        t.solution = [
          `y′=${C * k}e^(${k}x)=${k}y, så a=${k}. Vid x=0 är y=${C}.`,
        ];
        t.hint = "Derivera funktionen och jämför med funktionen själv.";
      }
      if (type === "model") {
        const sc = pick(["tank", "cooling", "harvest"]);
        if (sc === "tank") {
          const rate = pick([5, 10, 15, 20]),
            inflow = rand(2, 8) * 10;
          t.prompt = `En tank har konstant volym. Varje minut förs ${inflow} gram salt in, samtidigt som ${rate} % av det salt som finns i tanken förs ut per minut. Låt y(t) vara saltmängden i gram. Ange a och b i modellen y′=a·y+b och dess jämviktsvärde.`;
          f("a", -rate / 100);
          f("b", inflow);
          f("Jämviktsmängd i gram", inflow / (rate / 100));
          t.solution = [
            `Förändring = inflöde − utflöde: y′=${inflow}−${fmt(rate / 100)}y.`,
            `Jämvikt: y=${inflow}/${fmt(rate / 100)}=${fmt(inflow / (rate / 100))} gram.`,
          ];
          t.hint =
            "Utflödet är proportionellt mot hur mycket salt som finns, inflödet är konstant.";
        }
        if (sc === "cooling") {
          const rate = pick([5, 10, 20]),
            room = rand(18, 24);
          t.prompt = `En kopp kaffe har temperaturen y(t) grader efter t minuter i ett rum med temperaturen ${room} °C. Varje minut minskar skillnaden mellan kaffet och rummet med ${rate} % av skillnaden. Ställ upp modellen y′=a·y+b och ange jämviktstemperaturen.`;
          f("a", -rate / 100);
          f("b", (rate / 100) * room, "number", { tolerance: 1e-4 });
          f("Jämviktstemperatur", room);
          t.solution = [
            `Förändringen är proportionell mot skillnaden: y′ = −${fmt(rate / 100)}(y − ${room}) = −${fmt(rate / 100)}y + ${fmt((rate / 100) * room)}.`,
            `Jämvikt: y′ = 0 ger y = ${room}. Kaffet närmar sig rumstemperaturen.`,
          ];
          t.hint = "Skriv förändringen som en konstant gånger (y − rumstemperaturen).";
        }
        if (sc === "harvest") {
          const grow = pick([10, 20, 25]),
            catchPer = rand(2, 8) * 10;
          t.prompt = `En fiskpopulation y(t) växer med ${grow} % per år, men ${catchPer} fiskar fångas varje år. Ställ upp modellen y′=a·y+b och ange den populationsstorlek där populationen varken ökar eller minskar.`;
          f("a", grow / 100);
          f("b", -catchPer);
          f("Jämviktspopulation", catchPer / (grow / 100));
          t.solution = [
            `Tillväxt minus fångst: y′ = ${fmt(grow / 100)}y − ${catchPer}.`,
            `Jämvikt: y = ${catchPer}/${fmt(grow / 100)} = ${fmt(catchPer / (grow / 100))}. Över detta växer populationen, under minskar den.`,
          ];
          t.hint = "Tillväxten är proportionell mot populationen, fångsten är konstant.";
        }
      }
    }
    if (category === "calculus") {
      if (type === "productDerivative") {
        const p = rand(2, 4),
          k = rand(1, 3),
          fam = pick(["exp", "ln", "sin", "cos"]);
        if (fam === "exp") {
          t.prompt = `f(x)=x^${p}·e^(${k}x). Derivatan skrivs f′(x)=e^(${k}x)·(A·x^${p - 1}+B·x^${p}). Ange A och B.`;
          f("A", p);
          f("B", k);
          t.solution = [
            `Produktregeln: f′=${p}x^${p - 1}e^(${k}x)+${k}x^${p}e^(${k}x).`,
          ];
        }
        if (fam === "ln") {
          t.prompt = `f(x)=x^${p}·ln x för x > 0. Derivatan skrivs f′(x)=x^${p - 1}·(A·ln x+B). Ange A och B.`;
          f("A", p);
          f("B", 1);
          t.solution = [
            `Produktregeln: f′=${p}x^${p - 1}·ln x + x^${p}·(1/x) = x^${p - 1}(${p}·ln x + 1).`,
          ];
        }
        if (fam === "sin") {
          t.prompt = `f(x)=x^${p}·sin(${k}x). Derivatan skrivs f′(x)=x^${p - 1}·(A·sin(${k}x)+B·x·cos(${k}x)). Ange A och B.`;
          f("A", p);
          f("B", k);
          t.solution = [
            `Produktregeln och kedjeregeln: f′=${p}x^${p - 1}sin(${k}x)+x^${p}·${k}cos(${k}x).`,
          ];
        }
        if (fam === "cos") {
          t.prompt = `f(x)=x^${p}·cos(${k}x). Derivatan skrivs f′(x)=x^${p - 1}·(A·cos(${k}x)+B·x·sin(${k}x)). Ange A och B.`;
          f("A", p);
          f("B", -k);
          t.solution = [
            `Produktregeln och kedjeregeln: f′=${p}x^${p - 1}cos(${k}x)+x^${p}·(−${k}sin(${k}x)).`,
          ];
        }
        t.hint = "Derivera en faktor i taget och behåll den andra. Glöm inte kedjeregeln för den inre funktionen.";
      }
      if (type === "integration") {
        const k = rand(1, 4);
        t.prompt = `En primitiv funktion till x·e^(${k}x) kan skrivas F(x)=e^(${k}x)·(A·x+B)+C. Ange A och B.`;
        f("A", 1 / k);
        f("B", -1 / (k * k));
        t.solution = [
          `Välj u=x och v′=e^(${k}x). Då u′=1 och v=e^(${k}x)/${k}.`,
          `∫x·e^(${k}x)dx = x·e^(${k}x)/${k} − e^(${k}x)/${k * k}+C.`,
        ];
        t.hint = "Låt x vara faktorn som deriveras i partiell integration.";
      }
      if (type === "area") {
        const fam = level >= 3 ? pick(["lin", "cubic", "parab"]) : "lin";
        if (fam === "lin") {
          const a = rand(1, 4),
            b = rand(1, 5);
          t.prompt = `För f(x)=x på intervallet [−${a}, ${b}]: bestäm den bestämda integralen och den geometriska arean mellan grafen och x-axeln.`;
          f("Bestämd integral", (b * b - a * a) / 2);
          f("Geometrisk area", (a * a + b * b) / 2);
          t.solution = [
            `Integralen är [x²/2] från −${a} till ${b}: (${b * b}−${a * a})/2=${fmt((b * b - a * a) / 2)}.`,
            `Arean är summan av två triangelareor: (${a * a}+${b * b})/2=${fmt((a * a + b * b) / 2)}.`,
          ];
        }
        if (fam === "cubic") {
          const a = rand(1, 3),
            b = rand(1, 3);
          t.prompt = `För f(x)=x³ på intervallet [−${a}, ${b}]: bestäm den bestämda integralen och den geometriska arean mellan grafen och x-axeln.`;
          f("Bestämd integral", (b ** 4 - a ** 4) / 4);
          f("Geometrisk area", (a ** 4 + b ** 4) / 4);
          t.solution = [
            `Integralen är [x⁴/4] från −${a} till ${b}: (${b ** 4}−${a ** 4})/4=${fmt((b ** 4 - a ** 4) / 4)}.`,
            `Grafen ligger under x-axeln för x<0 och över för x>0. Arean är (${a ** 4}+${b ** 4})/4=${fmt((a ** 4 + b ** 4) / 4)}.`,
          ];
        }
        if (fam === "parab") {
          const s = rand(2, 6);
          t.prompt = `Grafen till f(x)=x(x−${s}) skär x-axeln i x=0 och x=${s}. Bestäm den bestämda integralen från 0 till ${s} och den geometriska arean mellan grafen och x-axeln.`;
          f("Bestämd integral", -(s ** 3) / 6, "number", { tolerance: 0.006 });
          f("Geometrisk area", s ** 3 / 6, "number", { tolerance: 0.006 });
          t.solution = [
            `∫(x²−${s}x)dx=[x³/3−${fmt(s / 2)}x²] från 0 till ${s} = ${s ** 3}/3 − ${s ** 3}/2 = −${s ** 3}/6.`,
            `Grafen ligger under x-axeln mellan nollställena, så arean är ${s ** 3}/6.`,
          ];
        }
        t.hint =
          "Integralen räknar området under x-axeln negativt. Geometrisk area är alltid positiv.";
      }
    }
    if (category === "graphs") {
      const n = rand(4, level >= 4 ? 10 : 7);
      if (type === "degrees") {
        const degrees = range(n).map(() => 0),
          edges = [];
        for (let i = 0; i < n; i++)
          for (let j = i + 1; j < n; j++)
            if (Math.random() < 0.5) {
              degrees[i]++;
              degrees[j]++;
              edges.push([i, j]);
            }
        t.prompt = `En oriktad graf har nodgraderna ${degrees.join(", ")}. Hur många kanter finns?`;
        f("Antal kanter", edges.length);
        t.solution = [
          `Handskakningslemmat: summa grader=${degrees.reduce((a, b) => a + b, 0)}=2·antal kanter. Antal kanter=${edges.length}.`,
        ];
        t.hint = "Varje kant bidrar till graden hos två noder.";
      }
      if (type === "complete") {
        t.prompt = `En komplett oriktad graf K${n} har ${n} noder och en kant mellan varje par av olika noder. Ange antal kanter och graden hos varje nod.`;
        f("Antal kanter", choose(n, 2));
        f("Grad per nod", n - 1);
        t.solution = [
          `Antal kanter=C(${n},2)=${choose(n, 2)}. Varje nod är kopplad till ${n - 1} andra.`,
        ];
        t.hint = "Varje kant motsvarar ett oordnat par av noder.";
      }
      if (type === "trees") {
        t.prompt = `Ett träd är en sammanhängande graf utan cykler. Hur många kanter har ett träd med ${n} noder?`;
        f("Antal kanter", n - 1);
        t.solution = [`Ett träd med n noder har n−1 kanter. Här: ${n - 1}.`];
        t.hint =
          "Börja med en nod. Varje ny nod måste kopplas in med en ny kant.";
      }
      if (type === "shortest") {
        const ab = rand(2, 8),
          ac = rand(2, 8),
          bc = rand(1, 5),
          bd = rand(2, 8),
          cd = rand(2, 8);
        const edges = [
            ["A", "B", ab],
            ["A", "C", ac],
            ["B", "C", bc],
            ["B", "D", bd],
            ["C", "D", cd],
          ],
          routes = [
            ["A–B–D", ab + bd],
            ["A–C–D", ac + cd],
            ["A–B–C–D", ab + bc + cd],
            ["A–C–B–D", ac + bc + bd],
          ].sort((a, b) => a[1] - b[1]);
        t.prompt =
          "Bestäm längden på den kortaste vägen från A till D i den oriktade grafen.";
        t.context = edges.map(([a, b, w]) => `${a}–${b}: ${w}`);
        t.graph = { nodes: ["A", "B", "C", "D"], edges };
        f("Kortaste längd", routes[0][1]);
        t.solution = [
          ...routes.map(([route, length]) => `${route}: ${length}.`),
          `Minsta längden är ${routes[0][1]}.`,
        ];
        t.hint =
          "Jämför möjliga vägar. Alla vikter är positiva, så en kortaste väg behöver inte återbesöka en nod.";
      }
      if (type === "euler") {
        const kind = rand(0, 2),
          degrees =
            kind === 0
              ? [2, 2, 2, 2]
              : kind === 1
                ? [1, 2, 2, 1]
                : [3, 3, 3, 3];
        t.prompt = `En sammanhängande oriktad graf har nodgraderna ${degrees.join(", ")}. Ange 2 om den har Eulerkrets, 1 om den endast har en öppen Eulerväg och 0 om ingen Eulerväg finns.`;
        f("0, 1 eller 2", kind === 0 ? 2 : kind === 1 ? 1 : 0);
        t.solution = [
          `Antalet udda grader är ${degrees.filter((x) => x % 2).length}. Noll udda ger krets, två ger en öppen väg, fler än två innebär ingen Eulerväg.`,
        ];
        t.hint = "Räkna antalet noder med udda grad.";
      }
    }
    if (level === 1 && category === "sequences" && type === "arithmetic") {
      const a = rand(1, 5),
        d = rand(1, 3);
      t.prompt = `Talföljden börjar ${a}, ${a + d}, ${a + 2 * d}. Den ökar lika mycket varje gång. Vilket tal kommer härnäst?`;
      t.fields = [field("Nästa tal", a + 3 * d)];
      t.solution = [
        `Skillnaden är ${d}. Lägg till ${d} till ${a + 2 * d}: ${a + 3 * d}.`,
      ];
      t.hint = "Jämför två tal som står intill varandra.";
    }
    if (level === 1 && category === "proofs" && type === "sum") {
      t.prompt =
        "Förbered ett induktionsbevis för 1+2+…+n=n(n+1)/2. Kontrollera basfallet n=1 och prova även n=2. Skriv varför basfallet är ett första steg i dina mellanled.";
      t.fields = [
        field("Båda sidornas värde när n=1", 1),
        field("Båda sidornas värde när n=2", 3),
      ];
      t.solution = [
        "När n=1: vänsterledet är 1 och högerledet är 1·2/2=1.",
        "När n=2: vänsterledet är 1+2=3 och högerledet är 2·3/2=3.",
        "Två exempel är inte ett fullständigt bevis. Därefter behövs ett antagande för k och ett induktionssteg till k+1.",
      ];
    }
    if (level === 1 && category === "differential" && type === "verify") {
      const C = rand(2, 4);
      t.prompt = `y(x)=${C}e^x. Derivatan är y′(x)=${C}e^x. Bestäm a i y′=a·y och startvärdet y(0).`;
      t.fields = [field("a", 1), field("y(0)", C)];
      t.solution = [
        "Derivatan är samma som funktionen, så a=1.",
        `Eftersom e⁰=1 blir y(0)=${C}.`,
      ];
      t.hint = "Jämför uttrycken för y och y′. Sätt sedan x=0.";
    }
    if (level === 1 && category === "calculus" && type === "area") {
      const b = rand(2, 4);
      t.prompt = `Grafen y=x och x-axeln bildar en rätvinklig triangel på intervallet 0 ≤ x ≤ ${b}. Basen och höjden är ${b}. Bestäm arean.`;
      t.fields = [field("Area", (b * b) / 2)];
      t.solution = [
        `Triangelns area = bas · höjd / 2 = ${b} · ${b} / 2 = ${fmt((b * b) / 2)}.`,
      ];
      t.hint = "Börja med en vanlig areaformel; integraler ger samma resultat.";
    }
    // The highest levels add linked reasoning rather than only larger numbers.
    if (
      level >= 4 &&
      category === "sets" &&
      [
        "union",
        "intersection",
        "difference",
        "complement",
        "demorgan",
      ].includes(type)
    ) {
      const { u, a, b } = t.setData,
        c = u.filter(() => Math.random() < 0.45);
      t.context.push("C = " + setText(c));
      const answer =
        level === 4
          ? u.filter((x) => (a.includes(x) || b.includes(x)) && c.includes(x))
          : u.filter(
              (x) => !((a.includes(x) && b.includes(x)) || c.includes(x)),
            );
      const expr = level === 4 ? "(A ∪ B) ∩ C" : "((A ∩ B) ∪ C)ᶜ";
      t.prompt += " Bestäm också " + expr + ".";
      f(expr, answer, "set");
      t.solution.push(
        expr + " = " + setText(answer) + ". Räkna den inre parentesen först.",
      );
      t.hint = "Ta en parentes i taget; komplementet beräknas sist.";
    }
    if (level >= 4 && category === "combinatorics" && type === "combination") {
      const n = rand(7, 12),
        k = rand(3, 5),
        groups = choose(n, k);
      t.prompt = `Välj ${k} av ${n} personer till en grupp. Välj därefter en ordförande bland gruppens medlemmar. Hur många grupper och hur många grupper med utsedd ordförande finns?`;
      t.fields = [
        field("Antal grupper", groups),
        field("Grupper med ordförande", groups * k),
      ];
      t.solution = [
        `C(${n},${k}) = ${groups} grupper.`,
        `${k} möjliga ordförande för varje grupp: ${groups} · ${k} = ${groups * k}.`,
      ];
      t.hint = "Räkna gruppen först, sedan rollen inom varje grupp.";
    }
    if (level === 5 && category === "combinatorics" && type === "restricted") {
      const a = rand(4, 7),
        b = rand(4, 7),
        k = rand(3, 5),
        total = choose(a + b, k),
        none = choose(b, k),
        exact = choose(a, 2) * choose(b, k - 2);
      t.prompt = `Välj ${k} personer bland ${a} från A och ${b} från B. Bestäm antalet grupper med minst en från A och antalet med exakt två från A. I det senare fallet utses även en av de två från A till ordförande.`;
      t.fields = [
        field("Grupper med minst en från A", total - none),
        field("Exakt två från A, med ordförande", exact * 2),
      ];
      t.solution = [
        `Alla grupper minus grupper med enbart B: C(${a + b},${k})−C(${b},${k})=${total - none}.`,
        `C(${a},2) · C(${b},${k - 2}) · 2 = ${exact * 2}.`,
      ];
      t.hint =
        "Använd komplement för minst en. För exakt två räknar du urval från varje klass och sedan ordföranden.";
    }
    if (
      level === 5 &&
      category === "congruence" &&
      ["equation", "inverse"].includes(type)
    ) {
      const p = pick([5, 7]),
        q = pick([3, 11]),
        a = rand(0, p - 1),
        b = rand(0, q - 1),
        answer = range(p * q)
          .map((x) => x - 1)
          .find((x) => mod(x, p) === a && mod(x, q) === b);
      t.prompt = `Bestäm minsta icke-negativa heltalet x som uppfyller både x ≡ ${a} (mod ${p}) och x ≡ ${b} (mod ${q}).`;
      t.fields = [field("Minsta x", answer)];
      t.solution = [
        `Skriv x=${a}+${p}k. Sök ett k som även ger resten ${b} modulo ${q}.`,
        `Lösningen i intervallet 0 ≤ x < ${p * q} är ${answer}.`,
      ];
      t.hint =
        "Lista tal i den första restklassen och undersök den andra kongruensen.";
    }
    if (level === 5 && category === "bases" && type === "between") {
      const base = pick([2, 8, 16]),
        a = rand(25, 100),
        b = rand(15, 90);
      t.prompt = `Två tal är skrivna i bas ${base}: ${a.toString(base).toUpperCase()} och ${b.toString(base).toUpperCase()}. Addera dem och ange summan både i bas tio och i bas ${base}.`;
      t.fields = [
        field("Summa i bas tio", a + b),
        field(
          "Summa i bas " + base,
          (a + b).toString(base).toUpperCase(),
          "digits",
        ),
      ];
      t.solution = [
        `Talen är ${a} och ${b} i bas tio. Summan är ${a + b}.`,
        `${a + b} i bas tio blir ${(a + b).toString(base).toUpperCase()} i bas ${base}.`,
      ];
      t.hint = "Omvandla till bas tio, addera, och omvandla tillbaka.";
    }
    if (level === 5 && category === "sequences" && type === "recurrence") {
      const a = rand(2, 5),
        q = rand(2, 3),
        b = rand(1, 5),
        n = rand(4, 7),
        values = [a];
      for (let i = 1; i < n; i++) values.push(q * values.at(-1) + b);
      const D = -b / (q - 1),
        A = a - D;
      t.prompt = `a₁=${a}, aₙ₊₁=${q}aₙ+${b}. En explicit formel är aₙ=A·${q}^(n−1)+D. Bestäm A, D och a${n}.`;
      t.fields = [field("A", A), field("D", D), field("a" + n, values.at(-1))];
      t.solution = [
        `Den konstanta termen måste uppfylla D=${q}D+${b}, så D=${fmt(D)}.`,
        `Startvärdet ger A+D=${a}, alltså A=${fmt(A)}.`,
        `a${n}=${fmt(A)} · ${q}^${n - 1}+(${fmt(D)})=${values.at(-1)}.`,
      ];
      t.hint =
        "Bestäm en konstant jämviktslösning D och använd sedan startvärdet.";
    }
    if (level === 5 && category === "proofs" && type === "sum") {
      t.title = "Induktion · kvadratsummor";
      t.prompt =
        "Bevisa med induktion att 1²+2²+…+n²=n(n+1)(2n+1)/6 för alla n≥1. Skriv basfall, antagande, induktionssteg och slutsats i dina mellanled. Fyll kontrollpunkterna.";
      t.fields = [
        field("Basfall n=1: båda sidornas värde", 1),
        field("Nästa term när k=4", 25),
        field("Summan när n=5", 55),
      ];
      t.solution = [
        "Basfall: 1=1·2·3/6.",
        "Antag formeln för k. Lägg till (k+1)².",
        "k(k+1)(2k+1)/6+(k+1)²=(k+1)[k(2k+1)+6(k+1)]/6.",
        "Faktorisera 2k²+7k+6=(k+2)(2k+3). Resultatet är (k+1)(k+2)(2k+3)/6.",
        "Det är formeln för k+1; induktionen är klar.",
      ];
      t.hint =
        "Bryt ut k+1 ur båda termerna och faktorisera polynomet som återstår.";
    }
    if (level === 5 && category === "differential" && type === "secondOrder") {
      const r = pick([-3, -2, -1, 1, 2]),
        A = rand(2, 6),
        B = rand(1, 4),
        initialDerivative = B + r * A;
      t.prompt = `Lös y″ + (${-2 * r})y′ + (${r * r})y=0, y(0)=${A}, y′(0)=${initialDerivative}. Använd formen y=(A+Bx)e^(rx).`;
      t.fields = [field("r", r), field("A", A), field("B", B)];
      t.solution = [
        `Karakteristisk ekvation: (r−(${r}))²=0. En dubbelrot ger y=(A+Bx)e^(${r}x).`,
        `y(0)=A=${A}. Derivatan i noll är B+${r}A=${initialDerivative}, så B=${B}.`,
      ];
      t.hint =
        "Vid dubbelrot behövs både e^(rx) och x·e^(rx). Använd startvillkoren.";
    }
    if (level >= 4 && category === "calculus" && type === "integration") {
      const k = rand(1, 3),
        fam = level === 4 ? pick(["exp", "cos", "sin", "ln"]) : pick(["exp3", "cos2", "ln2"]);
      if (fam === "exp" || fam === "exp3") {
        const p = fam === "exp" ? 2 : 3;
        const A = 1 / k,
          B = -p / (k * k),
          D = (p * (p - 1)) / k ** 3,
          G = (-p * (p - 1) * (p - 2)) / k ** 4;
        t.prompt = `Bestäm en primitiv funktion till x^${p}·e^(${k}x). Skriv F=e^(${k}x)·(A·x^${p}+B·x^${p - 1}+D${p === 3 ? "·x+G" : ""})+C och ange koefficienterna.`;
        t.fields = [field("A", A), field("B", B), field("D", D)];
        if (p === 3) t.fields.push(field("G", G));
        t.solution = [
          `Använd partiell integration ${p} gånger; graden på polynomet minskar varje gång.`,
          `A=${fmt(A)}, B=${fmt(B)}, D=${fmt(D)}${p === 3 ? ", G=" + fmt(G) : ""}.`,
          `Verifiera genom att derivera: polynomet P måste uppfylla P′+${k}P=x^${p}.`,
        ];
        t.hint = "Välj polynomet som u. Alternativt jämför koefficienter i P′+kP=x^p.";
      }
      if (fam === "cos") {
        t.prompt = `Bestäm en primitiv funktion till x·cos(${k}x). Skriv F=A·x·sin(${k}x)+B·cos(${k}x)+C och ange A och B.`;
        t.fields = [field("A", 1 / k), field("B", 1 / (k * k))];
        t.solution = [
          `Partiell integration med u=x och v′=cos(${k}x): v=sin(${k}x)/${k}.`,
          `∫x·cos(${k}x)dx = x·sin(${k}x)/${k} − ∫sin(${k}x)/${k} dx = x·sin(${k}x)/${k} + cos(${k}x)/${k * k} + C.`,
        ];
        t.hint = "Låt x vara u och derivera den. Då försvinner x i nästa integral.";
      }
      if (fam === "sin") {
        t.prompt = `Bestäm en primitiv funktion till x·sin(${k}x). Skriv F=A·x·cos(${k}x)+B·sin(${k}x)+C och ange A och B.`;
        t.fields = [field("A", -1 / k), field("B", 1 / (k * k))];
        t.solution = [
          `Partiell integration med u=x och v′=sin(${k}x): v=−cos(${k}x)/${k}.`,
          `∫x·sin(${k}x)dx = −x·cos(${k}x)/${k} + ∫cos(${k}x)/${k} dx = −x·cos(${k}x)/${k} + sin(${k}x)/${k * k} + C.`,
        ];
        t.hint = "Låt x vara u. Primitiv funktion till sin(kx) är −cos(kx)/k.";
      }
      if (fam === "ln") {
        const m = rand(1, 3);
        t.prompt = `Bestäm en primitiv funktion till x^${m}·ln x för x > 0. Skriv F=x^${m + 1}·(A·ln x+B)+C och ange A och B.`;
        t.fields = [field("A", 1 / (m + 1)), field("B", -1 / (m + 1) ** 2)];
        t.solution = [
          `Partiell integration med u=ln x och v′=x^${m}: v=x^${m + 1}/${m + 1}.`,
          `∫x^${m}·ln x dx = x^${m + 1}·ln x/${m + 1} − ∫x^${m}/${m + 1} dx = x^${m + 1}(ln x/${m + 1} − 1/${(m + 1) ** 2}) + C.`,
        ];
        t.hint = "Här är det ln x som ska deriveras (u), eftersom den primitiva funktionen till ln x är besvärlig.";
      }
      if (fam === "cos2") {
        t.prompt = `Bestäm en primitiv funktion till x²·cos(${k}x). Skriv F=A·x²·sin(${k}x)+B·x·cos(${k}x)+D·sin(${k}x)+C och ange A, B och D.`;
        t.fields = [field("A", 1 / k), field("B", 2 / (k * k)), field("D", -2 / k ** 3)];
        t.solution = [
          `Partiell integration två gånger: först med u=x², sedan med u=x.`,
          `F = x²·sin(${k}x)/${k} + 2x·cos(${k}x)/${k * k} − 2·sin(${k}x)/${k ** 3} + C.`,
          `Kontrollera genom att derivera F.`,
        ];
        t.hint = "Upprepa partiell integration: graden på polynomet minskar med ett varje gång.";
      }
      if (fam === "ln2") {
        const m = rand(1, 3);
        t.prompt = `Bestäm en primitiv funktion till x^${m}·(ln x)². Skriv F=x^${m + 1}·(A·(ln x)²+B·ln x+D)+C och ange A, B och D.`;
        const q = m + 1;
        t.fields = [field("A", 1 / q), field("B", -2 / (q * q)), field("D", 2 / q ** 3)];
        t.solution = [
          `Partiell integration med u=(ln x)² och v′=x^${m}: v=x^${q}/${q}.`,
          `∫x^${m}(ln x)²dx = x^${q}(ln x)²/${q} − (2/${q})∫x^${m}·ln x dx. Den sista integralen löses med partiell integration igen.`,
          `F = x^${q}·((ln x)²/${q} − 2·ln x/${q * q} + 2/${q ** 3}) + C.`,
        ];
        t.hint = "Partiell integration två gånger: derivera ln-faktorn varje gång.";
      }
    }
    if (level === 5 && category === "graphs" && type === "shortest") {
      const distance = t.fields[0].answer,
        ac = t.graph.edges.find(([a, b]) => a === "A" && b === "C")[2],
        bc = t.graph.edges.find(([a, b]) => a === "B" && b === "C")[2],
        bd = t.graph.edges.find(([a, b]) => a === "B" && b === "D")[2],
        cd = t.graph.edges.find(([a, b]) => a === "C" && b === "D")[2],
        newDistance = Math.min(ac + cd, ac + bc + bd);
      t.prompt += " Bestäm också den kortaste längden om kanten A–B stängs.";
      f("Kortaste längd utan A–B", newDistance);
      t.solution.push(
        `Utan A–B återstår A–C–D (${ac + cd}) eller A–C–B–D (${ac + bc + bd}). Minsta längden är ${newDistance}.`,
      );
    }

    if (level === 5 && category === "sequences" && type === "sum") {
      const a = rand(1, 4),
        q = rand(2, 3),
        n = rand(3, 5);
      const total = (a * (q ** (2 * n) - 1)) / (q - 1),
        odd = (a * (q ** (2 * n) - 1)) / (q * q - 1);
      t.prompt = `aₙ=${a}·${q}^(n−1). Bestäm summan av de första ${2 * n} termerna, och summan a₁+a₃+…+a${2 * n - 1}.`;
      t.fields = [
        field("Alla första " + 2 * n + " termer", total),
        field("Termer med udda index", odd),
      ];
      t.solution = [
        `Hela summan: ${a}(${q}^${2 * n}−1)/(${q}−1)=${total}.`,
        `Termerna med udda index bildar en geometrisk följd med kvot ${q * q} och ${n} termer: summan blir ${odd}.`,
      ];
      t.hint =
        "Den andra summan hoppar över varannan term. Vilken kvot får den följden?";
    }
    if (level === 5 && category === "proofs" && type === "contradiction") {
      const p = pick([3, 5, 7]);
      t.prompt = `Bevisa med motsägelse att √${p} är irrationellt. Anta √${p}=a/b i förkortad form, med positiva heltal a,b. Använd att om ett primtal delar a² så delar det a. Fyll kontrollpunkterna och skriv beviset i dina mellanled.`;
      t.fields = [
        field("I a²=c·b²: c", p),
        field("Om a=" + p + "r blir b²=d·r²: d", p),
      ];
      t.solution = [
        `Antag √${p}=a/b i förkortad form. Då a²=${p}b².`,
        `${p} delar a² och därmed a. Sätt a=${p}r. Då b²=${p}r².`,
        `${p} delar därför också b. Det strider mot att bråket är förkortat. √${p} är irrationellt.`,
      ];
      t.hint = "Visa att samma primtal måste dela både täljare och nämnare.";
    }

    return t;
  }

  root.Math5EngineGenerators = { populateTask };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { populateTask };
  }
})();
