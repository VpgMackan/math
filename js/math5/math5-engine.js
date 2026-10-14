(() => {
  "use strict";

  const root = typeof window !== "undefined" ? window : globalThis;
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick = (a) => a[rand(0, a.length - 1)];
  const factorial = (n) => {
    let v = 1;
    for (let i = 2; i <= n; i++) v *= i;
    return v;
  };
  const choose = (n, k) => {
    if (k < 0 || k > n) return 0;
    k = Math.min(k, n - k);
    let v = 1;
    for (let i = 1; i <= k; i++) v = (v * (n - k + i)) / i;
    return Math.round(v);
  };
  const mod = (a, m) => ((a % m) + m) % m;
  const fmt = (n) =>
    Number.isInteger(n)
      ? String(n)
      : Number(n.toFixed(6)).toString().replace(".", ",");
  const setText = (a) => "{" + a.join(", ") + "}",
    range = (n) => Array.from({ length: n }, (_, i) => i + 1);
  const categories = {
    combinatorics: {
      title: "Kombinatorik",
      desc: "Ordning, urval och antal",
      rule: "Produktprincipen: multiplicera antalet val i varje steg. Ordning utan återläggning: n!/(n−k)!. Urval utan ordning: C(n,k) = n!/[k!(n−k)!]. Med upprepade identiska objekt: n!/(a!b!…).",
      types: {
        product: "Produktprincipen",
        permutation: "Permutationer",
        combination: "Kombinationer",
        repeated: "Identiska objekt",
        binomial: "Binomialsatsen",
        restricted: "Urval med villkor",
      },
    },
    sets: {
      title: "Mängdlära",
      desc: "Union, snitt och komplement",
      rule: "A ∪ B: finns i minst en mängd. A ∩ B: finns i båda. A ∖ B: finns i A men inte B. Aᶜ = U ∖ A. |A ∪ B| = |A| + |B| − |A ∩ B|. En mängd med n element har 2ⁿ delmängder.",
      types: {
        union: "Union",
        intersection: "Snitt",
        difference: "Differens",
        complement: "Komplement",
        demorgan: "De Morgans lag",
        cardinality: "Antal element",
        subsets: "Delmängder",
      },
    },
    congruence: {
      title: "Kongruens",
      desc: "Rester och modulär räkning",
      rule: "a ≡ b (mod m) betyder att m delar a−b. Rester kan reduceras efter addition och multiplikation. En invers till a modulo m finns om största gemensamma delaren av a och m är 1.",
      types: {
        remainder: "Rester",
        power: "Potenser modulo m",
        equation: "Kongruensekvationer",
        inverse: "Multiplikativ invers",
      },
    },
    bases: {
      title: "Talbaser",
      desc: "Positionssystem och omvandling",
      rule: "I bas b är platsvärdena 1, b, b², b³, … från höger. Till bas tio: summera siffra × platsvärde. Från bas tio: dividera upprepade gånger med b och läs resterna baklänges. I bas 16 står A–F för 10–15.",
      types: {
        toDecimal: "Till bas tio",
        fromDecimal: "Från bas tio",
        between: "Mellan talbaser",
      },
    },
    sequences: {
      title: "Talföljder och rekursion",
      desc: "Nästa term och generella samband",
      rule: "Aritmetisk: aₙ = a₁+(n−1)d. Geometrisk: aₙ = a₁qⁿ⁻¹. En rekursion beskriver nästa term med tidigare termer; använd startvärdet och upprepa regeln. Geometrisk summa: a₁(qⁿ−1)/(q−1) för q ≠ 1.",
      types: {
        arithmetic: "Aritmetiska talföljder",
        geometric: "Geometriska talföljder",
        recurrence: "Linjära rekursioner",
        second: "Två tidigare termer",
        sum: "Geometriska summor",
      },
    },
    proofs: {
      title: "Induktion och bevis",
      desc: "Basfall, antagande och induktionssteg",
      rule: "Induktion: 1. Visa basfallet. 2. Anta påståendet för n=k. 3. Visa det för n=k+1 med hjälp av antagandet. 4. Dra slutsatsen. Ett motsägelsebevis antar att påståendet är falskt och härleder en motsägelse.",
      types: {
        sum: "Summan av heltal",
        odd: "Summan av udda tal",
        divisibility: "Delbarhet med induktion",
        contradiction: "Motsägelsebevis",
      },
    },
    differential: {
      title: "Differentialekvationer",
      desc: "Lösningar, modeller och Euler",
      rule: "y′=ky ger y=Ce^(kx). y′=ky+b har jämviktsvärdet L=−b/k och lösningen y=L+Ce^(kx), när k ≠ 0. Euler: yₙ₊₁=yₙ+h·f(xₙ,yₙ). För y″+ay′+by=0 används r²+ar+b=0.",
      types: {
        exponential: "Exponentiell förändring",
        linear: "Första ordningen",
        euler: "Eulers metod",
        secondOrder: "Andra ordningen",
        verify: "Verifiera en lösning",
        model: "Ställ upp en modell",
      },
    },
    calculus: {
      title: "Derivata och integraler",
      desc: "Fördjupning och tillämpning",
      rule: "Produktregeln: (fg)′=f′g+fg′. Partiell integration: ∫u·v′ dx = uv−∫u′·v dx. En bestämd integral ger nettot av positiva och negativa bidrag. En geometrisk area beräknas med |f(x)|.",
      types: {
        productDerivative: "Produktregeln",
        integration: "Partiell integration",
        area: "Area och tecken",
      },
    },
    graphs: {
      title: "Grafteori · extra",
      desc: "Grader, vägar och träd",
      rule: "Summan av nodgraderna är dubbelt så stor som antalet kanter. Ett träd med n noder har n−1 kanter. En sammanhängande graf har en Eulerkrets om alla grader är jämna, och en öppen Eulerväg om exakt två är udda.",
      types: {
        degrees: "Nodgrader",
        complete: "Kompletta grafer",
        trees: "Träd",
        shortest: "Kortaste väg",
        euler: "Eulerväg och Eulerkrets",
      },
    },
  };
  const field = (label, answer, type = "number", extra = {}) => ({
    label,
    answer,
    type,
    ...extra,
  });
  const levels = {
    1: {
      name: "Nybörjare",
      description: "Små tal och ett tydligt första steg. Ta hjälp av exemplet.",
    },
    2: {
      name: "Grund",
      description: "En metod i taget. Öva tills begreppen känns bekanta.",
    },
    3: {
      name: "Fortsättning",
      description: "Flera beräkningar och fler typer av uppgifter.",
    },
    4: {
      name: "Utmaning",
      description: "Kombinera metoder och hantera extra villkor.",
    },
    5: {
      name: "Fördjupning",
      description: "Sammansatta problem och större krav på eget resonemang.",
    },
  };
  const minimum = {
    combinatorics: {
      product: 1,
      combination: 2,
      permutation: 2,
      repeated: 3,
      binomial: 3,
      restricted: 4,
    },
    sets: {
      union: 1,
      intersection: 1,
      difference: 2,
      complement: 2,
      cardinality: 3,
      subsets: 3,
      demorgan: 4,
    },
    congruence: { remainder: 1, power: 2, equation: 3, inverse: 4 },
    bases: { toDecimal: 1, fromDecimal: 2, between: 3 },
    sequences: {
      arithmetic: 1,
      geometric: 2,
      recurrence: 3,
      second: 3,
      sum: 4,
    },
    proofs: { sum: 1, odd: 2, divisibility: 3, contradiction: 4 },
    differential: {
      verify: 1,
      exponential: 2,
      linear: 3,
      euler: 3,
      model: 3,
      secondOrder: 4,
    },
    calculus: { area: 1, productDerivative: 2, integration: 4 },
    graphs: { degrees: 1, trees: 1, complete: 2, euler: 3, shortest: 4 },
  };
  function availableTypes(category, level) {
    const all = Object.keys(categories[category].types).filter(
      (type) => (minimum[category][type] || 1) <= level,
    );
    if (level === 5) {
      const top = Math.max(...all.map((type) => minimum[category][type] || 1));
      return all.filter((type) => (minimum[category][type] || 1) === top);
    }
    return all;
  }
  function generate(category, type, level = 2) {
    const cat = categories[category];
    if (!cat) throw Error("Okänt område");
    level = Math.max(1, Math.min(5, Number(level) || 1));
    if (!type || type === "mixed") type = pick(availableTypes(category, level));
    if (!(type in cat.types)) throw Error("Okänd övning");

    const t = {
      category,
      type,
      level,
      title: cat.types[type],
      prompt: "",
      fields: [],
      solution: [],
      hint: "",
      context: [],
      reasoning: false,
    };

    const helpers = {
      t,
      category,
      type,
      level,
      rand,
      pick,
      factorial,
      choose,
      mod,
      fmt,
      setText,
      range,
      field,
    };

    if (!root.Math5EngineGenerators?.populateTask)
      throw Error("Math5EngineGenerators saknas.");

    return root.Math5EngineGenerators.populateTask(helpers);
  }
  function parseNumber(raw) {
    const s = String(raw).trim().replaceAll("−", "-").replace(",", ".");
    if (/^[+-]?\d+(?:\.\d+)?\s*\/\s*[+-]?\d+(?:\.\d+)?$/.test(s)) {
      const [a, b] = s.split("/").map(Number);
      if (b === 0) throw Error("Nämnaren får inte vara noll.");
      const v = a / b;
      if (!Number.isFinite(v)) throw Error("Talet är för stort.");
      return v;
    }
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(s))
      throw Error(
        "Skriv ett tal, decimal eller bråk, till exempel 0,5 eller 1/2.",
      );
    const value = Number(s);
    if (!Number.isFinite(value)) throw Error("Talet är för stort.");
    return value;
  }
  function parseSet(raw) {
    let s = String(raw).trim();
    if (s === "∅" || s === "{}") return [];
    if (!s) throw Error("Ange en mängd. Skriv ∅ för den tomma mängden.");
    if (s.startsWith("{") && s.endsWith("}")) s = s.slice(1, -1).trim();
    if (!s) return [];
    if (!/^[+−\-\d,;\s]+$/.test(s))
      throw Error(
        "Skriv heltal åtskilda med kommatecken, till exempel {1, 2, 3}.",
      );
    const tokens = s
      .replaceAll("−", "-")
      .split(/[,;\s]+/)
      .filter(Boolean);
    if (!tokens.every((x) => /^[+-]?\d+$/.test(x)))
      throw Error("Mängden ska innehålla heltal.");
    const values = tokens.map(Number);
    if (values.some((x) => !Number.isSafeInteger(x)))
      throw Error("Talet är för stort.");
    return [...new Set(values)].sort((a, b) => a - b);
  }
  function assess(task, values) {
    if (values.length !== task.fields.length)
      throw Error("Fyll i alla svarsfält.");
    return task.fields.map((f, i) => {
      if (f.type === "set")
        return (
          JSON.stringify(parseSet(values[i])) ===
          JSON.stringify([...f.answer].sort((a, b) => a - b))
        );
      if (f.type === "digits") {
        const v = String(values[i]).trim().toUpperCase();
        if (!/^[0-9A-F]+$/.test(v))
          throw Error("Skriv talets siffror utan bas eller index.");
        return v.replace(/^0+(?=.)/, "") === f.answer;
      }
      const value = parseNumber(values[i]);
      return Math.abs(value - f.answer) <= (f.tolerance ?? 1e-6);
    });
  }
  function validate(task, values) {
    task.fields.forEach((f, i) => {
      if (f.type === "set") parseSet(values[i]);
      else if (f.type === "digits") {
        if (!/^[0-9A-F]+$/i.test(String(values[i]).trim()))
          throw Error("Skriv talets siffror utan bas eller index.");
      } else parseNumber(values[i]);
    });
  }
  root.Math5Engine = {
    levels,
    minimum,
    availableTypes,
    categories,
    generate,
    assess,
    validate,
    choose,
    factorial,
    mod,
    parseSet,
    parseNumber,
    setText,
    fmt,
  };
  if (typeof module !== "undefined" && module.exports) {
    module.exports = root.Math5Engine;
  }
})();
