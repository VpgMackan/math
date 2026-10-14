(() => {
  "use strict";
  const { $ } = window.GaussShared;
  const guides = {
    gauss: {
      title: "Gausselimination, en rad i taget",
      intro:
        "En matris är en tabell med tal. Varje rad motsvarar en ekvation. Talen till höger om strecket är högerleden. Målet är ettor på diagonalen och nollor runt dem.",
      steps: [
        "Välj raden du vill ändra. Räkna ut hela den nya raden själv.",
        "En rad [2, 4 | 6] kan delas med 2 och blir [1, 2 | 3]. Högerledet måste också ändras.",
        "Skriv 1, 2 och 3 i fälten och spara eller kontrollera. Upprepa tills vänster sida är identitetsmatrisen.",
      ],
      before: "Det räcker att kunna de fyra räknesätten och enkla ekvationer.",
    },
    operations: {
      title: "Så räknar du med matriser",
      intro:
        "En matris har rader vågrätt och kolumner lodrätt. I produkten AB multipliceras en rad i A med en kolumn i B, ett elementpar i taget. Produkterna summeras.",
      steps: [
        "Exempel: raden [1, 2] och kolumnen [3, 4] ger 1·3+2·4.",
        "Räkna produkterna: 3+8=11. Det blir ett element i resultatmatrisen.",
        "Upprepa för varje rad och kolumn. Vid addition eller subtraktion arbetar du i stället med elementen på samma plats.",
      ],
      before: "Börja med små matriser och positiva heltal.",
    },
    combinatorics: {
      title: "Räkna möjligheter",
      intro:
        "Kombinatorik handlar om hur många olika val som finns. Fråga först om ordningen spelar roll och om något får väljas flera gånger.",
      steps: [
        "Exempel: 2 tröjor och 3 byxor. Varje tröja passar till 3 val av byxor.",
        "Produktprincipen ger 2·3=6 klädkombinationer.",
        "En grupp med två personer har ingen inbördes ordning. En första- och andraplats har ordning: samma personer kan ge olika resultat.",
      ],
      before: "Starta med produktprincipen. Permutationer och kombinationer kommer på nästa nivå.",
    },
    sets: {
      title: "Mängder är samlingar",
      intro:
        "En mängd innehåller element. A={1,2} betyder att A innehåller talen 1 och 2. Ordningen spelar ingen roll och varje element räknas bara en gång.",
      steps: [
        "Exempel: A={1,2} och B={2,3}.",
        "Union A ∪ B tar allt från båda: {1,2,3}. Snitt A ∩ B tar bara det gemensamma: {2}.",
        "En mängd utan element skrivs ∅ eller {}. Skriv dina egna element i svarsfältet, åtskilda med kommatecken.",
      ],
      before: "Börja med union och snitt innan differens och komplement.",
    },
    congruence: {
      title: "Kongruens handlar om rester",
      intro:
        "Modulo betyder att vi räknar med resten vid heltalsdivision. Två tal är kongruenta om de får samma rest.",
      steps: [
        "Exempel: 17=3·5+2. Resten vid division med 5 är 2.",
        "Det skrivs 17 ≡ 2 (mod 5). Svaret ska här ligga mellan 0 och 4.",
        "En klocka är ett liknande exempel: 15 och 3 visar samma timme på en 12-timmarsklocka.",
      ],
      before: "Börja med positiva heltal. Negativa rester och ekvationer kommer senare.",
    },
    bases: {
      title: "Samma tal, olika talbaser",
      intro:
        "I bas tio har platserna värdena 1, 10, 100 och så vidare. I bas två är de i stället 1, 2, 4, 8, från höger.",
      steps: [
        "Exempel: 101 i bas två har tre siffror.",
        "Platsvärdena ger 1·4+0·2+1·1=5 i bas tio.",
        "Skriv 5 i svarsfältet. Om svaret ska vara i bas två skriver du bara dess siffror, utan basindex.",
      ],
      before: "Börja med binära tal som har två eller tre siffror.",
    },
    sequences: {
      title: "Hitta regeln i talföljden",
      intro:
        "En talföljd är tal i en bestämd ordning. a₁ är första termen, a₂ är den andra. En rekursion berättar hur nästa term fås från en tidigare.",
      steps: [
        "Exempel: 2, 5, 8. Skillnaden mellan grannarna är 3.",
        "Nästa term blir 8+3=11. Regeln kan skrivas aₙ₊₁=aₙ+3.",
        "Vid multiplikation med samma tal i varje steg har du en geometrisk talföljd.",
      ],
      before: "Börja med en konstant skillnad innan flera tidigare termer behövs.",
    },
    proofs: {
      title: "Varför gäller det för alla?",
      intro:
        "Några exempel kan stödja en idé, men beviset måste förklara varför påståendet alltid gäller. Induktion liknar en rad dominobrickor.",
      steps: [
        "Basfall: visa att den första brickan faller, till exempel att formeln gäller för n=1.",
        "Antag att den gäller för n=k. Visa att det leder till att den också gäller för k+1.",
        "Skriv en slutsats. Svarsfälten kontrollerar delar av arbetet; ditt fullständiga resonemang jämför du själv med lösningsförslaget.",
      ],
      before: "Börja med basfall och enkla summor. Fritext rättas inte automatiskt.",
    },
    differential: {
      title: "En funktion och dess förändring",
      intro:
        "y är en funktion och y′ är dess derivata: hur snabbt den förändras. En differentialekvation beskriver ett samband mellan funktionen och dess förändring.",
      steps: [
        "Exempel: y=2e^x har derivatan y′=2e^x, alltså y′=y.",
        "I formen y′=a·y blir a=1. Startvärdet är y(0)=2, eftersom e⁰=1.",
        "En lösning ska uppfylla både differentialekvationen och eventuella startvillkor.",
      ],
      before:
        "Du behöver känna till derivata och exponentialfunktionen. Första övningen hjälper dig att jämföra uttrycken.",
    },
    calculus: {
      title: "Area, derivata och integral",
      intro:
        "Derivata mäter förändring. Integraler kan summera små bidrag, till exempel area. Ett område under x-axeln ger ett negativt bidrag till en bestämd integral.",
      steps: [
        "Exempel: grafen y=x från 0 till 2 bildar en triangel med bas 2 och höjd 2.",
        "Arean är 2·2/2=2. Den bestämda integralen ger samma värde på detta positiva intervall.",
        "När du går vidare tränar du produktregeln och partiell integration.",
      ],
      before:
        "Nybörjarnivån börjar med geometrisk area. Högre nivåer förutsätter derivata och primitiva funktioner.",
    },
    graphs: {
      title: "Noder och kanter",
      intro:
        "Här betyder graf ett nätverk, inte en funktionskurva. Punkterna kallas noder och förbindelserna kanter. En nods grad är antalet kanter vid noden.",
      steps: [
        "Exempel: en triangel har 3 noder. Varje nod har grad 2.",
        "Gradsumman är 2+2+2=6. Varje kant räknas i båda ändarna.",
        "Antalet kanter är därför 6/2=3.",
      ],
      before: "Börja med grader och träd innan kortaste vägar och Eulervägar.",
    },
  };
  let area = "gauss";
  function setArea(value) {
    area = value;
    const g = guides[area] || guides.gauss;
    $("guideTitle").textContent = g.title;
    $("guideIntro").textContent = g.intro;
    $("guideBefore").textContent = g.before;
    $("guideSteps").replaceChildren();
    g.steps.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      $("guideSteps").append(li);
    });
  }
  $("showGuide").onclick = () => {
    $("beginnerExample").open = !$("beginnerExample").open;
    $("showGuide").setAttribute("aria-expanded", String($("beginnerExample").open));
  };
  $("beginnerExample").addEventListener("toggle", () => {
    $("showGuide").setAttribute("aria-expanded", String($("beginnerExample").open));
  });
  $("startSimple").onclick = () => {
    const topic = $("topic").value;
    if (topic === "math5") window.Math5?.startBeginner();
    else if (topic === "operations") window.MatrixOps?.startBeginner();
    else window.GaussGame?.startBeginner();
  };
  function onTopicChange(topic) {
    if (topic !== "math5") setArea(topic);
    $("beginnerStart").hidden = false;
  }
  window.BeginnerGuide = { setArea, onTopicChange, guides };
  setArea("gauss");
})();
